"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormInput } from "lucide-react";
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

    return (
        <div className="space-y-6">
            {/* Inputs Section */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-6">
                    <FormInput className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Inputs</h3>
                </div>

                <div className="space-y-6">
                    {/* Normal State */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Normal</h4>
                        </div>
                        <Input placeholder="Enter text..." />
                    </div>

                    {/* Active/Focus State */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active</h4>
                        </div>
                        <Input placeholder="Enter text..." style={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${primaryColor}33` }} />
                    </div>

                    {/* Error State */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Error</h4>
                        </div>
                        <Input placeholder=")(&21jdas" className="border-red-500" />
                        <p className="text-xs text-red-500">Error message</p>
                    </div>

                    {/* Label Example */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Label</h4>
                        </div>
                        <label className="text-sm font-medium">Name Surname</label>
                        <Input placeholder="Enter your name" />
                    </div>
                </div>
            </Card>
        </div>
    );
}
