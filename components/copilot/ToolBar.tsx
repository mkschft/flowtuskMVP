"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, UserPlus, ChevronDown, Undo2, Redo2 } from "lucide-react";
import { ExportDropdown } from "./ExportDropdown";
import { ExportToFigmaButton } from "./ExportToFigmaButton";
import type { TabType } from "@/components/DesignStudioWorkspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ToolBarProps = {
  activeTab: TabType;
  onExport: (format: string, message: string) => void;
  onShare: () => void;
  flowId: string;
  workspaceData: any;
  designAssets: any;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

// Mock team members
const teamMembers = [
  { name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You", role: "Owner" },
  { name: "Alex", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", role: "Editor" },
];

export function ToolBar({
  activeTab,
  onExport,
  onShare,
  flowId,
  workspaceData,
  designAssets,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}: ToolBarProps) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      {/* Undo/Redo Controls - Desktop Only */}
      <div className="hidden md:flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="gap-2"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="gap-2"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Divider - Desktop Only */}
      <div className="hidden md:block h-6 w-px bg-border" />

      {/* Team Members - Desktop Only */}
      <div className="hidden md:flex items-center -space-x-2">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="relative group"
            title={`${member.name} (${member.role})`}
          >
            <img
              src={member.avatar}
              alt={member.name}
              className="w-8 h-8 rounded-full border-2 border-background ring-1 ring-border hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
            />
          </div>
        ))}

        {/* Add Member Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 rounded-full p-0 border-2 border-dashed hover:border-purple-500 hover:text-purple-600 transition-colors ml-2"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite team member
            </DropdownMenuItem>
            <DropdownMenuItem>
              Copy invite link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Manage team</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Divider - Desktop Only */}
      <div className="hidden md:block h-6 w-px bg-border" />

      {/* Export & Share - Compact on Mobile */}
      <div className="flex items-center gap-1 md:gap-2">
        <div className="hidden md:block">
          <ExportToFigmaButton
            flowId={flowId}
            workspaceData={workspaceData}
            designAssets={designAssets}
          />
        </div>

        {/* Mobile: Overflow Menu with All Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onUndo} disabled={!canUndo}>
              <Undo2 className="w-4 h-4 mr-2" />
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRedo} disabled={!canRedo}>
              <Redo2 className="w-4 h-4 mr-2" />
              Redo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onExport('png', 'Exporting as PNG...')}>
              Export PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('pdf', 'Exporting as PDF...')}>
              Export PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden md:block">
          <ExportDropdown activeTab={activeTab} onExport={onExport} />
        </div>
        <Button variant="outline" size="sm" className="gap-2 hidden md:flex" onClick={onShare}>
          <Share2 className="w-4 h-4" />
          Share
        </Button>

        {/* Mobile: Share button only */}
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 md:hidden" onClick={onShare}>
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

