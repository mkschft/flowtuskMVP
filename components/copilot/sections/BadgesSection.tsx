"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    Info,
    Bell,
    Tag,
    Star
} from "lucide-react";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor, getSecondaryColor, getLightShade } from "@/lib/utils/color-utils";

type BadgesSectionProps = {
    manifest?: BrandManifest | null;
};

export function BadgesSection({ manifest }: BadgesSectionProps) {
    // Get dynamic colors from manifest
    const primaryColor = getPrimaryColor(manifest);
    const secondaryColor = getSecondaryColor(manifest);
    const lightPrimaryBg = getLightShade(primaryColor, 0.1);

    // Semantic colors (we'll use standard colors for semantic meaning, but accent with brand colors)
    const semanticColors = {
        success: "#10b981", // green
        warning: "#f59e0b", // amber
        error: "#ef4444",   // red
        info: primaryColor  // use brand primary for info
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-bold text-lg mb-2">Badges & Tags</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Small, versatile components for statuses, categories, and notifications
                </p>
            </div>

            {/* Status Badges */}
            <Card className="p-6">
                <h4 className="font-semibold text-base mb-4">Status Badges</h4>
                <p className="text-sm text-muted-foreground mb-4">
                    Use semantic colors to communicate state
                </p>

                <div className="space-y-6">
                    {/* Filled Variant */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Filled</p>
                        <div className="flex flex-wrap gap-3">
                            <Badge
                                className="gap-1.5"
                                style={{
                                    backgroundColor: semanticColors.success,
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                <CheckCircle className="w-3 h-3" />
                                Success
                            </Badge>
                            <Badge
                                className="gap-1.5"
                                style={{
                                    backgroundColor: semanticColors.warning,
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                <AlertTriangle className="w-3 h-3" />
                                Warning
                            </Badge>
                            <Badge
                                className="gap-1.5"
                                style={{
                                    backgroundColor: semanticColors.error,
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                <XCircle className="w-3 h-3" />
                                Error
                            </Badge>
                            <Badge
                                className="gap-1.5"
                                style={{
                                    backgroundColor: semanticColors.info,
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                <Info className="w-3 h-3" />
                                Info
                            </Badge>
                        </div>
                    </div>

                    {/* Outline Variant */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Outline</p>
                        <div className="flex flex-wrap gap-3">
                            <Badge
                                variant="outline"
                                className="gap-1.5"
                                style={{
                                    borderColor: semanticColors.success,
                                    color: semanticColors.success
                                }}
                            >
                                <CheckCircle className="w-3 h-3" />
                                Success
                            </Badge>
                            <Badge
                                variant="outline"
                                className="gap-1.5"
                                style={{
                                    borderColor: semanticColors.warning,
                                    color: semanticColors.warning
                                }}
                            >
                                <AlertTriangle className="w-3 h-3" />
                                Warning
                            </Badge>
                            <Badge
                                variant="outline"
                                className="gap-1.5"
                                style={{
                                    borderColor: semanticColors.error,
                                    color: semanticColors.error
                                }}
                            >
                                <XCircle className="w-3 h-3" />
                                Error
                            </Badge>
                            <Badge
                                variant="outline"
                                className="gap-1.5"
                                style={{
                                    borderColor: semanticColors.info,
                                    color: semanticColors.info
                                }}
                            >
                                <Info className="w-3 h-3" />
                                Info
                            </Badge>
                        </div>
                    </div>

                    {/* Subtle Variant */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Subtle</p>
                        <div className="flex flex-wrap gap-3">
                            <Badge
                                className="gap-1.5"
                                style={{
                                    backgroundColor: getLightShade(semanticColors.success, 0.15),
                                    color: semanticColors.success,
                                    border: 'none'
                                }}
                            >
                                <CheckCircle className="w-3 h-3" />
                                Success
                            </Badge>
                            <Badge
                                className="gap-1.5"
                                style={{
                                    backgroundColor: getLightShade(semanticColors.warning, 0.15),
                                    color: semanticColors.warning,
                                    border: 'none'
                                }}
                            >
                                <AlertTriangle className="w-3 h-3" />
                                Warning
                            </Badge>
                            <Badge
                                className="gap-1.5"
                                style={{
                                    backgroundColor: getLightShade(semanticColors.error, 0.15),
                                    color: semanticColors.error,
                                    border: 'none'
                                }}
                            >
                                <XCircle className="w-3 h-3" />
                                Error
                            </Badge>
                            <Badge
                                className="gap-1.5"
                                style={{
                                    backgroundColor: lightPrimaryBg,
                                    color: semanticColors.info,
                                    border: 'none'
                                }}
                            >
                                <Info className="w-3 h-3" />
                                Info
                            </Badge>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Category Tags */}
            <Card className="p-6">
                <h4 className="font-semibold text-base mb-4">Category Tags</h4>
                <p className="text-sm text-muted-foreground mb-4">
                    Use for labeling, filtering, and organization
                </p>

                <div className="space-y-6">
                    {/* Brand-Colored Tags - Filled */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Brand Color (Filled)</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge
                                style={{
                                    backgroundColor: primaryColor,
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                <Tag className="w-3 h-3 mr-1" />
                                Design
                            </Badge>
                            <Badge
                                style={{
                                    backgroundColor: secondaryColor,
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                <Tag className="w-3 h-3 mr-1" />
                                Development
                            </Badge>
                            <Badge
                                style={{
                                    backgroundColor: primaryColor,
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                <Tag className="w-3 h-3 mr-1" />
                                Marketing
                            </Badge>
                        </div>
                    </div>

                    {/* Brand-Colored Tags - Outline */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Brand Color (Outline)</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge
                                variant="outline"
                                style={{
                                    borderColor: primaryColor,
                                    color: primaryColor
                                }}
                            >
                                Product
                            </Badge>
                            <Badge
                                variant="outline"
                                style={{
                                    borderColor: secondaryColor,
                                    color: secondaryColor
                                }}
                            >
                                Engineering
                            </Badge>
                            <Badge
                                variant="outline"
                                style={{
                                    borderColor: primaryColor,
                                    color: primaryColor
                                }}
                            >
                                Sales
                            </Badge>
                        </div>
                    </div>

                    {/* Brand-Colored Tags - Subtle */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Brand Color (Subtle)</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge
                                style={{
                                    backgroundColor: lightPrimaryBg,
                                    color: primaryColor,
                                    border: 'none'
                                }}
                            >
                                Feature
                            </Badge>
                            <Badge
                                style={{
                                    backgroundColor: getLightShade(secondaryColor, 0.15),
                                    color: secondaryColor,
                                    border: 'none'
                                }}
                            >
                                Enhancement
                            </Badge>
                            <Badge
                                style={{
                                    backgroundColor: lightPrimaryBg,
                                    color: primaryColor,
                                    border: 'none'
                                }}
                            >
                                Bug Fix
                            </Badge>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Notification Badges */}
            <Card className="p-6">
                <h4 className="font-semibold text-base mb-4">Notification Badges</h4>
                <p className="text-sm text-muted-foreground mb-4">
                    Indicate counts, alerts, or status indicators
                </p>

                <div className="space-y-4">
                    {/* With Icons */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">With Icons</p>
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="relative inline-block">
                                <Bell className="w-6 h-6 text-foreground" />
                                <Badge
                                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                                    style={{
                                        backgroundColor: semanticColors.error,
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    3
                                </Badge>
                            </div>
                            <div className="relative inline-block">
                                <Star className="w-6 h-6 text-foreground" />
                                <Badge
                                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                                    style={{
                                        backgroundColor: primaryColor,
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    12
                                </Badge>
                            </div>
                            <div className="relative inline-block">
                                <Info className="w-6 h-6 text-foreground" />
                                <Badge
                                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                                    style={{
                                        backgroundColor: semanticColors.warning,
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    5
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Standalone Count Badges */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Count Badges</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge
                                className="rounded-full h-6 w-6 flex items-center justify-center p-0 text-xs"
                                style={{
                                    backgroundColor: primaryColor,
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                1
                            </Badge>
                            <Badge
                                className="rounded-full h-6 w-6 flex items-center justify-center p-0 text-xs"
                                style={{
                                    backgroundColor: secondaryColor,
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                5
                            </Badge>
                            <Badge
                                className="rounded-full px-2 h-6 flex items-center justify-center text-xs"
                                style={{
                                    backgroundColor: semanticColors.error,
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                99+
                            </Badge>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                💡 Status badges use semantic colors, while category tags use your brand colors from the Identity tab
            </div>
        </div>
    );
}
