"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "@/drizzle/db";
import { menuCategories } from "@/drizzle/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function getMenuCategories() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get active organization from session
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) {
    return [];
  }

  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.organizationId, activeOrgId))
    .orderBy(asc(menuCategories.orderColumn));

  return categories;
}

export async function updateCategoryOrder(categoryIds: string[]) {
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

  // Update order column for each category
  for (let i = 0; i < categoryIds.length; i++) {
    await db
      .update(menuCategories)
      .set({ orderColumn: i + 1 })
      .where(and(eq(menuCategories.id, categoryIds[i]), eq(menuCategories.organizationId, activeOrgId)));
  }

  return { success: true };
}

export async function updateCategoryName(categoryId: string, name: string) {
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

  await db
    .update(menuCategories)
    .set({ name })
    .where(and(eq(menuCategories.id, categoryId), eq(menuCategories.organizationId, activeOrgId)));

  return { success: true };
}

export async function createCategory(name: string) {
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

  // Get the max order column to add new category at the end
  const existingCategories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.organizationId, activeOrgId))
    .orderBy(asc(menuCategories.orderColumn));

  const maxOrder = existingCategories.length > 0 ? Math.max(...existingCategories.map((c) => c.orderColumn)) : 0;

  const [newCategory] = await db
    .insert(menuCategories)
    .values({
      organizationId: activeOrgId,
      name,
      orderColumn: maxOrder + 1,
    })
    .returning();

  return newCategory;
}

export async function deleteCategory(categoryId: string) {
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

  await db
    .delete(menuCategories)
    .where(and(eq(menuCategories.id, categoryId), eq(menuCategories.organizationId, activeOrgId)));

  return { success: true };
}
