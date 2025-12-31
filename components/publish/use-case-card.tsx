"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown, ChevronUp } from "@hugeicons/core-free-icons";
import { useState } from "react";
import type { IconSvgElement } from "@hugeicons/react";

type UseCaseCardProps = {
  title: string;
  description: string;
  icon: IconSvgElement;
  instructions: string[];
};

export function UseCaseCard({ title, description, icon: Icon, instructions }: UseCaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <Card className="py-0">
        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors py-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="rounded-lg bg-primary/10 p-2">
                <HugeiconsIcon icon={Icon} className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>{title}</CardTitle>
                <CardDescription className="mt-1">{description}</CardDescription>
              </div>
            </div>
            <HugeiconsIcon
              icon={isExpanded ? ChevronUp : ChevronDown}
              className="size-4 text-muted-foreground shrink-0"
            />
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            <ul className="space-y-2 pb-6">
              {instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-muted-foreground">{instruction}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
