"use client";

import { Card } from "@/components/ui/card";
import { Ruler, Circle } from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getGradientBgStyle } from "@/lib/utils/color-utils";

type DesignTokensSectionProps = {
    project: DesignProject;
    manifest?: BrandManifest | null;
};

export function DesignTokensSection({ project, manifest }: DesignTokensSectionProps) {
    const { styleGuide } = project;

    // Get dynamic colors from manifest
    const gradientBgStyle = getGradientBgStyle(manifest, "to-br");

    // Safe access helpers with Array guards
    const spacing = Array.isArray(styleGuide?.spacing) ? styleGuide.spacing : [];
    const borderRadius = Array.isArray(styleGuide?.borderRadius) ? styleGuide.borderRadius : [];

    return (
        <div className="space-y-6">
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
