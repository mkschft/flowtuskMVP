import { NextRequest } from "next/server";
import OpenAI from "openai";
import { scrapeWebsite, streamScrapeWebsite } from "@/lib/scraper";

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

// Generate pain points and growth opportunity analysis from scraped content
async function generatePainPointsAnalysis(
    content: string,
    url: string,
    flowId: string | undefined,
    req: NextRequest
): Promise<void> {
    try {
        // Limit content to avoid token limits
        const truncatedContent = content.length > 30000 ? content.substring(0, 30000) + "..." : content;

        const analysisPrompt = `Analyze the following website content and extract:

1. Key Pain Points & Impact: List 2-4 specific pain points that the business addresses, each with a quantified impact (e.g., "45% of firms report increased stress", "average penalty of AED 5,000"). Use bullet points with the format: "• [Pain point] — [Specific impact with numbers/metrics]."

2. Growth Opportunity: Generate a single paragraph (2-3 sentences) about the growth potential when targeting the right customer profile with personalized messaging. Include realistic multipliers (2x-5x) and specific benefits.

Website content:
${truncatedContent}

Return ONLY valid JSON in this exact format:
{
  "painPoints": [
    "• [Pain point description] — [Specific quantified impact]",
    "• [Pain point description] — [Specific quantified impact]"
  ],
  "growthOpportunity": "[2-3 sentence paragraph about growth potential with realistic metrics]"
}

IMPORTANT:
- Use REAL numbers and metrics from the content when available
- If specific numbers aren't available, use realistic industry-standard estimates
- Keep pain points concise and specific
- Growth opportunity should be compelling but realistic (2x-5x multipliers)`;


        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a B2B marketing analyst specializing in extracting pain points and growth opportunities from business websites.",
                },
                {
                    role: "user",
                    content: analysisPrompt,
                },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
            max_tokens: 1000,
        });

        const result = JSON.parse(response.choices[0]?.message?.content || "{}");
        
        if (result.painPoints && result.growthOpportunity && flowId) {
            // Format the analysis as markdown
            let analysisText = `**Key Pain Points & Impact:**\n\n`;
            
            result.painPoints.forEach((point: string) => {
                analysisText += `${point}\n\n`;
            });
            
            analysisText += `**Growth Opportunity:** ${result.growthOpportunity}`;
            
            // Save as a separate speech
            try {
                const { POST: createSpeech } = await import("@/app/api/create-ai-speech/route");
                const createReq = new NextRequest(req.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        content: analysisText,
                        flowId: flowId,
                        modelCode: "gpt-4o-mini",
                    }),
                });
                await createSpeech(createReq);
            } catch (saveError) {
                console.error("Error saving pain points analysis:", saveError);
            }
        }
    } catch (error) {
        // Silently fail - don't break the flow if analysis fails
        console.error("Error generating pain points analysis:", error);
    }
}

