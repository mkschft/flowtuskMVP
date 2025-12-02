"use client";

import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { BrandGuideCanvasSkeleton } from "./BrandGuideCanvasSkeleton";
import { StyleGuideCanvasSkeleton } from "./StyleGuideCanvasSkeleton";
import { LandingCanvasSkeleton } from "./LandingCanvasSkeleton";
import type { TabType } from "@/components/DesignStudioWorkspace";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { ICP } from "@/lib/types/database";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor } from "@/lib/utils/color-utils";
import { AnimatePresence, motion } from "motion/react";
import { Target, Palette, Box, Eye, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// Lazy load heavy canvas components
const ValuePropCanvas = lazy(() => import("./ValuePropCanvas").then(m => ({ default: m.ValuePropCanvas })));
const BrandGuideCanvas = lazy(() => import("./BrandGuideCanvas").then(m => ({ default: m.BrandGuideCanvas })));
const ComponentsCanvas = lazy(() => import("./ComponentsCanvas").then(m => ({ default: m.ComponentsCanvas })));
const PreviewsCanvas = lazy(() => import("./PreviewsCanvas").then(m => ({ default: m.PreviewsCanvas })));

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
      <div className="flex items-center justify-center gap-3 px-3 md:px-6 py-3 overflow-x-auto">
        <div className="flex items-center gap-3">
          {/* Tab Navigation - Segmented Control Style */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("strategy")}
              className={cn(
                "gap-1.5 md:gap-2 h-11 md:h-8 min-w-[44px] md:min-w-0",
                activeTab === "strategy"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Target className="w-4 h-4 md:w-3 md:h-3" />
              <span className="hidden sm:inline text-xs md:text-sm">Strategy</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("identity")}
              className={cn(
                "gap-1.5 md:gap-2 h-11 md:h-8 min-w-[44px] md:min-w-0",
                activeTab === "identity"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Palette className="w-4 h-4 md:w-3 md:h-3" />
              <span className="hidden sm:inline text-xs md:text-sm">Identity</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("components")}
              className={cn(
                "gap-1.5 md:gap-2 h-11 md:h-8 min-w-[44px] md:min-w-0",
                activeTab === "components"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Box className="w-4 h-4 md:w-3 md:h-3" />
              <span className="hidden sm:inline text-xs md:text-sm">Components</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("previews")}
              className={cn(
                "gap-1.5 md:gap-2 h-11 md:h-8 min-w-[44px] md:min-w-0",
                activeTab === "previews"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Eye className="w-4 h-4 md:w-3 md:h-3" />
              <span className="hidden sm:inline text-xs md:text-sm">Previews</span>
            </Button>
          </div>

          {/* Info Icon with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted/80 transition-colors">
                <Info className="h-4 w-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-xs leading-relaxed">
                {activeTab === "strategy" && "This is your brand's source of truth. Changes here will affect your Identity, Components, and Previews. Ask the AI to refine your messaging for different audiences."}
                {activeTab === "identity" && 'Your visual and tonal identity. Try asking: "Change the primary color to forest green" or "Make the tone more professional". Changes here update Components and Previews instantly.'}
                {activeTab === "components" && "These components automatically inherit colors and styles from the Identity tab. When you change your primary color or typography, all components here update in real-time."}
                {activeTab === "previews" && "All previews update automatically when you change your brand in the Strategy or Identity tabs."}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Canvas Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 md:p-6" id="design-canvas-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "strategy" && (
                <Suspense fallback={<BrandGuideCanvasSkeleton />}>
                  <ValuePropCanvas project={project} persona={persona} manifest={manifest} />
                </Suspense>
              )}
              {activeTab === "identity" && (
                isGeneratingBrand ? (
                  <BrandGuideCanvasSkeleton />
                ) : (
                  <Suspense fallback={<BrandGuideCanvasSkeleton />}>
                    <BrandGuideCanvas project={project} manifest={manifest} />
                  </Suspense>
                )
              )}
              {activeTab === "components" && (
                isGeneratingStyle ? (
                  <StyleGuideCanvasSkeleton />
                ) : (
                  <Suspense fallback={<StyleGuideCanvasSkeleton />}>
                    <ComponentsCanvas project={project} manifest={manifest} />
                  </Suspense>
                )
              )}
              {activeTab === "previews" && (
                isGeneratingLanding ? (
                  <LandingCanvasSkeleton />
                ) : (
                  <Suspense fallback={<LandingCanvasSkeleton />}>
                    <PreviewsCanvas project={project} persona={persona} manifest={manifest} />
                  </Suspense>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

