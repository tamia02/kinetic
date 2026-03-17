import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { polar } from "@/lib/polar";
import { env } from "@/lib/env";
import { TRPCError } from "@trpc/server";
import { chatterbox } from "@/lib/chatterbox-client";
import { sarvam } from "@/lib/sarvam-client";
import { prisma } from "@/lib/db";
import { uploadAudio } from "@/lib/r2";
import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";
import { createTRPCRouter, orgProcedure } from "../init";

export const generationsRouter = createTRPCRouter({
  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.query(
        `SELECT id, text, "voiceName", "voiceId", temperature, "topP", "topK", "repetitionPenalty", provider, model, pace, language, "createdAt", "updatedAt"
         FROM "Generation"
         WHERE id = $1 AND "orgId" = $2`,
        [input.id, ctx.orgId]
      );
      const generation = res.rows[0];

      if (!generation) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        ...generation,
        audioUrl: `/api/audio/${generation.id}`,
      };
    }),
  
  getAll: orgProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.query(
      `SELECT id, text, "voiceName", "voiceId", temperature, "topP", "topK", "repetitionPenalty", provider, model, pace, language, "createdAt", "updatedAt"
       FROM "Generation"
       WHERE "orgId" = $1
       ORDER BY "createdAt" DESC`,
      [ctx.orgId]
    );

    return res.rows;
  }),

  create: orgProcedure
    .input(
      z.object({
        text: z.string().min(1).max(TEXT_MAX_LENGTH),
        voiceId: z.string().min(1),
        provider: z.enum(["MODAL", "SARVAM"]).default("MODAL"),
        model: z.string().optional(),
        pace: z.number().optional(),
        language: z.string().optional(),
        temperature: z.number().min(0).max(2).default(0.8),
        topP: z.number().min(0).max(1).default(0.95),
        topK: z.number().min(1).max(10000).default(1000),
        repetitionPenalty: z.number().min(1).max(2).default(1.2),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check for active subscription before generation
      try {
        const isAdmin = env.BYPASS_SUBSCRIPTION_CHECK || (env.ADMIN_USER_ID === ctx.userId);

        if (!isAdmin) {
          const customerState = await polar.customers.getStateExternal({
            externalId: ctx.orgId,
          });
          const hasActiveSubscription =
            (customerState.activeSubscriptions ?? []).length > 0;
          if (!hasActiveSubscription) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "SUBSCRIPTION_REQUIRED",
            });
          }
        }
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        
        const isAdmin = env.BYPASS_SUBSCRIPTION_CHECK || (env.ADMIN_USER_ID === ctx.userId);
        if (!isAdmin) {
          // Customer doesn't exist in Polar yet -> no subscription
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "SUBSCRIPTION_REQUIRED",
          });
        }
      }

      const voiceRes = await ctx.db.query(
        `SELECT id, name, language, "r2ObjectKey", provider, variant 
         FROM "Voice" 
         WHERE id = $1 AND ("orgId" = $2 OR variant = 'SYSTEM')`,
        [input.voiceId, ctx.orgId]
      );
      const voice = voiceRes.rows[0];

      if (!voice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      const provider = input.provider || voice.provider || "MODAL";

      if (voice.variant === "CUSTOM" && !voice.r2ObjectKey && provider === "MODAL") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Voice audio not available",
        });
      }

      let audioData: ArrayBuffer;

      if (provider === "SARVAM") {
        try {
          audioData = await sarvam.generate({
            inputs: [input.text],
            target_language_code: input.language || voice.language || "hi-IN",
            speaker: voice.name,
            model: "bulbul:v1",
            speech_sample_rate: 22050,
          });
        } catch (err) {
          console.error("Sarvam generation error:", err);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate audio via Sarvam AI",
          });
        }
      } else {
        const { data, error } = await chatterbox.POST("/generate", {
          body: {
            prompt: input.text,
            voice_key: voice.r2ObjectKey!,
            temperature: input.temperature,
            top_p: input.topP,
            top_k: input.topK,
            repetition_penalty: input.repetitionPenalty,
            norm_loudness: true,
          },
          parseAs: "arrayBuffer",
        });

        if (error || !data) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate audio",
          });
        }
        audioData = data as ArrayBuffer;
      }

      if (!(audioData instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid audio response",
        });
      }

      const buffer = Buffer.from(audioData);
      let generationId: string | null = null;
      let r2ObjectKey: string | null = null;

      try {
        const createRes = await ctx.db.query(
          `INSERT INTO "Generation" 
           (id, "orgId", text, "voiceName", "voiceId", temperature, "topP", "topK", "repetitionPenalty", provider, model, pace, language, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
           RETURNING id`,
          [
            `gen_${Math.random().toString(36).substring(2, 11)}`,
            ctx.orgId,
            input.text,
            voice.name,
            voice.id,
            input.temperature,
            input.topP,
            input.topK,
            input.repetitionPenalty,
            input.provider,
            input.model || (provider === "SARVAM" ? "sarvam-tts-v1" : null),
            input.pace || 1.0,
            input.language || voice.language || (provider === "SARVAM" ? "hi-IN" : "en-US"),
          ]
        );
        const generation = createRes.rows[0];

        generationId = generation.id;
        r2ObjectKey = `generations/orgs/${ctx.orgId}/${generation.id}`;

        await uploadAudio({ buffer, key: r2ObjectKey });

        await prisma.generation.update({
          where: {
            id: generation.id,
          },
          data: {
            r2ObjectKey,
          },
        });

        Sentry.logger.info("Audio generated", {
          orgId: ctx.orgId,
          generationId: generation.id,
        });
      } catch {
        if (generationId) {
          await prisma.generation
            .delete({
              where: {
                id: generationId,
              },
            })
            .catch(() => {});
        }

        Sentry.logger.error("Generation failed", {
          orgId: ctx.orgId,
          voiceId: input.voiceId,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      if (!generationId || !r2ObjectKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      // Ingest usage event to Polar (fire-and-forget, don't block response)
      polar.events
        .ingest({
          events: [
            {
              name: env.POLAR_METER_TTS_GENERATION,
              externalCustomerId: ctx.orgId,
              metadata: { [env.POLAR_METER_TTS_PROPERTY]: input.text.length },
              timestamp: new Date(),
            },
          ],
        })
        .catch(() => {
          // Silently fail - don't break the user experience for metering errors
        });

      return {
        id: generationId,
      };
    }),
});