// Scrape URL using internal scrape service and stream OpenAI-formatted content
async function scrapeUrl(url: string, controller: ReadableStreamDefaultController<Uint8Array>, encoder: TextEncoder, flowId?: string, req?: NextRequest): Promise<string> {
    try {
        // Output bold "Crawling URL" and preview card with link
        const previewHtml = `<div class="my-4 border rounded-lg p-4 bg-muted/50">
<strong>Crawling URL</strong>
<div class="mt-3 flex items-center gap-3">
  <div class="flex-1">
    <p class="text-sm font-medium text-foreground">${url}</p>
    <p class="text-xs text-muted-foreground mt-1">Website preview unavailable (CSP restrictions)</p>
  </div>
  <a href="${url}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
    Open Site →
  </a>
</div>
</div>\n\n`;
        controller.enqueue(encoder.encode(`\n\n${previewHtml}`));

        let markdown = "";
        let hasContent = false;

        try {
            // Stream OpenAI-formatted markdown from scrape service
            for await (const formattedChunk of streamScrapeWebsite(url, {
                include_text: true,
                include_links: true,
                include_images: false,
                timeout: 30,
            })) {
                markdown += formattedChunk;
                hasContent = true;
                // Stream the formatted content as it comes from OpenAI
                controller.enqueue(encoder.encode(formattedChunk));
            }

            if (hasContent && markdown) {
                // Add separator
                controller.enqueue(encoder.encode(`\n\n---\n\n`));
                
                // Generate pain points analysis asynchronously and save as separate speech
                if (flowId && req) {
                    generatePainPointsAnalysis(markdown, url, flowId, req).catch((err) => {
                        console.error("Failed to generate pain points analysis:", err);
                    });
                }
                
                return markdown;
            } else {
                controller.enqueue(encoder.encode(`\n[No content extracted from ${url}]\n\n`));
                return "";
            }
        } catch (streamError) {
            if (streamError instanceof Error) {
                if (streamError.message.includes('timeout') || streamError.name === 'AbortError') {
                    const errorMsg = `\n\n[Timeout: ${url} took too long to respond (30s limit)]\n` +
                        "The website may be blocking automated access or responding slowly.\n\n";
                    controller.enqueue(encoder.encode(errorMsg));
                } else {
                    const errorMsg = `\n\n[Error scraping ${url}: ${streamError.message}]\n\n`;
                    controller.enqueue(encoder.encode(errorMsg));
                }
            }
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
                try {
                    // Use internal scrape service
                    const scrapeResult = await scrapeWebsite(args.url, {
                        include_text: true,
                        include_links: true,
                        include_images: false,
                    });

                    const title = scrapeResult.metadata.title || new URL(args.url).hostname;
                    const favicon = `${new URL(args.url).origin}/favicon.ico`;
                    const description = scrapeResult.metadata.description || "No description available.";

                    // Build formatted content
                    let formattedContent = "";

                    // Row 1: favicon + bold site name
                    formattedContent += `![Favicon](${favicon}) **${title}**\n\n`;

                    // Row 2: Social media preview (if hero image available)
                    const ogImage = scrapeResult.metadata.heroImage;
                    if (ogImage) {
                        formattedContent += `![Social Preview](${ogImage})\n`;
                        formattedContent += `**${title}**\n`;
                        formattedContent += `${description}\n\n`;
                    } else {
                        formattedContent += `*Social media preview not available*\n\n`;
                    }

                    // Row 3: Description
                    formattedContent += `## Description\n\n${description}\n\n`;

                    // Extract basic page structure from markdown (headings)
                    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
                    const headings: Array<{ level: number; text: string }> = [];
                    let match;
                    while ((match = headingRegex.exec(scrapeResult.markdown)) !== null) {
                        headings.push({
                            level: match[1].length,
                            text: match[2],
                        });
                    }

                    // Row 4: Page structure with headings
                    if (headings.length > 0) {
                        formattedContent += `## Page Structure\n\n`;
                        headings.slice(0, 10).forEach((heading) => {
                            const prefix = '#'.repeat(heading.level + 2);
                            formattedContent += `${prefix} ${heading.text}\n\n`;
                        });
                    } else {
                        formattedContent += `## Page Structure\n\n*Structure analysis not available*\n\n`;
                    }

                    formattedContent += `---\n\n`;

                    // Stream formatted content if controller and encoder are provided
                    if (controller && encoder) {
                        controller.enqueue(encoder.encode(formattedContent));
                    }

                    // Build full markdown content
                    const fullMarkdown = formattedContent + `\n\n## Full Content\n\n${scrapeResult.markdown}`;

                    // Save formatted content as speech if flowId is provided
                    if (flowId) {
                        try {
                            const { POST: createSpeech } = await import("@/app/api/create-ai-speech/route");
                            const createReq = new NextRequest(req.url, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    content: fullMarkdown,
                                    flowId: flowId,
                                    modelCode: "gpt-4o-mini",
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
                        hasSocialPreview: !!ogImage,
                        structureSections: headings.length,
                        note: "Complete website information has been extracted and saved to the flow.",
                    };
                    return JSON.stringify(summary);
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    return JSON.stringify({ error: `Scrape service error: ${errorMsg}` });
                }
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
                    const scrapedUrls = new Set<string>(); // Track which URLs were already scraped
                    
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
                            const content = await scrapeUrl(url, controller, encoder, flowId, req);
                            if (content) {
                                scrapedContents.push({ url, content });
                                scrapedUrls.add(url); // Track that this URL was scraped
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

                                // Skip duplicate scraping message if URL was already scraped
                                // (Don't show tool usage messages)

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

