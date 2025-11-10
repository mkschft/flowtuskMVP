"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Layout, Globe } from "lucide-react";
import type { TabType } from "@/components/DesignStudioWorkspace";
import { cn } from "@/lib/utils";

type TabBarProps = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "value-prop", label: "Value Prop", icon: <Sparkles className="w-4 h-4" /> },
  { id: "brand", label: "Brand Guide", icon: <Palette className="w-4 h-4" /> },
  { id: "style", label: "Style Guide", icon: <Layout className="w-4 h-4" /> },
  { id: "landing", label: "Landing", icon: <Globe className="w-4 h-4" /> },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex items-center gap-1 border-b bg-background px-4">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative gap-2 rounded-none border-b-2 border-transparent px-4 py-5",
            activeTab === tab.id
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.icon}
          <span className="font-medium">{tab.label}</span>
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
          )}
        </Button>
      ))}
    </div>
  );
}

