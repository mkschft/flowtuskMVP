"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    Star,
    Check,
    Sparkles,
    DollarSign,
    Zap
} from "lucide-react";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor, getSecondaryColor, getTextGradientStyle, getLightShade } from "@/lib/utils/color-utils";

type CardsSectionProps = {
    manifest?: BrandManifest | null;
    cards?: Array<{
        type: string;
        title: string;
        description: string;
        features?: string[];
        price?: string;
        cta?: string;
        trend?: string;
        author?: string;
        role?: string;
        company?: string;
        rating?: number;
        highlighted?: boolean;
    }>;
};

export function CardsSection({ manifest, cards = [] }: CardsSectionProps) {
    // Get dynamic colors from manifest
    const primaryColor = getPrimaryColor(manifest);
    const secondaryColor = getSecondaryColor(manifest);
    const textGradientStyle = getTextGradientStyle(manifest);
    const lightPrimaryBg = getLightShade(primaryColor, 0.1);
    const lightPrimaryRing = getLightShade(primaryColor, 0.2);

    // Default cards if not provided
    const defaultCards = [
        {
            type: "feature",
            title: "AI-Powered Automation",
            description: "Automate your workflow with intelligent AI that learns from your brand.",
            features: ["Smart detection", "Auto-updates", "24/7 monitoring"],
            cta: "Learn More"
        },
        {
            type: "stat",
            title: "98%",
            description: "Customer Satisfaction",
            trend: "+12%"
        },
        {
            type: "pricing",
            title: "Professional",
            description: "For growing teams",
            price: "$49",
            features: [
                "Unlimited projects",
                "Advanced analytics",
                "Priority support",
                "Custom integrations"
            ],
            cta: "Get Started",
            highlighted: true
        },
        {
            type: "testimonial",
            title: "Game-changing platform",
            description: "This tool transformed how we approach brand strategy. The AI suggestions are spot-on and save us hours every week.",
            author: "Sarah Chen",
            role: "Marketing Director",
            company: "TechCorp",
            rating: 5
        }
    ];

    const displayCards = cards.length > 0 ? cards : defaultCards;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-bold text-lg mb-2">Cards</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Versatile card components that inherit your brand's colors and typography
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayCards.map((card, idx) => {
                    // Feature Card
                    if (card.type === "feature") {
                        return (
                            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                    style={{ backgroundColor: lightPrimaryBg }}
                                >
                                    <Sparkles className="w-6 h-6" style={{ color: primaryColor }} />
                                </div>
                                <h4 className="font-bold text-lg mb-2">{card.title}</h4>
                                <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                                {card.features && card.features.length > 0 && (
                                    <ul className="space-y-2 mb-4">
                                        {card.features.map((feature, fIdx) => (
                                            <li key={fIdx} className="flex items-start gap-2 text-sm">
                                                <Check className="w-4 h-4 mt-0.5" style={{ color: primaryColor }} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <Button variant="outline" className="w-full">
                                    {card.cta || "Learn More"}
                                </Button>
                            </Card>
                        );
                    }

                    // Stat Card
                    if (card.type === "stat") {
                        return (
                            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4
                                            className="text-4xl font-bold mb-1"
                                            style={textGradientStyle}
                                        >
                                            {card.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">{card.description}</p>
                                    </div>
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: lightPrimaryBg }}
                                    >
                                        <TrendingUp className="w-5 h-5" style={{ color: primaryColor }} />
                                    </div>
                                </div>
                                {card.trend && (
                                    <Badge
                                        className="mt-2"
                                        style={{
                                            backgroundColor: lightPrimaryBg,
                                            color: primaryColor,
                                        }}
                                    >
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        {card.trend} from last month
                                    </Badge>
                                )}
                            </Card>
                        );
                    }

                    // Pricing Card
                    if (card.type === "pricing") {
                        const isHighlighted = 'highlighted' in card && card.highlighted;
                        return (
                            <Card
                                key={idx}
                                className={`p-6 hover:shadow-lg transition-shadow relative ${isHighlighted ? 'ring-2 ring-offset-2' : ''
                                    }`}
                                style={isHighlighted ? { borderColor: primaryColor } : {}}
                            >
                                {isHighlighted && (
                                    <Badge
                                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                                        style={{
                                            backgroundColor: primaryColor,
                                            color: 'white',
                                        }}
                                    >
                                        Most Popular
                                    </Badge>
                                )}
                                <div className="text-center mb-6">
                                    <h4 className="font-bold text-xl mb-2">{card.title}</h4>
                                    <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold" style={textGradientStyle}>
                                            {card.price}
                                        </span>
                                        <span className="text-muted-foreground">/month</span>
                                    </div>
                                </div>
                                {card.features && card.features.length > 0 && (
                                    <ul className="space-y-3 mb-6">
                                        {card.features.map((feature, fIdx) => (
                                            <li key={fIdx} className="flex items-start gap-2 text-sm">
                                                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <Button
                                    className="w-full"
                                    variant={isHighlighted ? "default" : "outline"}
                                >
                                    {card.cta || "Get Started"}
                                </Button>
                            </Card>
                        );
                    }

                    // Testimonial Card
                    if (card.type === "testimonial") {
                        const testimonialCard = card as typeof card & { author?: string; role?: string; company?: string; rating?: number };
                        return (
                            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonialCard.rating || 5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" style={{ color: primaryColor }} />
                                    ))}
                                </div>
                                <h4 className="font-bold text-lg mb-2">{card.title}</h4>
                                <p className="text-sm text-muted-foreground mb-4 italic">
                                    "{card.description}"
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {testimonialCard.author?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{testimonialCard.author || "Anonymous"}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {testimonialCard.role || "Customer"}
                                            {testimonialCard.company && ` at ${testimonialCard.company}`}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        );
                    }

                    return null;
                })}
            </div>

            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                💡 These cards automatically use your primary color from the Identity tab
            </div>
        </div>
    );
}
