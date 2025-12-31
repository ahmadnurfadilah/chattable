"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
import { getOrders, updateOrderStatus } from "@/lib/actions/order";
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const handleStatusUpdate = async (newStatus: string | null) => {
    if (!selectedOrder || !newStatus) return;

    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      toast.success("Order status updated successfully");

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === selectedOrder.id ? { ...order, status: newStatus } : order))
      );

      // Update selected order
      setSelectedOrder({ ...selectedOrder, status: newStatus });

      // Close sheet if order is completed
      if (newStatus === "completed") {
        setIsSheetOpen(false);
      }
    } catch (error) {
      toast.error("Failed to update order status");
      console.error(error);
    }
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Card key={index} className="p-2">
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between mb-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>

                        <hr className="my-3 border-dashed" />

                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-3 w-10" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-10" />
                          </div>
                        </div>

                        <Skeleton className="h-6 w-24 rounded-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No orders found</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {orders.map((order) => (
                    <Card
                      key={order.id}
                      className="p-2 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleOrderClick(order)}
                    >
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
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {item.quantity}x {item.name}
                              </p>
                              <p className="text-xs">${item.price.toFixed(2)}</p>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>

                        {order.status === "new" && (
                          <Badge variant="outline" className="border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-400 dark:bg-rose-500/20 dark:border-rose-500/30">
                            <HugeiconsIcon icon={HotelBellIcon} className="size-4" />
                            New Order
                          </Badge>
                        )}
                        {order.status === "cooking" && (
                          <Badge variant="outline" className="border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400 dark:bg-orange-500/20 dark:border-orange-500/30">
                            <HugeiconsIcon icon={FireIcon} className="size-4" />
                            Cooking
                          </Badge>
                        )}
                        {order.status === "ready" && (
                          <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20 dark:border-green-500/30">
                            <HugeiconsIcon icon={ServingFoodIcon} className="size-4" />
                            Ready to serve
                          </Badge>
                        )}
                        {order.status === "completed" && (
                          <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:bg-blue-500/20 dark:border-blue-500/30">
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

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Order Details</SheetTitle>
                <SheetDescription>
                  Order #{selectedOrder.id} • {format(selectedOrder.createdAt, "MMM d, yyyy 'at' hh:mm a")}
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 space-y-6">
                {/* Customer Info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Customer Information</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedOrder.name}</span>
                    </div>
                    {selectedOrder.orderType === "takeaway" ? (
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={ShoppingBag02Icon} className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Takeaway</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={SpoonAndForkIcon} className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {selectedOrder.tableNumber ? `Table #${selectedOrder.tableNumber}` : "Dine-in"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Order Status</h3>
                  <Select value={selectedOrder.status} onValueChange={handleStatusUpdate}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {selectedOrder.status === "new" && (
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={HotelBellIcon} className="size-4" />
                            <span>New Order</span>
                          </div>
                        )}
                        {selectedOrder.status === "cooking" && (
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={FireIcon} className="size-4" />
                            <span>Cooking</span>
                          </div>
                        )}
                        {selectedOrder.status === "ready" && (
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={ServingFoodIcon} className="size-4" />
                            <span>Ready to serve</span>
                          </div>
                        )}
                        {selectedOrder.status === "completed" && (
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={TickDouble03Icon} className="size-4" />
                            <span>Completed</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={HotelBellIcon} className="size-4" />
                          <span>New Order</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cooking">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={FireIcon} className="size-4" />
                          <span>Cooking</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ready">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={ServingFoodIcon} className="size-4" />
                          <span>Ready to serve</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={TickDouble03Icon} className="size-4" />
                          <span>Completed</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Order Items ({selectedOrder.items.length})</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-md border bg-muted/50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">${item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-primary">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
