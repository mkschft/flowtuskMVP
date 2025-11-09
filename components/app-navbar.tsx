"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function AppNavbar() {
  const [viewMode, setViewMode] = useState<"editor" | "threads">("threads");

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-end px-4">
        {/* View Mode Toggle */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            if (value) setViewMode(value as "editor" | "threads");
          }}
          variant="outline"
          size="sm"
          className="h-7"
        >
          <ToggleGroupItem value="editor" aria-label="Editor" className="h-7 px-2 text-xs">
            Editor
          </ToggleGroupItem>
          <ToggleGroupItem value="threads" aria-label="Threads" className="h-7 px-2 text-xs">
            Threads
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </nav>
  );
}

