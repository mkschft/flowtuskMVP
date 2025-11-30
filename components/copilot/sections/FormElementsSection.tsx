"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormInput, Mail, MessageSquare, Calendar, Download } from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor } from "@/lib/utils/color-utils";

type FormElementsSectionProps = {
    project: DesignProject;
    manifest?: BrandManifest | null;
};

export function FormElementsSection({ project, manifest }: FormElementsSectionProps) {
    // Get dynamic colors from manifest
    const primaryColor = getPrimaryColor(manifest);

    // Get input styles from manifest
    const inputStyle = manifest?.components?.inputs;
    const borderRadius = inputStyle?.borderRadius || "0.375rem"; // Default to rounded-md

    return (
        <div className="space-y-6">
            {/* Input States */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-6">
                    <FormInput className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Input States</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Normal State */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Normal</h4>
                        <Input placeholder="Enter text..." style={{ borderRadius }} />
                    </div>

                    {/* Active/Focus State */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active</h4>
                        <Input
                            placeholder="Enter text..."
                            style={{
                                borderColor: primaryColor,
                                boxShadow: `0 0 0 2px ${primaryColor}33`,
                                borderRadius
                            }}
                        />
                    </div>

                    {/* Error State */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Error</h4>
                        <Input placeholder=")(&21jdas" className="border-red-500" style={{ borderRadius }} />
                        <p className="text-xs text-red-500">Please enter a valid value</p>
                    </div>

                    {/* With Label */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">With Label</h4>
                        <label className="text-sm font-medium">Full Name</label>
                        <Input placeholder="Enter your name" style={{ borderRadius }} />
                    </div>
                </div>
            </Card>

            {/* Newsletter Subscribe Form */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Newsletter Subscribe</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    Most popular lead generation form - minimal friction, high conversion
                </p>

                <div className="max-w-md space-y-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            style={{ borderRadius }}
                        />
                    </div>
                    <Button
                        className="w-full"
                        style={{
                            backgroundColor: primaryColor,
                            borderRadius
                        }}
                    >
                        Get Weekly Insights
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                        Join 10,000+ subscribers • Unsubscribe anytime
                    </p>
                </div>
            </Card>

            {/* Contact Us Form */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Contact Us Form</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    Essential for every website - keeps fields minimal for higher completion
                </p>

                <div className="max-w-2xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input placeholder="John Doe" style={{ borderRadius }} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input type="email" placeholder="john@company.com" style={{ borderRadius }} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                            placeholder="How can we help you?"
                            rows={4}
                            style={{ borderRadius }}
                        />
                    </div>
                    <Button
                        style={{
                            backgroundColor: primaryColor,
                            borderRadius
                        }}
                    >
                        Send Message
                    </Button>
                </div>
            </Card>

            {/* Lead Magnet Download Form */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-4">
                    <Download className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Lead Magnet Download</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    High-value offer in exchange for contact info - proven to generate quality leads
                </p>

                <div className="max-w-md space-y-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input placeholder="Your name" style={{ borderRadius }} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Work Email</label>
                        <Input type="email" placeholder="you@company.com" style={{ borderRadius }} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Company (Optional)</label>
                        <Input placeholder="Company name" style={{ borderRadius }} />
                    </div>
                    <Button
                        className="w-full"
                        style={{
                            backgroundColor: primaryColor,
                            borderRadius
                        }}
                    >
                        Download Free Guide
                    </Button>
                </div>
            </Card>

            {/* Demo Request Form */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Demo Request Form</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    For B2B companies - balances information gathering with conversion optimization
                </p>

                <div className="max-w-2xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input placeholder="Jane Smith" style={{ borderRadius }} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Work Email</label>
                            <Input type="email" placeholder="jane@company.com" style={{ borderRadius }} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company</label>
                            <Input placeholder="Company name" style={{ borderRadius }} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input type="tel" placeholder="+1 (555) 000-0000" style={{ borderRadius }} />
                        </div>
                    </div>
                    <Button
                        className="w-full md:w-auto"
                        style={{
                            backgroundColor: primaryColor,
                            borderRadius
                        }}
                    >
                        Schedule Demo
                    </Button>
                </div>
            </Card>
        </div>
    );
}
