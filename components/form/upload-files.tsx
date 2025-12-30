"use client";

import Link from "next/link";
import { useState } from "react";
import { formatBytes, useFileUpload, type FileMetadata, type FileWithPreview } from "@/hooks/use-file-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CloudUpload,
  Download,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  RefreshCwIcon,
  Trash2,
  TriangleAlert,
  Upload,
  VideoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createFileSource, deleteFileSource } from "@/lib/actions/sources";

interface FileUploadItem extends FileWithPreview {
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  sourceId?: string; // Database ID for completed files
}

interface UploadFilesProps {
  organizationId: string;
  initialFiles?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    createdAt: Date;
  }>;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  onFilesChange?: (files: FileWithPreview[]) => void;
}

export default function UploadFiles({
  organizationId,
  initialFiles = [],
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  accept = ".pdf,.doc,.docx,.txt,.md,.markdown",
  multiple = true,
  className,
  onFilesChange,
}: UploadFilesProps) {
  // Convert initial files to FileUploadItem format
  const initialUploadFiles: FileUploadItem[] = initialFiles.map((file) => ({
    id: file.id,
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
    } as File,
    preview: file.url,
    progress: 100,
    status: "completed" as const,
    sourceId: file.id,
  }));

  const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>(initialUploadFiles);

  const [
    { isDragging, errors },
    {
      removeFile: removeFileFromHook,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    initialFiles: initialFiles.map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.url,
    })),
    onFilesChange: (newFiles) => {
      onFilesChange?.(newFiles);
    },
    onFilesAdded: async (addedFiles) => {
      // Immediately add files to state with uploading status
      const newUploadItems: FileUploadItem[] = addedFiles
        .filter((fileItem) => fileItem.file instanceof File)
        .map((fileItem) => ({
          ...fileItem,
          progress: 0,
          status: "uploading" as const,
        }));

      // Add new files to state immediately
      setUploadFiles((prev) => [...prev, ...newUploadItems]);

      // Upload each file
      for (const fileItem of addedFiles) {
        if (fileItem.file instanceof File) {
          try {
            // Simulate progress
            const progressInterval = setInterval(() => {
              setUploadFiles((prev) =>
                prev.map((f) => {
                  if (f.id === fileItem.id && f.status === "uploading") {
                    const newProgress = Math.min(f.progress + 10, 90);
                    return { ...f, progress: newProgress };
                  }
                  return f;
                })
              );
            }, 200);

            // Upload file
            const result = await createFileSource(organizationId, fileItem.file);

            clearInterval(progressInterval);

            // Update with completed status
            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? {
                      ...f,
                      progress: 100,
                      status: "completed" as const,
                      sourceId: result.id,
                      preview: result.url || f.preview,
                    }
                  : f
              )
            );

            toast.success(`File "${fileItem.file.name}" uploaded successfully`);
          } catch (error) {
            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? {
                      ...f,
                      progress: 0,
                      status: "error" as const,
                      error: error instanceof Error ? error.message : "Upload failed",
                    }
                  : f
              )
            );
            toast.error(
              `Failed to upload "${fileItem.file.name}": ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }
      }
    },
  });

  const removeUploadFile = async (fileId: string) => {
    const fileItem = uploadFiles.find((f) => f.id === fileId);

    if (!fileItem) return;

    // If it's a completed file with a sourceId, delete from server
    if (fileItem.sourceId && fileItem.status === "completed") {
      try {
        await deleteFileSource(fileItem.sourceId);
        toast.success(`File "${fileItem.file.name}" deleted successfully`);
      } catch (error) {
        toast.error(`Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`);
        return; // Don't remove from UI if deletion failed
      }
    }

    // Remove from local state
    setUploadFiles((prev) => prev.filter((file) => file.id !== fileId));
    removeFileFromHook(fileId);
  };

  const retryUpload = async (fileId: string) => {
    const fileItem = uploadFiles.find((f) => f.id === fileId);

    if (!fileItem || !(fileItem.file instanceof File)) return;

    // Reset status
    setUploadFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, progress: 0, status: "uploading" as const, error: undefined } : file
      )
    );

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadFiles((prev) =>
          prev.map((f) => {
            if (f.id === fileId && f.status === "uploading") {
              const newProgress = Math.min(f.progress + 10, 90);
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 200);

      // Upload file
      const result = await createFileSource(organizationId, fileItem.file as File);

      clearInterval(progressInterval);

      // Update with completed status
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                progress: 100,
                status: "completed" as const,
                sourceId: result.id,
                preview: result.url || f.preview,
              }
            : f
        )
      );

      toast.success(`File "${fileItem.file.name}" uploaded successfully`);
    } catch (error) {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                progress: 0,
                status: "error" as const,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
      toast.error(
        `Failed to upload "${fileItem.file.name}": ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const getFileIcon = (file: File | FileMetadata) => {
    const type = file instanceof File ? file.type : file.type;
    if (type.startsWith("image/")) return <ImageIcon className="size-4" />;
    if (type.startsWith("video/")) return <VideoIcon className="size-4" />;
    if (type.startsWith("audio/")) return <HeadphonesIcon className="size-4" />;
    if (type.includes("pdf")) return <FileTextIcon className="size-4" />;
    if (type.includes("word") || type.includes("doc")) return <FileTextIcon className="size-4" />;
    if (type.includes("excel") || type.includes("sheet")) return <FileSpreadsheetIcon className="size-4" />;
    if (type.includes("zip") || type.includes("rar")) return <FileArchiveIcon className="size-4" />;
    return <FileTextIcon className="size-4" />;
  };

  const getFileTypeLabel = (file: File | FileMetadata) => {
    const type = file instanceof File ? file.type : file.type;
    if (type.startsWith("image/")) return "Image";
    if (type.startsWith("video/")) return "Video";
    if (type.startsWith("audio/")) return "Audio";
    if (type.includes("pdf")) return "PDF";
    if (type.includes("word") || type.includes("doc")) return "Word";
    if (type.includes("excel") || type.includes("sheet")) return "Excel";
    if (type.includes("zip") || type.includes("rar")) return "Archive";
    if (type.includes("json")) return "JSON";
    if (type.includes("text")) return "Text";
    return "File";
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative rounded-lg border border-dashed p-6 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className="sr-only" />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors",
              isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25"
            )}
          >
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Drop files here or{" "}
              <button
                type="button"
                onClick={openFileDialog}
                className="cursor-pointer text-primary underline-offset-4 hover:underline"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-muted-foreground">Maximum file size: {formatBytes(maxSize)}</p>
          </div>
        </div>
      </div>

      {/* Files Table */}
      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Files ({uploadFiles.length})</h3>
            <div className="flex gap-2">
              <Button onClick={openFileDialog} variant="outline" size="sm">
                <CloudUpload />
                Add files
              </Button>
              <Button onClick={clearFiles} variant="outline" size="sm">
                <Trash2 />
                Remove all
              </Button>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="h-9">Name</TableHead>
                  <TableHead className="h-9">Type</TableHead>
                  <TableHead className="h-9">Size</TableHead>
                  <TableHead className="h-9 w-[100px] text-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadFiles.map((fileItem) => (
                  <TableRow key={fileItem.id}>
                    <TableCell className="py-2 ps-1.5">
                      <div className="flex items-center gap-1">
                        <div
                          className={cn(
                            "size-8 shrink-0 relative flex items-center justify-center text-muted-foreground/80"
                          )}
                        >
                          {fileItem.status === "uploading" ? (
                            <div className="relative">
                              {/* Circular progress background */}
                              <svg className="size-8 -rotate-90" viewBox="0 0 32 32">
                                <circle
                                  cx="16"
                                  cy="16"
                                  r="14"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="text-muted-foreground/20"
                                />
                                {/* Progress circle */}
                                <circle
                                  cx="16"
                                  cy="16"
                                  r="14"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeDasharray={`${2 * Math.PI * 14}`}
                                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - fileItem.progress / 100)}`}
                                  className="text-primary transition-all duration-300"
                                  strokeLinecap="round"
                                />
                              </svg>
                              {/* File icon in center */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                {getFileIcon(fileItem.file)}
                              </div>
                            </div>
                          ) : (
                            <div className="not-[]:size-8 flex items-center justify-center">
                              {getFileIcon(fileItem.file)}
                            </div>
                          )}
                        </div>
                        <p className="flex items-center gap-1 truncate text-sm font-medium">
                          {fileItem.file.name}
                          {fileItem.status === "error" && <Badge variant="destructive">Error</Badge>}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge variant="secondary" className="text-xs">
                        {getFileTypeLabel(fileItem.file)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-sm text-muted-foreground">
                      {formatBytes(fileItem.file.size)}
                    </TableCell>
                    <TableCell className="py-2 pe-1">
                      <div className="flex items-center gap-1">
                        {fileItem.preview && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            render={<Link href={fileItem.preview} target="_blank" />}
                            nativeButton={false}
                          >
                            <Download className="size-3.5" />
                          </Button>
                        )}
                        {fileItem.status === "error" ? (
                          <Button
                            onClick={() => retryUpload(fileItem.id)}
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive/80 hover:text-destructive"
                          >
                            <RefreshCwIcon className="size-3.5" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => removeUploadFile(fileItem.id)}
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-5">
          <TriangleAlert />
          <AlertTitle>File upload error(s)</AlertTitle>
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
