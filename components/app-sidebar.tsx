"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  AiBrain04Icon,
  DashboardBrowsingIcon,
  Invoice02Icon,
  MenuRestaurantIcon,
  Settings01Icon,
  WebDesign01Icon,
} from "@hugeicons/core-free-icons";
import { NavUser } from "./nav-user";
import { HugeiconsIcon } from "@hugeicons/react";
import { User } from "better-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: DashboardBrowsingIcon,
  },
  {
    title: "Order",
    url: "/order",
    icon: Invoice02Icon,
  },
  {
    title: "Menu",
    url: "/menu",
    icon: MenuRestaurantIcon,
  },
  {
    title: "Knowledge Base",
    url: "/knowledge-base",
    icon: AiBrain04Icon,
  },
  {
    title: "Brand Design",
    url: "/brand-design",
    icon: WebDesign01Icon,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings01Icon,
  },
];

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: User }) {
  const pathname = usePathname();

  // Helper function to check if a path is active
  const isPathActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={
                <Link href="/dashboard">
                  <span className="text-base font-semibold">Speaksy</span>
                </Link>
              }
            ></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = isPathActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                      {item.icon && <HugeiconsIcon icon={item.icon} />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
