import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// URL detection regex - matches http/https URLs
const URL_REGEX = /https?:\/\/[^\s\)\]\"\'<>]+/gi;

// Detect URLs in text and clean them
function detectUrls(text: string): string[] {
    const matches = text.match(URL_REGEX);
    if (!matches) return [];
    
    // Clean URLs (remove trailing punctuation, brackets, quotes)
    const cleanedUrls = matches.map(url => {
        // Remove trailing punctuation that might be part of sentence
        let cleaned = url.replace(/[.,;:!?]+$/, '');
        // Remove trailing brackets/quotes
        cleaned = cleaned.replace(/[\)\]\"\']+$/, '');
        return cleaned;
    });
    
    // Return unique URLs
    return [...new Set(cleanedUrls)];
}

// Scrape URL using Firecrawl and stream content
async function scrapeUrl(url: string, controller: ReadableStreamDefaultController<Uint8Array>, encoder: TextEncoder): Promise<string> {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
        const errorMsg = "\n\n[Error: Firecrawl API key not configured]\n\n";
        controller.enqueue(encoder.encode(errorMsg));
        return "";
    }

    try {
        controller.enqueue(encoder.encode(`\n\n[Scraping ${url}...]\n\n`));

        const scrapeResp = await fetch("https://api.firecrawl.dev/v2/scrape", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: url,
                formats: ["markdown"],
            }),
        });

        if (!scrapeResp.ok) {
            const errorText = await scrapeResp.text();
            const errorMsg = `\n\n[Error scraping ${url}: ${errorText}]\n\n`;
            controller.enqueue(encoder.encode(errorMsg));
            return "";
        }

        const scrapeData = await scrapeResp.json();
        const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
        const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};

        if (markdown) {
            // Stream the scraped content
            const title = metadata.title || metadata.ogTitle || new URL(url).hostname;
            const description = metadata.description || metadata.ogDescription || "";
            
            let scrapedContent = `## Scraped Content from ${title}\n\n`;
            if (description) {
                scrapedContent += `**Description:** ${description}\n\n`;
            }
            scrapedContent += `**URL:** ${url}\n\n`;
            scrapedContent += `---\n\n${markdown}\n\n---\n\n`;
            
            controller.enqueue(encoder.encode(scrapedContent));
            return markdown;
        } else {
            controller.enqueue(encoder.encode(`\n[No content extracted from ${url}]\n\n`));
            return "";
        }
    } catch (error) {
        const errorMsg = `\n\n[Error scraping ${url}: ${error instanceof Error ? error.message : String(error)}]\n\n`;
        controller.enqueue(encoder.encode(errorMsg));
        return "";
    }
}

