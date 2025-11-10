"use client";

import { Button } from "@/components/ui/button";
import { Download, Share2, Settings, Shuffle } from "lucide-react";

export function ToolBar() {
  return (
    <div className="flex items-center justify-between gap-2 p-3 border-t bg-background">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Shuffle className="w-4 h-4" />
          Shuffle Colors
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

