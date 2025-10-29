"use client";

import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

/**
 * ChatChips - Chip button group for quick selections
 *
 * Used throughout the conversation flow for:
 * - Email vs LinkedIn choice
 * - Email format selection (Single/Sequence 5/7/10)
 * - LinkedIn format selection (Post/Bio/InMail)
 */

interface ChatChip {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ChatChipsProps {
  chips: ChatChip[];
  onSelect: (chipId: string) => void;
  selectedId?: string;
  multiSelect?: boolean;
  selectedIds?: string[];
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ChatChips({
  chips,
  onSelect,
  selectedId,
  multiSelect = false,
  selectedIds = [],
  className,
  size = "md",
}: ChatChipsProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const isSelected = (chipId: string) => {
    if (multiSelect) {
      return selectedIds.includes(chipId);
    }
    return selectedId === chipId;
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {chips.map((chip) => {
        const selected = isSelected(chip.id);

        return (
          <Button
            key={chip.id}
            variant={selected ? "default" : "outline"}
            className={cn(
              "transition-all duration-200",
              sizeClasses[size],
              selected && "ring-2 ring-offset-2",
              !selected && "hover:border-primary/50"
            )}
            onClick={() => onSelect(chip.id)}
          >
            {chip.icon && <span className="mr-2">{chip.icon}</span>}
            <span>{chip.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

/**
 * Compact variant for inline usage
 */
export function CompactChips({
  chips,
  onSelect,
  selectedId,
  className,
}: Omit<ChatChipsProps, "size" | "multiSelect" | "selectedIds">) {
  return (
    <div className={cn("inline-flex gap-1.5", className)}>
      {chips.map((chip) => {
        const selected = selectedId === chip.id;

        return (
          <button
            key={chip.id}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-all",
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
            onClick={() => onSelect(chip.id)}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
