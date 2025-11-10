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

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Colors Section */}
      <Card className="p-6 bg-background border-2">
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
              {brandGuide.colors.primary.map((color, idx) => (
                <div key={idx} className="group">
                  <div
                    className="h-24 rounded-lg shadow-md mb-2 relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleCopy(color.hex, `color-${idx}`)}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedId === `color-${idx}` ? (
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      ) : (
                        <Copy className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </div>
                  </div>
                  <p className="font-mono text-xs font-semibold">{color.hex}</p>
                  <p className="text-xs text-muted-foreground">{color.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Colors */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Secondary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {brandGuide.colors.secondary.map((color, idx) => (
                <div key={idx} className="group">
                  <div
                    className="h-24 rounded-lg shadow-md mb-2 relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleCopy(color.hex, `color-sec-${idx}`)}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedId === `color-sec-${idx}` ? (
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      ) : (
                        <Copy className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </div>
                  </div>
                  <p className="font-mono text-xs font-semibold">{color.hex}</p>
                  <p className="text-xs text-muted-foreground">{color.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Accent
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {brandGuide.colors.accent.map((color, idx) => (
                <div key={idx} className="group">
                  <div
                    className="h-24 rounded-lg shadow-md mb-2 relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleCopy(color.hex, `color-acc-${idx}`)}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedId === `color-acc-${idx}` ? (
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      ) : (
                        <Copy className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </div>
                  </div>
                  <p className="font-mono text-xs font-semibold">{color.hex}</p>
                  <p className="text-xs text-muted-foreground">{color.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Typography */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Type className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Typography</h3>
        </div>

        <div className="space-y-6">
          {brandGuide.typography.map((typo, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {typo.category}
                </h4>
                <Badge variant="outline">{typo.fontFamily}</Badge>
              </div>
              <div className="space-y-3">
                {typo.sizes.map((size, sIdx) => (
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
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Logo Variations */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Logo Variations</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {brandGuide.logoVariations.map((logo, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="aspect-square flex items-center justify-center mb-3 bg-background rounded-lg">
                <div className="text-4xl font-bold text-muted-foreground opacity-20">
                  {project.name.charAt(0)}
                </div>
              </div>
              <p className="font-semibold text-sm">{logo.name}</p>
              <p className="text-xs text-muted-foreground">{logo.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tone of Voice */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Tone of Voice</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {brandGuide.toneOfVoice.map((tone, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="px-4 py-2 text-sm"
            >
              {tone}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Brand Personality */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Brand Personality</h3>
        </div>

        <div className="space-y-6">
          {brandGuide.personalityTraits.map((trait) => (
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
          ))}
        </div>
      </Card>
    </div>
  );
}

