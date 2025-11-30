"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput, Square, Box, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { BrandManifest } from "@/lib/types/brand-manifest";

// Import section components
import { FormElementsSection } from "./sections/FormElementsSection";
import { ButtonsSection } from "./sections/ButtonsSection";
import { CardsSection } from "./sections/CardsSection";
import { BadgesSection } from "./sections/BadgesSection";
import { DesignTokensSection } from "./sections/DesignTokensSection";

type ComponentSubTab = "form-elements" | "buttons-actions" | "content-display" | "design-tokens";

type ComponentsCanvasProps = {
    project: DesignProject;
    manifest?: BrandManifest | null;
};

export function ComponentsCanvas({ project, manifest }: ComponentsCanvasProps) {
    const [activeSubTab, setActiveSubTab] = useState<ComponentSubTab>("form-elements");

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Message */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Box className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">Living UI Kit</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            These components automatically inherit colors and styles from the <strong>Identity</strong> tab.
                            When you change your primary color or typography, all components here update in real-time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sub-Tab Navigation */}
            <div className="flex items-center justify-center">
                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveSubTab("form-elements")}
                        className={cn(
                            "gap-2 h-8 text-xs",
                            activeSubTab === "form-elements"
                                ? "bg-background shadow-sm text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <FormInput className="w-3 h-3" />
                        Form Elements
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveSubTab("buttons-actions")}
                        className={cn(
                            "gap-2 h-8 text-xs",
                            activeSubTab === "buttons-actions"
                                ? "bg-background shadow-sm text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Square className="w-3 h-3" />
                        Buttons & Actions
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveSubTab("content-display")}
                        className={cn(
                            "gap-2 h-8 text-xs",
                            activeSubTab === "content-display"
                                ? "bg-background shadow-sm text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Box className="w-3 h-3" />
                        Content Display
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveSubTab("design-tokens")}
                        className={cn(
                            "gap-2 h-8 text-xs",
                            activeSubTab === "design-tokens"
                                ? "bg-background shadow-sm text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Palette className="w-3 h-3" />
                        Design Tokens
                    </Button>
                </div>
            </div>

            {/* Sub-Tab Content */}
            <div>
                {activeSubTab === "form-elements" && (
                    <FormElementsSection project={project} manifest={manifest} />
                )}
                {activeSubTab === "buttons-actions" && (
                    <ButtonsSection project={project} manifest={manifest} />
                )}
                {activeSubTab === "content-display" && (
                    <div className="space-y-8">
                        <CardsSection manifest={manifest} />
                        <BadgesSection manifest={manifest} />
                    </div>
                )}
                {activeSubTab === "design-tokens" && (
                    <DesignTokensSection project={project} manifest={manifest} />
                )}
            </div>
        </div>
    );
}
