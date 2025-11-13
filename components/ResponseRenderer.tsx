"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Button } from "@/components/ui/button";
import { ICPCard } from "@/components/ICPCard";
import { ICPResponse } from "@/components/ICPResponse";
import { PersonaCreatedCard } from "@/components/PersonaCreatedCard";
import { SiteAlreadyScrapedCard } from "@/components/SiteAlreadyScrapedCard";

// Component definitions that can be rendered
type ComponentType = "button" | "card" | "progress" | "badge" | "icp-card" | "icp-cards" | "persona-created-card" | "site-already-scraped" | "custom";

interface ComponentData {
    type: ComponentType;
    props?: Record<string, any>;
    children?: React.ReactNode | ComponentData[];
}

// Parse component JSON from content
function parseComponents(content: string): { markdown: string; components: ComponentData[] } {
    const componentRegex = /<component>([\s\S]*?)<\/component>/g;
    const components: ComponentData[] = [];
    let markdown = content;
    const matches: Array<{ fullMatch: string; jsonContent: string; index: number }> = [];
    let match;

    // First pass: collect all component matches
    componentRegex.lastIndex = 0;
    while ((match = componentRegex.exec(content)) !== null) {
        matches.push({
            fullMatch: match[0],
            jsonContent: match[1],
            index: match.index,
        });
    }

    // Second pass: parse components and replace in reverse order to preserve indices
    for (let i = matches.length - 1; i >= 0; i--) {
        const m = matches[i];
        try {
            const componentData = JSON.parse(m.jsonContent);
            components.unshift(componentData);
            // Replace component tag with placeholder (working backwards preserves string indices)
            markdown = markdown.substring(0, m.index) + `[COMPONENT_${i}]` + markdown.substring(m.index + m.fullMatch.length);
        } catch (e) {
            console.error("Failed to parse component:", e);
            // Even if parsing fails, remove the component tag to prevent it from showing as text
            markdown = markdown.substring(0, m.index) + markdown.substring(m.index + m.fullMatch.length);
        }
    }

    return { markdown, components };
}

// Render a single component
function renderComponent(component: ComponentData, index: number, flowId?: string, websiteUrl?: string, onICPSelect?: (icpData: { personaName: string; title: string; [key: string]: any }) => void, onPersonaWorkflows?: (personaId?: string) => void, onPersonaRestart?: () => void, onSiteProceed?: (url: string, siteId: string, flowId?: string) => void, onSiteUseSaved?: (siteId: string, flowId?: string) => void): React.ReactNode {
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
                        ? component.children.map((child, i) => renderComponent(child, i, flowId, websiteUrl, onICPSelect, onPersonaWorkflows, onPersonaRestart, onSiteProceed, onSiteUseSaved))
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
                    {Array.isArray(component.children)
                        ? component.children.map((child, i) => 
                            typeof child === "string" ? child : renderComponent(child, i, flowId, websiteUrl, onICPSelect, onPersonaWorkflows, onPersonaRestart, onSiteProceed, onSiteUseSaved)
                          )
                        : typeof component.children === "string" 
                        ? component.children 
                        : component.children}
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
                    onICPSelect={(icpData) => onICPSelect?.(icpData)}
                />
            );

        case "icp-cards":
            return (
                <div key={index} className="space-y-4 mb-4">
                    {/* Site Description */}
                    {component.props?.businessDescription && (
                        <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold mb-2 text-foreground">Company Description</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {component.props.businessDescription}
                                </p>
                            </div>
                            {/* Key Pain Points */}
                            {component.props?.painPointsWithMetrics && component.props.painPointsWithMetrics.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2 text-foreground">Key Pain Points</h3>
                                    <ul className="space-y-2">
                                        {component.props.painPointsWithMetrics.map((item: any, i: number) => (
                                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                <span className="text-primary mt-0.5">•</span>
                                                <span>
                                                    <span className="font-medium">{item.pain}</span>
                                                    {item.metric && <span className="ml-1">({item.metric})</span>}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    {/* ICP Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {component.props?.icps?.map((icp: any, i: number) => (
                            <ICPResponse
                                key={i}
                                icpData={{
                                    personaName: icp.personaName || "",
                                    personaRole: icp.personaRole || "",
                                    personaCompany: icp.personaCompany || "",
                                    location: icp.location || "",
                                    country: icp.country || "",
                                    title: icp.title || "",
                                    description: icp.description || "",
                                    painPoints: icp.painPoints || [],
                                    fitScore: icp.fitScore || 90,
                                    profilesFound: icp.profilesFound || 12,
                                }}
                                websiteUrl={component.props?.websiteUrl || websiteUrl}
                                flowId={component.props?.flowId || flowId}
                                onICPSelect={(icpData) => onICPSelect?.(icpData)}
                            />
                        ))}
                    </div>
                </div>
            );

        case "persona-created-card":
            return (
                <PersonaCreatedCard
                    key={index}
                    personaName={component.props?.personaName || ""}
                    personaId={component.props?.personaId}
                    onWorkflows={() => onPersonaWorkflows?.(component.props?.personaId)}
                    onRestart={onPersonaRestart}
                />
            );

        case "site-already-scraped":
            return (
                <SiteAlreadyScrapedCard
                    key={index}
                    url={component.props?.url || ""}
                    siteId={component.props?.siteId || ""}
                    title={component.props?.title || component.props?.url || ""}
                    summary={component.props?.summary || "This site has already been scraped."}
                    createdAt={component.props?.createdAt || ""}
                    flowId={component.props?.flowId || flowId}
                    onProceed={() => onSiteProceed?.(component.props?.url || "", component.props?.siteId || "", component.props?.flowId || flowId)}
                    onUseSaved={() => onSiteUseSaved?.(component.props?.siteId || "", component.props?.flowId || flowId)}
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
    onICPSelect?: (icpData: { personaName: string; title: string; [key: string]: any }) => void;
    onPersonaWorkflows?: (personaId?: string) => void;
    onPersonaRestart?: () => void;
    onSiteProceed?: (url: string, siteId: string, flowId?: string) => void;
    onSiteUseSaved?: (siteId: string, flowId?: string) => void;
}

export function ResponseRenderer({ content, flowId, websiteUrl, onICPSelect, onPersonaWorkflows, onPersonaRestart, onSiteProceed, onSiteUseSaved }: ResponseRendererProps) {
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
            parts.push(renderComponent(components[compIndex], compIndex, flowId, websiteUrl, onICPSelect, onPersonaWorkflows, onPersonaRestart, onSiteProceed, onSiteUseSaved));
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

