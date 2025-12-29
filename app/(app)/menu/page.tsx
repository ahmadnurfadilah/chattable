import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GridViewIcon, PencilEdit02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";

const menus = [
  {
    name: "Mozarella Pizza",
    category: "Main Course",
    price: 10.99,
    image: "https://placehold.co/600x400/png",
    description: "A delicious pizza width mozzarella cheese and tomato sauce",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Buffalo Wings",
    category: "Main Course",
    price: 10.99,
    image: "https://placehold.co/600x400/png",
    description: "A delicious pizza with mozzarella cheese and tomato sauce",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Nachos",
    category: "Appetizer",
    price: 2.99,
    image: "https://placehold.co/600x400/png",
    description: "A delicious nachos with cheese and salsa",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Salad",
    category: "Salad",
    price: 2.99,
    image: "https://placehold.co/600x400/png",
    description: "A delicious salad with lettuce and tomato",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Coke",
    category: "Drink",
    price: 1.99,
    image: "https://placehold.co/600x400/png",
    description: "A delicious pizza with mozzarella cheese and tomato sauce",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Ice Cream",
    category: "Dessert",
    price: 2.99,
    image: "https://placehold.co/600x400/png",
    description: "A delicious pizza with mozzarella cheese and tomato sauce",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function MenuPage() {
  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-sm text-muted-foreground">Manage your menu items and categories</p>
        </div>
        <Button variant="outline">
          <HugeiconsIcon icon={GridViewIcon} />
          Manage Categories
        </Button>
      </div>
      <div>
        <Tabs defaultValue="account" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Categories</TabsTrigger>
            <TabsTrigger value="Main">Main Course</TabsTrigger>
            <TabsTrigger value="Dessert">Dessert</TabsTrigger>
            <TabsTrigger value="Drink">Drink</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Link href="/menu/create" className="w-full h-full flex flex-col gap-4 items-center justify-center border border-dashed border-border rounded-xl p-4 hover:bg-muted group">
            <HugeiconsIcon icon={PlusSignIcon} className="group-hover:rotate-180 transition-all ease-in-out" />
            <p className="text-sm text-muted-foreground transition-all ease-in-out">Add new menu item</p>
          </Link>
          {menus.map((menu) => (
            <Card key={menu.name} className="py-0">
              <CardContent className="p-2 flex flex-col gap-2">
                <div className="shrink-0 relative aspect-4/3 rounded-xl overflow-hidden">
                  <Image src={menu.image} alt={menu.name} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <h3 className="text-base font-semibold">{menu.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{menu.description}</p>
                </div>
                <div className="shrink-0 flex items-center justify-between">
                  <p className="font-bold">${menu.price}</p>
                  <Button variant="outline" size="icon">
                    <HugeiconsIcon icon={PencilEdit02Icon} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
