"use client";

import { Button } from "@/components/ui/button";
import { ValuePropCanvas } from "./ValuePropCanvas";
import { BrandGuideCanvas } from "./BrandGuideCanvas";
import { StyleGuideCanvas } from "./StyleGuideCanvas";
import { LandingCanvas } from "./LandingCanvas";
import { PreviewsCanvas } from "./PreviewsCanvas";
import { BrandGuideCanvasSkeleton } from "./BrandGuideCanvasSkeleton";
import { StyleGuideCanvasSkeleton } from "./StyleGuideCanvasSkeleton";
import { LandingCanvasSkeleton } from "./LandingCanvasSkeleton";
import type { TabType } from "@/components/DesignStudioWorkspace";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { ICP } from "@/lib/types/database";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor } from "@/lib/utils/color-utils";
import { AnimatePresence, motion } from "motion/react";
import { Target, Palette, Box, Eye } from "lucide-react";
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-center gap-3 px-6 py-3">
        {/* Tab Navigation - Segmented Control Style */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("strategy")}
            className={cn(
              "gap-2 h-8",
              activeTab === "strategy"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Target className="w-3 h-3" />
            Strategy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("identity")}
            className={cn(
              "gap-2 h-8",
              activeTab === "identity"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Palette className="w-3 h-3" />
            Identity
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("components")}
            className={cn(
              "gap-2 h-8",
              activeTab === "components"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Box className="w-3 h-3" />
            Components
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("previews")}
            className={cn(
              "gap-2 h-8",
              activeTab === "previews"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Eye className="w-3 h-3" />
            Previews
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
              {activeTab === "strategy" && <ValuePropCanvas project={project} persona={persona} manifest={manifest} />}
              {activeTab === "identity" && (isGeneratingBrand ? <BrandGuideCanvasSkeleton /> : <BrandGuideCanvas project={project} manifest={manifest} />)}
              {activeTab === "components" && (isGeneratingStyle ? <StyleGuideCanvasSkeleton /> : <StyleGuideCanvas project={project} manifest={manifest} />)}
              {activeTab === "previews" && (isGeneratingLanding ? <LandingCanvasSkeleton /> : <PreviewsCanvas project={project} manifest={manifest} />)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

