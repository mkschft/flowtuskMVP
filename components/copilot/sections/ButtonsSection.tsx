"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Square, ArrowRight, Download, Play, Calendar, Share2, Heart } from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor } from "@/lib/utils/color-utils";

type ButtonsSectionProps = {
    project: DesignProject;
    manifest?: BrandManifest | null;
};

export function ButtonsSection({ project, manifest }: ButtonsSectionProps) {
    const { valueProp } = project;
    const primaryColor = getPrimaryColor(manifest);
    const buttonStyles = manifest?.components?.buttons;

    // Get CTAs from manifest with fallbacks
    const ctas = manifest?.components?.ctas;
    const primaryCTAs = ctas?.primary || [];
    const secondaryCTAs = ctas?.secondary || [];
    const tertiaryCTAs = ctas?.tertiary || [];
    const socialCTAs = ctas?.social || [];
    const destructiveCTAs = ctas?.destructive || [];

    // Fallback to valueProp if manifest CTAs not available
    const primaryCTA = primaryCTAs[0] || valueProp?.ctaSuggestions?.[0] || "Get Started";

    const borderRadius = buttonStyles?.primary?.borderRadius || "0.375rem";

    return (
        <div className="space-y-6">
            {/* Primary CTAs - Conversion-Focused */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-4">
                    <Square className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Primary CTAs</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                    High-impact actions - use sparingly, one per section
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {primaryCTAs.length > 0 ? (
                        primaryCTAs.slice(0, 6).map((cta, idx) => (
                            <div key={idx} className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {idx === 0 ? "Lead Generation" : idx === 1 ? "Free Trial" : idx === 2 ? "Action-Oriented" : idx === 3 ? "Booking" : idx === 4 ? "With Arrow" : "Urgency"}
                                </p>
                                <Button className="w-full" style={{ backgroundColor: primaryColor, borderRadius }}>
                                    {cta.includes("Download") && <Download className="w-4 h-4 mr-2" />}
                                    {cta.includes("Demo") || cta.includes("Book") ? <Calendar className="w-4 h-4 mr-2" /> : null}
                                    {cta}
                                    {idx === 4 && <ArrowRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Lead Generation</p>
                                <Button className="w-full" style={{ backgroundColor: primaryColor, borderRadius }}>
                                    {primaryCTA}
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Free Trial</p>
                                <Button className="w-full" style={{ backgroundColor: primaryColor, borderRadius }}>
                                    Start Free Trial
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Action-Oriented</p>
                                <Button className="w-full" style={{ backgroundColor: primaryColor, borderRadius }}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Now
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Booking/Scheduling</p>
                                <Button className="w-full" style={{ backgroundColor: primaryColor, borderRadius }}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Book Demo
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">With Arrow</p>
                                <Button className="w-full" style={{ backgroundColor: primaryColor, borderRadius }}>
                                    Get Started
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Urgency</p>
                                <Button className="w-full" style={{ backgroundColor: primaryColor, borderRadius }}>
                                    Claim Your Spot
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Secondary CTAs - Supporting Actions */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-4">
                    <Square className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-bold text-lg">Secondary CTAs</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                    Lower commitment alternatives - pair with primary CTAs
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {secondaryCTAs.length > 0 ? (
                        secondaryCTAs.slice(0, 6).map((cta, idx) => (
                            <div key={idx} className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {idx === 0 ? "Information" : idx === 1 ? "Video Content" : idx === 2 ? "Pricing" : idx === 3 ? "Documentation" : idx === 4 ? "Sales Contact" : "Resources"}
                                </p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    {cta.includes("Watch") || cta.includes("Demo") ? <Play className="w-4 h-4 mr-2" /> : null}
                                    {cta}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Information</p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    Learn More
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Video Content</p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    <Play className="w-4 h-4 mr-2" />
                                    Watch Demo
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Pricing</p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    See Pricing
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Documentation</p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    Read Docs
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Sales Contact</p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    Talk to Sales
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Resources</p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    Browse Resources
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Tertiary/Ghost CTAs - Minimal Emphasis */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-4">
                    <Square className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-bold text-lg">Tertiary & Ghost CTAs</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                    Subtle actions for navigation or low-priority tasks
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tertiaryCTAs.length > 0 ? (
                        tertiaryCTAs.slice(0, 6).map((cta, idx) => (
                            <div key={idx} className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {idx === 0 ? "Navigation" : idx === 1 ? "Skip Action" : idx === 2 ? "Dismiss" : idx === 3 ? "More Options" : idx === 4 ? "Back Navigation" : "Help/Support"}
                                </p>
                                <Button variant="ghost" className="w-full" style={{ borderRadius }}>
                                    {cta}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Navigation</p>
                                <Button variant="ghost" className="w-full" style={{ borderRadius }}>
                                    View All
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Skip Action</p>
                                <Button variant="ghost" className="w-full" style={{ borderRadius }}>
                                    Skip for Now
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Dismiss</p>
                                <Button variant="ghost" className="w-full" style={{ borderRadius }}>
                                    No Thanks
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">More Options</p>
                                <Button variant="ghost" className="w-full" style={{ borderRadius }}>
                                    Show More
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Back Navigation</p>
                                <Button variant="ghost" className="w-full" style={{ borderRadius }}>
                                    Go Back
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Help/Support</p>
                                <Button variant="ghost" className="w-full" style={{ borderRadius }}>
                                    Get Help
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Social & Engagement CTAs */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-4">
                    <Share2 className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Social & Engagement</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                    Encourage sharing, saving, and community participation
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {socialCTAs.length > 0 ? (
                        socialCTAs.slice(0, 4).map((cta, idx) => (
                            <div key={idx} className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {idx === 0 ? "Share" : idx === 1 ? "Save/Like" : idx === 2 ? "Community" : "Follow"}
                                </p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    {cta.includes("Share") ? <Share2 className="w-4 h-4 mr-2" /> : null}
                                    {cta.includes("Save") || cta.includes("Like") ? <Heart className="w-4 h-4 mr-2" /> : null}
                                    {cta}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Share</p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Save/Like</p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    <Heart className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Community</p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    Join Community
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Follow</p>
                                <Button variant="outline" className="w-full" style={{ borderRadius }}>
                                    Follow Us
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Destructive/Cancel CTAs */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-4">
                    <Square className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-lg">Destructive Actions</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                    For cancellations, deletions, or irreversible actions
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {destructiveCTAs.length > 0 ? (
                        destructiveCTAs.slice(0, 3).map((cta, idx) => (
                            <div key={idx} className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {idx === 0 ? "Cancel Subscription" : idx === 1 ? "Delete" : "Remove"}
                                </p>
                                <Button 
                                    variant={idx === 2 ? "outline" : "destructive"} 
                                    className={idx === 2 ? "w-full border-red-500 text-red-500 hover:bg-red-50" : "w-full"} 
                                    style={{ borderRadius }}
                                >
                                    {cta}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Cancel Subscription</p>
                                <Button variant="destructive" className="w-full" style={{ borderRadius }}>
                                    Cancel Subscription
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Delete</p>
                                <Button variant="destructive" className="w-full" style={{ borderRadius }}>
                                    Delete Account
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Remove</p>
                                <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-50" style={{ borderRadius }}>
                                    Remove Item
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
