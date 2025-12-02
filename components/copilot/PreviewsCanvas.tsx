"use client";

import { useState, lazy, Suspense } from "react";
import { Globe, Share2, Presentation, Mail, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingCanvasSkeleton } from "./LandingCanvasSkeleton";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import type { ICP } from "@/lib/types/database";
import { cn } from "@/lib/utils";

// Lazy load preview components
const LandingCanvas = lazy(() => import("./LandingCanvas").then(m => ({ default: m.LandingCanvas })));
const SocialMediaPreview = lazy(() => import("./SocialMediaPreview").then(m => ({ default: m.SocialMediaPreview })));
const PitchDeckPreview = lazy(() => import("./PitchDeckPreview").then(m => ({ default: m.PitchDeckPreview })));
const EmailPreview = lazy(() => import("./EmailPreview").then(m => ({ default: m.EmailPreview })));
const BusinessCardPreview = lazy(() => import("./BusinessCardPreview").then(m => ({ default: m.BusinessCardPreview })));

type PreviewType = "landing" | "social" | "pitchdeck" | "email" | "business-card";

type PreviewsCanvasProps = {
  project: DesignProject;
  persona: ICP;
  manifest?: BrandManifest | null;
};

export function PreviewsCanvas({ project, persona, manifest }: PreviewsCanvasProps) {
  const [activePreview, setActivePreview] = useState<PreviewType>("landing");

  return (
    <div className="space-y-6">
      {/* Preview Type Selector */}
      <div className="flex items-center justify-center overflow-x-auto px-4">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePreview("landing")}
            className={cn(
              "gap-1.5 md:gap-2 h-11 md:h-9 min-w-[44px] md:min-w-0 whitespace-nowrap",
              activePreview === "landing"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline text-xs md:text-sm">Landing</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePreview("social")}
            className={cn(
              "gap-1.5 md:gap-2 h-11 md:h-9 min-w-[44px] md:min-w-0 whitespace-nowrap",
              activePreview === "social"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline text-xs md:text-sm">Social</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePreview("pitchdeck")}
            className={cn(
              "gap-1.5 md:gap-2 h-11 md:h-9 min-w-[44px] md:min-w-0 whitespace-nowrap",
              activePreview === "pitchdeck"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Presentation className="w-4 h-4" />
            <span className="hidden sm:inline text-xs md:text-sm">Pitch</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePreview("email")}
            className={cn(
              "gap-1.5 md:gap-2 h-11 md:h-9 min-w-[44px] md:min-w-0 whitespace-nowrap",
              activePreview === "email"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline text-xs md:text-sm">Email</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePreview("business-card")}
            className={cn(
              "gap-1.5 md:gap-2 h-11 md:h-9 min-w-[44px] md:min-w-0 whitespace-nowrap",
              activePreview === "business-card"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline text-xs md:text-sm">Card</span>
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div>
        <Suspense fallback={<LandingCanvasSkeleton />}>
          {activePreview === "landing" && (
            <LandingCanvas project={project} manifest={manifest} />
          )}
          {activePreview === "social" && (
            <SocialMediaPreview project={project} manifest={manifest} />
          )}
          {activePreview === "pitchdeck" && (
            <PitchDeckPreview project={project} manifest={manifest} />
          )}
          {activePreview === "email" && (
            <EmailPreview project={project} persona={persona} manifest={manifest} />
          )}
          {activePreview === "business-card" && (
            <BusinessCardPreview project={project} persona={persona} manifest={manifest} />
          )}
        </Suspense>
      </div>

      {/* Helper Text */}
      <div className="text-center text-sm text-muted-foreground mt-4 pb-4">
        All previews update automatically when you change your brand in the Strategy or Identity tabs
      </div>
    </div>
  );
}
