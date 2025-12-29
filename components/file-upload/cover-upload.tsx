/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useFileUpload, type FileWithPreview } from "@/hooks/use-file-upload";
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CloudUpload, ImageIcon, TriangleAlert, Upload, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverUploadProps {
  maxSize?: number;
  accept?: string;
  className?: string;
  onImageChange?: (file: FileWithPreview | null) => void;
  defaultImage?: FileWithPreview | null;
  aspectRatio?: string;
}

export default function CoverUpload({
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = "image/*",
  className,
  onImageChange,
  defaultImage = null,
  aspectRatio = "4/3", // Default to 4:3 for menu images, can be overridden
}: CoverUploadProps) {
  const [coverImage, setCoverImage] = useState<FileWithPreview | null>(defaultImage);
  const [imageLoading, setImageLoading] = useState(false);

  const [
    { isDragging, errors },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept,
    multiple: false,
    onFilesChange: (files) => {
      if (files.length > 0) {
        setImageLoading(true);
        setCoverImage(files[0]);
        onImageChange?.(files[0]);
      }
    },
  });

  const removeCoverImage = () => {
    setCoverImage(null);
    setImageLoading(false);
    onImageChange?.(null);
  };

  const hasImage = coverImage && coverImage.preview;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Cover Upload Area */}
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl transition-all duration-200 border border-border",
          isDragging
            ? "border-dashed border-primary bg-primary/5"
            : hasImage
            ? "border-border bg-background hover:border-primary/50"
            : "border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary hover:bg-primary/5"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Hidden file input */}
        <input {...getInputProps()} className="sr-only" />

        {hasImage ? (
          <>
            {/* Cover Image Display */}
            <div className={`relative w-full`} style={{ aspectRatio }}>
              {/* Loading placeholder */}
              {imageLoading && (
                <div className="absolute inset-0 animate-pulse bg-muted flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="size-5" />
                    <span className="text-sm">Loading image...</span>
                  </div>
                </div>
              )}

              {/* Actual image */}
              <img
                src={coverImage.preview}
                alt="Cover"
                className={cn(
                  "h-full w-full object-cover transition-opacity duration-300",
                  imageLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />

              {/* Action buttons overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    onClick={openFileDialog}
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 text-gray-900 hover:bg-white"
                  >
                    <Upload />
                    Change Cover
                  </Button>
                  <Button onClick={removeCoverImage} variant="destructive" size="sm">
                    <XIcon />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div
            className={`flex w-full cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center`}
            style={{ aspectRatio }}
            onClick={openFileDialog}
          >
            <div className="rounded-full bg-primary/10 p-4">
              <CloudUpload className="size-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Menu Image</h3>
              <p className="text-sm text-muted-foreground">Drag and drop an image here, or click to browse</p>
              <p className="text-xs text-muted-foreground">
                Recommended size: 800x600px • Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>

            <Button variant="outline" size="sm">
              <ImageIcon />
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" appearance="light" className="mt-5">
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>File upload error(s)</AlertTitle>
            <AlertDescription>
              {errors.map((error, index) => (
                <p key={index} className="last:mb-0">
                  {error}
                </p>
              ))}
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {/* Upload Tips */}
      <div className="rounded-lg bg-muted/50 p-4">
        <h4 className="mb-2 text-sm font-medium">Menu Image Guidelines</h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Use high-quality images with good lighting and composition</li>
          <li>• Recommended aspect ratio: 4:3 for best results</li>
          <li>• Make sure the food/item is clearly visible and centered</li>
          <li>• Supported formats: JPG, PNG, WebP</li>
        </ul>
      </div>
    </div>
  );
}
