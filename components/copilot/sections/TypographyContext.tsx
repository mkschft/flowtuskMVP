"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor } from "@/lib/utils/color-utils";

type TypographyContextProps = {
    manifest?: BrandManifest | null;
};

export function TypographyContext({ manifest }: TypographyContextProps) {
    const typography = manifest?.identity?.typography;
    const headingFont = typography?.heading?.family || "Inter";
    const bodyFont = typography?.body?.family || "Inter";
    const primaryColor = getPrimaryColor(manifest);

    return (
        <Card className="p-6 bg-background border">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-lg">Typography in Context</h3>
                    <p className="text-sm text-muted-foreground">
                        How your fonts work together in real content
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Article Preview */}
                <div className="p-8 rounded-lg border bg-white dark:bg-slate-950 shadow-sm">
                    <span
                        className="text-xs font-bold uppercase tracking-wider mb-4 block"
                        style={{ color: primaryColor, fontFamily: bodyFont }}
                    >
                        Product Update
                    </span>

                    <h1
                        className="text-3xl font-bold mb-4 leading-tight"
                        style={{ fontFamily: headingFont }}
                    >
                        The Future of Digital Design is Automated
                    </h1>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div className="text-xs text-muted-foreground" style={{ fontFamily: bodyFont }}>
                            <span className="font-semibold text-foreground">Alex Chen</span> · 5 min read
                        </div>
                    </div>

                    <p
                        className="text-base text-muted-foreground leading-relaxed mb-4"
                        style={{ fontFamily: bodyFont }}
                    >
                        In a world where speed is currency, design systems need to evolve. We're moving beyond static style guides into living, breathing design ecosystems that adapt to your brand's needs in real-time.
                    </p>

                    <p
                        className="text-base text-muted-foreground leading-relaxed"
                        style={{ fontFamily: bodyFont }}
                    >
                        "Automation isn't about replacing creativity," says our Head of Design. "It's about removing the friction between an idea and its execution."
                    </p>
                </div>

                {/* UI Interface Preview */}
                <div className="p-6 rounded-lg border bg-slate-50 dark:bg-slate-900 flex flex-col justify-center">
                    <div className="bg-white dark:bg-slate-950 rounded-lg shadow-lg p-6 max-w-sm mx-auto w-full">
                        <h3
                            className="text-lg font-bold mb-2"
                            style={{ fontFamily: headingFont }}
                        >
                            Get Started
                        </h3>
                        <p
                            className="text-sm text-muted-foreground mb-4"
                            style={{ fontFamily: bodyFont }}
                        >
                            Create your account to start building.
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label
                                    className="text-xs font-medium mb-1.5 block"
                                    style={{ fontFamily: bodyFont }}
                                >
                                    Email Address
                                </label>
                                <div className="h-9 w-full rounded border bg-background px-3 flex items-center text-sm text-muted-foreground">
                                    name@company.com
                                </div>
                            </div>

                            <button
                                className="w-full h-9 rounded text-white text-sm font-medium mt-2"
                                style={{ backgroundColor: primaryColor, fontFamily: bodyFont }}
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
