"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { format, isToday, startOfToday } from "date-fns";
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
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await getOrders(selectedTab === "all" ? undefined : selectedTab, selectedDate);
        setOrders(data);
      } catch (error) {
        toast.error("Failed to fetch orders");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [selectedTab, selectedDate]);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order List</h1>
          <p className="text-sm text-muted-foreground">Manage your orders</p>
        </div>
      </div>
      <div>
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="order-2 md:order-1">
            <TabsList>
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
          </Tabs>
          <div className="order-1 md:order-2">
            <Popover>
              <PopoverTrigger>
                <Button variant="outline" className="gap-2">
                  <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
                  {isToday(selectedDate) ? "Today" : format(selectedDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          {["all", "new", "cooking", "ready", "completed"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No orders found</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {orders.map((order) => (
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
          ))}
        </Tabs>
      </div>
    </div>
  );
}
