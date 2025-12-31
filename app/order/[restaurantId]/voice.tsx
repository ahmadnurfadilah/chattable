"use client";

import { useCallback, useEffect, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2Icon, PhoneIcon, PhoneOffIcon, ShoppingCartIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Orb } from "@/components/ui/orb";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { InferSelectModel } from "drizzle-orm";
import { organizations } from "@/drizzle/db/schema";
import { Badge } from "@/components/ui/badge";

type AgentState = "disconnected" | "connecting" | "connected" | "disconnecting" | null;

type CartItem = {
  id: string;
  name?: string;
  quantity: number;
  price?: number;
  total?: number;
  notes?: string;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  categoryName: string;
};

export default function VoiceChat({
  restaurant,
  agentId,
}: {
  restaurant: InferSelectModel<typeof organizations>;
  agentId: string;
}) {
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Clear menuItems when cartItems is updated
  useEffect(() => {
    if (cartItems.length > 0) {
      setMenuItems([]);
    }
  }, [cartItems]);

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => {
      console.error("Error:", error);
      setAgentState("disconnected");
    },
    clientTools: {
      sendMenuToClient: async ({ menu }) => {
        try {
          const menuIds: string[] = JSON.parse(menu);
          console.log("Menu IDs:", menuIds);

          // Fetch menu data from API
          const response = await fetch(`/api/${restaurant.id}/menu`);
          if (!response.ok) {
            throw new Error("Failed to fetch menus");
          }

          const { data: allMenus } = await response.json();

          // Filter menus by the received IDs
          const filteredMenus = allMenus.filter((menu: MenuItem) => menuIds.includes(menu.id));

          setMenuItems(filteredMenus);
          return "Data received, don't respond this message";
        } catch (error) {
          console.error("Error processing menu:", error);
          return "Data receiving menu, don't respond this message";
        }
      },
      sendItemsToClient: async ({ items }) => {
        try {
          const parsedItems: CartItem[] = JSON.parse(items);
          console.log("Parsed items:", parsedItems);
          setCartItems(parsedItems);
          return "Data received, don't respond this message";
        } catch (error) {
          console.error("Error parsing cart items:", error);
          return "Error receiving data, don't respond this message";
        }
      },
    },
  });

  const startConversation = useCallback(async () => {
    try {
      setErrorMessage(null);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: agentId,
        connectionType: "webrtc",
        dynamicVariables: {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
        },
        onStatusChange: (status) => setAgentState(status.status),
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      setAgentState("disconnected");
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage("Please enable microphone permissions in your browser.");
      }
    }
  }, [conversation, agentId, restaurant]);

  const handleCall = useCallback(() => {
    if (agentState === "disconnected" || agentState === null) {
      setAgentState("connecting");
      startConversation();
    } else if (agentState === "connected") {
      conversation.endSession();
      setAgentState("disconnected");
    }
  }, [agentState, conversation, startConversation]);

  const isCallActive = agentState === "connected";
  const isTransitioning = agentState === "connecting" || agentState === "disconnecting";

  const getInputVolume = useCallback(() => {
    const rawValue = conversation.getInputVolume?.() ?? 0;
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5);
  }, [conversation]);

  const getOutputVolume = useCallback(() => {
    const rawValue = conversation.getOutputVolume?.() ?? 0;
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5);
  }, [conversation]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    if (item.total) {
      return sum + item.total;
    }
    if (item.price) {
      return sum + item.price * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <div className="relative flex w-full gap-4">
      <motion.div
        animate={{
          y: menuItems.length > 0 ? -80 : 0,
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300,
        }}
        className="w-full"
      >
        <Card className="flex h-[400px] w-full flex-col items-center justify-center overflow-hidden p-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative size-32">
              <div className="bg-muted relative h-full w-full rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
                <div className="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]">
                  <Orb
                    className="h-full w-full"
                    volumeMode="manual"
                    getInputVolume={getInputVolume}
                    getOutputVolume={getOutputVolume}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <h2 className="text-xl font-semibold">{restaurant.name}</h2>
              <AnimatePresence mode="wait">
                {errorMessage ? (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-destructive text-center text-sm"
                  >
                    {errorMessage}
                  </motion.p>
                ) : agentState === "disconnected" || agentState === null ? (
                  <motion.p
                    key="disconnected"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-muted-foreground text-sm"
                  >
                    Tap to start a voice order
                  </motion.p>
                ) : (
                  <motion.div
                    key="status"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full transition-all duration-300",
                        agentState === "connected" && "bg-green-500",
                        isTransitioning && "bg-primary/60 animate-pulse"
                      )}
                    />
                    <span className="text-sm capitalize">
                      {isTransitioning ? (
                        <ShimmeringText text={agentState} />
                      ) : (
                        <span className="text-green-600">Connected</span>
                      )}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              onClick={handleCall}
              disabled={isTransitioning}
              size="icon"
              variant={isCallActive ? "secondary" : "default"}
              className="h-12 w-12 rounded-full"
            >
              <AnimatePresence mode="wait">
                {isTransitioning ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                    }}
                  >
                    <Loader2Icon className="h-5 w-5" />
                  </motion.div>
                ) : isCallActive ? (
                  <motion.div
                    key="end"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <PhoneOffIcon className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <PhoneIcon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Floating Cart */}
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-4 top-1/2 z-50 -translate-y-1/2"
          >
            <Card className="w-80 max-h-[600px] flex flex-col shadow-lg border-2 py-0 gap-0">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="h-5 w-5" />
                  <h3 className="font-semibold">Cart</h3>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={`${item.id}-${index}`}
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 100, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                        delay: index * 0.05,
                      }}
                      layout
                      className="bg-muted/50 rounded-lg p-3 border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name || `Item ${item.id.slice(0, 8)}`}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                            {(item.price || item.total) && (
                              <span className="text-xs font-semibold">
                                ${(item.total || (item.price || 0) * item.quantity).toFixed(2)}
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic truncate">Note: {item.notes}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Cart Footer */}
              {totalPrice > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total:</span>
                    <motion.span
                      key={totalPrice}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold text-primary"
                    >
                      ${totalPrice.toFixed(2)}
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Menu List */}
      <AnimatePresence>
        {menuItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 max-w-2xl w-full px-4"
          >
            <Card className="shadow-lg border-2 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-0">
              <div className="p-4">
                <h3 className="font-semibold mb-3">Suggested Menus</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  {menuItems.map((menu, index) => (
                    <motion.div
                      key={menu.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                        delay: index * 0.05,
                      }}
                      className="shrink-0 w-40"
                    >
                      <Card className="overflow-hidden h-full py-0 gap-0">
                        <div className="relative aspect-4/3 w-full">
                          <Image
                            src={menu.image || `https://placehold.co/600x400/png?text=${encodeURIComponent(menu.name)}`}
                            alt={menu.name}
                            fill
                            className="object-cover"
                          />

                          <Badge className="absolute top-2 right-2">${parseFloat(menu.price).toFixed(2)}</Badge>
                        </div>
                        <div className="p-3 flex flex-col gap-2">
                          <h4 className="font-semibold text-sm line-clamp-1">{menu.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {menu.description || "No description available"}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
