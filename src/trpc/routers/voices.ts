import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { deleteAudio } from "@/lib/r2";
import type { Voice } from "@/generated/prisma";
import { createTRPCRouter, orgProcedure } from "../init";

export const voicesRouter = createTRPCRouter({
  getAll: orgProcedure
    .input(
      z
        .object({
          query: z.string().trim().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const searchFilter = input?.query
        ? {
          OR: [
            { 
              name: { 
                contains: input.query, mode: "insensitive" as const
              } 
            },
            {
              description: {
                contains: input.query,
                mode: "insensitive" as const,
              },
            },
          ],
        }
        : {};

      const getVoices = async (variant: "SYSTEM" | "CUSTOM", orgId?: string) => {
        const query = `
          SELECT id, name, description, category, language, variant, provider
          FROM "Voice"
          WHERE variant = $1
          ${variant === "CUSTOM" ? 'AND "orgId" = $2' : ""}
          ${input?.query ? 'AND (name ILIKE $3 OR description ILIKE $3)' : ""}
          ORDER BY ${variant === "SYSTEM" ? "name ASC" : '"createdAt" DESC'}
        `;
        const params: any[] = [variant];
        if (variant === "CUSTOM") params.push(orgId);
        if (input?.query) params.push(`%${input.query}%`);

        const res = await ctx.db.query(query, params);
        return res.rows as Voice[];
      };

      const [custom, system] = await Promise.all([
        getVoices("CUSTOM", ctx.orgId),
        getVoices("SYSTEM"),
      ]);

      return { custom, system };
    }),

    delete: orgProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const voice = await prisma.voice.findUnique({
          where: {
            id: input.id,
            variant: "CUSTOM",
            orgId: ctx.orgId,
          },
          select: { id: true, r2ObjectKey: true },
        });

        if (!voice) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Voice not found",
          });
        }

        await prisma.voice.delete({ where: { id: voice.id } });

        if (voice.r2ObjectKey) {
          // In production, consider background jobs, retires, cron jobs etc.
          await deleteAudio(voice.r2ObjectKey).catch(() => {});
        }

        return { success: true };
      }),
});
