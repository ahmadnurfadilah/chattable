"use server";

import { db } from "@/drizzle/db";
import { organizations, orders, orderItems, menus } from "@/drizzle/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { randomUUID } from "crypto";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

interface DataCollectionResults {
  name?: {
    value: string;
  };
  orderType?: {
    value: string;
  };
  items?: {
    value: string; // JSON string array
  };
}

/**
 * Get organization by agentId from metadata
 */
export async function getOrganizationByAgentId(agentId: string) {
  const allOrgs = await db.select().from(organizations);

  for (const org of allOrgs) {
    if (org.metadata) {
      try {
        const metadata = JSON.parse(org.metadata);
        if (metadata.agentId === agentId) {
          return org;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Skip invalid JSON
        continue;
      }
    }
  }

  return null;
}

/**
 * Create order from webhook data collection results
 */
export async function createOrderFromWebhook(agentId: string, dataCollectionResults: DataCollectionResults) {
  // Get organization by agentId
  const organization = await getOrganizationByAgentId(agentId);
  if (!organization) {
    throw new Error(`Organization not found for agentId: ${agentId}`);
  }

  // Extract data from dataCollectionResults
  const customerName = dataCollectionResults.name?.value || null;
  const orderType = dataCollectionResults.orderType?.value || "takeaway";
  const itemsJson = dataCollectionResults.items?.value;

  if (!itemsJson) {
    throw new Error("No items found in data collection results");
  }

  // Parse items JSON string
  let items: OrderItem[];
  try {
    items = JSON.parse(itemsJson);
  } catch (error) {
    throw new Error(`Invalid items JSON: ${error}`);
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Items must be a non-empty array");
  }

  // Get menu IDs and fetch menu items with prices
  const menuIds = items.map((item) => item.id);
  const menuRecords = await db
    .select()
    .from(menus)
    .where(and(inArray(menus.id, menuIds), eq(menus.organizationId, organization.id)));

  // Create a map of menu ID to menu record
  const menuMap = new Map(menuRecords.map((menu) => [menu.id, menu]));

  // Validate all items exist
  for (const item of items) {
    if (!menuMap.has(item.id)) {
      throw new Error(`Menu item not found: ${item.id}`);
    }
  }

  // Calculate totals
  let orderTotal = 0;
  const orderItemsData = items.map((item) => {
    const menu = menuMap.get(item.id)!;
    const price = parseFloat(menu.price.toString());
    const quantity = item.quantity;
    const itemTotal = price * quantity;
    orderTotal += itemTotal;

    return {
      menuId: item.id,
      quantity,
      price: price.toString(),
      total: itemTotal.toString(),
      notes: item.notes || null,
    };
  });

  // Generate order ID
  const orderId = randomUUID();

  // Create order
  const [newOrder] = await db
    .insert(orders)
    .values({
      id: orderId,
      organizationId: organization.id,
      type: orderType,
      customerName,
      paymentType: "cash", // Default payment type, can be updated later
      total: orderTotal.toString(),
      status: "new",
    })
    .returning();

  // Create order items
  const createdOrderItems = await db
    .insert(orderItems)
    .values(
      orderItemsData.map((item) => ({
        orderId: orderId,
        menuId: item.menuId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        notes: item.notes,
        status: "new",
      }))
    )
    .returning();

  return {
    order: newOrder,
    orderItems: createdOrderItems,
  };
}
