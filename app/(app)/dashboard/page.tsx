import { getRestaurants } from "@/lib/actions/restaurant";
import { getDashboardStats, getOrders } from "@/lib/actions/order";
import { getMenus } from "@/lib/actions/menu";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ShoppingBag02Icon,
  CreditCardIcon,
  HotelBellIcon,
  MenuIcon,
  FireIcon,
  ServingFoodIcon,
  TickDouble03Icon,
  ArrowRight01Icon,
  Calendar01Icon,
  SpoonAndForkIcon,
  PlusSignIcon,
  Settings01Icon,
  AiBrain04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";

export default async function DashboardPage() {
  const restaurants = await getRestaurants();

  if (restaurants.length === 0) {
    redirect("/create");
  }

  const stats = await getDashboardStats();
  const recentOrders = await getOrders(undefined, new Date());
  const menus = await getMenus();

  const recentOrdersList = recentOrders.slice(0, 5);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your restaurant</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-3xl font-bold">{stats.totalOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={ShoppingBag02Icon} className="size-4" />
              <span>All time</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={CreditCardIcon} className="size-4" />
              <span>Completed orders</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Today&apos;s Orders</CardDescription>
            <CardTitle className="text-3xl font-bold">{stats.todayOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
              <span>${stats.todayRevenue.toFixed(2)} revenue</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Pending Orders</CardDescription>
            <CardTitle className="text-3xl font-bold">{stats.pendingOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={HotelBellIcon} className="size-4" />
              <span>Needs attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from your restaurant</CardDescription>
              </div>
              <Link href="/order">
                <Button variant="outline" size="sm" className="gap-2">
                  View All
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrdersList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <HugeiconsIcon icon={ShoppingBag02Icon} className="size-12 mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
                <p className="text-xs mt-1">Orders will appear here when customers place them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrdersList.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{order.name}</span>
                        <span className="text-xs text-muted-foreground">#{order.id}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <HugeiconsIcon icon={Calendar01Icon} className="size-3" />
                          {format(order.createdAt, "MMM d, hh:mm a")}
                        </div>
                        {order.orderType === "takeaway" ? (
                          <div className="flex items-center gap-1">
                            <HugeiconsIcon icon={ShoppingBag02Icon} className="size-3" />
                            Takeaway
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <HugeiconsIcon icon={SpoonAndForkIcon} className="size-3" />
                            {order.tableNumber ? `Table #${order.tableNumber}` : "Dine-in"}
                          </div>
                        )}
                        <span>
                          {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">${order.total.toFixed(2)}</span>
                      {order.status === "new" && (
                        <Badge
                          variant="outline"
                          className="border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-400 dark:bg-rose-500/20 dark:border-rose-500/30"
                        >
                          <HugeiconsIcon icon={HotelBellIcon} className="size-3" />
                          New
                        </Badge>
                      )}
                      {order.status === "cooking" && (
                        <Badge
                          variant="outline"
                          className="border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400 dark:bg-orange-500/20 dark:border-orange-500/30"
                        >
                          <HugeiconsIcon icon={FireIcon} className="size-3" />
                          Cooking
                        </Badge>
                      )}
                      {order.status === "ready" && (
                        <Badge
                          variant="outline"
                          className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20 dark:border-green-500/30"
                        >
                          <HugeiconsIcon icon={ServingFoodIcon} className="size-3" />
                          Ready
                        </Badge>
                      )}
                      {order.status === "completed" && (
                        <Badge
                          variant="outline"
                          className="border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:bg-blue-500/20 dark:border-blue-500/30"
                        >
                          <HugeiconsIcon icon={TickDouble03Icon} className="size-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/menu/create">
              <Button variant="outline" className="w-full justify-start gap-2" size="lg">
                <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                Add Menu Item
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline" className="w-full justify-start gap-2" size="lg">
                <HugeiconsIcon icon={MenuIcon} className="size-4" />
                Manage Menu
              </Button>
            </Link>
            <Link href="/order">
              <Button variant="outline" className="w-full justify-start gap-2" size="lg">
                <HugeiconsIcon icon={ShoppingBag02Icon} className="size-4" />
                View Orders
              </Button>
            </Link>
            <Link href="/knowledge-base">
              <Button variant="outline" className="w-full justify-start gap-2" size="lg">
                <HugeiconsIcon icon={AiBrain04Icon} className="size-4" />
                Knowledge Base
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full justify-start gap-2" size="lg">
                <HugeiconsIcon icon={Settings01Icon} className="size-4" />
                Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
