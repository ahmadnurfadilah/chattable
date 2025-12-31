/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { AiBrain04Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { refineImageWithAI } from "@/lib/actions/image-refine";
import type { FileWithPreview } from "@/hooks/use-file-upload";

/**
 * Compresses and resizes an image to reduce file size
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1920)
 * @param quality - JPEG quality 0-1 (default: 0.85)
 * @returns Compressed File
 */
async function compressImage(file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.(png|webp)$/i, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

interface ImageRefineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: FileWithPreview | null;
  menuItemName?: string;
  onRefined: (refinedImage: FileWithPreview) => void;
}

const PRESET_PROMPTS = [
  {
    label: "Professional Food Photography",
    prompt:
      "Professional food photography style with perfect lighting, shallow depth of field, and appetizing presentation",
  },
  {
    label: "Bright & Vibrant",
    prompt: "Bright, vibrant colors with natural lighting that makes the food look fresh and appealing",
  },
  {
    label: "Restaurant Menu Style",
    prompt: "Restaurant menu photography style with elegant plating, professional lighting, and clean background",
  },
  {
    label: "Minimalist & Clean",
    prompt: "Minimalist style with clean white background, simple composition, and focus on the food item",
  },
  {
    label: "Warm & Cozy",
    prompt: "Warm, cozy atmosphere with soft lighting and inviting presentation that makes customers want to order",
  },
  {
    label: "High-End Restaurant",
    prompt: "High-end restaurant quality with sophisticated plating, artistic presentation, and premium feel",
  },
];

export function ImageRefineDialog({ open, onOpenChange, imageFile, menuItemName, onRefined }: ImageRefineDialogProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    if (!imageFile?.file) {
      toast.error("No image selected");
      return;
    }

    // Ensure we have a File instance (not FileMetadata)
    if (!(imageFile.file instanceof File)) {
      toast.error("Please upload a new image file to refine");
      return;
    }

    const prompt = selectedPrompt || customPrompt.trim();
    if (!prompt) {
      toast.error("Please select a preset prompt or write your own");
      return;
    }

    setIsRefining(true);
    try {
      const refinedImageBase64 = await refineImageWithAI(imageFile.file, prompt, menuItemName);

      // Convert base64 to File
      const byteCharacters = atob(refinedImageBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      let file = new File([blob], `refined-${imageFile.file.name}`, {
        type: "image/png",
      });

      // Compress the image to reduce file size (max 1920x1920, 85% quality)
      // This ensures it's under the 1MB limit for server actions
      try {
        file = await compressImage(file, 1920, 1920, 0.85);
      } catch (compressError) {
        console.warn("Failed to compress image, using original:", compressError);
        // If compression fails, we'll still try to use the original
        // but it might exceed the size limit
      }

      // Create preview blob for display
      const previewBlob = await file.arrayBuffer().then((ab) => new Blob([ab], { type: file.type }));

      // Generate unique ID for the file
      const fileId = `refined-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Create FileWithPreview
      const refinedFile: FileWithPreview = {
        file,
        id: fileId,
        preview: URL.createObjectURL(previewBlob),
      };

      onRefined(refinedFile);
      toast.success("Image refined successfully!");
      onOpenChange(false);
      setSelectedPrompt("");
      setCustomPrompt("");
    } catch (error) {
      toast.error("Failed to refine image", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={AiBrain04Icon} className="size-5" />
            Refine Image with AI
          </SheetTitle>
          <SheetDescription>
            Use Google Nano Banana AI to enhance your menu image. Select a preset style or write your own custom prompt.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4">
          {/* Preset Prompts */}
          <FieldGroup>
            <Field>
              <FieldLabel className="text-base font-semibold">Preset Styles</FieldLabel>
              <div className="grid grid-cols-1 gap-3">
                {PRESET_PROMPTS.map((preset) => {
                  const isSelected = selectedPrompt === preset.prompt;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setSelectedPrompt(preset.prompt);
                        setCustomPrompt("");
                      }}
                      disabled={isRefining}
                      className={`
                        group relative flex flex-col items-start gap-1 p-2 rounded-lg border-2 transition-all duration-200
                        text-left h-auto
                        ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-border bg-card hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                        }
                        ${isRefining ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                      `}
                    >
                      <span
                        className={`text-sm font-medium transition-colors ${
                          isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                        }`}
                      >
                        {preset.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="size-2 rounded-full bg-primary animate-in fade-in" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Field>
          </FieldGroup>

          {/* Custom Prompt */}
          <FieldGroup>
            <Field>
              <FieldLabel>Or Write Your Own Prompt</FieldLabel>
              <Textarea
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  setSelectedPrompt("");
                }}
                placeholder="E.g., 'Make it look more appetizing with better lighting and professional food styling'"
                disabled={isRefining}
                rows={4}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describe how you want to improve the image. Be specific about lighting, style, background, or
                presentation.
              </p>
            </Field>
          </FieldGroup>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isRefining}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleRefine}
            disabled={isRefining || (!selectedPrompt && !customPrompt.trim())}
          >
            {isRefining ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin mr-2" />
                Refining...
              </>
            ) : (
              <>
                <HugeiconsIcon icon={AiBrain04Icon} className="size-4 mr-2" />
                Refine Image
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
