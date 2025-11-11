"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ValuePropRow = {
  icon: React.ReactNode;
  label: string;
  content: string;
};

type ValuePropTableProps = {
  rows: ValuePropRow[];
  onCopy?: (text: string) => void;
};

export function ValuePropTable({ rows, onCopy }: ValuePropTableProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    onCopy?.(text);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full border-2 border-border rounded-lg overflow-hidden bg-background">
      {rows.map((row, index) => (
        <div
          key={index}
          className={cn(
            "group flex items-center gap-4 p-4 transition-colors hover:bg-muted/50",
            index !== rows.length - 1 && "border-b"
          )}
        >
          {/* Icon */}
          <div className="shrink-0 w-10 flex items-center justify-center">
            {row.icon}
          </div>

          {/* Label */}
          <div className="w-32 shrink-0">
            <p className="font-semibold text-sm">{row.label}</p>
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {row.content}
            </p>
          </div>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0"
            onClick={() => handleCopy(row.content, index)}
          >
            {copiedIndex === index ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}

