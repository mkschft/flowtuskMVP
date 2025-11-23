"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Download,
  ChevronDown,
  Camera,
  File
} from "lucide-react";
import type { TabType } from "@/components/DesignStudioWorkspace";

type ExportDropdownProps = {
  activeTab: TabType;
  onExport: (format: string, message: string) => void;
};

export function ExportDropdown({ activeTab, onExport }: ExportDropdownProps) {
  const handleExport = (format: string, message: string) => {
    onExport(format, message);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={() => handleExport("png", "Exporting view as PNG...")}>
          <Camera className="w-4 h-4 mr-2" />
          Export View as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf", "Exporting view as PDF...")}>
          <File className="w-4 h-4 mr-2" />
          Export View as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
