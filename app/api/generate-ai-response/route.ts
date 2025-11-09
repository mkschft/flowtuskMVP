import { NextRequest } from "next/server";
import OpenAI from "openai";
import { scrapeWebsite, streamScrapeWebsite, streamCrawlWebsite, crawlWebsiteWithWebcrawler } from "@/lib/scraper";
import { createClient } from "@/lib/supabase/server";
import { ICPInsert } from "@/lib/types/database";

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

// Save ICP to database
async function saveICP(icpData: any, flowId: string, websiteUrl?: string): Promise<void> {
    if (!flowId) {
        return; // Can't save without flowId
    }

    try {
        const supabase = await createClient();

        const icpInsert: ICPInsert = {
            parent_flow: flowId,
            website_url: websiteUrl || null,
            persona_name: icpData.personaName || "",
            persona_role: icpData.personaRole || "",
            persona_company: icpData.personaCompany || "",
            location: icpData.location || "",
            country: icpData.country || "",
            title: icpData.title || "",
            description: icpData.description || "",
            pain_points: icpData.painPoints || [],
            goals: icpData.goals || [],
            fit_score: icpData.fitScore || 90,
            profiles_found: icpData.profilesFound || 12,
        };

        const { error } = await supabase
            .from("icps")
            .insert(icpInsert);

        if (error) {
            console.error("Error saving ICP to database:", error);
        } else {
            console.log("✅ ICP saved to database:", icpInsert.title);
        }
    } catch (error) {
        console.error("Error saving ICP:", error);
        // Don't throw - saving ICP shouldn't break the flow
    }
}

