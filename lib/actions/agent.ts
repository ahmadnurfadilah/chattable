"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "@/drizzle/db";
import { organizations } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { elevenLabs } from "../elevenlabs";
import { Llm } from "@elevenlabs/elevenlabs-js/api";

/**
 * Get agent ID from active organization
 */
export async function getAgentIdFromActiveOrganization() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) {
    throw new Error("No active organization");
  }

  const [org] = await db
    .select({ metadata: organizations.metadata })
    .from(organizations)
    .where(eq(organizations.id, activeOrgId))
    .limit(1);

  if (!org?.metadata) {
    throw new Error("Organization metadata not found");
  }

  try {
    const metadata = JSON.parse(org.metadata);
    if (!metadata.agentId) {
      throw new Error("Agent ID not found in organization metadata");
    }
    return metadata.agentId as string;
  } catch {
    throw new Error("Failed to parse organization metadata");
  }
}

/**
 * Get ElevenLabs agent settings
 */
export async function getElevenLabsAgent(agentId?: string) {
  const id = agentId || (await getAgentIdFromActiveOrganization());
  const elevenLabsAgent = await elevenLabs.conversationalAi.agents.get(id);
  console.log("elevenLabsAgent", elevenLabsAgent.conversationConfig.tts?.voiceId);
  return elevenLabsAgent;
}

/**
 * Update ElevenLabs agent settings
 */
export async function updateElevenLabsAgent(
  agentId: string,
  updates: {
    voice?: string;
    language?: string;
    llmModel?: string;
    firstMessage?: string;
  }
) {
  // Get current agent config
  const currentAgent = await elevenLabs.conversationalAi.agents.get(agentId);

  if (!currentAgent.conversationConfig.agent || !currentAgent.conversationConfig.agent.prompt) {
    throw new Error("Invalid agent configuration");
  }

  const updatedAgent = await elevenLabs.conversationalAi.agents.update(agentId, {
    conversationConfig: {
      tts: {
        voiceId: updates.voice,
      },
      agent: {
        language: updates.language,
        firstMessage: updates.firstMessage,
        prompt: {
          llm: updates.llmModel as Llm,
        },
      },
    },
  });

  return updatedAgent;
}
