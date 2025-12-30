"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar01Icon,
  FireIcon,
  HotelBellIcon,
  LayoutGridIcon,
  ServingFoodIcon,
  ShoppingBag02Icon,
  SpoonAndForkIcon,
  TickDouble03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { getOrders } from "@/lib/actions/order";
import { toast } from "sonner";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

type Order = {
  id: string;
  name: string;
  tableNumber: string | null;
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  orderType: string;
  items: OrderItem[];
};

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        toast.error("Failed to fetch orders");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const getFilteredOrders = (status: string) => {
    if (status === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === status);
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order List</h1>
          <p className="text-sm text-muted-foreground">Manage your orders</p>
        </div>
      </div>
      <div>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-2">
            <TabsTrigger value="all">
              <HugeiconsIcon icon={LayoutGridIcon} className="size-3" />
              All
            </TabsTrigger>
            <TabsTrigger value="new">
              <HugeiconsIcon icon={HotelBellIcon} className="size-3" />
              New
            </TabsTrigger>
            <TabsTrigger value="cooking">
              <HugeiconsIcon icon={FireIcon} className="size-3" />
              Cooking
            </TabsTrigger>
            <TabsTrigger value="ready">
              <HugeiconsIcon icon={ServingFoodIcon} className="size-3" />
              Ready
            </TabsTrigger>
            <TabsTrigger value="completed">
              <HugeiconsIcon icon={TickDouble03Icon} className="size-3" />
              Completed
            </TabsTrigger>
          </TabsList>
          {["all", "new", "cooking", "ready", "completed"].map((tabValue) => {
            const filteredOrders = getFilteredOrders(tabValue);
            return (
              <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No orders found</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredOrders.map((order) => (
                      <Card key={order.id} className="p-2">
                        <CardContent className="p-2">
                          <div className="flex items-center justify-between mb-2">
                            <h2>{order.name}</h2>
                            <p className="text-sm text-muted-foreground">#{order.id}</p>
                          </div>
                          <div className="text-muted-foreground space-y-1.5">
                            <div className="flex items-center gap-1">
                              <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
                              <p className="text-xs">{format(order.createdAt, "d MMM, hh:mm a")}</p>
                            </div>
                            {order.orderType === "takeaway" ? (
                              <div className="flex items-center gap-1">
                                <HugeiconsIcon icon={ShoppingBag02Icon} className="size-4" />
                                <p className="text-xs">Takeaway</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <HugeiconsIcon icon={SpoonAndForkIcon} className="size-4" />
                                {order.tableNumber ? (
                                  <p className="text-xs">Table #{order.tableNumber}</p>
                                ) : (
                                  <p className="text-xs">Dine-in</p>
                                )}
                              </div>
                            )}
                          </div>

                          <hr className="my-3 border-dashed" />

                          <div className="space-y-1.5 mb-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold">Order ({order.items.length})</p>
                              <p className="text-xs font-bold text-primary">${order.total.toFixed(2)}</p>
                            </div>
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity}x {item.name}
                                </p>
                                <p className="text-xs">${item.price.toFixed(2)}</p>
                              </div>
                            ))}
                          </div>

                          {order.status === "new" && (
                            <Badge variant="outline">
                              <HugeiconsIcon icon={HotelBellIcon} className="size-4" />
                              New Order
                            </Badge>
                          )}
                          {order.status === "cooking" && (
                            <Badge variant="outline">
                              <HugeiconsIcon icon={FireIcon} className="size-4" />
                              Cooking
                            </Badge>
                          )}
                          {order.status === "ready" && (
                            <Badge variant="outline">
                              <HugeiconsIcon icon={ServingFoodIcon} className="size-4" />
                              Ready to serve
                            </Badge>
                          )}
                          {order.status === "completed" && (
                            <Badge variant="outline">
                              <HugeiconsIcon icon={TickDouble03Icon} className="size-4" />
                              Completed
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
