"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "@/drizzle/db";
import { menus, menuCategories } from "@/drizzle/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { supabaseServer } from "../supabase";

export async function createMenu(formData: FormData) {
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

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const categoryId = formData.get("categoryId") as string;
  const price = formData.get("price") as string;
  const isAvailable = formData.get("isAvailable") === "true";
  const imageFile = formData.get("image") as File | null;

  // Validate required fields
  if (!name || !categoryId || !price) {
    throw new Error("Name, category, and price are required");
  }

  // Validate category belongs to organization
  const category = await db
    .select()
    .from(menuCategories)
    .where(and(eq(menuCategories.id, categoryId), eq(menuCategories.organizationId, activeOrgId)))
    .limit(1);

  if (category.length === 0) {
    throw new Error("Invalid category");
  }

  // Parse price
  const priceValue = parseFloat(price);
  if (isNaN(priceValue) || priceValue < 0) {
    throw new Error("Invalid price");
  }

  // Upload image if provided
  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    try {
      // Generate a unique file name
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `menu-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `menus/${activeOrgId}/${fileName}`;

      // Convert File to ArrayBuffer for server-side upload
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload file to Supabase storage
      const { error: uploadError } = await supabaseServer.storage.from("chattable").upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type,
      });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabaseServer.storage.from("chattable").getPublicUrl(filePath);

      imageUrl = publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  }

  // Create menu item
  const [newMenu] = await db
    .insert(menus)
    .values({
      organizationId: activeOrgId,
      categoryId,
      name,
      description: description || null,
      image: imageUrl,
      price: priceValue.toString(),
      isAvailable,
    })
    .returning();

  return newMenu;
}

export async function getMenus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) {
    return [];
  }

  const menusData = await db
    .select({
      id: menus.id,
      name: menus.name,
      description: menus.description,
      image: menus.image,
      price: menus.price,
      isAvailable: menus.isAvailable,
      createdAt: menus.createdAt,
      updatedAt: menus.updatedAt,
      categoryId: menus.categoryId,
      categoryName: menuCategories.name,
    })
    .from(menus)
    .innerJoin(menuCategories, eq(menus.categoryId, menuCategories.id))
    .where(eq(menus.organizationId, activeOrgId))
    .orderBy(asc(menuCategories.orderColumn), asc(menus.createdAt));

  return menusData;
}

export async function getMenu(menuId: string) {
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

  const [menu] = await db
    .select({
      id: menus.id,
      name: menus.name,
      description: menus.description,
      image: menus.image,
      price: menus.price,
      isAvailable: menus.isAvailable,
      createdAt: menus.createdAt,
      updatedAt: menus.updatedAt,
      categoryId: menus.categoryId,
      organizationId: menus.organizationId,
    })
    .from(menus)
    .where(and(eq(menus.id, menuId), eq(menus.organizationId, activeOrgId)))
    .limit(1);

  if (!menu) {
    throw new Error("Menu not found");
  }

  return menu;
}

export async function updateMenu(menuId: string, formData: FormData) {
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

  // Verify menu exists and belongs to organization
  const existingMenu = await db
    .select()
    .from(menus)
    .where(and(eq(menus.id, menuId), eq(menus.organizationId, activeOrgId)))
    .limit(1);

  if (existingMenu.length === 0) {
    throw new Error("Menu not found");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const categoryId = formData.get("categoryId") as string;
  const price = formData.get("price") as string;
  const isAvailable = formData.get("isAvailable") === "true";
  const imageFile = formData.get("image") as File | null;
  const removeImage = formData.get("removeImage") === "true";

  // Validate required fields
  if (!name || !categoryId || !price) {
    throw new Error("Name, category, and price are required");
  }

  // Validate category belongs to organization
  const category = await db
    .select()
    .from(menuCategories)
    .where(and(eq(menuCategories.id, categoryId), eq(menuCategories.organizationId, activeOrgId)))
    .limit(1);

  if (category.length === 0) {
    throw new Error("Invalid category");
  }

  // Parse price
  const priceValue = parseFloat(price);
  if (isNaN(priceValue) || priceValue < 0) {
    throw new Error("Invalid price");
  }

  // Handle image update
  let imageUrl: string | null = existingMenu[0].image;

  if (removeImage) {
    imageUrl = null;
  } else if (imageFile && imageFile.size > 0) {
    try {
      // Generate a unique file name
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `menu-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `menus/${activeOrgId}/${fileName}`;

      // Convert File to ArrayBuffer for server-side upload
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload file to Supabase storage
      const { error: uploadError } = await supabaseServer.storage.from("chattable").upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type,
      });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabaseServer.storage.from("chattable").getPublicUrl(filePath);

      imageUrl = publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  }

  // Update menu item
  const [updatedMenu] = await db
    .update(menus)
    .set({
      categoryId,
      name,
      description: description || null,
      image: imageUrl,
      price: priceValue.toString(),
      isAvailable,
    })
    .where(and(eq(menus.id, menuId), eq(menus.organizationId, activeOrgId)))
    .returning();

  return updatedMenu;
}
