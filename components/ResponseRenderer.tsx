"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Button } from "@/components/ui/button";
import { ICPCard } from "@/components/ICPCard";
import { ICPResponse } from "@/components/ICPResponse";

// Component definitions that can be rendered
type ComponentType = "button" | "card" | "progress" | "badge" | "icp-card" | "custom";

interface ComponentData {
    type: ComponentType;
    props?: Record<string, any>;
    children?: React.ReactNode | ComponentData[];
}

// Parse component JSON from content
function parseComponents(content: string): { markdown: string; components: ComponentData[] } {
    const componentRegex = /<component>(.*?)<\/component>/gs;
    const components: ComponentData[] = [];
    let markdown = content;
    let match;
    let componentIndex = 0;

    while ((match = componentRegex.exec(content)) !== null) {
        try {
            const componentData = JSON.parse(match[1]);
            components.push(componentData);
            // Replace component tag with placeholder
            markdown = markdown.replace(match[0], `[COMPONENT_${componentIndex}]`);
            componentIndex++;
        } catch (e) {
            console.error("Failed to parse component:", e);
        }
    }

    return { markdown, components };
}

// Render a single component
function renderComponent(component: ComponentData, index: number, flowId?: string, websiteUrl?: string): React.ReactNode {
    switch (component.type) {
        case "button":
            return (
                <Button
                    key={index}
                    variant={component.props?.variant || "default"}
                    size={component.props?.size || "default"}
                    onClick={() => {
                        if (component.props?.onClick) {
                            // Handle click actions
                            if (component.props.onClick === "copy") {
                                navigator.clipboard.writeText(component.props?.copyText || "");
                            }
                        }
                    }}
                    className={component.props?.className}
                >
                    {component.props?.label || (typeof component.children === "string" ? component.children : null)}
                </Button>
            );

        case "card":
            return (
                <div
                    key={index}
                    className={`rounded-lg border p-4 ${component.props?.className || ""}`}
                >
                    {component.props?.title && (
                        <h3 className="font-semibold mb-2">{component.props.title}</h3>
                    )}
                    {component.props?.subtitle && (
                        <p className="text-sm text-muted-foreground mb-4">
                            {component.props.subtitle}
                        </p>
                    )}
                    {Array.isArray(component.children)
                        ? component.children.map((child, i) => renderComponent(child, i, flowId, websiteUrl))
                        : component.children}
                </div>
            );

        case "progress":
            return (
                <div key={index} className="space-y-2">
                    {component.props?.label && (
                        <div className="flex justify-between text-sm">
                            <span>{component.props.label}</span>
                            <span>{component.props.value}%</span>
                        </div>
                    )}
                    <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${component.props?.value || 0}%` }}
                        />
                    </div>
                </div>
            );

        case "badge":
            return (
                <span
                    key={index}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${component.props?.variant === "secondary"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                        }`}
                >
                    {component.children}
                </span>
            );

        case "icp-card":
            return (
                <ICPResponse
                    key={index}
                    icpData={{
                        personaName: component.props?.personaName || "",
                        personaRole: component.props?.personaRole || "",
                        personaCompany: component.props?.personaCompany || "",
                        location: component.props?.location || "",
                        country: component.props?.country || "",
                        title: component.props?.title || "",
                        description: component.props?.description || "",
                        painPoints: component.props?.painPoints || [],
                        fitScore: component.props?.fitScore || 90,
                        profilesFound: component.props?.profilesFound || 12,
                    }}
                    websiteUrl={component.props?.websiteUrl || websiteUrl}
                    flowId={component.props?.flowId || flowId}
                />
            );

        default:
            return <div key={index}>{JSON.stringify(component)}</div>;
    }
}

interface ResponseRendererProps {
    content: string;
    flowId?: string;
    websiteUrl?: string;
}

export function ResponseRenderer({ content, flowId, websiteUrl }: ResponseRendererProps) {
    const { markdown, components } = parseComponents(content);

    // Split markdown by component placeholders and render accordingly
    const parts: React.ReactNode[] = [];
    let currentMarkdown = markdown;
    let componentIndex = 0;

    // Find all component placeholders
    const placeholderRegex = /\[COMPONENT_(\d+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = placeholderRegex.exec(markdown)) !== null) {
        // Add markdown before component
        if (match.index > lastIndex) {
            const markdownPart = markdown.substring(lastIndex, match.index);
            if (markdownPart.trim()) {
                parts.push(
                    <ReactMarkdown
                        key={`md-${lastIndex}`}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                            h1: ({ children }) => <h1 className="text-lg font-semibold my-2 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-semibold my-2 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold my-2 first:mt-0">{children}</h3>,
                            code: ({ children, className }) => {
                                const isInline = !className;
                                return isInline ? (
                                    <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                                ) : (
                                    <code className={className}>{children}</code>
                                );
                            },
                            pre: ({ children }) => (
                                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto my-2">{children}</pre>
                            ),
                            blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-muted pl-2 my-2 italic">{children}</blockquote>
                            ),
                            a: ({ href, children }) => (
                                <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                                    {children}
                                </a>
                            ),
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                        }}
                    >
                        {markdownPart}
                    </ReactMarkdown>
                );
            }
        }

        // Add component
        const compIndex = parseInt(match[1]);
        if (components[compIndex]) {
            parts.push(renderComponent(components[compIndex], compIndex, flowId, websiteUrl));
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining markdown
    if (lastIndex < markdown.length) {
        const markdownPart = markdown.substring(lastIndex);
        if (markdownPart.trim()) {
            parts.push(
                <ReactMarkdown
                    key={`md-${lastIndex}`}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                        ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                        li: ({ children }) => <li className="my-0.5">{children}</li>,
                        h1: ({ children }) => <h1 className="text-lg font-semibold my-2 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-semibold my-2 first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold my-2 first:mt-0">{children}</h3>,
                        code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                                <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                            ) : (
                                <code className={className}>{children}</code>
                            );
                        },
                        pre: ({ children }) => (
                            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto my-2">{children}</pre>
                        ),
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-muted pl-2 my-2 italic">{children}</blockquote>
                        ),
                        a: ({ href, children }) => (
                            <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                                {children}
                            </a>
                        ),
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                    }}
                >
                    {markdownPart}
                </ReactMarkdown>
            );
        }
    }

    // If no components, just render markdown
    if (parts.length === 0) {
        return (
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                    p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="my-0.5">{children}</li>,
                    h1: ({ children }) => <h1 className="text-lg font-semibold my-2 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold my-2 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold my-2 first:mt-0">{children}</h3>,
                    code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                        ) : (
                            <code className={className}>{children}</code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto my-2">{children}</pre>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-muted pl-2 my-2 italic">{children}</blockquote>
                    ),
                    a: ({ href, children }) => (
                        <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                            {children}
                        </a>
                    ),
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                }}
            >
                {content}
            </ReactMarkdown>
        );
    }

    return <div className="space-y-4">{parts}</div>;
}

