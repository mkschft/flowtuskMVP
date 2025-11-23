"use client";

import { Button } from "@/components/ui/button";
import { ValuePropCanvas } from "./ValuePropCanvas";
import { BrandGuideCanvas } from "./BrandGuideCanvas";
import { StyleGuideCanvas } from "./StyleGuideCanvas";
import { LandingCanvas } from "./LandingCanvas";
import { BrandGuideCanvasSkeleton } from "./BrandGuideCanvasSkeleton";
import { StyleGuideCanvasSkeleton } from "./StyleGuideCanvasSkeleton";
import { LandingCanvasSkeleton } from "./LandingCanvasSkeleton";
import type { TabType } from "@/components/DesignStudioWorkspace";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { ICP } from "@/lib/types/database";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor } from "@/lib/utils/color-utils";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, Palette, Layout, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type CanvasAreaProps = {
  project: DesignProject;
  persona: ICP;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isGeneratingBrand?: boolean;
  isGeneratingStyle?: boolean;
  isGeneratingLanding?: boolean;
  manifest?: BrandManifest | null;
};

export function CanvasArea({
  project,
  persona,
  activeTab,
  onTabChange,
  isGeneratingBrand = false,
  isGeneratingStyle = false,
  isGeneratingLanding = false,
  manifest,
}: CanvasAreaProps) {
  // Get dynamic colors from manifest for tab styling
  const primaryColor = getPrimaryColor(manifest);
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-center gap-3 px-6 py-3">
        {/* Tab Navigation - Segmented Control Style */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("value-prop")}
            className={cn(
              "gap-2 h-8",
              activeTab === "value-prop"
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            )}
            style={activeTab === "value-prop" ? { color: primaryColor } : undefined}
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
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            )}
            style={activeTab === "brand" ? { color: primaryColor } : undefined}
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
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            )}
            style={activeTab === "style" ? { color: primaryColor } : undefined}
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
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            )}
            style={activeTab === "landing" ? { color: primaryColor } : undefined}
          >
            <Globe className="w-3 h-3" />
            Landing
          </Button>
        </div>
      </div>

      {/* Canvas Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6" id="design-canvas-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "value-prop" && <ValuePropCanvas project={project} persona={persona} manifest={manifest} />}
              {activeTab === "brand" && (isGeneratingBrand ? <BrandGuideCanvasSkeleton /> : <BrandGuideCanvas project={project} manifest={manifest} />)}
              {activeTab === "style" && (isGeneratingStyle ? <StyleGuideCanvasSkeleton /> : <StyleGuideCanvas project={project} manifest={manifest} />)}
              {activeTab === "landing" && (isGeneratingLanding ? <LandingCanvasSkeleton /> : <LandingCanvas project={project} manifest={manifest} />)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

