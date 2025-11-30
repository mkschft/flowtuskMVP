"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertTriangle } from "lucide-react";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getContrastRatio, getWCAGScore } from "@/lib/utils/color-utils";

type ColorAccessibilityProps = {
    manifest?: BrandManifest | null;
};

export function ColorAccessibility({ manifest }: ColorAccessibilityProps) {
    const primaryColors = manifest?.identity?.colors?.primary || [];
    const secondaryColors = manifest?.identity?.colors?.secondary || [];
    const neutralColors = manifest?.identity?.colors?.neutral || [];

    // Use first primary as main brand color
    const brandColor = primaryColors[0]?.hex || "#000000";

    // Backgrounds to test against
    const backgrounds = [
        { name: "White", hex: "#FFFFFF" },
        { name: "Black", hex: "#000000" },
        { name: "Light Neutral", hex: neutralColors.find(c => c.name.toLowerCase().includes("50") || c.name.toLowerCase().includes("100"))?.hex || "#F8FAFC" },
        { name: "Dark Neutral", hex: neutralColors.find(c => c.name.toLowerCase().includes("900") || c.name.toLowerCase().includes("950"))?.hex || "#0F172A" },
    ];

    return (
        <Card className="p-6 bg-background border">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-lg">Accessibility Check</h3>
                    <p className="text-sm text-muted-foreground">
                        Ensure your brand colors are legible for everyone (WCAG 2.1)
                    </p>
                </div>
                <Badge variant="outline" className="gap-1">
                    WCAG 2.1 AA
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {backgrounds.map((bg, idx) => {
                    const ratio = getContrastRatio(brandColor, bg.hex);
                    const scoreNormal = getWCAGScore(ratio, false);
                    const scoreLarge = getWCAGScore(ratio, true);

                    return (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-lg border" style={{ backgroundColor: bg.hex }}>
                            <div className="flex-1">
                                <p className="text-lg font-bold" style={{ color: brandColor }}>
                                    {brandColor} Text
                                </p>
                                <p className="text-sm" style={{ color: brandColor }}>
                                    on {bg.name} Background
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[100px]">
                                <div className="flex items-center justify-between bg-white/90 dark:bg-black/90 p-2 rounded shadow-sm backdrop-blur-sm">
                                    <span className="text-xs font-semibold text-foreground">Ratio</span>
                                    <span className="text-xs font-mono font-bold text-foreground">{ratio.toFixed(2)}:1</span>
                                </div>

                                <div className="flex gap-2">
                                    <Badge
                                        variant={scoreNormal === "Fail" ? "destructive" : "default"}
                                        className="flex-1 justify-center text-[10px] h-5"
                                    >
                                        {scoreNormal === "Fail" ? "AA Fail" : `AA ${scoreNormal}`}
                                    </Badge>
                                    <Badge
                                        variant={scoreLarge === "Fail" ? "destructive" : "secondary"}
                                        className="flex-1 justify-center text-[10px] h-5"
                                    >
                                        {scoreLarge === "Fail" ? "Lg Fail" : `Lg ${scoreLarge}`}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
