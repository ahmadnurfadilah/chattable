"use server";

import { db } from "@/drizzle/db";
import { sources } from "@/drizzle/db/schema";
import { and, asc, eq, count, desc } from "drizzle-orm";
import { supabaseServer } from "../supabase";
import { createEmbedding } from "./embeddings";

export const getTextSources = async (organizationId: string) => {
  const textSources = await db
    .select()
    .from(sources)
    .where(and(eq(sources.organizationId, organizationId), eq(sources.type, "text")))
    .orderBy(asc(sources.name));

  return textSources;
};

export const getTextSourcesPaginated = async (
  organizationId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const offset = (page - 1) * pageSize;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(sources)
    .where(and(eq(sources.organizationId, organizationId), eq(sources.type, "text")));

  const total = totalResult?.count || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Get paginated results
  const textSources = await db
    .select()
    .from(sources)
    .where(and(eq(sources.organizationId, organizationId), eq(sources.type, "text")))
    .orderBy(desc(sources.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    data: textSources,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
};

export const getFileSources = async (organizationId: string) => {
  // Get files from database
  const files = await db
    .select()
    .from(sources)
    .where(and(eq(sources.organizationId, organizationId), eq(sources.type, "file")))
    .orderBy(asc(sources.name));

  // Get public URLs for each file
  const filesWithUrls = await Promise.all(
    files.map(async (file: (typeof files)[0]) => {
      if (!file.filePath) return null;

      const { data: urlData } = supabaseServer.storage.from("chattable").getPublicUrl(file.filePath);

      return {
        id: file.id,
        name: file.name || file.fileName || "Unknown",
        size: file.size || 0,
        type: file.mimeType || "application/octet-stream",
        url: urlData.publicUrl,
        createdAt: file.createdAt,
      };
    })
  );

  return filesWithUrls.filter((file): file is NonNullable<(typeof filesWithUrls)[0]> => file !== null);
};

export const createTextSource = async (organizationId: string, title: string, content: string) => {
  const [source] = await db
    .insert(sources)
    .values({
      organizationId,
      type: "text",
      name: title,
      content,
    })
    .returning();

  try {
    await createEmbedding(source.id);
  } catch (error) {
    await db.delete(sources).where(eq(sources.id, source.id));
    throw error;
  }

  return source;
};

export const createFileSource = async (organizationId: string, file: File) => {
  // Generate unique file path
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `sources/${organizationId}/${fileName}`;

  // Upload to Supabase storage
  const { error: uploadError } = await supabaseServer.storage.from("chattable").upload(filePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseServer.storage.from("chattable").getPublicUrl(filePath);

  // Save to database
  const [source] = await db
    .insert(sources)
    .values({
      organizationId,
      type: "file",
      name: file.name,
      fileName: file.name,
      filePath: filePath,
      mimeType: file.type,
      size: file.size,
    })
    .returning();

  try {
    await createEmbedding(source.id);
  } catch (error) {
    await db.delete(sources).where(eq(sources.id, source.id));
    throw error;
  }

  return {
    ...source,
    url: urlData.publicUrl,
  };
};

export const deleteTextSource = async (sourceId: string) => {
  await db.delete(sources).where(eq(sources.id, sourceId));
};

export const deleteFileSource = async (sourceId: string) => {
  // Get file from database
  const [file] = await db
    .select({
      id: sources.id,
      organizationId: sources.organizationId,
      filePath: sources.filePath,
    })
    .from(sources)
    .where(eq(sources.id, sourceId))
    .limit(1);

  if (!file) {
    throw new Error("File not found");
  }

  // Delete from storage
  if (file.filePath) {
    const { error: storageError } = await supabaseServer.storage.from("chattable").remove([file.filePath]);

    if (storageError) {
      throw new Error("Failed to delete file from storage");
    }
  }

  // Delete from database
  await db.delete(sources).where(eq(sources.id, sourceId));
};
