import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { organizations } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { embeddingsModel } from "@/lib/config";
import { supabaseServer } from "@/lib/supabase";

export async function GET(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  try {
    const { restaurantId } = await params;

    const query = request.nextUrl.searchParams.get("query") || "";

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    // Verify restaurant exists
    const [restaurant] = await db.select().from(organizations).where(eq(organizations.id, restaurantId)).limit(1);

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const vectorStore = new SupabaseVectorStore(embeddingsModel, {
      client: supabaseServer,
      tableName: "documents",
      queryName: "match_documents",
      filter: {
        restaurantId: restaurantId,
      },
    });

    const retrievedDocsWithScore = await vectorStore.similaritySearchWithScore(query as string, 10);

    // Filter documents with similarity score > 0.6
    const retrievedDocs = retrievedDocsWithScore.filter(([, score]) => score > 0.6).map(([doc]) => doc);

    const serialized = retrievedDocs
      .map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
      .join("\n");

    return NextResponse.json({
      success: true,
      data: serialized,
    });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
