"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown, Loading03Icon, PlusSignIcon, VoiceIcon } from "@hugeicons/core-free-icons";
import { getRestaurants } from "@/lib/actions/restaurant";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type Restaurant = {
  id: string;
  name: string;
  logo: string;
};

export function RestaurantSwitcher() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { data: activeRestaurant } = authClient.useActiveOrganization();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRestaurants = useCallback(async () => {
    try {
      const data = await getRestaurants();

      const restaurantsList: Restaurant[] = (data || []).map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        logo: restaurant.logo as string,
      }));

      setRestaurants(restaurantsList);
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to load restaurants", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchRestaurants();
    }, 0);
    return () => clearTimeout(timeout);
  }, [fetchRestaurants]);

  useEffect(() => {
    if (activeRestaurant) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentRestaurant(restaurants.find((restaurant) => restaurant.id === activeRestaurant?.id) || null);
    }
  }, [activeRestaurant, restaurants]);

  const handleRestaurantSwitch = async (restaurantId: string) => {
    setIsLoading(true);
    const { error } = await authClient.organization.setActive({
      organizationId: restaurantId,
    });

    if (error) {
      setIsLoading(false);
      toast.error("Failed to switch restaurant", {
        description: error.message,
      });
      return;
    }

    setCurrentRestaurant(restaurants.find((restaurant) => restaurant.id === restaurantId) || null);
    setTimeout(() => {
      setIsLoading(false);
      router.refresh();
    }, 500);
  };

  const handleAddRestaurant = () => {
    router.push("/create");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-md border">
                  {isLoading ? (
                    <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
                  ) : (
                    <Avatar className="size-5 rounded-lg">
                      <AvatarImage
                        src={activeRestaurant?.logo as string}
                        alt={activeRestaurant?.name || "Restaurant Logo"}
                        className="object-cover object-center rounded-lg"
                      />
                      <AvatarFallback className="rounded-lg">{activeRestaurant?.name?.charAt(0) || "R"}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {isLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <span className="truncate font-medium">{activeRestaurant?.name || "No Restaurant"}</span>
                  )}
                </div>
                <HugeiconsIcon icon={ChevronDown} className="ml-auto" />
              </SidebarMenuButton>
            }
          ></DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">Restaurants</DropdownMenuLabel>
              {isLoading ? (
                <>
                  <DropdownMenuItem disabled className="gap-2 p-2">
                    <Skeleton className="size-6 rounded-md" />
                    <div className="flex flex-col gap-1 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="gap-2 p-2">
                    <Skeleton className="size-6 rounded-md" />
                    <div className="flex flex-col gap-1 flex-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </DropdownMenuItem>
                </>
              ) : restaurants.length === 0 ? (
                <DropdownMenuItem disabled className="gap-2 p-2">
                  <div className="text-muted-foreground text-sm">No agents found</div>
                </DropdownMenuItem>
              ) : (
                restaurants.map((restaurant) => (
                  <DropdownMenuItem
                    key={restaurant.id}
                    className="gap-2 p-2"
                    onClick={() => handleRestaurantSwitch(restaurant.id)}
                  >
                    <div
                      className={`flex size-6 items-center justify-center rounded-md border ${
                        currentRestaurant?.id === restaurant.id ? "bg-sidebar-accent" : ""
                      }`}
                    >
                      <Avatar className="size-3.5 rounded-lg">
                        <AvatarImage
                          src={restaurant.logo as string}
                          alt={restaurant.name || "Restaurant Logo"}
                          className="object-cover object-center rounded-lg"
                        />
                        <AvatarFallback className="rounded-lg">{restaurant.name?.charAt(0) || "R"}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{restaurant.name}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2" onClick={handleAddRestaurant}>
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">Add Restaurant</div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
