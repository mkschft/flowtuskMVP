"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { BrandManifest } from "@/lib/types/brand-manifest";

type ButtonsSectionProps = {
    project: DesignProject;
    manifest?: BrandManifest | null;
};

export function ButtonsSection({ project, manifest }: ButtonsSectionProps) {
    const { styleGuide, valueProp } = project;

    // Safe access helpers with Array guards
    const buttons = Array.isArray(styleGuide?.buttons) ? styleGuide.buttons : [];

    // Use persona-specific CTAs, or fallback to generic ones
    const ctaLabels = valueProp?.ctaSuggestions || ["Get Started", "Learn More", "Contact Us", "Book Demo", "Try Free"];

    return (
        <div className="space-y-6">
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
        </div>
    );
}
