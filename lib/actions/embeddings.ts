"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "@/drizzle/db";
import { sources, documents } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { supabaseServer } from "../supabase";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "@langchain/core/documents";
import { embeddingsModel } from "../config";

export const createEmbedding = async (sourceId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const source = await db.select().from(sources).where(eq(sources.id, sourceId)).limit(1);

  if (!source || source.length === 0) {
    throw new Error("Source not found");
  }

  const docs = await documentLoader(source[0]);

  // If source type is file, store the extracted text in the sources table
  if (source[0].type === "file") {
    const extractedText = docs.map((doc) => doc.pageContent).join("\n\n");
    await db
      .update(sources)
      .set({ content: extractedText })
      .where(eq(sources.id, sourceId));
  }

  // Split documents into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });
  const chunks = await textSplitter.splitDocuments(docs);

  // Store vectors in the database
  try {
    // Generate embeddings for all chunks
    const embeddings = await embeddingsModel.embedDocuments(chunks.map((chunk) => chunk.pageContent));

    // Insert chunks with embeddings directly into the database using Drizzle
    const documentsToInsert = chunks.map((chunk, index) => ({
      sourceId: sourceId,
      content: chunk.pageContent,
      metadata: chunk.metadata,
      embedding: embeddings[index],
    }));

    await db.insert(documents).values(documentsToInsert);
  } catch (error) {
    throw error;
  }
};

export const documentLoader = async (source: typeof sources.$inferSelect) => {
  if (source.type === "file") {
    const { data: fileUrl } = supabaseServer.storage.from("chattable").getPublicUrl(source.filePath as string);

    // Fetch the document from the URL
    const response = await fetch(fileUrl.publicUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    // Convert the response to a Blob
    const blob = await response.blob();

    let docs: Document<Record<string, unknown>>[] = [];

    if (source.mimeType === "application/pdf") {
      const loader = new PDFLoader(blob);
      docs = await loader.load();
    } else if (source.mimeType === "application/msword") {
      const loader = new DocxLoader(blob, {
        type: "doc",
      });
      docs = await loader.load();
    } else if (source.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const loader = new DocxLoader(blob);
      docs = await loader.load();
    } else if (source.mimeType === "text/plain" || source.mimeType === "text/markdown") {
      const loader = new TextLoader(blob);
      docs = await loader.load();
    } else {
      throw new Error(`Unsupported document type: ${source.mimeType}`);
    }

    // Update metadata to use the actual file path instead of 'blob'
    const docsWithUpdatedMetadata = docs.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        source: "file",
        sourcePath: source.filePath,
        sourceId: source.id,
        restaurantId: source.organizationId,
      },
    }));

    return docsWithUpdatedMetadata;
  } else if (source.type === "text") {
    return [
      {
        pageContent: source.content as string,
        metadata: {
          source: "text",
          sourceId: source.id,
          restaurantId: source.organizationId,
        },
      },
    ];
  }

  return [];
};
