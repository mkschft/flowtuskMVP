"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPrimaryColor, getSecondaryColor } from "@/lib/utils/color-utils";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { ArrowUpRight, Shield, Zap, Trophy, Users } from "lucide-react";

type CompetitivePositioningProps = {
    manifest?: BrandManifest | null;
    brandName: string;
};

export function CompetitivePositioning({ manifest, brandName }: CompetitivePositioningProps) {
    const primaryColor = getPrimaryColor(manifest);
    const secondaryColor = getSecondaryColor(manifest);

    // Get competitive positioning from manifest with fallback
    const competitivePositioning = manifest?.strategy?.competitivePositioning;
    const competitorsData = competitivePositioning?.competitors || [];
    const differentiatorsData = competitivePositioning?.differentiators || [];

    // Build competitors array - brand should ALWAYS be in top-right quadrant
    const competitors = competitorsData.length > 0
        ? competitorsData.map(comp => ({
            name: comp.name,
            x: comp.x,
            y: comp.y,
            type: comp.name === brandName ? "hero" : "competitor"
        }))
        : [
            { name: "Legacy Inc.", x: 15, y: 60, type: "competitor" },
            { name: "CheapTool", x: 30, y: 30, type: "competitor" },
            { name: "Enterprise Corp", x: 65, y: 45, type: "competitor" },
            { name: brandName, x: 75, y: 75, type: "hero" },
        ];

    // Default differentiators if not in manifest
    const defaultDifferentiators = [
        {
            title: "Speed to Value",
            description: "Deploy in minutes, not months. 3x faster than legacy solutions.",
            icon: "Zap"
        },
        {
            title: "Enterprise Trust",
            description: "SOC2 compliant security with consumer-grade usability.",
            icon: "Shield"
        },
        {
            title: "User Centric",
            description: "Designed for end-users first, driving 90% adoption rates.",
            icon: "Users"
        }
    ];

    const differentiators = differentiatorsData.length > 0 ? differentiatorsData : defaultDifferentiators;

    return (
        <Card className="p-6 bg-background border">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-lg">Competitive Positioning</h3>
                    <p className="text-sm text-muted-foreground">
                        Where {brandName} stands in the market landscape
                    </p>
                </div>
                <Badge variant="outline" className="gap-1">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    Market Leader
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quadrant Chart */}
                <div className="md:col-span-2 relative aspect-video bg-slate-50 dark:bg-slate-900/50 rounded-lg border p-4">
                    {/* Axis Labels */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                        High Innovation
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                        Low Innovation
                    </div>
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                        High Value
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-xs font-semibold text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                        Low Value
                    </div>

                    {/* Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                        <div className="border-r border-b border-dashed border-slate-200 dark:border-slate-800" />
                        <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />
                        <div className="border-r border-dashed border-slate-200 dark:border-slate-800" />
                        <div />
                    </div>

                    {/* Points */}
                    {competitors.map((comp, idx) => (
                        <div
                            key={idx}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group cursor-pointer"
                            style={{
                                left: `${comp.x}%`,
                                bottom: `${comp.y}%`,
                            }}
                        >
                            <div
                                className={`w-4 h-4 rounded-full border-2 shadow-sm transition-all duration-300 ${comp.type === "hero"
                                    ? "w-6 h-6 ring-4 ring-opacity-20"
                                    : "bg-slate-300 border-slate-400 dark:bg-slate-700 dark:border-slate-600"
                                    }`}
                                style={
                                    comp.type === "hero"
                                        ? {
                                            backgroundColor: primaryColor,
                                            borderColor: "white",
                                            boxShadow: `0 0 20px ${primaryColor}40`
                                        }
                                        : {}
                                }
                            />
                            <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm ${comp.type === "hero"
                                    ? "bg-foreground text-background font-bold shadow-lg"
                                    : "bg-background/80 text-muted-foreground border shadow-sm"
                                    }`}
                            >
                                {comp.name}
                            </span>

                            {/* Tooltip for Hero */}
                            {comp.type === "hero" && (
                                <div className="absolute bottom-full mb-2 w-48 bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    <p className="font-semibold mb-1">Your Advantage:</p>
                                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                        <li>AI-First Approach</li>
                                        <li>Enterprise Security</li>
                                        <li>Rapid Deployment</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Differentiators List */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Key Differentiators</h4>

                    {differentiators.map((diff, idx) => {
                        const iconMap: Record<string, any> = {
                            "Zap": Zap,
                            "Shield": Shield,
                            "Users": Users,
                            "Trophy": Trophy,
                            "ArrowUpRight": ArrowUpRight
                        };
                        const IconComponent = diff.icon ? iconMap[diff.icon] || Zap : Zap;
                        const colorClasses = [
                            "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                            "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                            "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        ];
                        const colorClass = colorClasses[idx % colorClasses.length];

                        return (
                            <div key={idx} className="p-3 rounded-lg border bg-muted/30 flex gap-3">
                                <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center shrink-0`}>
                                    <IconComponent className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{diff.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {diff.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
