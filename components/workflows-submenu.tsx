"use client";

import { useState, useMemo, useEffect } from "react";
import { useWorkflowTab } from "@/app/w/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Copy, Download, Palette, Type, Layout, Linkedin, Mail, Twitter, Instagram, Facebook, FileImage, Layers, User, Building2, Search } from "lucide-react";

export function WorkflowsSubmenu() {
  const { activeTab, activeSubmenu, setActiveSubmenu } = useWorkflowTab();
  const [searchQuery, setSearchQuery] = useState("");

  // Clear search when tab changes
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  const getSubmenuItems = () => {
    switch (activeTab) {
      case "value-prop":
        return [
          { id: "persona", label: "Persona (ICP)", icon: User },
          { id: "business-overview", label: "Business Overview", icon: Building2 },
        ];
      case "style":
        return [
          { id: "colors", label: "Colors", icon: Palette },
          { id: "typography", label: "Typography", icon: Type },
          { id: "components", label: "Components", icon: Layout },
        ];
      case "campaigns":
        return [
          { id: "linkedin", label: "LinkedIn", icon: Linkedin },
          { id: "email", label: "Email", icon: Mail },
          { id: "social", label: "Social", icon: Twitter },
          { id: "facebook", label: "Facebook", icon: Facebook },
          { id: "instagram", label: "Instagram", icon: Instagram },
          { id: "twitter", label: "Twitter", icon: Twitter },
        ];
      case "design":
        return [
          { id: "templates", label: "Templates", icon: FileImage },
          { id: "assets", label: "Assets", icon: Layers },
        ];
      default:
        return [];
    }
  };

  const allItems = useMemo(() => getSubmenuItems(), [activeTab]);

  // Set default submenu when tab changes if none is set
  useEffect(() => {
    if (allItems.length > 0 && !activeSubmenu) {
      // Only set if there's no submenu in URL to avoid loops
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.get("s")) {
        setActiveSubmenu(allItems[0].id);
      }
    }
  }, [activeTab, allItems, activeSubmenu, setActiveSubmenu]);

  // Determine if search should be shown for this tab
  const showSearch = activeTab === "campaigns" || allItems.length > 5;

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    const query = searchQuery.toLowerCase();
    return allItems.filter((item) =>
      item.label.toLowerCase().includes(query)
    );
  }, [allItems, searchQuery]);

  if (allItems.length === 0) return null;

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-10 items-center gap-2 px-4">
        {showSearch && (
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-7 pr-2 text-xs"
            />
          </div>
        )}
        <div className="flex items-center gap-1 flex-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubmenu === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setActiveSubmenu(item.id)}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

