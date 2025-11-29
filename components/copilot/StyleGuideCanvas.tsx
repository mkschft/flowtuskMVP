"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Square,
  FormInput,
  Ruler,
  Circle
} from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor, getSecondaryColor, getGradientBgStyle } from "@/lib/utils/color-utils";

type StyleGuideCanvasProps = {
  project: DesignProject;
  manifest?: BrandManifest | null;
};

export function StyleGuideCanvas({ project, manifest }: StyleGuideCanvasProps) {
  const { styleGuide, valueProp } = project;

  // Get dynamic colors from manifest
  const primaryColor = getPrimaryColor(manifest);
  const secondaryColor = getSecondaryColor(manifest);
  const gradientBgStyle = getGradientBgStyle(manifest, "to-br");

  // Safe access helpers with Array guards
  const buttons = Array.isArray(styleGuide?.buttons) ? styleGuide.buttons : [];
  const spacing = Array.isArray(styleGuide?.spacing) ? styleGuide.spacing : [];
  const borderRadius = Array.isArray(styleGuide?.borderRadius) ? styleGuide.borderRadius : [];

  // Use persona-specific CTAs, or fallback to generic ones
  const ctaLabels = valueProp?.ctaSuggestions || ["Get Started", "Learn More", "Contact Us", "Book Demo", "Try Free"];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Message */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Circle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Living UI Kit</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              These components automatically inherit colors and styles from the <strong>Identity</strong> tab.
              When you change your primary color or typography, all components here update in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Call-to-action Section */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <Square className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Call-to-action</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buttons.length > 0 ? buttons.map((btn, idx) => {
            // Cycle through CTA labels for variety
            const ctaLabel = ctaLabels[idx % ctaLabels.length];

            return (
              <div key={idx} className="space-y-3 p-4 rounded-lg border bg-muted/20">
                <div>
                  <p className="font-semibold text-sm mb-1">{btn.variant}</p>
                  <p className="text-xs text-muted-foreground">{btn.description}</p>
                </div>
                <div className="flex items-center justify-center py-4">
                  {btn.variant === "Primary" && (
                    <Button>{ctaLabel}</Button>
                  )}
                  {btn.variant === "Secondary" && (
                    <Button variant="secondary">{ctaLabel}</Button>
                  )}
                  {btn.variant === "Outline" && (
                    <Button variant="outline">{ctaLabel}</Button>
                  )}
                  {btn.variant === "Ghost" && (
                    <Button variant="ghost">{ctaLabel}</Button>
                  )}
                  {btn.variant === "Destructive" && (
                    <Button variant="destructive">Cancel</Button>
                  )}
                  {btn.variant === "Dark" && (
                    <Button variant="default" className="bg-slate-900 text-white hover:bg-slate-800">
                      {ctaLabel}
                    </Button>
                  )}
                </div>
              </div>
            );
          }) : <p className="text-sm text-muted-foreground italic col-span-3">No button styles defined</p>}
        </div>
      </Card>

      {/* Inputs Section */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <FormInput className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Inputs</h3>
        </div>

        <div className="space-y-6">
          {/* Normal State */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Normal</h4>
            </div>
            <Input placeholder="Enter text..." />
          </div>

          {/* Active/Focus State */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active</h4>
            </div>
            <Input placeholder="Enter text..." style={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${primaryColor}33` }} />
          </div>

          {/* Error State */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Error</h4>
            </div>
            <Input placeholder=")(& 21jdas" className="border-red-500" />
            <p className="text-xs text-red-500">Error message</p>
          </div>

          {/* Label Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Label</h4>
            </div>
            <label className="text-sm font-medium">Name Surname</label>
            <Input placeholder="Enter your name" />
          </div>
        </div>
      </Card>

      {/* Spacing System */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <Ruler className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Spacing Scale</h3>
        </div>

        <div className="space-y-3">
          {spacing.length > 0 ? spacing.map((space, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-16 text-right">
                <span className="font-mono text-xs font-semibold">{space.name}</span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div
                  className="rounded bg-muted"
                  style={{
                    width: space.value,
                    height: "24px"
                  }}
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {space.value}
                </span>
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground italic">No spacing scale defined</p>}
        </div>
      </Card>

      {/* Border Radius */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <Circle className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Border Radius</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {borderRadius.length > 0 ? borderRadius.map((radius, idx) => (
            <div key={idx} className="text-center space-y-2">
              <div
                className="w-full aspect-square mx-auto"
                style={{
                  borderRadius: radius.value,
                  ...gradientBgStyle
                }}
              />
              <p className="font-mono text-xs font-semibold">{radius.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{radius.value}</p>
            </div>
          )) : <p className="text-sm text-muted-foreground italic col-span-5">No border radius defined</p>}
        </div>
      </Card>
    </div>
  );
}

