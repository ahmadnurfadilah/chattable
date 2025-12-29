"use server";

import slugify from "slugify";
import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "@/drizzle/db";
import { members, organizations } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { supabaseServer } from "../supabase";
import { elevenLabs } from "../elevenlabs";
import { conversationConfig } from "../config";
import { ConversationalConfig } from "@elevenlabs/elevenlabs-js/api";

export async function getRestaurants() {
  const data = await auth.api.listOrganizations({
    headers: await headers(),
  });

  return data;
}

export async function createRestaurant(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const logoFile = formData.get("logo") as File | null;

  // Create restaurant first to get the ID
  const data = await auth.api.createOrganization({
    body: {
      name,
      slug: slugify(name).toLowerCase() + "-" + Math.random().toString(36).substring(2, 8),
      metadata: {
        description,
      },
      logo: undefined,
    },
    headers: await headers(),
  });

  if (!data) {
    throw new Error("Failed to create restaurant");
  }

  const restaurantId = data.id;

  // Create ElevenLabs Agent
  const agent = await elevenLabs.conversationalAi.agents.create({
    name: name,
    tags: [restaurantId],
    conversationConfig: conversationConfig(name, restaurantId) as ConversationalConfig,
  });

  // Update restaurant with agent ID
  await db
    .update(organizations)
    .set({
      metadata: JSON.stringify({
        agentId: agent.agentId,
        description: description,
      }),
    })
    .where(eq(organizations.id, restaurantId));

  // Upload logo if provided
  if (logoFile && logoFile.size > 0) {
    try {
      // Generate a unique file name
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `logo-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `restaurants/${restaurantId}/${fileName}`;

      // Convert File to ArrayBuffer for server-side upload
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload file to Supabase storage
      const { error: uploadError } = await supabaseServer.storage.from("speaksy").upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: logoFile.type,
      });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabaseServer.storage.from("speaksy").getPublicUrl(filePath);

      // Update restaurant with logo URL
      await db.update(organizations).set({ logo: publicUrl }).where(eq(organizations.id, restaurantId));
    } catch (error) {
      console.error("Error uploading logo:", error);
    }
  }

  return data;
}

export async function getRestaurantsByUser(userId: string) {
  const orgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      logo: organizations.logo,
      createdAt: organizations.createdAt,
      metadata: organizations.metadata,
    })
    .from(members)
    .innerJoin(organizations, eq(members.organizationId, organizations.id))
    .where(eq(members.userId, userId));

  return orgs;
}
