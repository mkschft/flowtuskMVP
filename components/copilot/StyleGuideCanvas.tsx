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

type StyleGuideCanvasProps = {
  project: DesignProject;
};

export function StyleGuideCanvas({ project }: StyleGuideCanvasProps) {
  const { styleGuide, valueProp } = project;
  
  // Safe access helpers with Array guards
  const buttons = Array.isArray(styleGuide?.buttons) ? styleGuide.buttons : [];
  const spacing = Array.isArray(styleGuide?.spacing) ? styleGuide.spacing : [];
  const borderRadius = Array.isArray(styleGuide?.borderRadius) ? styleGuide.borderRadius : [];
  
  // Use persona-specific CTAs, or fallback to generic ones
  const ctaLabels = valueProp?.ctaSuggestions || ["Get Started", "Learn More", "Contact Us", "Book Demo", "Try Free"];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Call-to-action Section */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Square className="w-5 h-5 text-purple-600" />
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
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <FormInput className="w-5 h-5 text-purple-600" />
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
            <Input placeholder="Enter text..." className="ring-2 ring-purple-600" />
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
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Ruler className="w-5 h-5 text-purple-600" />
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
                  className="bg-purple-500 rounded"
                  style={{
                    width: space.value,
                    height: "24px",
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
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Circle className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Border Radius</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {borderRadius.length > 0 ? borderRadius.map((radius, idx) => (
            <div key={idx} className="text-center space-y-2">
              <div
                className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 mx-auto"
                style={{ borderRadius: radius.value }}
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

