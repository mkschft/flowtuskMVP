"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Share2, Printer } from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import type { ICP } from "@/lib/types/database";
import { getPrimaryColor, getSecondaryColor, getAccentColor, getContrastColor } from "@/lib/utils/color-utils";
import { renderLogoWithColors } from "@/lib/generation/logo-generator";

type BusinessCardPreviewProps = {
    project: DesignProject;
    manifest?: BrandManifest | null;
    persona?: ICP;
};

export function BusinessCardPreview({ project, manifest, persona }: BusinessCardPreviewProps) {
    const primaryColor = getPrimaryColor(manifest);
    const secondaryColor = getSecondaryColor(manifest);
    const accentColor = getAccentColor(manifest);

    // Get brand details
    const brandName = manifest?.brandName || project.name;
    
    // Generate logo dynamically with current colors (cascades when colors change)
    const logoVariation = manifest?.identity?.logo?.variations?.[0];
    const logoUrl = useMemo(() => {
        if (!logoVariation) return null;
        const typography = manifest?.identity?.typography?.heading ? {
            family: manifest.identity.typography.heading.family,
            weight: manifest.identity.typography.heading.weights?.[0] || '600'
        } : null;
        return renderLogoWithColors(
            brandName,
            { name: logoVariation.name, description: logoVariation.description },
            primaryColor,
            accentColor,
            typography
        );
    }, [logoVariation, brandName, primaryColor, accentColor, manifest?.identity?.typography?.heading]);

    // Get person details
    const name = persona?.persona_name || "Alex Morgan";
    const role = persona?.persona_role || "Founder & CEO";
    const email = `alex@${brandName.toLowerCase().replace(/\s/g, '')}.com`;
    const phone = "+1 (555) 123-4567";
    const website = `www.${brandName.toLowerCase().replace(/\s/g, '')}.com`;

    // Determine text colors based on background contrast
    const primaryTextColor = getContrastColor(primaryColor);
    const secondaryTextColor = getContrastColor(secondaryColor);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        Print Ready
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        3.5" x 2.0"
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Front of Card */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground text-center">Front</h3>
                    <div
                        className="aspect-[3.5/2] rounded-lg shadow-xl relative overflow-hidden flex flex-col items-center justify-center p-8 transition-transform hover:scale-[1.02] duration-300"
                        style={{
                            backgroundColor: primaryColor,
                            color: primaryTextColor
                        }}
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `radial-gradient(circle at 2px 2px, ${primaryTextColor} 1px, transparent 0)`,
                                backgroundSize: '20px 20px'
                            }}
                        />

                        <div className="relative z-10 text-center">
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt="Logo"
                                    className="h-16 w-auto mb-4 mx-auto object-contain filter brightness-0 invert"
                                />
                            ) : (
                                <div className="text-4xl font-bold mb-2 tracking-tight">
                                    {brandName}
                                </div>
                            )}
                            <div className="h-1 w-12 bg-current opacity-50 mx-auto rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Back of Card */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground text-center">Back</h3>
                    <div
                        className="aspect-[3.5/2] rounded-lg shadow-xl relative overflow-hidden flex flex-col justify-between p-8 bg-white dark:bg-slate-900 border transition-transform hover:scale-[1.02] duration-300"
                    >
                        {/* Accent Line */}
                        <div
                            className="absolute left-0 top-0 bottom-0 w-2"
                            style={{ backgroundColor: secondaryColor }}
                        />

                        <div className="pl-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-foreground">{name}</h2>
                                <p className="text-sm font-medium text-muted-foreground" style={{ color: primaryColor }}>{role}</p>
                            </div>

                            <div className="space-y-1.5 text-xs text-muted-foreground">
                                <p className="flex items-center gap-2">
                                    <span className="font-semibold w-4">E</span> {email}
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="font-semibold w-4">P</span> {phone}
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="font-semibold w-4">W</span> {website}
                                </p>
                            </div>
                        </div>

                        <div className="pl-6 flex justify-end">
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt="Logo"
                                    className="h-6 w-auto opacity-50 grayscale"
                                />
                            ) : (
                                <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase opacity-50">
                                    {brandName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mockup Context */}
            <Card className="p-8 bg-muted/30 border-dashed">
                <div className="text-center space-y-2">
                    <h3 className="font-semibold">Professional Identity</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Your business card is often the first physical touchpoint with your brand.
                        We automatically generate print-ready assets based on your brand identity.
                    </p>
                </div>
            </Card>
        </div>
    );
}
