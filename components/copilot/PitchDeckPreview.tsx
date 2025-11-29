"use client";

import { useState } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import type { DesignProject } from "@/lib/design-studio-mock-data";

type SlideType = "title" | "problem" | "solution" | "closing";

type PitchDeckPreviewProps = {
  project: DesignProject;
  manifest?: BrandManifest | null;
};

export function PitchDeckPreview({ project, manifest }: PitchDeckPreviewProps) {
  const [slideType, setSlideType] = useState<SlideType>("title");

  // Extract brand data
  const logo = manifest?.identity?.logo?.variations?.[0]?.imageUrl || null;
  const companyName = manifest?.brandName || project.name;
  const headline = project.valueProp?.headline || "Transform your brand with AI";
  const subheadline = project.valueProp?.subheadline || "Build a cohesive brand system in minutes";
  const primaryColor = manifest?.identity?.colors?.primary?.[0]?.hex || "#6366F1";
  const secondaryColor = manifest?.identity?.colors?.secondary?.[0]?.hex || "#8B5CF6";
  const accentColor = manifest?.identity?.colors?.accent?.[0]?.hex || "#EC4899";
  const headingFont = manifest?.identity?.typography?.heading?.family || "Inter";
  const bodyFont = manifest?.identity?.typography?.body?.family || "Inter";

  // Extract pain points and benefits from value prop
  const painPoints = [
    "Inconsistent brand across channels",
    "Time-consuming manual design",
    "Expensive agency costs"
  ];
  const benefits = project.valueProp?.benefits || [
    "Unified brand system",
    "AI-powered automation",
    "Professional results"
  ];

  const slides: { type: SlideType; label: string }[] = [
    { type: "title", label: "Title Slide" },
    { type: "problem", label: "Problem" },
    { type: "solution", label: "Solution" },
    { type: "closing", label: "Closing" },
  ];

  const currentIndex = slides.findIndex((s) => s.type === slideType);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < slides.length - 1;

  const handlePrev = () => {
    if (canGoPrev) setSlideType(slides[currentIndex - 1].type);
  };

  const handleNext = () => {
    if (canGoNext) setSlideType(slides[currentIndex + 1].type);
  };

  return (
    <div className="space-y-6">
      {/* Slide Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={!canGoPrev}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border">
            {slides.map((slide) => (
              <Button
                key={slide.type}
                variant="ghost"
                size="sm"
                onClick={() => setSlideType(slide.type)}
                className={slideType === slide.type ? "bg-background shadow-sm" : ""}
              >
                {slide.label}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!canGoNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export PPTX
        </Button>
      </div>

      {/* 16:9 Slide Preview */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border" style={{ aspectRatio: "16/9" }}>
        {slideType === "title" && (
          <div className="relative h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-slate-50 to-white">
            {/* Logo */}
            {logo ? (
              <img src={logo} alt={companyName} className="h-12 mb-8 opacity-80" />
            ) : (
              <div
                className="h-12 w-12 rounded-lg mb-8 flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: primaryColor }}
              >
                {companyName.charAt(0)}
              </div>
            )}

            {/* Company Name */}
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 text-center"
              style={{ fontFamily: headingFont, color: primaryColor }}
            >
              {companyName}
            </h1>

            {/* Headline */}
            <p
              className="text-xl md:text-2xl text-center max-w-2xl mb-8"
              style={{
                fontFamily: bodyFont,
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {headline}
            </p>

            {/* Color Accent Bars */}
            <div className="absolute bottom-0 left-0 right-0 flex h-2">
              <div className="flex-1" style={{ backgroundColor: primaryColor }} />
              <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
              <div className="flex-1" style={{ backgroundColor: accentColor }} />
            </div>
          </div>
        )}

        {slideType === "problem" && (
          <div className="relative h-full flex flex-col p-12 bg-gradient-to-br from-slate-50 to-white">
            {/* Header */}
            <div className="mb-8">
              <h2
                className="text-3xl font-bold mb-2"
                style={{ fontFamily: headingFont, color: primaryColor }}
              >
                The Challenge
              </h2>
              <div className="h-1 w-20 rounded" style={{ backgroundColor: primaryColor }} />
            </div>

            {/* Pain Points Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {painPoints.map((pain, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border-2"
                  style={{ borderColor: idx === 0 ? primaryColor : idx === 1 ? secondaryColor : accentColor }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4"
                    style={{ backgroundColor: idx === 0 ? primaryColor : idx === 1 ? secondaryColor : accentColor }}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-sm font-medium" style={{ fontFamily: bodyFont }}>
                    {pain}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 right-4">
              {logo && <img src={logo} alt="" className="h-6 opacity-30" />}
            </div>
          </div>
        )}

        {slideType === "solution" && (
          <div className="relative h-full flex flex-col p-12 bg-gradient-to-br from-slate-50 to-white">
            {/* Header */}
            <div className="mb-8">
              <h2
                className="text-3xl font-bold mb-2"
                style={{ fontFamily: headingFont, color: primaryColor }}
              >
                Our Solution
              </h2>
              <div className="h-1 w-20 rounded" style={{ backgroundColor: primaryColor }} />
            </div>

            {/* Split Layout */}
            <div className="flex-1 grid grid-cols-2 gap-8">
              {/* Left: Benefits */}
              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      ✓
                    </div>
                    <p className="text-sm font-medium" style={{ fontFamily: bodyFont }}>
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              {/* Right: Product Visual Placeholder */}
              <div className="relative rounded-lg overflow-hidden border-2" style={{ borderColor: primaryColor }}>
                <div
                  className="absolute inset-0 flex items-center justify-center text-white text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  Product Screenshot
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 right-4">
              {logo && <img src={logo} alt="" className="h-6 opacity-30" />}
            </div>
          </div>
        )}

        {slideType === "closing" && (
          <div className="relative h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-slate-50 to-white">
            {/* Logo */}
            {logo && <img src={logo} alt={companyName} className="h-16 mb-8" />}

            {/* CTA */}
            <h2
              className="text-4xl font-bold mb-4 text-center"
              style={{ fontFamily: headingFont, color: primaryColor }}
            >
              Let's Transform Your Brand
            </h2>

            <p
              className="text-lg text-center mb-8 text-muted-foreground max-w-xl"
              style={{ fontFamily: bodyFont }}
            >
              {subheadline}
            </p>

            {/* Contact Info Placeholder */}
            <div className="space-y-2 text-center text-sm text-muted-foreground">
              <p>contact@{companyName.toLowerCase().replace(/\s+/g, "")}.com</p>
              <p>Schedule a demo</p>
            </div>

            {/* Color Accent Bars */}
            <div className="absolute bottom-0 left-0 right-0 flex h-2">
              <div className="flex-1" style={{ backgroundColor: primaryColor }} />
              <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
              <div className="flex-1" style={{ backgroundColor: accentColor }} />
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="text-xs text-muted-foreground text-center">
        Slide {currentIndex + 1} of {slides.length} · Uses brand colors and fonts from Identity tab
      </div>
    </div>
  );
}
