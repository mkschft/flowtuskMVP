"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ruler, Circle, Code, FileJson, Copy, Check, Sparkles } from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getGradientBgStyle, getPrimaryColor, getLightShade } from "@/lib/utils/color-utils";
import { useState } from "react";

type DesignTokensSectionProps = {
    project: DesignProject;
    manifest?: BrandManifest | null;
};

export function DesignTokensSection({ project, manifest }: DesignTokensSectionProps) {
    const { styleGuide } = project;
    const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

    // Get dynamic colors from manifest
    const gradientBgStyle = getGradientBgStyle(manifest, "to-br");
    const primaryColor = getPrimaryColor(manifest);
    const lightPrimaryBg = getLightShade(primaryColor, 0.1);

    // Safe access helpers with Array guards
    let spacing = Array.isArray(styleGuide?.spacing) ? styleGuide.spacing : [];
    let borderRadius = Array.isArray(styleGuide?.borderRadius) ? styleGuide.borderRadius : [];

    // Override with manifest data if available
    if (manifest?.components?.spacing?.scale) {
        spacing = Object.entries(manifest.components.spacing.scale).map(([name, value]) => ({
            name,
            value
        }));
    }

    if (manifest?.components) {
        const manifestRadii = [];
        if (manifest.components.buttons?.primary?.borderRadius) {
            manifestRadii.push({ name: "Buttons", value: manifest.components.buttons.primary.borderRadius });
        }
        if (manifest.components.cards?.borderRadius) {
            manifestRadii.push({ name: "Cards", value: manifest.components.cards.borderRadius });
        }
        if (manifest.components.inputs?.borderRadius) {
            manifestRadii.push({ name: "Inputs", value: manifest.components.inputs.borderRadius });
        }
        if (manifest.components.badges?.borderRadius) {
            manifestRadii.push({ name: "Badges", value: manifest.components.badges.borderRadius });
        }
        if (manifestRadii.length > 0) {
            borderRadius = manifestRadii;
        }
    }

    // Generate export formats
    const generateFigmaTokens = () => {
        return JSON.stringify({
            "colors": {
                "primary": manifest?.identity?.colors?.primary?.[0]?.hex || "#000000",
                "secondary": manifest?.identity?.colors?.secondary?.[0]?.hex || "#666666",
                "accent": manifest?.identity?.colors?.accent?.[0]?.hex || "#0066FF"
            },
            "spacing": Object.fromEntries(spacing.map(s => [s.name, s.value])),
            "borderRadius": Object.fromEntries(borderRadius.map(r => [r.name.toLowerCase(), r.value])),
            "typography": {
                "heading": manifest?.identity?.typography?.heading?.family || "Inter",
                "body": manifest?.identity?.typography?.body?.family || "Inter"
            }
        }, null, 2);
    };

    const generateCSSVariables = () => {
        let css = ":root {\n";
        css += `  /* Colors */\n`;
        css += `  --color-primary: ${manifest?.identity?.colors?.primary?.[0]?.hex || "#000000"};\n`;
        css += `  --color-secondary: ${manifest?.identity?.colors?.secondary?.[0]?.hex || "#666666"};\n`;
        css += `  --color-accent: ${manifest?.identity?.colors?.accent?.[0]?.hex || "#0066FF"};\n\n`;

        css += `  /* Spacing */\n`;
        spacing.forEach(s => {
            css += `  --spacing-${s.name}: ${s.value};\n`;
        });

        css += `\n  /* Border Radius */\n`;
        borderRadius.forEach(r => {
            css += `  --radius-${r.name.toLowerCase()}: ${r.value};\n`;
        });

        css += `\n  /* Typography */\n`;
        css += `  --font-heading: ${manifest?.identity?.typography?.heading?.family || "Inter"};\n`;
        css += `  --font-body: ${manifest?.identity?.typography?.body?.family || "Inter"};\n`;
        css += "}";

        return css;
    };

    const generateStyleDictionary = () => {
        return JSON.stringify({
            "color": {
                "primary": { "value": manifest?.identity?.colors?.primary?.[0]?.hex || "#000000" },
                "secondary": { "value": manifest?.identity?.colors?.secondary?.[0]?.hex || "#666666" },
                "accent": { "value": manifest?.identity?.colors?.accent?.[0]?.hex || "#0066FF" }
            },
            "size": {
                "spacing": Object.fromEntries(spacing.map(s => [s.name, { value: s.value }]))
            },
            "radius": Object.fromEntries(borderRadius.map(r => [r.name.toLowerCase(), { value: r.value }])),
            "font": {
                "heading": { "value": manifest?.identity?.typography?.heading?.family || "Inter" },
                "body": { "value": manifest?.identity?.typography?.body?.family || "Inter" }
            }
        }, null, 2);
    };

    const generateAIPrompt = () => {
        const brandName = manifest?.brandName || "our brand";

        let prompt = `# Brand Design System for ${brandName}\n\n`;
        prompt += `Use this design system when generating code or designs:\n\n`;

        prompt += `## Colors\n`;
        prompt += `- Primary: ${manifest?.identity?.colors?.primary?.[0]?.hex || "#000000"} (${manifest?.identity?.colors?.primary?.[0]?.usage || "Main brand color"})\n`;
        prompt += `- Secondary: ${manifest?.identity?.colors?.secondary?.[0]?.hex || "#666666"}\n`;
        prompt += `- Accent: ${manifest?.identity?.colors?.accent?.[0]?.hex || "#0066FF"}\n\n`;

        prompt += `## Typography\n`;
        prompt += `- Headings: ${manifest?.identity?.typography?.heading?.family || "Inter"}\n`;
        prompt += `- Body: ${manifest?.identity?.typography?.body?.family || "Inter"}\n\n`;

        prompt += `## Spacing Scale\n`;
        spacing.forEach(s => {
            prompt += `- ${s.name}: ${s.value}\n`;
        });

        prompt += `\n## Border Radius\n`;
        borderRadius.forEach(r => {
            prompt += `- ${r.name}: ${r.value}\n`;
        });

        prompt += `\n## Guidelines\n`;
        prompt += `- Always use these exact color values\n`;
        prompt += `- Maintain consistent spacing using the spacing scale\n`;
        prompt += `- Apply appropriate border radius to components\n`;
        prompt += `- Use heading font for titles, body font for content\n`;

        return prompt;
    };

    const copyToClipboard = async (text: string, format: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedFormat(format);
        setTimeout(() => setCopiedFormat(null), 2000);
    };

    const ExportCard = ({
        title,
        description,
        icon: Icon,
        content,
        format,
        language
    }: {
        title: string;
        description: string;
        icon: any;
        content: string;
        format: string;
        language: string;
    }) => (
        <Card className="p-6 bg-background border">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">{title}</h3>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(content, format)}
                    className="gap-2 transition-colors"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = lightPrimaryBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    {copiedFormat === format ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy
                        </>
                    )}
                </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs">
                <code>{content}</code>
            </pre>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Spacing System */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-6">
                    <Ruler className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Spacing Scale</h3>
                </div>

                <div className="space-y-3">
                    {spacing.length > 0 ? spacing.map((space, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <div className="w-16 text-right">
                                <span className="font-mono text-xs font-semibold">{space.name}</span>
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                                <div
                                    className="rounded bg-muted"
                                    style={{
                                        width: space.value,
                                        height: "24px"
                                    }}
                                />
                                <span className="font-mono text-xs text-muted-foreground">
                                    {space.value}
                                </span>
                            </div>
                        </div>
                    )) : <p className="text-sm text-muted-foreground italic">No spacing scale defined</p>}
                </div>
            </Card>

            {/* Border Radius */}
            <Card className="p-6 bg-background border">
                <div className="flex items-center gap-2 mb-6">
                    <Circle className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Border Radius</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {borderRadius.length > 0 ? borderRadius.map((radius, idx) => (
                        <div key={idx} className="text-center space-y-2">
                            <div
                                className="w-full aspect-square mx-auto"
                                style={{
                                    borderRadius: radius.value,
                                    ...gradientBgStyle
                                }}
                            />
                            <p className="font-mono text-xs font-semibold">{radius.name}</p>
                            <p className="font-mono text-xs text-muted-foreground">{radius.value}</p>
                        </div>
                    )) : <p className="text-sm text-muted-foreground italic col-span-5">No border radius defined</p>}
                </div>
            </Card>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-medium">
                        Export Formats
                    </span>
                </div>
            </div>

            {/* Figma Tokens */}
            <ExportCard
                title="Figma Tokens (JSON)"
                description="Import into Figma using Tokens Studio plugin for instant design system sync"
                icon={FileJson}
                content={generateFigmaTokens()}
                format="figma"
                language="json"
            />

            {/* CSS Variables */}
            <ExportCard
                title="CSS Variables"
                description="Copy into your stylesheet for immediate use in any web project"
                icon={Code}
                content={generateCSSVariables()}
                format="css"
                language="css"
            />

            {/* Style Dictionary */}
            <ExportCard
                title="Style Dictionary (JSON)"
                description="Industry-standard format compatible with design system tools (Amazon, Salesforce)"
                icon={FileJson}
                content={generateStyleDictionary()}
                format="style-dict"
                language="json"
            />

            {/* AI Prompt */}
            <ExportCard
                title="AI Coding Assistant Prompt"
                description="Paste into Cursor, ChatGPT, or Claude to generate on-brand code automatically"
                icon={Sparkles}
                content={generateAIPrompt()}
                format="ai-prompt"
                language="markdown"
            />
        </div>
    );
}
