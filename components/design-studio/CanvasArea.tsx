"use client";

import { Button } from "@/components/ui/button";
import { ToolBar } from "./ToolBar";
import { ValuePropCanvas } from "./ValuePropCanvas";
import { BrandGuideCanvas } from "./BrandGuideCanvas";
import { StyleGuideCanvas } from "./StyleGuideCanvas";
import { LandingCanvas } from "./LandingCanvas";
import type { TabType } from "@/components/DesignStudioWorkspace";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Palette, Layout, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type CanvasAreaProps = {
  project: DesignProject;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

export function CanvasArea({
  project,
  activeTab,
  onTabChange,
}: CanvasAreaProps) {
  return (
    <div className="flex-1 flex flex-col bg-muted/30">
      {/* Main Navigation - Segmented Control Style */}
      <div className="flex items-center justify-center gap-3 p-4 border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center gap-1 bg-background rounded-lg p-1 border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("value-prop")}
            className={cn(
              "gap-2 h-8",
              activeTab === "value-prop"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                : ""
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
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                : ""
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
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                : ""
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
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                : ""
            )}
          >
            <Globe className="w-3 h-3" />
            Landing
          </Button>
        </div>
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

      {/* Tool Bar */}
      <ToolBar />
    </div>
  );
}

