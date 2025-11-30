"use client";

import { useState, useMemo } from "react";
import { Download, Linkedin, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import { cn } from "@/lib/utils";
import { renderLogoWithColors } from "@/lib/generation/logo-generator";

type Platform = "linkedin" | "twitter" | "instagram";

type SocialMediaPreviewProps = {
  project: DesignProject;
  manifest?: BrandManifest | null;
};

export function SocialMediaPreview({ project, manifest }: SocialMediaPreviewProps) {
  const [platform, setPlatform] = useState<Platform>("linkedin");

  // Extract brand data
  const companyName = manifest?.brandName || project.name;
  const headline = project.valueProp?.headline || "Transform your brand with AI";
  const primaryColor = manifest?.identity?.colors?.primary?.[0]?.hex || "#6366F1";
  const secondaryColor = manifest?.identity?.colors?.secondary?.[0]?.hex || "#8B5CF6";
  const accentColor = manifest?.identity?.colors?.accent?.[0]?.hex || primaryColor;
  const headingFont = manifest?.identity?.typography?.heading?.family || "Inter";
  
  // Generate logo dynamically with current colors (cascades when colors change)
  const logoVariation = manifest?.identity?.logo?.variations?.[0];
  const logo = useMemo(() => {
    if (!logoVariation) return null;
    const typography = manifest?.identity?.typography?.heading ? {
      family: manifest.identity.typography.heading.family,
      weight: manifest.identity.typography.heading.weights?.[0] || '600'
    } : null;
    return renderLogoWithColors(
      companyName,
      { name: logoVariation.name, description: logoVariation.description },
      primaryColor,
      accentColor,
      typography
    );
  }, [logoVariation, companyName, primaryColor, accentColor, manifest?.identity?.typography?.heading]);

  // Platform-specific dimensions
  const dimensions = {
    linkedin: { width: "600px", height: "314px", aspectRatio: "1200/628" },
    twitter: { width: "600px", height: "337px", aspectRatio: "1200/675" },
    instagram: { width: "540px", height: "540px", aspectRatio: "1080/1080" },
  };

  const dim = dimensions[platform];

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1 border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPlatform("linkedin")}
            className={cn(
              "gap-2 h-8",
              platform === "linkedin"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Linkedin className="w-3 h-3" />
            LinkedIn
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPlatform("twitter")}
            className={cn(
              "gap-2 h-8",
              platform === "twitter"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Twitter className="w-3 h-3" />
            Twitter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPlatform("instagram")}
            className={cn(
              "gap-2 h-8",
              platform === "instagram"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            <Instagram className="w-3 h-3" />
            Instagram
          </Button>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export PNG
        </Button>
      </div>

      {/* Social Media Post Mockup */}
      <div className="bg-white rounded-xl shadow-lg p-6 border">
        {/* Platform Header */}
        <div className="flex items-center gap-3 mb-4">
          {logo ? (
            <img src={logo} alt={companyName} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {companyName.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <div className="font-semibold text-sm">{companyName}</div>
            <div className="text-xs text-muted-foreground">2h · 🌍</div>
          </div>
        </div>

        {/* Post Copy */}
        <div className="mb-4 text-sm leading-relaxed">
          {headline}
        </div>

        {/* Branded Image */}
        <div
          className="rounded-lg overflow-hidden relative"
          style={{
            width: dim.width,
            height: dim.height,
            maxWidth: "100%",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          />

          {/* Content Overlay */}
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
            {logo && (
              <img
                src={logo}
                alt={companyName}
                className="w-16 h-16 mb-4 opacity-90"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            )}
            <h2
              className="text-2xl md:text-3xl font-bold text-center max-w-lg"
              style={{ fontFamily: headingFont }}
            >
              {headline}
            </h2>

            {/* Subtle logo watermark at bottom */}
            {logo && (
              <div className="absolute bottom-4 right-4 opacity-20">
                <img
                  src={logo}
                  alt=""
                  className="w-12 h-12"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t text-sm text-muted-foreground">
          <button className="flex items-center gap-2 hover:text-foreground transition-colors">
            <span>👍</span> 42
          </button>
          <button className="flex items-center gap-2 hover:text-foreground transition-colors">
            <span>💬</span> 8
          </button>
          <button className="flex items-center gap-2 hover:text-foreground transition-colors">
            <span>🔄</span> 12
          </button>
          {platform === "linkedin" && (
            <button className="flex items-center gap-2 hover:text-foreground transition-colors">
              <span>📤</span> 3
            </button>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="text-xs text-muted-foreground text-center">
        This preview uses your headline from Strategy and colors from Identity.
      </div>
    </div>
  );
}
