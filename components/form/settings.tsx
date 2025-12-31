"use client";

import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { useState, useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, PlayIcon, PauseIcon } from "@hugeicons/core-free-icons";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { updateElevenLabsAgent, getAgentIdFromActiveOrganization } from "@/lib/actions/agent";

const formSchema = z.object({
  voice: z.string().min(1, "Voice is required"),
  language: z.string().min(1, "Language is required"),
  llmModel: z.string().min(1, "LLM model is required"),
  firstMessage: z.string().min(1, "First message is required"),
});

type InitialData = {
  voice: string;
  language: string;
  llmModel: string;
  firstMessage: string;
} | null;

// Common ElevenLabs voices
const VOICES = [
  {
    id: "vBKc2FfBKJfcZNyEt1n6",
    name: "Finn",
    description: "Youthful, Eager and Energetic",
    gender: "male",
    preview:
      "https://storage.googleapis.com/eleven-public-prod/database/workspace/1da06ea679a54975ad96a2221fe6530d/voices/vBKc2FfBKJfcZNyEt1n6/o4o4mqfdaIsxzmOipiS9.mp3",
  },
  {
    id: "UgBBYS2sOqTuMpoF3BR0",
    name: "Mark",
    description: "Casual and Conversational",
    gender: "male",
    preview:
      "https://storage.googleapis.com/eleven-public-prod/database/workspace/f94e260200764678babc807b935bfb0b/voices/UgBBYS2sOqTuMpoF3BR0/0Oc7jiXwWN9kRTXfQsmw.mp3",
  },
  {
    id: "s3TPKV1kjDlVtZbl4Ksh",
    name: "Adam",
    description: "Engaging, Friendly and Bright",
    gender: "male",
    preview:
      "https://storage.googleapis.com/eleven-public-prod/database/user/u7Eid7eUnqPIUgLLpKlk7WwRQNO2/voices/s3TPKV1kjDlVtZbl4Ksh/ljK6ZoK2OOTR8kXJ8Arp.mp3",
  },
  {
    id: "56AoDkrOh6qfVPDXZ7Pt",
    name: "Cassidy",
    description: "Crisp, Direct and Clear",
    gender: "female",
    preview:
      "https://storage.googleapis.com/eleven-public-prod/database/workspace/1da06ea679a54975ad96a2221fe6530d/voices/56AoDkrOh6qfVPDXZ7Pt/oEgVi6mikkKcpVcTFfj5.mp3",
  },
  {
    id: "g6xIsTj2HwM6VR4iXFCw",
    name: "Jessica Anne Bogart",
    description: "Chatty and Friendly",
    gender: "female",
    preview:
      "https://storage.googleapis.com/eleven-public-prod/database/user/yA8yDNUx4dZ4gwL9ztbTpUEIyR12/voices/g6xIsTj2HwM6VR4iXFCw/1Oqk9SesQxUMxopfgLb7.mp3",
  },
  {
    id: "rfkTsdZrVWEVhDycUYn9",
    name: "Shelby",
    description: "British female voice",
    gender: "female",
    preview:
      "https://storage.googleapis.com/eleven-public-prod/database/user/amWos2WP7hRs0yPBtA0OwjuzHAH2/voices/rfkTsdZrVWEVhDycUYn9/iiFLm9bEQ83kiP0bExhG.mp3",
  },
];

// Common languages
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

// Google LLM Models
const GOOGLE_MODELS = [
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  { id: "gemini-3-pro-preview", name: "Gemini 3 Pro Preview" },
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash Preview" },
];

