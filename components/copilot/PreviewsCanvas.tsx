"use client";

import { useState } from "react";
import { Globe, Share2, Presentation, Mail, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingCanvas } from "./LandingCanvas";
import { SocialMediaPreview } from "./SocialMediaPreview";
import { PitchDeckPreview } from "./PitchDeckPreview";
import { EmailPreview } from "./EmailPreview";
import { BusinessCardPreview } from "./BusinessCardPreview";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import type { ICP } from "@/lib/types/database";
import { cn } from "@/lib/utils";

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
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePreview("landing")}
            className={cn(
              "gap-2 h-9",
              activePreview === "landing"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Globe className="w-4 h-4" />
            Landing Page
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePreview("social")}
            className={cn(
              "gap-2 h-9",
              activePreview === "social"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Share2 className="w-4 h-4" />
            Social Post
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePreview("pitchdeck")}
            className={cn(
              "gap-2 h-9",
              activePreview === "pitchdeck"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Presentation className="w-4 h-4" />
            Pitch Deck
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePreview("email")}
            className={cn(
              "gap-2 h-9",
              activePreview === "email"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePreview("business-card")}
            className={cn(
              "gap-2 h-9",
              activePreview === "business-card"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <CreditCard className="w-4 h-4" />
            Card
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div>
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
      </div>

      {/* Helper Text */}
      <div className="text-center text-sm text-muted-foreground mt-4 pb-4">
        All previews update automatically when you change your brand in the Strategy or Identity tabs
      </div>
    </div>
  );
}