// Available tools/functions the AI can use
const tools = [
    {
        type: "function" as const,
        function: {
            name: "Crawler",
            description: "Analyze a website URL to extract content, facts, and metadata. Use this when the user provides a website URL to analyze.",
            parameters: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        description: "The website URL to analyze (e.g., https://example.com)",
                    },
                },
                required: ["url"],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "Analyst",
            description: "Generate Ideal Customer Profiles (ICPs) from website content. Use after analyzing a website.",
            parameters: {
                type: "object",
                properties: {
                    content: {
                        type: "string",
                        description: "Website content or raw text to analyze for ICPs",
                    },
                    factsJson: {
                        type: "object",
                        description: "Optional structured facts JSON from website analysis",
                    },
                },
                required: ["content"],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "generate_value_prop",
            description: "Generate value propositions based on ICP and website info. Use after generating ICPs.",
            parameters: {
                type: "object",
                properties: {
                    icp: {
                        type: "object",
                        description: "ICP object with title, description, painPoints, goals, demographics",
                    },
                    websiteUrl: {
                        type: "string",
                        description: "The website URL being analyzed",
                    },
                    factsJson: {
                        type: "object",
                        description: "Optional structured facts JSON from website analysis",
                    },
                },
                required: ["icp", "websiteUrl"],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "generate_email_sequence",
            description: "Generate an email sequence for outreach. Use when user asks for email campaigns or sequences.",
            parameters: {
                type: "object",
                properties: {
                    icp: {
                        type: "object",
                        description: "ICP object",
                    },
                    websiteUrl: {
                        type: "string",
                        description: "The website URL",
                    },
                    factsJson: {
                        type: "object",
                        description: "Optional structured facts JSON",
                    },
                },
                required: ["icp", "websiteUrl"],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "generate_one_time_email",
            description: "Generate a single one-time email. Use when user asks for a single email.",
            parameters: {
                type: "object",
                properties: {
                    icp: {
                        type: "object",
                        description: "ICP object",
                    },
                    websiteUrl: {
                        type: "string",
                        description: "The website URL",
                    },
                    factsJson: {
                        type: "object",
                        description: "Optional structured facts JSON",
                    },
                },
                required: ["icp", "websiteUrl"],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "generate_linkedin_outreach",
            description: "Generate LinkedIn outreach content. Use when user asks for LinkedIn posts or outreach.",
            parameters: {
                type: "object",
                properties: {
                    icp: {
                        type: "object",
                        description: "ICP object",
                    },
                    websiteUrl: {
                        type: "string",
                        description: "The website URL",
                    },
                    factsJson: {
                        type: "object",
                        description: "Optional structured facts JSON",
                    },
                },
                required: ["icp", "websiteUrl"],
            },
        },
    },
];

// Execute a tool call by importing and calling route handlers directly
async function executeTool(toolName: string, args: any, req: NextRequest, flowId?: string, controller?: ReadableStreamDefaultController<Uint8Array>, encoder?: TextEncoder): Promise<string> {
    try {
        switch (toolName) {
            case "Crawler": {
                const apiKey = process.env.FIRECRAWL_API_KEY;
                if (!apiKey) {
                    return JSON.stringify({ error: "Firecrawl API key not configured" });
                }

                // Define extraction schema for comprehensive data
                const extractionSchema = {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        favicon: { type: "string" },
                        description: { type: "string" },
                        cssColors: {
                            type: "object",
                            properties: {
                                primary: { type: "string" },
                                secondary: { type: "string" },
                                accent: { type: "string" },
                                background: { type: "string" },
                                text: { type: "string" }
                            }
                        },
                        fonts: {
                            type: "array",
                            items: { type: "string" }
                        },
                        socialMediaPreview: {
                            type: "object",
                            properties: {
                                ogImage: { type: "string" },
                                ogTitle: { type: "string" },
                                ogDescription: { type: "string" },
                                twitterImage: { type: "string" },
                                twitterTitle: { type: "string" },
                                twitterDescription: { type: "string" }
                            }
                        },
                        pageStructure: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    heading: { type: "string" },
                                    description: { type: "string" },
                                    section: { type: "string" }
                                }
                            }
                        }
                    },
                    required: ["title", "description"]
                };

                // Call Firecrawl Extract API
                const firecrawlResp = await fetch("https://api.firecrawl.dev/v2/extract", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        urls: [args.url],
                        prompt: "Extract the complete website information including title, favicon, description, CSS colors and fonts used, social media preview metadata (OG tags, Twitter cards), and the page structure with all headings and their descriptions. Provide comprehensive details about the visual design and content organization.",
                        schema: extractionSchema,
                        scrapeOptions: {
                            formats: [
                                {
                                    type: "json",
                                    prompt: "Extract all website metadata, design information, and page structure",
                                    schema: extractionSchema
                                }
                            ]
                        }
                    }),
                });

                if (!firecrawlResp.ok) {
                    const error = await firecrawlResp.text();
                    return JSON.stringify({ error: `Firecrawl API error: ${error}` });
                }

                const firecrawlData = await firecrawlResp.json();

                // Extract data from response
                let extractedData;
                if (firecrawlData.data && Array.isArray(firecrawlData.data) && firecrawlData.data.length > 0) {
                    extractedData = firecrawlData.data[0].extract || firecrawlData.data[0];
                } else if (firecrawlData.extract) {
                    extractedData = firecrawlData.extract;
                } else {
                    extractedData = firecrawlData;
                }

                const title = extractedData.title || new URL(args.url).hostname;
                const favicon = extractedData.favicon || `${new URL(args.url).origin}/favicon.ico`;
                const description = extractedData.description || "No description available.";
                const cssColors = extractedData.cssColors || {};
                const fonts = extractedData.fonts || [];
                const socialMediaPreview = extractedData.socialMediaPreview || {};
                const pageStructure = extractedData.pageStructure || [];

                // Build formatted content
                let formattedContent = "";

                // Row 1: favicon + bold site name
                formattedContent += `![Favicon](${favicon}) **${title}**\n\n`;

                // Row 2: Social media preview
                let ogImage = socialMediaPreview.ogImage || socialMediaPreview.twitterImage;
                const ogTitle = socialMediaPreview.ogTitle || socialMediaPreview.twitterTitle || title;
                const ogDescription = socialMediaPreview.ogDescription || socialMediaPreview.twitterDescription || description;

                if (ogImage) {
                    formattedContent += `![Social Preview](${ogImage})\n`;
                    formattedContent += `**${ogTitle}**\n`;
                    formattedContent += `${ogDescription}\n\n`;
                } else {
                    formattedContent += `*Social media preview not available*\n\n`;
                }

                // Row 3: Description page
                formattedContent += `## Description\n\n${description}\n\n`;

                // Add CSS Colors and Fonts if available
                if (Object.keys(cssColors).length > 0) {
                    formattedContent += `### Design Colors\n`;
                    if (cssColors.primary) formattedContent += `- Primary: ${cssColors.primary}\n`;
                    if (cssColors.secondary) formattedContent += `- Secondary: ${cssColors.secondary}\n`;
                    if (cssColors.accent) formattedContent += `- Accent: ${cssColors.accent}\n`;
                    if (cssColors.background) formattedContent += `- Background: ${cssColors.background}\n`;
                    if (cssColors.text) formattedContent += `- Text: ${cssColors.text}\n`;
                    formattedContent += `\n`;
                }

                if (fonts.length > 0) {
                    formattedContent += `### Fonts\n`;
                    fonts.forEach((font: string) => {
                        formattedContent += `- ${font}\n`;
                    });
                    formattedContent += `\n`;
                }

                // Row 4: Page structure with headings and descriptions
                if (pageStructure.length > 0) {
                    formattedContent += `## Page Structure\n\n`;
                    pageStructure.forEach((section: any, index: number) => {
                        const heading = section.heading || section.section || `Section ${index + 1}`;
                        const sectionDesc = section.description || "No description provided.";
                        formattedContent += `### ${heading}\n\n${sectionDesc}\n\n`;
                    });
                } else {
                    formattedContent += `## Page Structure\n\n*Structure analysis not available*\n\n`;
                }

                formattedContent += `---\n\n`;

                // Stream formatted content if controller and encoder are provided
                if (controller && encoder) {
                    controller.enqueue(encoder.encode(formattedContent));
                }

                // Also get markdown for saving
                let markdown = "";
                try {
                    const scrapeResp = await fetch("https://api.firecrawl.dev/v2/scrape", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            url: args.url,
                            formats: ["markdown"],
                        }),
                    });
                    if (scrapeResp.ok) {
                        const scrapeData = await scrapeResp.json();
                        markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
                    }
                } catch (scrapeErr) {
                    console.error("Error fetching markdown:", scrapeErr);
                }

                // Build full markdown content with formatted data
                let fullMarkdown = formattedContent;
                if (markdown) {
                    fullMarkdown += `\n\n## Full Content\n\n${markdown}`;
                }

                // Save formatted content as speech if flowId is provided
                if (flowId) {
                    try {
                        // Save to database
                        const { POST: createSpeech } = await import("@/app/api/create-ai-speech/route");
                        const createReq = new NextRequest(req.url, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                content: fullMarkdown,
                                flowId: flowId,
                                modelCode: "firecrawl-scraper",
                            }),
                        });
                        await createSpeech(createReq);
                    } catch (saveError) {
                        console.error("Error saving scraped content:", saveError);
                    }
                }

                // Return structured summary for AI processing
                const summary = {
                    success: true,
                    url: args.url,
                    title,
                    description,
                    cssColors,
                    fonts: fonts.slice(0, 5),
                    hasSocialPreview: !!ogImage,
                    structureSections: pageStructure.length,
                    note: "Complete website information including design details and structure has been extracted and saved to the flow.",
                };
                return JSON.stringify(summary);
            }
            case "analyze_website": {
                const { POST } = await import("@/app/api/analyze-website/route");
                const newReq = new NextRequest(req.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: args.url }),
                });
                const resp = await POST(newReq);
                const data = await resp.json();
                return JSON.stringify(data);
            }
            case "generate_icps": {
                const { POST } = await import("@/app/api/generate-icps/route");
                const newReq = new NextRequest(req.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        content: args.content,
                        factsJson: args.factsJson,
                    }),
                });
                const resp = await POST(newReq);
                const data = await resp.json();
                return JSON.stringify(data);
            }
            case "generate_value_prop": {
                const { POST } = await import("@/app/api/generate-value-prop/route");
                const newReq = new NextRequest(req.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        icp: args.icp,
                        websiteUrl: args.websiteUrl,
                        factsJson: args.factsJson,
                    }),
                });
                const resp = await POST(newReq);
                const data = await resp.json();
                return JSON.stringify(data);
            }
            case "generate_email_sequence": {
                const { POST } = await import("@/app/api/generate-email-sequence/route");
                const newReq = new NextRequest(req.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        icp: args.icp,
                        websiteUrl: args.websiteUrl,
                        factsJson: args.factsJson,
                    }),
                });
                const resp = await POST(newReq);
                const data = await resp.json();
                return JSON.stringify(data);
            }
            case "generate_one_time_email": {
                const { POST } = await import("@/app/api/generate-one-time-email/route");
                const newReq = new NextRequest(req.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        icp: args.icp,
                        websiteUrl: args.websiteUrl,
                        factsJson: args.factsJson,
                    }),
                });
                const resp = await POST(newReq);
                const data = await resp.json();
                return JSON.stringify(data);
            }
            case "generate_linkedin_outreach": {
                const { POST } = await import("@/app/api/generate-linkedin-outreach/route");
                const newReq = new NextRequest(req.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        icp: args.icp,
                        websiteUrl: args.websiteUrl,
                        factsJson: args.factsJson,
                    }),
                });
                const resp = await POST(newReq);
                const data = await resp.json();
                return JSON.stringify(data);
            }
            default:
                return JSON.stringify({ error: `Unknown tool: ${toolName}` });
        }
    } catch (error) {
        console.error(`Tool execution error for ${toolName}:`, error);
        return JSON.stringify({ error: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}` });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { message, flowId } = await req.json() as { message?: string; flowId?: string };
        if (!message || !message.trim()) {
            return new Response(JSON.stringify({ error: "Missing message" }), { status: 400 });
        }

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    // Detect URLs in the message
                    const urls = detectUrls(message);
                    const scrapedContents: Array<{ url: string; content: string }> = [];
                    
                    // Check if prompt mentions scraping requirements
                    const lowerMessage = message.toLowerCase();
                    const needsScraping = 
                        urls.length > 0 || 
                        lowerMessage.includes('scrape') || 
                        lowerMessage.includes('scraping') ||
                        lowerMessage.includes('get content from') ||
                        lowerMessage.includes('fetch from url') ||
                        lowerMessage.includes('read from url') ||
                        lowerMessage.includes('extract from url');

                    // If URLs detected or scraping mentioned, scrape them
                    if (needsScraping && urls.length > 0) {
                        for (const url of urls) {
                            const content = await scrapeUrl(url, controller, encoder);
                            if (content) {
                                scrapedContents.push({ url, content });
                            }
                        }
                    } else if (needsScraping && urls.length === 0) {
                        // User wants scraping but no URL provided
                        controller.enqueue(encoder.encode("\n[Please provide a URL to scrape]\n\n"));
                    }

                    // Build system message with scraped content context
                    let systemContent = `You are a helpful AI assistant with access to tools for analyzing websites and generating content.

Available tools:
- Crawler: Analyze a website URL to extract content, facts, and metadata
- Analyst: Generate Ideal Customer Profiles from website content
- generate_value_prop: Generate value propositions based on ICP and website
- generate_email_sequence: Generate email sequences for outreach
- generate_one_time_email: Generate a single email
- generate_linkedin_outreach: Generate LinkedIn outreach content

When a user asks you to analyze a website or generate content, use the appropriate tools. Work step by step:
1. If given a URL, use Crawler first
2. Then generate ICPs from the analysis
3. Then generate value props, emails, or LinkedIn content as requested

Always explain what you're doing and summarize the results for the user.`;

                    // Add scraped content to context if available
                    if (scrapedContents.length > 0) {
                        systemContent += `\n\n**Scraped Content Context:**\nThe following URLs have been scraped and their content is available:\n`;
                        scrapedContents.forEach(({ url, content }) => {
                            systemContent += `\n- ${url}: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}\n`;
                        });
                        systemContent += `\nUse this scraped content to answer the user's questions. The full content has been streamed to the user above.`;
                    }

                    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                        {
                            role: "system",
                            content: systemContent,
                        },
                        { role: "user", content: message },
                    ];

                    let iteration = 0;
                    const maxIterations = 5; // Prevent infinite loops

                    while (iteration < maxIterations) {
                        const stream = await openai.chat.completions.create({
                            model: "gpt-4o-mini",
                            messages,
                            tools,
                            tool_choice: "auto",
                            temperature: 0.7,
                            max_tokens: 1000,
                            stream: true,
                        });

                        let toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [];
                        let accumulatedContent = "";

                        for await (const chunk of stream) {
                            const delta = chunk.choices[0]?.delta;
                            if (delta?.content) {
                                accumulatedContent += delta.content;
                                controller.enqueue(encoder.encode(delta.content));
                            }
                            if (delta?.tool_calls) {
                                for (const toolCall of delta.tool_calls) {
                                    const index = toolCall.index;
                                    if (!toolCalls[index]) {
                                        toolCalls[index] = {
                                            id: toolCall.id || "",
                                            type: "function",
                                            function: {
                                                name: toolCall.function?.name || "",
                                                arguments: toolCall.function?.arguments || "",
                                            },
                                        };
                                    } else {
                                        toolCalls[index].function.arguments += toolCall.function?.arguments || "";
                                    }
                                }
                            }
                        }

                        // If we got content but no tool calls, we're done
                        if (toolCalls.length === 0) {
                            if (accumulatedContent) {
                                // Final response, we're done
                                controller.close();
                                return;
                            }
                        }

                        // Execute tool calls and add results to messages
                        if (toolCalls.length > 0) {
                            messages.push({
                                role: "assistant",
                                content: accumulatedContent || null,
                                tool_calls: toolCalls,
                            } as any);

                            for (const toolCall of toolCalls) {
                                const functionName = toolCall.function.name;
                                let functionArgs;
                                try {
                                    functionArgs = JSON.parse(toolCall.function.arguments);
                                } catch {
                                    functionArgs = {};
                                }

                                // Send a message indicating we're using a tool
                                if (functionName === "Crawler") {
                                    controller.enqueue(encoder.encode(`\n\n[Scraping ${functionArgs.url || 'website'}...]\n\n`));
                                } else {
                                    controller.enqueue(encoder.encode(`\n\n[Using ${functionName}...]\n`));
                                }

                                const result = await executeTool(functionName, functionArgs, req, flowId, controller, encoder);

                                messages.push({
                                    role: "tool",
                                    tool_call_id: toolCall.id,
                                    content: result,
                                } as any);
                            }

                            // Reset accumulated content for next iteration
                            accumulatedContent = "";

                            // Continue the loop to get the final response with tool results
                            iteration++;
                        } else {
                            // No tool calls and no content means stream ended
                            controller.close();
                            return;
                        }
                    }

                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
                    controller.error(error);
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (e) {
        console.error("generate-ai-response error", e);
        return new Response(JSON.stringify({ error: "Failed to generate AI response" }), { status: 500 });
    }
}

