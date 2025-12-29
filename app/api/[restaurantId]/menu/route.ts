import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { menus, menuCategories, organizations } from "@/drizzle/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
  try {
    const { restaurantId } = await params;

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    // Verify restaurant exists
    const [restaurant] = await db.select().from(organizations).where(eq(organizations.id, restaurantId)).limit(1);

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Get menus for the restaurant
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
      .where(and(eq(menus.organizationId, restaurantId), eq(menus.isAvailable, true)))
      .orderBy(asc(menuCategories.orderColumn), asc(menus.createdAt));

    return NextResponse.json({
      success: true,
      data: menusData,
    });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
