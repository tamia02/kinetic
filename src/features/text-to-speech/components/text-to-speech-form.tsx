"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useAppForm } from "@/hooks/use-app-form";
import { useCheckout } from "@/features/billing/hooks/use-checkout";

const ttsFormSchema = z.object({
  text: z.string().min(1, "Please enter some text"),
  voiceId: z.string().min(1, "Please select a voice"),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number(),
  repetitionPenalty: z.number(),
  provider: z.enum(["MODAL", "SARVAM"]).optional(),
  model: z.string().optional(),
  pace: z.number().optional(),
  language: z.string().optional(),
});

export type TTSFormValues = z.infer<typeof ttsFormSchema>;

export const defaultTTSValues: TTSFormValues = {
  text: "",
  voiceId: "",
  temperature: 0.8,
  topP: 0.95,
  topK: 1000,
  repetitionPenalty: 1.2,
  provider: "MODAL",
  language: "en-US",
};

export const ttsFormOptions = formOptions({
  defaultValues: defaultTTSValues,
});

export function TextToSpeechForm({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: TTSFormValues;
}) {
  const trpc = useTRPC();
  const router = useRouter();
  const createMutation = useMutation(
    (trpc.generations.create as any).mutationOptions({}),
  );

  const { checkout } = useCheckout();

  const form = useAppForm({
    ...ttsFormOptions,
    defaultValues: defaultValues ?? defaultTTSValues,
    validators: {
      onSubmit: ttsFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const data = await createMutation.mutateAsync({
          text: value.text.trim(),
          voiceId: value.voiceId,
          temperature: value.temperature,
          topP: value.topP,
          topK: value.topK,
          repetitionPenalty: value.repetitionPenalty,
          provider: value.provider,
          model: value.model,
          pace: value.pace,
          language: value.language,
        } as any);

        toast.success("Audio generated successfully!");
        router.push(`/text-to-speech/${(data as any).id}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate audio";

        if (message === "SUBSCRIPTION_REQUIRED") {
          toast.error("Subscription required", {
            action: {
              label: "Subscribe",
              onClick: () => checkout(),
            },
          });
        } else {
          toast.error(message);
        }
      }
    },
    onSubmitInvalid: ({ formApi }) => {
      const errors = formApi.state.errors;
      if (errors.length > 0) {
        toast.error(errors[0]?.toString() || "Please fill out all required fields");
      }
    },
  });

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {children}
      </form>
    </form.AppForm>
  );
};
