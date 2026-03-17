"use client";

import { useStore } from "@tanstack/react-form";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { sliders } from "@/features/text-to-speech/data/sliders";
import { ttsFormOptions } from "@/features/text-to-speech/components/text-to-speech-form";
import { VoiceSelector } from "@/features/text-to-speech/components/voice-selector";
import { useTTSVoices } from "../contexts/tts-voices-context";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SARVAM_LANGUAGES } from "@/features/sarvam/data/sarvam";

export function SettingsPanelSettings() {
  const form = useTypedAppFormContext(ttsFormOptions);
  const { allVoices: voices } = useTTSVoices();
  const voiceId = useStore(form.store, (s) => s.values.voiceId);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  const selectedVoice = voices.find((v) => v.id === voiceId) as any;
  const isSarvam = selectedVoice?.provider === "SARVAM";

  return (
    <>
      {/* Voice Style Dropdown Section */}
      <div className="border-b border-dashed p-4">
        <VoiceSelector />
      </div>

      {/* Voice Adjustments Section */}
      <div className="p-4 flex-1">
        {isSarvam ? (
          <FieldGroup className="gap-8">
            <form.Field name={"model" as any}>
              {(field) => (
                <Field>
                  <FieldLabel>Model</FieldLabel>
                  <Select 
                    value={field.state.value} 
                    onValueChange={field.handleChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bulbul:v1">Bulbul V1 (Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name={"language" as any}>
              {(field) => (
                <Field>
                  <FieldLabel>Language</FieldLabel>
                  <Select 
                    value={field.state.value || selectedVoice?.language} 
                    onValueChange={field.handleChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SARVAM_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        ) : (
          <FieldGroup className="gap-8">
            {sliders.map((slider) => (
              <form.Field key={slider.id} name={slider.id as any}>
                {(field) => (
                  <Field>
                    <FieldLabel>{slider.label}</FieldLabel>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {slider.leftLabel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {slider.rightLabel}
                      </span>
                    </div>
                    <Slider
                      value={[field.state.value]}
                      onValueChange={(value) => field.handleChange(value[0])}
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      disabled={isSubmitting}
                      className="**:data-[slot=slider-thumb]:size-3 **:data-[slot=slider-thumb]:bg-foreground **:data-[slot=slider-track]:h-1"
                    />
                  </Field>
                )}
              </form.Field>
            ))}
          </FieldGroup>
        )}
      </div>
    </>
  );
}