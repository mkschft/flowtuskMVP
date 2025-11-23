"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Palette,
  Type,
  Image as ImageIcon,
  MessageSquare,
  Copy,
  Check,
  Sun,
  Moon,
  Shuffle
} from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import { useState } from "react";
import { cn } from "@/lib/utils";

type BrandGuideCanvasProps = {
  project: DesignProject;
};

export function BrandGuideCanvas({ project }: BrandGuideCanvasProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightMode, setLightMode] = useState(true);
  const { brandGuide } = project;

  // Safe access helpers with Array guards
  const primaryColors = Array.isArray(brandGuide?.colors?.primary) ? brandGuide.colors.primary : [];
  const secondaryColors = Array.isArray(brandGuide?.colors?.secondary) ? brandGuide.colors.secondary : [];
  const accentColors = Array.isArray(brandGuide?.colors?.accent) ? brandGuide.colors.accent : [];
  const typography = Array.isArray(brandGuide?.typography) ? brandGuide.typography : [];
  const logoVariations = Array.isArray(brandGuide?.logoVariations) ? brandGuide.logoVariations : [];
  const toneOfVoice = Array.isArray(brandGuide?.toneOfVoice) ? brandGuide.toneOfVoice : [];
  const personalityTraits = Array.isArray(brandGuide?.personalityTraits) ? brandGuide.personalityTraits : [];

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Colors Section */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-lg">Color Palette</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Shuffle className="w-3 h-3" />
              Shuffle
            </Button>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
              <Button
                variant={lightMode ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setLightMode(true)}
              >
                <Sun className="w-3 h-3" />
              </Button>
              <Button
                variant={!lightMode ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setLightMode(false)}
              >
                <Moon className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Primary Colors */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Primary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {primaryColors.length > 0 ? primaryColors.map((color, idx) => (
                <div key={idx} className="group">
                  <div
                    className="h-24 rounded-lg shadow-md mb-2 relative overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleCopy(color.hex, `color-${idx}`)}
                    title="Click to copy hex code"
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {/* Hover tooltip */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-semibold text-white drop-shadow px-2 py-1 rounded bg-black/40">
                        Click to copy
                      </span>
                    </div>
                    {/* Copy icon */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedId === `color-${idx}` ? (
                        <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
                          <Check className="w-3 h-3" />
                          Copied!
                        </div>
                      ) : (
                        <Copy className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </div>
                  </div>
                  <p className="font-mono text-xs font-semibold cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleCopy(color.hex, `color-${idx}`)}>{color.hex}</p>
                  <p className="text-xs text-muted-foreground">{color.name}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground italic">No primary colors defined</p>}
            </div>
          </div>

          {/* Secondary Colors */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Secondary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {secondaryColors.length > 0 ? secondaryColors.map((color, idx) => (
                <div key={idx} className="group">
                  <div
                    className="h-24 rounded-lg shadow-md mb-2 relative overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleCopy(color.hex, `color-sec-${idx}`)}
                    title="Click to copy hex code"
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-semibold text-white drop-shadow px-2 py-1 rounded bg-black/40">
                        Click to copy
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedId === `color-sec-${idx}` ? (
                        <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
                          <Check className="w-3 h-3" />
                          Copied!
                        </div>
                      ) : (
                        <Copy className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </div>
                  </div>
                  <p className="font-mono text-xs font-semibold cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleCopy(color.hex, `color-sec-${idx}`)}>{color.hex}</p>
                  <p className="text-xs text-muted-foreground">{color.name}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground italic">No secondary colors defined</p>}
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Accent
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {accentColors.length > 0 ? accentColors.map((color, idx) => (
                <div key={idx} className="group">
                  <div
                    className="h-24 rounded-lg shadow-md mb-2 relative overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleCopy(color.hex, `color-acc-${idx}`)}
                    title="Click to copy hex code"
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-semibold text-white drop-shadow px-2 py-1 rounded bg-black/40">
                        Click to copy
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedId === `color-acc-${idx}` ? (
                        <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
                          <Check className="w-3 h-3" />
                          Copied!
                        </div>
                      ) : (
                        <Copy className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </div>
                  </div>
                  <p className="font-mono text-xs font-semibold cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleCopy(color.hex, `color-acc-${idx}`)}>{color.hex}</p>
                  <p className="text-xs text-muted-foreground">{color.name}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground italic">No accent colors defined</p>}
            </div>
          </div>
        </div>
      </Card>

      {/* Typography */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <Type className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Typography</h3>
        </div>

        <div className="space-y-6">
          {typography.length > 0 ? typography.map((typo, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {typo.category}
                </h4>
                <Badge variant="outline">{typo.fontFamily}</Badge>
              </div>
              <div className="space-y-3">
                {typo.sizes && typeof typo.sizes === 'object' ? (
                  // Handle both array format and object format (from manifest)
                  Array.isArray(typo.sizes) ? (
                    typo.sizes.map((size, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-4 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            {size.name}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {size.size} / {size.weight}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: typo.fontFamily,
                            fontSize: parseInt(size.size) > 36 ? "36px" : size.size,
                            fontWeight: size.weight,
                          }}
                        >
                          The quick brown fox
                        </p>
                      </div>
                    ))
                  ) : (
                    // Object format: { h1: "48px", h2: "36px" }
                    Object.entries(typo.sizes).map(([name, size], sIdx) => (
                      <div
                        key={sIdx}
                        className="p-4 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            {name}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {size} / {typo.weights?.[0] || '400'}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: typo.fontFamily,
                            fontSize: typeof size === 'string' && parseInt(size) > 36 ? "36px" : (size as string),
                            fontWeight: typo.weights?.[0] || '400',
                          }}
                        >
                          The quick brown fox
                        </p>
                      </div>
                    ))
                  )
                ) : null}
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground italic">No typography defined</p>}
        </div>
      </Card>

      {/* Logo Variations */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Logo Variations</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {logoVariations.length > 0 ? logoVariations.map((logo, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="aspect-square flex items-center justify-center mb-3 bg-background rounded-lg">
                <div className="text-4xl font-bold text-muted-foreground opacity-20">
                  {project.name.charAt(0)}
                </div>
              </div>
              <p className="font-semibold text-sm">{logo.name}</p>
              <p className="text-xs text-muted-foreground">{logo.description}</p>
            </div>
          )) : <p className="text-sm text-muted-foreground italic col-span-4">No logo variations defined</p>}
        </div>
      </Card>

      {/* Tone of Voice */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Tone of Voice</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {toneOfVoice.length > 0 ? toneOfVoice.map((tone, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="px-4 py-2 text-sm"
            >
              {tone}
            </Badge>
          )) : <p className="text-sm text-muted-foreground italic">No tone of voice defined</p>}
        </div>
      </Card>

      {/* Brand Personality */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Brand Personality</h3>
        </div>

        <div className="space-y-6">
          {personalityTraits.length > 0 ? personalityTraits.map((trait) => (
            <div key={trait.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  {trait.label}
                </label>
                <span className="text-sm font-mono text-muted-foreground">
                  {trait.value}
                </span>
              </div>

              <Slider
                value={[trait.value]}
                max={100}
                step={1}
                className="w-full"
                disabled
              />

              <div className="flex items-start justify-between text-xs">
                <span className="text-muted-foreground">{trait.leftLabel}</span>
                <span className="text-muted-foreground">{trait.rightLabel}</span>
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground italic">No personality traits defined</p>}
        </div>
      </Card>
    </div>
  );
}