// Scrape URL using webcrawlerapi, analyze with OpenAI, and generate ICP
async function scrapeUrl(url: string, controller: ReadableStreamDefaultController<Uint8Array>, encoder: TextEncoder, flowId?: string, req?: NextRequest, excludeICP?: any): Promise<string> {
    try {

        let crawledContent = "";
        let hasContent = false;

        try {
            // Collect crawled content (don't stream progress updates)
            for await (const chunk of streamCrawlWebsite(url, {
                items_limit: 10,
                allow_subdomains: false,
                respect_robots_txt: false,
            })) {
                crawledContent += chunk;
                hasContent = true;
                // Don't stream progress updates - only show final ICP results
            }

            if (!hasContent || !crawledContent.trim()) {
                controller.enqueue(encoder.encode(`\n[No content extracted from ${url}]\n\n`));
                return "";
            }

            // Don't show analysis message - just generate ICPs silently

            // Generate ICPs from crawled content
            const { POST: generateICPs } = await import("@/app/api/generate-icps/route");
            const icpReq = new NextRequest(req?.url || "http://localhost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: crawledContent,
                    excludeCurrentICP: excludeICP,
                }),
            });

            const icpResp = await generateICPs(icpReq);
            const icpData = await icpResp.json();

            if (!icpData.icps || icpData.icps.length === 0) {
                controller.enqueue(encoder.encode(`\n[Error: Could not generate ICPs from website content]\n\n`));
                return "";
            }

            // Get first 3 ICPs (or all if less than 3)
            const icpsToShow = icpData.icps.slice(0, 3);

            // Save all ICPs to database
            if (flowId) {
                for (const icp of icpsToShow) {
                    await saveICP({
                        ...icp,
                        fitScore: 90,
                        profilesFound: 12,
                    }, flowId, url);
                }
            }

            // Create ICP cards component JSON with multiple ICPs
            const icpComponent = {
                type: "icp-cards",
                props: {
                    icps: icpsToShow.map((icp: any) => ({
                        personaName: icp.personaName || "",
                        personaRole: icp.personaRole || "",
                        personaCompany: icp.personaCompany || "",
                        location: icp.location || "",
                        country: icp.country || "",
                        title: icp.title || "",
                        description: icp.description || "",
                        painPoints: icp.painPoints || [],
                        fitScore: 90, // Default fit score
                        profilesFound: 12, // Default profiles found
                    })),
                    websiteUrl: url,
                    flowId: flowId,
                    businessDescription: icpData.summary?.businessDescription || "",
                    painPointsWithMetrics: icpData.summary?.painPointsWithMetrics || [],
                }
            };

            // Format as component tag
            const icpContent = `<component>${JSON.stringify(icpComponent)}</component>`;

            // Stream the ICP component
            // Note: Don't save here - AIComposer.tsx will save the full response after streaming
            controller.enqueue(encoder.encode(icpContent));

            return icpContent;
        } catch (streamError) {
            if (streamError instanceof Error) {
                if (streamError.message.includes('timeout') || streamError.name === 'AbortError') {
                    const errorMsg = `\n\n[Timeout: ${url} took too long to respond]\n` +
                        "The website may be blocking automated access or responding slowly.\n\n";
                    controller.enqueue(encoder.encode(errorMsg));
                } else {
                    const errorMsg = `\n\n[Error crawling ${url}: ${streamError.message}]\n\n`;
                    controller.enqueue(encoder.encode(errorMsg));
                }
            }
            return "";
        }
    } catch (error) {
        const errorMsg = `\n\n[Error crawling ${url}: ${error instanceof Error ? error.message : String(error)}]\n\n`;
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
async function executeTool(toolName: string, args: any, req: NextRequest, flowId?: string, controller?: ReadableStreamDefaultController<Uint8Array>, encoder?: TextEncoder, scrapedUrls?: Set<string>, excludeICP?: any): Promise<string> {
    try {
        switch (toolName) {
            case "Crawler": {
                // Skip if URL was already scraped
                if (scrapedUrls && scrapedUrls.has(args.url)) {
                    return JSON.stringify({
                        success: true,
                        url: args.url,
                        note: "This URL was already analyzed and ICPs have been generated above. No need to analyze again."
                    });
                }
                try {
                    // Use webcrawlerapi to crawl website
                    const scrapeResult = await crawlWebsiteWithWebcrawler(args.url, {
                        items_limit: 10,
                        allow_subdomains: false,
                        respect_robots_txt: false,
                    });

                    if (!scrapeResult.markdown || !scrapeResult.markdown.trim()) {
                        return JSON.stringify({ error: "No content extracted from website" });
                    }

                    // Generate ICPs from crawled content
                    const { POST: generateICPs } = await import("@/app/api/generate-icps/route");
                    const icpReq = new NextRequest(req.url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            content: scrapeResult.markdown,
                            excludeCurrentICP: excludeICP,
                        }),
                    });

                    const icpResp = await generateICPs(icpReq);
                    const icpData = await icpResp.json();

                    if (!icpData.icps || icpData.icps.length === 0) {
                        return JSON.stringify({ error: "Could not generate ICPs from website content" });
                    }

                    // Get first 3 ICPs (or all if less than 3)
                    const icpsToShow = icpData.icps.slice(0, 3);

                    // Save all ICPs to database
                    if (flowId) {
                        for (const icp of icpsToShow) {
                            await saveICP({
                                ...icp,
                                fitScore: 90,
                                profilesFound: 12,
                            }, flowId, args.url);
                        }
                    }

                    // Create ICP cards component JSON with multiple ICPs
                    const icpComponent = {
                        type: "icp-cards",
                        props: {
                            icps: icpsToShow.map((icp: any) => ({
                                personaName: icp.personaName || "",
                                personaRole: icp.personaRole || "",
                                personaCompany: icp.personaCompany || "",
                                location: icp.location || "",
                                country: icp.country || "",
                                title: icp.title || "",
                                description: icp.description || "",
                                painPoints: icp.painPoints || [],
                                fitScore: 90, // Default fit score
                                profilesFound: 12, // Default profiles found
                            })),
                            websiteUrl: args.url,
                            flowId: flowId,
                            businessDescription: icpData.summary?.businessDescription || "",
                            painPointsWithMetrics: icpData.summary?.painPointsWithMetrics || [],
                        }
                    };

                    // Format as component tag
                    const icpContent = `<component>${JSON.stringify(icpComponent)}</component>`;

                    // Stream ICP component if controller and encoder are provided
                    // Note: Don't save here - AIComposer.tsx will save the full response after streaming
                    if (controller && encoder) {
                        controller.enqueue(encoder.encode(icpContent));
                    }

                    // Return structured summary for AI processing
                    const summary = {
                        success: true,
                        url: args.url,
                        icpsGenerated: icpData.icps?.length || 0,
                        note: "Ideal Customer Profiles have been generated and saved to the flow using webcrawlerapi.",
                    };
                    return JSON.stringify(summary);
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    return JSON.stringify({ error: `Webcrawlerapi error: ${errorMsg}` });
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

// Helper function to send status updates
function sendStatus(controller: ReadableStreamDefaultController<Uint8Array>, encoder: TextEncoder, status: string) {
    // Only send status if it's not empty - empty status means clear/remove status
    if (status.trim()) {
        controller.enqueue(encoder.encode(`STATUS:${status}\n`));
    }
}

export async function POST(req: NextRequest) {
    try {
        const { message, flowId, excludeCurrentICP } = await req.json() as {
            message?: string;
            flowId?: string;
            excludeCurrentICP?: string;
        };
        if (!message || !message.trim()) {
            return new Response(JSON.stringify({ error: "Missing message" }), { status: 400 });
        }

        let excludeICP: any = null;
        if (excludeCurrentICP) {
            try {
                excludeICP = JSON.parse(excludeCurrentICP);
            } catch {
                // Ignore parse errors
            }
        }

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    // Step 1: Analyze user prompt to see what it's asking for
                    sendStatus(controller, encoder, "Thinking");

                    // Detect URLs in the message
                    const urls = detectUrls(message);
                    const lowerMessage = message.toLowerCase();

                    // Analyze what tools might be needed
                    const needsScraping =
                        urls.length > 0 ||
                        lowerMessage.includes('scrape') ||
                        lowerMessage.includes('scraping') ||
                        lowerMessage.includes('get content from') ||
                        lowerMessage.includes('fetch from url') ||
                        lowerMessage.includes('read from url') ||
                        lowerMessage.includes('extract from url') ||
                        lowerMessage.includes('analyze website') ||
                        lowerMessage.includes('website url');

                    const needsICP =
                        lowerMessage.includes('icp') ||
                        lowerMessage.includes('ideal customer') ||
                        lowerMessage.includes('customer profile');

                    const needsValueProp =
                        lowerMessage.includes('value prop') ||
                        lowerMessage.includes('value proposition');

                    const needsEmail =
                        lowerMessage.includes('email') ||
                        lowerMessage.includes('outreach');

                    const needsLinkedIn =
                        lowerMessage.includes('linkedin') ||
                        lowerMessage.includes('linked in');

                    // Step 2: Check if required tools exist
                    const requiredTools: string[] = [];
                    if (needsScraping && urls.length > 0) {
                        requiredTools.push("Crawler");
                    }
                    if (needsICP) {
                        requiredTools.push("Analyst");
                    }
                    if (needsValueProp) {
                        requiredTools.push("generate_value_prop");
                    }
                    if (needsEmail) {
                        requiredTools.push("generate_email_sequence");
                    }
                    if (needsLinkedIn) {
                        requiredTools.push("generate_linkedin_outreach");
                    }

                    // Check if tools exist
                    const availableToolNames = tools.map(t => t.function.name);
                    const missingTools = requiredTools.filter(tool => !availableToolNames.includes(tool));

                    if (missingTools.length > 0) {
                        // Tool doesn't exist - show apology
                        sendStatus(controller, encoder, "");
                        const apology = `I apologize, but I don't have access to the following tools: ${missingTools.join(", ")}. Please try a different request or contact support if you need these features.`;
                        controller.enqueue(encoder.encode(apology));
                        controller.close();
                        return;
                    }

                    // Step 3: Execute tools if needed
                    const scrapedContents: Array<{ url: string; content: string }> = [];
                    const scrapedUrls = new Set<string>();

                    // If URLs detected or scraping mentioned, scrape them
                    let hasICPComponent = false;
                    if (needsScraping && urls.length > 0) {
                        sendStatus(controller, encoder, "Scraping data");
                        for (const url of urls) {
                            const content = await scrapeUrl(url, controller, encoder, flowId, req, excludeICP);
                            if (content) {
                                scrapedContents.push({ url, content });
                                scrapedUrls.add(url);
                                // Check if ICP component was generated
                                if (content.includes("<component>") && (content.includes('"type":"icp-card"') || content.includes('"type":"icp-cards"'))) {
                                    hasICPComponent = true;
                                }
                            }
                        }

                        // If ICP component was generated, close stream immediately (no additional AI text needed)
                        if (hasICPComponent) {
                            sendStatus(controller, encoder, "");
                            controller.close();
                            return;
                        }
                    } else if (needsScraping && urls.length === 0) {
                        // User wants scraping but no URL provided
                        sendStatus(controller, encoder, "");
                        controller.enqueue(encoder.encode("\n[Please provide a URL to scrape]\n\n"));
                        controller.close();
                        return;
                    }

                    // Step 4: Generate AI response (only if we haven't already closed the stream)
                    // Skip AI call entirely if ICP component was already generated to save tokens
                    if (hasICPComponent) {
                        // Already closed stream above, but double-check
                        sendStatus(controller, encoder, "");
                        controller.close();
                        return;
                    }

                    sendStatus(controller, encoder, "Generating response");

                    // Build system message with scraped content context
                    let systemContent = `You are a helpful AI assistant with access to tools for analyzing websites and generating content.

Available tools:
- Crawler: Analyze a website URL to extract content, facts, and metadata (ICPs are automatically generated)
- Analyst: Generate Ideal Customer Profiles from website content
- generate_value_prop: Generate value propositions based on ICP and website
- generate_email_sequence: Generate email sequences for outreach
- generate_one_time_email: Generate a single email
- generate_linkedin_outreach: Generate LinkedIn outreach content

IMPORTANT: When a URL is provided and scraped, Ideal Customer Profiles (ICPs) are AUTOMATICALLY generated and displayed as interactive card components.

CRITICAL RULES FOR ICP RESPONSES:
1. When ICPs are generated and displayed as card components, DO NOT add any additional text, explanations, or summaries after the component
2. The ICP card component is self-contained and includes action buttons - no additional commentary is needed
3. If you see an ICP component in the conversation, DO NOT add text like "Here are the details:" or "The ICPs have been generated" - the component speaks for itself
4. Only generate the ICP component and stop - do not add any follow-up text

CRITICAL: Do NOT call the Crawler tool if URLs have already been scraped. The ICPs are already generated and displayed above.

When a user asks you to analyze a website or generate content:
1. If URLs were already scraped (you'll see ICPs displayed above), DO NOT call the Crawler tool
2. If ICPs are already displayed as components, DO NOT add any text - just let the component be displayed
3. Only use tools if the user explicitly asks for something that hasn't been generated yet

Remember: ICP components are complete and self-explanatory - no additional text is needed.`;

                    // Add scraped content to context if available
                    if (scrapedContents.length > 0) {
                        systemContent += `\n\n**IMPORTANT CONTEXT:**\nThe following URLs have been scraped and Ideal Customer Profiles (ICPs) have ALREADY been generated and displayed as card components above:\n`;
                        scrapedContents.forEach(({ url, content }) => {
                            const hasICPs = content.includes("<component>") && (content.includes('"type":"icp-card"') || content.includes('"type":"icp-cards"'));
                            if (hasICPs) {
                                systemContent += `\n- ${url}: ICPs have been generated and are shown as interactive card components above. The cards include action buttons. DO NOT add any text, explanations, or summaries - the component is complete.\n`;
                            } else {
                                systemContent += `\n- ${url}: Content scraped (${content.substring(0, 200)}${content.length > 200 ? '...' : ''})\n`;
                            }
                        });
                        systemContent += `\nCRITICAL: When ICP components are displayed, DO NOT add any follow-up text. The component is self-contained with action buttons. Just let it be displayed without any additional commentary.`;
                    }

                    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                        {
                            role: "system",
                            content: systemContent,
                        },
                        { role: "user", content: message },
                    ];

                    let iteration = 0;
                    const maxIterations = 5;

                    // Clear status before streaming content
                    sendStatus(controller, encoder, "");

                    while (iteration < maxIterations) {
                        // If we already have ICP components in scraped content, use strict format to prevent extra text
                        const hasICPsInContext = scrapedContents.some(({ content }) =>
                            content.includes("<component>") && (content.includes('"type":"icp-card"') || content.includes('"type":"icp-cards"'))
                        );

                        const stream = await openai.chat.completions.create({
                            model: "gpt-4o-mini",
                            messages,
                            tools,
                            tool_choice: "auto",
                            temperature: 0.3, // Lower temperature for more deterministic output
                            max_tokens: hasICPsInContext ? 50 : 1000, // Very low token limit if ICPs already exist
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

                        // If we got content but no tool calls, check if we should suppress it
                        if (toolCalls.length === 0) {
                            if (accumulatedContent) {
                                // Check if we have ICP components in context - if so, suppress any additional text
                                const hasICPsInContext = scrapedContents.some(({ content }) =>
                                    content.includes("<component>") && (content.includes('"type":"icp-card"') || content.includes('"type":"icp-cards"'))
                                );

                                // If ICP components exist, don't stream any additional text
                                if (hasICPsInContext) {
                                    // Suppress the content - ICP component is already displayed
                                    controller.close();
                                    return;
                                }

                                // Regular content without ICPs, stream it
                                controller.enqueue(encoder.encode(accumulatedContent));
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

                                // Update status based on tool being used
                                if (functionName === "Crawler") {
                                    sendStatus(controller, encoder, "Scraping data");
                                } else if (functionName === "Analyst") {
                                    sendStatus(controller, encoder, "Analyzing content");
                                } else if (functionName.startsWith("generate_")) {
                                    sendStatus(controller, encoder, "Generating content");
                                }

                                const result = await executeTool(functionName, functionArgs, req, flowId, controller, encoder, scrapedUrls, excludeICP);

                                // Clear status after tool execution
                                sendStatus(controller, encoder, "");

                                messages.push({
                                    role: "tool",
                                    tool_call_id: toolCall.id,
                                    content: result,
                                } as any);
                            }

                            accumulatedContent = "";
                            iteration++;
                        } else {
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

