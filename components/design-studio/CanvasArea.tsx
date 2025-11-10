"use client";

import { Button } from "@/components/ui/button";
import { ToolBar } from "./ToolBar";
import { ValuePropCanvas } from "./ValuePropCanvas";
import { BrandGuideCanvas } from "./BrandGuideCanvas";
import { StyleGuideCanvas } from "./StyleGuideCanvas";
import { LandingCanvas } from "./LandingCanvas";
import type { TabType } from "@/components/DesignStudioWorkspace";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, Palette, Layout, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type CanvasAreaProps = {
  project: DesignProject;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onExport: (format: string, message: string) => void;
  onShare: () => void;
};

export function CanvasArea({
  project,
  activeTab,
  onTabChange,
  onExport,
  onShare,
}: CanvasAreaProps) {
  return (
    <div className="flex-1 flex flex-col bg-muted/30">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-b bg-background">
        {/* Left: Tab Navigation - Segmented Control Style */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("value-prop")}
            className={cn(
              "gap-2 h-8",
              activeTab === "value-prop"
                ? "bg-background text-purple-600 shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <Sparkles className="w-3 h-3" />
            Value Prop
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("brand")}
            className={cn(
              "gap-2 h-8",
              activeTab === "brand"
                ? "bg-background text-purple-600 shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <Palette className="w-3 h-3" />
            Brand Guide
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("style")}
            className={cn(
              "gap-2 h-8",
              activeTab === "style"
                ? "bg-background text-purple-600 shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <Layout className="w-3 h-3" />
            Style Guide
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("landing")}
            className={cn(
              "gap-2 h-8",
              activeTab === "landing"
                ? "bg-background text-purple-600 shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <Globe className="w-3 h-3" />
            Landing
          </Button>
        </div>

        {/* Right: Toolbar with Team & Actions */}
        <ToolBar activeTab={activeTab} onExport={onExport} onShare={onShare} />
      </div>

      {/* Canvas Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "value-prop" && <ValuePropCanvas project={project} />}
              {activeTab === "brand" && <BrandGuideCanvas project={project} />}
              {activeTab === "style" && <StyleGuideCanvas project={project} />}
              {activeTab === "landing" && <LandingCanvas project={project} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

