"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, MessageSquare, Sparkles, RefreshCw } from "lucide-react";
import { useState } from "react";
import { getPrimaryColor, getLightShade } from "@/lib/utils/color-utils";
import type { BrandManifest } from "@/lib/types/brand-manifest";

type MessagingVariationsProps = {
    manifest?: BrandManifest | null;
    valueProp: any; // Using any for flexibility with mock data structure
};

export function MessagingVariations({ manifest, valueProp }: MessagingVariationsProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const primaryColor = getPrimaryColor(manifest);
    const lightPrimaryBg = getLightShade(primaryColor, 0.1);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Get messaging variations from manifest with fallback
    const messagingVariations = manifest?.strategy?.messagingVariations || [];
    
    const getIconForType = (type: string) => {
        switch (type) {
            case "Benefit-First":
                return <Sparkles className="w-4 h-4" />;
            case "Problem-Agitate-Solve":
                return <MessageSquare className="w-4 h-4" />;
            case "Social Proof":
                return <UsersIcon />;
            case "Urgency":
                return <RefreshCw className="w-4 h-4" />;
            default:
                return <Sparkles className="w-4 h-4" />;
        }
    };

    // Build variations from manifest or use fallback
    const variations = messagingVariations.length > 0
        ? messagingVariations.map(v => ({
            type: v.type,
            text: v.text,
            icon: getIconForType(v.type),
            context: v.context
        }))
        : [
            {
                type: "Benefit-First",
                text: valueProp.headline || "Transform your workflow with AI-powered automation.",
                icon: <Sparkles className="w-4 h-4" />,
                context: "Best for: Landing Page Hero, Ads"
            },
            {
                type: "Problem-Agitate-Solve",
                text: `${valueProp.problem} Stop the chaos. ${valueProp.solution}`,
                icon: <MessageSquare className="w-4 h-4" />,
                context: "Best for: Email Outreach, Sales Calls"
            },
            {
                type: "Social Proof",
                text: `Join 10,000+ teams who use ${manifest?.brandName || "our platform"} to ${valueProp.outcome?.toLowerCase() || "achieve results"}.`,
                icon: <UsersIcon />,
                context: "Best for: Retargeting, Footer CTA"
            }
        ];

    return (
        <Card className="p-6 bg-background border">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-lg">Messaging Variations</h3>
                    <p className="text-sm text-muted-foreground">
                        Tailored messages for different contexts
                    </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                </Button>
            </div>

            <div className="grid gap-4">
                {variations.map((variation, idx) => (
                    <div
                        key={idx}
                        className="group relative p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                        variant="secondary"
                                        className="text-xs font-medium"
                                        style={{
                                            backgroundColor: idx === 0 ? lightPrimaryBg : undefined,
                                            color: idx === 0 ? primaryColor : undefined
                                        }}
                                    >
                                        {variation.icon && <span className="mr-1">{variation.icon}</span>}
                                        {variation.type}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {variation.context}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed font-medium text-foreground/90">
                                    {variation.text}
                                </p>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleCopy(variation.text, `var-${idx}`)}
                            >
                                {copiedId === `var-${idx}` ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function UsersIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
