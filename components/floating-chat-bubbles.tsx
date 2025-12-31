/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ChatBubble {
  id: number;
  message: string;
  avatarInitial: string;
  x: number;
  y: number;
  delay: number;
  duration: number;
  xOffset: number;
  yOffset: number;
}

const messages = [
  "I'll have a burger, please",
  "What's on the menu today?",
  "Can I get a large pizza?",
  "Do you have vegetarian options?",
  "I'd like to place an order",
  "What are your specials?",
  "Can I customize my order?",
  "How long will it take?",
];

const avatarInitials = ["A", "B", "C", "D", "E", "F", "J", "M"];

// Generate random bubbles with better positioning
// Strictly avoid center area where main text content is (35-65% horizontal, 25-75% vertical)
const generateBubbles = (cycleId: number): ChatBubble[] => {
  // Shuffle messages and avatar initials to ensure variety
  const shuffledMessages = [...messages].sort(() => Math.random() - 0.5);
  const shuffledAvatars = [...avatarInitials].sort(() => Math.random() - 0.5);

  return Array.from({ length: 3 }, (_, i) => {
    const message = shuffledMessages[i % shuffledMessages.length];
    const avatarInitial = shuffledAvatars[i % shuffledAvatars.length];

    // Position bubbles strictly in corners and edges
    // Avoid center: 35-65% horizontal, 25-75% vertical
    let x: number, y: number;

    const position = i % 3;
    switch (position) {
      case 0: // Top-left corner
        x = 3 + Math.random() * 12; // 3-15% from left
        y = 5 + Math.random() * 15; // 5-20% from top
        break;
      case 1: // Top-right corner
        x = 85 + Math.random() * 5; // 85-90% from left
        y = 5 + Math.random() * 15; // 5-20% from top
        break;
      default: // Bottom-left or bottom-right (alternating)
        if (cycleId % 2 === 0) {
          // Bottom-left corner
          x = 3 + Math.random() * 12; // 3-15% from left
          y = 50 + Math.random() * 10; // 50-60% from top
        } else {
          // Bottom-right corner
          x = 85 + Math.random() * 5; // 85-90% from left
          y = 50 + Math.random() * 10; // 50-60% from top
        }
    }

    return {
      id: cycleId * 10 + i, // Unique ID per cycle
      message,
      avatarInitial,
      x,
      y,
      delay: i * 0.3, // Stagger the animations
      duration: 8, // Fixed duration for consistent cycling
      xOffset: (Math.random() - 0.5) * 30, // -15 to +15% horizontal movement
      yOffset: -25 - Math.random() * 30, // -25 to -55% vertical movement (upward)
    };
  });
};

export function FloatingChatBubbles() {
  const cycleIdRef = useRef(0);
  const [bubbles, setBubbles] = useState<ChatBubble[]>(() => generateBubbles(0));

  useEffect(() => {
    // Cycle duration: 2s fade in + 4s visible + 2s fade out = 8s total
    const cycleDuration = 8000;

    const interval = setInterval(() => {
      cycleIdRef.current += 1;
      // Generate new bubbles for the next cycle
      setBubbles(generateBubbles(cycleIdRef.current));
    }, cycleDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className={cn(
            "absolute rounded-2xl rounded-bl-sm px-3 py-2 sm:px-4 sm:py-2.5 pb-8 text-sm",
            "bg-background/95 backdrop-blur-md border shadow-xl",
            "dark:bg-card/95 dark:border-border/50",
            "max-w-[160px] sm:max-w-[180px]",
            "transition-all duration-300",
            "relative"
          )}
          initial={{
            opacity: 0,
            scale: 0.7,
            x: 0,
            y: 0,
          }}
          animate={{
            // Animate in (0-25%): fade in and scale up
            // Stay visible (25-75%): maintain opacity and scale
            // Animate out (75-100%): fade out and scale down
            opacity: [0, 0.9, 0.9, 0],
            scale: [0.7, 1, 1, 0.7],
            x: [0, `${bubble.xOffset * 0.3}%`, `${bubble.xOffset}%`, `${bubble.xOffset * 0.3}%`, 0],
            y: [0, `${bubble.yOffset * 0.3}%`, `${bubble.yOffset}%`, `${bubble.yOffset * 0.3}%`, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: 0, // Don't repeat, we'll cycle manually
            ease: "easeInOut",
            times: [0, 0.25, 0.75, 1], // 25% fade in, 50% visible, 25% fade out
          }}
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
          }}
        >
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-medium">{bubble.message}</p>
          {/* Chat bubble tail */}
          <div
            className={cn(
              "absolute -bottom-1 left-3 sm:left-4 w-3 h-3 rotate-45",
              "bg-background border-b border-r",
              "dark:bg-card dark:border-border/50"
            )}
          />
          {/* Avatar at bottom */}
          <div
            className={cn(
              "absolute -bottom-10 left-6 -translate-x-1/2",
              "size-8 rounded-full border-2 border-background dark:border-card",
              "flex items-center justify-center text-white text-xs font-semibold",
              "shadow-md"
            )}
          >
            <img
              src={`https://avatar.iran.liara.run/public?name=${bubble.avatarInitial}`}
              alt="Image Avatar"
              className="size-full object-cover rounded-full"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
