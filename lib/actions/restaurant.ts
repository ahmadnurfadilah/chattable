"use server";

import slugify from "slugify";
import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "@/drizzle/db";
import { members, organizations } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";

export async function getRestaurants() {
  const data = await auth.api.listOrganizations({
    headers: await headers(),
  });

  return data;
}

export async function createRestaurant(values: { name: string; description: string }) {
  const data = await auth.api.createOrganization({
    body: {
      name: values.name,
      slug: slugify(values.name).toLowerCase() + "-" + Math.random().toString(36).substring(2, 8),
      logo: undefined,
    },
    headers: await headers(),
  });

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
