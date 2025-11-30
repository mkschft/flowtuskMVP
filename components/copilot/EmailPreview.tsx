"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ExternalLink, Calendar, Download } from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { ICP } from "@/lib/types/database";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor, getSecondaryColor, getTextGradientStyle } from "@/lib/utils/color-utils";

type EmailPreviewProps = {
    project: DesignProject;
    persona: ICP;
    manifest?: BrandManifest | null;
};

export function EmailPreview({ project, persona, manifest }: EmailPreviewProps) {
    // Prioritize manifest over project/props for single source of truth
    const valueProp = manifest?.strategy?.valueProp || project.valueProp;
    const manifestPersona = manifest?.strategy?.persona;

    // Get dynamic colors
    const primaryColor = getPrimaryColor(manifest);
    const secondaryColor = getSecondaryColor(manifest);
    const textGradientStyle = getTextGradientStyle(manifest);

    // Get brand name - try brandName from manifest first, fallback to persona_company
    const brandName = manifest?.brandName || manifestPersona?.company || persona?.persona_company || "Your Company";

    // Get CTA from manifest or defaults - ctaSuggestions might be in project.valueProp
    const primaryCTA = manifest?.components?.ctas?.primary?.[0] || (project.valueProp as any)?.ctaSuggestions?.[0] || "Get Started";
    const headline = valueProp?.headline || "Transform your workflow";
    const subheadline = valueProp?.subheadline || "Discover how we can help you achieve your goals";
    const benefits = valueProp?.benefits || ["Benefit 1", "Benefit 2", "Benefit 3"];

    // Persona data for personalization - prioritize manifest
    const personaName = (manifestPersona?.name || persona?.persona_name || "there").split(' ')[0];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Email Viewport Card */}
            <Card className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span className="font-semibold">Email Template Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            Newsletter
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            Responsive
                        </Badge>
                    </div>
                </div>

                {/* Email Container (mimics email client) */}
                <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl overflow-hidden border">
                    {/* Email Header */}
                    <div
                        className="px-8 py-6 border-b"
                        style={{ backgroundColor: `${primaryColor}15` }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-xs text-muted-foreground">From: {brandName} &lt;hello@{brandName.toLowerCase().replace(/\s/g, '')}.com&gt;</p>
                                <p className="text-xs text-muted-foreground">To: {personaName.toLowerCase()}@example.com</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Just now
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mt-2" style={textGradientStyle}>
                            {headline}
                        </h3>
                    </div>

                    {/* Email Body */}
                    <div className="p-8">
                        {/* Greeting */}
                        <div className="mb-6">
                            <p className="text-base mb-4">
                                Hi {personaName},
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {subheadline}
                            </p>
                        </div>

                        {/* Key Benefits */}
                        <div className="my-8 p-6 rounded-lg border bg-muted/30">
                            <h4 className="font-semibold text-sm mb-4">Here's what you'll get:</h4>
                            <ul className="space-y-3">
                                {benefits.slice(0, 3).map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5 flex-shrink-0"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            ✓
                                        </div>
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA Button */}
                        <div className="text-center my-8">
                            <Button
                                size="lg"
                                className="shadow-lg"
                                style={{
                                    backgroundColor: primaryColor,
                                    color: 'white',
                                }}
                            >
                                {primaryCTA}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-3">
                                No credit card required · Free 14-day trial
                            </p>
                        </div>

                        {/* Social Proof */}
                        <div className="text-center my-8 p-6 bg-muted/20 rounded-lg">
                            <p className="text-sm italic text-muted-foreground mb-2">
                                "This has completely transformed how we work. Highly recommended!"
                            </p>
                            <p className="text-xs font-semibold">
                                — {persona?.persona_name || "Sarah Chen"}, {persona?.persona_role || "Marketing Director"}
                            </p>
                        </div>

                        {/* Closing */}
                        <div className="mt-6 pt-6 border-t">
                            <p className="text-sm text-muted-foreground">
                                Best regards,<br />
                                <span className="font-semibold text-foreground">The {brandName} Team</span>
                            </p>
                        </div>
                    </div>

                    {/* Email Footer */}
                    <div className="px-8 py-6 bg-muted/50 border-t text-center">
                        <div className="flex items-center justify-center gap-4 mb-3">
                            <a href="#" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                Visit Website
                            </a>
                            <a href="#" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Schedule Demo
                            </a>
                            <a href="#" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                Download Resources
                            </a>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {brandName} · {persona?.location || "San Francisco"}, {persona?.country || "United States"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            You're receiving this because you signed up for updates.{" "}
                            <a href="#" className="underline">Unsubscribe</a>
                        </p>
                    </div>
                </div>

                {/* Preview Notes */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-900 dark:text-blue-100">
                            <p className="font-semibold mb-1">Email Template Features:</p>
                            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                                <li>• Brand colors from Identity tab (primary: {primaryColor})</li>
                                <li>• Personalized greeting using persona data</li>
                                <li>• Responsive design for mobile and desktop</li>
                                <li>• Clear CTA with social proof</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