export function SettingsForm({ initialData }: { initialData: InitialData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voice: initialData?.voice || "vBKc2FfBKJfcZNyEt1n6",
      language: initialData?.language || "en",
      llmModel: initialData?.llmModel || "gemini-2.5-flash",
      firstMessage: initialData?.firstMessage || "",
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        voice: initialData.voice,
        language: initialData.language,
        llmModel: initialData.llmModel,
        firstMessage: initialData.firstMessage,
      });
    }
  }, [initialData, form]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSaveSettings = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const agentId = await getAgentIdFromActiveOrganization();

      await updateElevenLabsAgent(agentId, {
        voice: values.voice,
        language: values.language,
        llmModel: values.llmModel,
        firstMessage: values.firstMessage,
      });

      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPreview = (voiceId: string) => {
    const voice = VOICES.find((v) => v.id === voiceId);
    if (!voice?.preview) return;

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // If clicking the same voice that's playing, stop it
    if (playingVoiceId === voiceId) {
      setPlayingVoiceId(null);
      return;
    }

    // Play new audio
    const audio = new Audio(voice.preview);
    audioRef.current = audio;
    setPlayingVoiceId(voiceId);

    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      toast.error("Failed to play voice preview");
      setPlayingVoiceId(null);
    });

    audio.onended = () => {
      setPlayingVoiceId(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      toast.error("Failed to load voice preview");
      setPlayingVoiceId(null);
      audioRef.current = null;
    };
  };

  return (
    <form onSubmit={form.handleSubmit(handleSaveSettings)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agent Settings</CardTitle>
          <CardDescription>Configure your AI agent&apos;s voice, language, and behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name="voice"
              control={form.control}
              render={({ field, fieldState }) => {
                const selectedVoice = VOICES.find((v) => v.id === field.value);
                const isPlaying = playingVoiceId === field.value;

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="voice">
                      Voice <span className="text-destructive">*</span>
                    </FieldLabel>
                    <div className="flex gap-2">
                      <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                        <SelectTrigger id="voice" aria-invalid={fieldState.invalid} className="w-full">
                          <SelectValue>{selectedVoice ? selectedVoice.name : "Select a voice"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {VOICES.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              <div className="flex items-center justify-between w-full gap-2">
                                <span>{voice.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handlePlayPreview(voice.id);
                                  }}
                                  disabled={!voice.preview}
                                  aria-label={
                                    playingVoiceId === voice.id
                                      ? `Pause ${voice.name} preview`
                                      : `Play ${voice.name} preview`
                                  }
                                >
                                  {playingVoiceId === voice.id ? (
                                    <HugeiconsIcon icon={PauseIcon} className="size-3" />
                                  ) : (
                                    <HugeiconsIcon icon={PlayIcon} className="size-3" />
                                  )}
                                </Button>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedVoice?.preview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handlePlayPreview(field.value)}
                          disabled={isLoading || !field.value}
                          className="shrink-0"
                          aria-label={isPlaying ? "Pause preview" : "Play preview"}
                        >
                          {isPlaying ? (
                            <HugeiconsIcon icon={PauseIcon} className="size-4" />
                          ) : (
                            <HugeiconsIcon icon={PlayIcon} className="size-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    <p className="text-xs text-muted-foreground mt-1">Select the voice for the agent to use</p>
                  </Field>
                );
              }}
            />

            <Controller
              name="language"
              control={form.control}
              render={({ field, fieldState }) => {
                const selectedLanguage = LANGUAGES.find((lang) => lang.code === field.value);

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="language">
                      Language <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                      <SelectTrigger id="language" aria-invalid={fieldState.invalid} className="w-full">
                        <SelectValue>{selectedLanguage ? selectedLanguage.name : "Select a language"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }}
            />

            <Controller
              name="llmModel"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="llmModel">
                    LLM Model <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                    <SelectTrigger id="llmModel" aria-invalid={fieldState.invalid} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOOGLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  <p className="text-xs text-muted-foreground mt-1">Select a Google Gemini model</p>
                </Field>
              )}
            />

            <Controller
              name="firstMessage"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="firstMessage">
                    First Message <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="firstMessage"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter the first message the agent will say..."
                    autoComplete="off"
                    disabled={isLoading}
                    rows={3}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  <p className="text-xs text-muted-foreground mt-1">
                    The initial greeting message when a conversation starts
                  </p>
                </Field>
              )}
            />

            <Field>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" /> : "Save Settings"}
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
