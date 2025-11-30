"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPrimaryColor, getAccentColor } from "@/lib/utils/color-utils";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { Trophy } from "lucide-react";

type CompetitivePositioningProps = {
    manifest?: BrandManifest | null;
    brandName: string;
};

export function CompetitivePositioning({ manifest, brandName }: CompetitivePositioningProps) {
    const primaryColor = getPrimaryColor(manifest);
    const accentColor = getAccentColor(manifest);

    // Get competitive positioning from manifest with fallback
    const competitivePositioning = manifest?.strategy?.competitivePositioning;
    const competitorsData = competitivePositioning?.competitors || [];

    // Build competitors array - brand should ALWAYS be in top-right quadrant (but with safe margins)
    // Using coordinate system: x = left-to-right (0-100), y = bottom-to-top (0-100)
    // We clamp values to 10-90 range to prevent labels going outside chart
    const clamp = (val: number) => Math.max(12, Math.min(88, val));
    
    const competitors = competitorsData.length > 0
        ? competitorsData.map(comp => ({
            name: comp.name,
            x: clamp(comp.x),
            y: clamp(comp.y),
            type: comp.name === brandName ? "hero" : "competitor"
        }))
        : [
            { name: "Legacy Players", x: 20, y: 55, type: "competitor" },
            { name: "Budget Tools", x: 25, y: 25, type: "competitor" },
            { name: "Enterprise Suite", x: 60, y: 40, type: "competitor" },
            { name: brandName, x: 78, y: 72, type: "hero" }, // Top-right but with safe margin
        ];

    return (
        <Card className="p-6 bg-background border">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-lg">Competitive Positioning</h3>
                    <p className="text-sm text-muted-foreground">
                        Where {brandName} stands in the market landscape
                    </p>
                </div>
                <Badge 
                    variant="outline" 
                    className="gap-1"
                    style={{ borderColor: accentColor, color: accentColor }}
                >
                    <Trophy className="w-3 h-3" style={{ color: accentColor }} />
                    Market Leader
                </Badge>
            </div>

            {/* Full Width Quadrant Chart */}
            <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 rounded-xl border overflow-hidden">
                {/* Inner chart area with padding for labels */}
                <div className="absolute inset-8">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                        <div className="border-r border-b border-dashed border-slate-300 dark:border-slate-700" />
                        <div className="border-b border-dashed border-slate-300 dark:border-slate-700" />
                        <div className="border-r border-dashed border-slate-300 dark:border-slate-700" />
                        <div />
                    </div>

                    {/* Quadrant Labels */}
                    <div className="absolute top-1 right-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                        Leaders
                    </div>
                    <div className="absolute top-1 left-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                        Visionaries
                    </div>
                    <div className="absolute bottom-1 left-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-1.5 py-0.5 rounded">
                        Niche
                    </div>
                    <div className="absolute bottom-1 right-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                        Challengers
                    </div>

                    {/* Points */}
                    {competitors.map((comp, idx) => (
                        <div
                            key={idx}
                            className="absolute transform -translate-x-1/2 translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                            style={{
                                left: `${comp.x}%`,
                                bottom: `${comp.y}%`,
                            }}
                        >
                            {/* Dot */}
                            <div
                                className={`rounded-full border-2 shadow-md transition-all duration-300 ${
                                    comp.type === "hero"
                                        ? "w-5 h-5 ring-4 ring-opacity-30"
                                        : "w-3 h-3 bg-slate-400 border-slate-500 dark:bg-slate-600 dark:border-slate-500 hover:scale-125"
                                }`}
                                style={
                                    comp.type === "hero"
                                        ? {
                                            backgroundColor: primaryColor,
                                            borderColor: "white",
                                            boxShadow: `0 0 24px ${primaryColor}50, 0 0 0 4px ${primaryColor}30`,
                                        }
                                        : {}
                                }
                            />
                            {/* Label */}
                            <span
                                className={`mt-1 text-[11px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap transition-all ${
                                    comp.type === "hero"
                                        ? "text-white shadow-lg"
                                        : "bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-105"
                                }`}
                                style={
                                    comp.type === "hero"
                                        ? { backgroundColor: primaryColor }
                                        : {}
                                }
                            >
                                {comp.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Axis Labels - Outside the chart area */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground">
                    High Innovation ↑
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground">
                    Low Innovation
                </div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground writing-mode-vertical">
                    <span className="inline-block -rotate-90 whitespace-nowrap">High Value ←</span>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    <span className="inline-block rotate-90 whitespace-nowrap">Low Value →</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div 
                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                    />
                    <span>Your Brand</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    <span>Competitors</span>
                </div>
            </div>
        </Card>
    );
}
