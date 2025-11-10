"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, UserPlus, ChevronDown } from "lucide-react";
import { ExportDropdown } from "./ExportDropdown";
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
};

// Mock team members
const teamMembers = [
  { name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You", role: "Owner" },
  { name: "Alex", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", role: "Editor" },
];

export function ToolBar({ activeTab, onExport, onShare }: ToolBarProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Team Members */}
      <div className="flex items-center -space-x-2">
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

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Export & Share */}
      <div className="flex items-center gap-2">
        <ExportDropdown activeTab={activeTab} onExport={onExport} />
        <Button variant="outline" size="sm" className="gap-2" onClick={onShare}>
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </div>
  );
}

