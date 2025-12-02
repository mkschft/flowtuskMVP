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

            {/* Sub-Tab Navigation */}
            <div className="flex items-center justify-center overflow-x-auto px-4">
                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveSubTab("form-elements")}
                        className={cn(
                            "gap-1.5 md:gap-2 h-11 md:h-8 text-xs min-w-[44px] md:min-w-0 whitespace-nowrap",
                            activeSubTab === "form-elements"
                                ? "bg-background shadow-sm text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <FormInput className="w-4 h-4 md:w-3 md:h-3" />
                        <span className="hidden sm:inline">Forms</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveSubTab("buttons-actions")}
                        className={cn(
                            "gap-1.5 md:gap-2 h-11 md:h-8 text-xs min-w-[44px] md:min-w-0 whitespace-nowrap",
                            activeSubTab === "buttons-actions"
                                ? "bg-background shadow-sm text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Square className="w-4 h-4 md:w-3 md:h-3" />
                        <span className="hidden sm:inline">Buttons</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveSubTab("content-display")}
                        className={cn(
                            "gap-1.5 md:gap-2 h-11 md:h-8 text-xs min-w-[44px] md:min-w-0 whitespace-nowrap",
                            activeSubTab === "content-display"
                                ? "bg-background shadow-sm text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Box className="w-4 h-4 md:w-3 md:h-3" />
                        <span className="hidden sm:inline">Cards</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveSubTab("design-tokens")}
                        className={cn(
                            "gap-1.5 md:gap-2 h-11 md:h-8 text-xs min-w-[44px] md:min-w-0 whitespace-nowrap",
                            activeSubTab === "design-tokens"
                                ? "bg-background shadow-sm text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Palette className="w-4 h-4 md:w-3 md:h-3" />
                        <span className="hidden sm:inline">Tokens</span>
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
