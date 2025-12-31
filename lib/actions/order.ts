"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "@/drizzle/db";
import { organizations, orders, orderItems, menus } from "@/drizzle/db/schema";
import { eq, inArray, and, desc, gte, lte, count, sum } from "drizzle-orm";

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

  // Generate an 8-digit alphanumeric orderId with non-ambiguous characters
  const nonAmbigChars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // Exclude I, L, O, 1, 0
  const orderId = Array.from({ length: 8 }, () => nonAmbigChars[Math.floor(Math.random() * nonAmbigChars.length)]).join(
    ""
  );

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

/**
 * Get orders with their items for the current organization
 */
export async function getOrders(status?: string, date?: Date) {
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

  // Build where condition
  const whereConditions = [eq(orders.organizationId, activeOrgId)];
  if (status && status !== "all") {
    whereConditions.push(eq(orders.status, status));
  }

  // Filter by date if provided
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    whereConditions.push(gte(orders.createdAt, startOfDay));
    whereConditions.push(lte(orders.createdAt, endOfDay));
  }

  // Fetch orders
  const ordersData = await db
    .select()
    .from(orders)
    .where(and(...whereConditions))
    .orderBy(desc(orders.createdAt));

  if (ordersData.length === 0) {
    return [];
  }

  // Fetch order items for all orders
  const orderIds = ordersData.map((order) => order.id);
  const itemsData = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      menuId: orderItems.menuId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      total: orderItems.total,
      notes: orderItems.notes,
      menuName: menus.name,
    })
    .from(orderItems)
    .innerJoin(menus, eq(orderItems.menuId, menus.id))
    .where(inArray(orderItems.orderId, orderIds));

  // Group items by orderId
  const itemsByOrderId = new Map<string, typeof itemsData>();
  for (const item of itemsData) {
    if (!itemsByOrderId.has(item.orderId)) {
      itemsByOrderId.set(item.orderId, []);
    }
    itemsByOrderId.get(item.orderId)!.push(item);
  }

  // Combine orders with their items
  return ordersData.map((order) => ({
    id: order.id,
    name: order.customerName || "Guest",
    tableNumber: order.tableNumber,
    orderType: order.type,
    status: order.status,
    total: parseFloat(order.total.toString()),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: (itemsByOrderId.get(order.id) || []).map((item) => ({
      id: item.id,
      name: item.menuName,
      quantity: item.quantity,
      price: parseFloat(item.price.toString()),
      total: parseFloat(item.total.toString()),
    })),
  }));
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string) {
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

  // Validate status
  const validStatuses = ["new", "cooking", "ready", "completed"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  // Update order
  const [updatedOrder] = await db
    .update(orders)
    .set({
      status,
      completedAt: status === "completed" ? new Date() : null,
    })
    .where(and(eq(orders.id, orderId), eq(orders.organizationId, activeOrgId)))
    .returning();

  if (!updatedOrder) {
    throw new Error("Order not found");
  }

  return updatedOrder;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
      todayRevenue: 0,
      pendingOrders: 0,
      menuItemsCount: 0,
    };
  }

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  // Total orders count
  const [totalOrdersResult] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.organizationId, activeOrgId));

  // Total revenue
  const [totalRevenueResult] = await db
    .select({ total: sum(orders.total) })
    .from(orders)
    .where(and(eq(orders.organizationId, activeOrgId), eq(orders.status, "completed")));

  // Today's orders count
  const [todayOrdersResult] = await db
    .select({ count: count() })
    .from(orders)
    .where(
      and(eq(orders.organizationId, activeOrgId), gte(orders.createdAt, today), lte(orders.createdAt, endOfToday))
    );

  // Today's revenue
  const [todayRevenueResult] = await db
    .select({ total: sum(orders.total) })
    .from(orders)
    .where(
      and(
        eq(orders.organizationId, activeOrgId),
        eq(orders.status, "completed"),
        gte(orders.createdAt, today),
        lte(orders.createdAt, endOfToday)
      )
    );

  // Pending orders (new + cooking + ready)
  const [pendingOrdersResult] = await db
    .select({ count: count() })
    .from(orders)
    .where(and(eq(orders.organizationId, activeOrgId), inArray(orders.status, ["new", "cooking", "ready"])));

  // Menu items count
  const [menuItemsResult] = await db
    .select({ count: count() })
    .from(menus)
    .where(eq(menus.organizationId, activeOrgId));

  return {
    totalOrders: totalOrdersResult?.count || 0,
    totalRevenue: parseFloat(totalRevenueResult?.total?.toString() || "0"),
    todayOrders: todayOrdersResult?.count || 0,
    todayRevenue: parseFloat(todayRevenueResult?.total?.toString() || "0"),
    pendingOrders: pendingOrdersResult?.count || 0,
    menuItemsCount: menuItemsResult?.count || 0,
  };
}
