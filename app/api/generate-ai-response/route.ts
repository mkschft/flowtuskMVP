import { NextRequest } from "next/server";
import OpenAI from "openai";
import { scrapeWebsite, streamScrapeWebsite, streamCrawlWebsite, crawlWebsiteWithWebcrawler } from "@/lib/scraper";
import { createClient } from "@/lib/supabase/server";
import { ICPInsert, SiteInsert } from "@/lib/types/database";

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

// Check if site already exists
async function checkExistingSite(url: string, flowId?: string): Promise<any | null> {
    if (!flowId) return null;

    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("sites")
            .select("*")
            .eq("url", url)
            .eq("parent_flow", flowId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error || !data) return null;
        return data;
    } catch (error) {
        console.error("Error checking existing site:", error);
        return null;
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

// Store or update ICP requirements
async function storeICPRequirements(args: any, flowId: string): Promise<any> {
    if (!flowId) {
        return { error: "Flow ID is required" };
    }

    try {
        const supabase = await createClient();

        // Check if requirements already exist for this flow
        const { data: existing } = await supabase
            .from("icp_requirements")
            .select("*")
            .eq("parent_flow", flowId)
            .maybeSingle();

        const requirementsData: any = {
            parent_flow: flowId,
        };

        // Only update fields that are provided
        if (args.business_description !== undefined) requirementsData.business_description = args.business_description;
        if (args.core_value_prop !== undefined) requirementsData.core_value_prop = args.core_value_prop;
        if (args.industry !== undefined) requirementsData.industry = args.industry;
        if (args.customer_size !== undefined) requirementsData.customer_size = args.customer_size;
        if (args.existing_customers !== undefined) requirementsData.existing_customers = args.existing_customers;
        if (args.target_geography !== undefined) requirementsData.target_geography = args.target_geography;
        if (args.buyer_roles !== undefined) requirementsData.buyer_roles = args.buyer_roles;
        if (args.competitors !== undefined) requirementsData.competitors = args.competitors;
        if (args.unique_selling_point !== undefined) requirementsData.unique_selling_point = args.unique_selling_point;
        if (args.product_description !== undefined) requirementsData.product_description = args.product_description;
        if (args.target_user !== undefined) requirementsData.target_user = args.target_user;
        if (args.primary_pain_point !== undefined) requirementsData.primary_pain_point = args.primary_pain_point;

        let result;
        if (existing) {
            // Update existing requirements (merge with existing data)
            const mergedData = {
                ...existing,
                ...requirementsData,
            };
            const { data, error } = await supabase
                .from("icp_requirements")
                .update(mergedData)
                .eq("id", existing.id)
                .select()
                .single();
            result = { data, error };
        } else {
            // Insert new requirements
            const { data, error } = await supabase
                .from("icp_requirements")
                .insert(requirementsData)
                .select()
                .single();
            result = { data, error };
        }

        if (result.error) {
            console.error("Error storing ICP requirements:", result.error);
            return { error: result.error.message };
        }

        return { success: true, data: result.data };
    } catch (error) {
        console.error("Error storing ICP requirements:", error);
        return { error: error instanceof Error ? error.message : String(error) };
    }
}

// Check if minimum requirements are met
function checkMinimumRequirements(requirements: any): { met: boolean; missing: string[] } {
    const missing: string[] = [];

    // Check minimum required inputs
    if (!requirements.business_description && !requirements.product_description) {
        missing.push("business_description or product_description");
    }
    if (!requirements.core_value_prop && !requirements.primary_pain_point) {
        missing.push("core_value_prop or primary_pain_point");
    }
    if (!requirements.industry) {
        missing.push("industry");
    }
    if (!requirements.customer_size && !requirements.target_user) {
        missing.push("customer_size or target_user");
    }

    // If we have fallback mode inputs, that's acceptable
    const hasFallback = requirements.product_description && requirements.target_user && requirements.primary_pain_point;

    if (missing.length === 0 || hasFallback) {
        return { met: true, missing: [] };
    }

    return { met: false, missing };
}

// Generate ICPs from stored requirements
async function generateICPsFromRequirements(requirements: any, flowId: string, controller?: ReadableStreamDefaultController<Uint8Array>, encoder?: TextEncoder, excludeExisting?: boolean): Promise<any> {
    try {
        // First, try to get scraped content if available (more comprehensive)
        let content = "";
        let useScrapedContent = false;

        if (flowId) {
            try {
                const supabase = await createClient();
                const { data: existingSites } = await supabase
                    .from("sites")
                    .select("content, facts_json")
                    .eq("parent_flow", flowId)
                    .order("created_at", { ascending: false })
                    .limit(1);

                if (existingSites && existingSites.length > 0 && existingSites[0].content) {
                    // Use scraped content if available (more comprehensive than requirements)
                    content = existingSites[0].content;
                    useScrapedContent = true;
                }
            } catch (error) {
                console.error("Error fetching scraped content:", error);
                // Fall back to requirements
            }
        }

        // If no scraped content, build from requirements
        if (!useScrapedContent) {
            if (requirements.business_description) {
                content += `Business Description: ${requirements.business_description}\n\n`;
            }
            if (requirements.product_description) {
                content += `Product Description: ${requirements.product_description}\n\n`;
            }
            if (requirements.core_value_prop) {
                content += `Core Value Proposition: ${requirements.core_value_prop}\n\n`;
            }
            if (requirements.primary_pain_point) {
                content += `Primary Pain Point: ${requirements.primary_pain_point}\n\n`;
            }
            if (requirements.industry) {
                content += `Industry: ${requirements.industry}\n\n`;
            }
            if (requirements.customer_size) {
                content += `Customer Size: ${requirements.customer_size}\n\n`;
            }
            if (requirements.target_user) {
                content += `Target User: ${requirements.target_user}\n\n`;
            }
            if (requirements.existing_customers && Array.isArray(requirements.existing_customers) && requirements.existing_customers.length > 0) {
                content += `Existing Customers: ${requirements.existing_customers.join(", ")}\n\n`;
            }
            if (requirements.target_geography) {
                content += `Target Geography: ${requirements.target_geography}\n\n`;
            }
            if (requirements.buyer_roles && Array.isArray(requirements.buyer_roles) && requirements.buyer_roles.length > 0) {
                content += `Buyer Roles: ${requirements.buyer_roles.join(", ")}\n\n`;
            }
            if (requirements.competitors && Array.isArray(requirements.competitors) && requirements.competitors.length > 0) {
                content += `Competitors: ${requirements.competitors.join(", ")}\n\n`;
            }
            if (requirements.unique_selling_point) {
                content += `Unique Selling Point: ${requirements.unique_selling_point}\n\n`;
            }
        }

        // Get existing ICPs to exclude if regenerating
        let excludeCurrentICP: any = null;
        if (excludeExisting && flowId) {
            try {
                const supabase = await createClient();
                const { data: existingICPs } = await supabase
                    .from("icps")
                    .select("title, persona_name, persona_role")
                    .eq("parent_flow", flowId)
                    .order("created_at", { ascending: false })
                    .limit(10); // Get recent ICPs to exclude

                if (existingICPs && existingICPs.length > 0) {
                    // Use the most recent ICP as the exclusion reference
                    excludeCurrentICP = {
                        title: existingICPs[0].title,
                        personaName: existingICPs[0].persona_name,
                        personaRole: existingICPs[0].persona_role,
                    };
                }
            } catch (error) {
                console.error("Error fetching existing ICPs for exclusion:", error);
                // Continue without exclusion if fetch fails
            }
        }

        // Generate ICPs using the existing generate-icps endpoint
        const { POST: generateICPs } = await import("@/app/api/generate-icps/route");
        const icpReq = new NextRequest("http://localhost/api/generate-icps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: content,
                excludeCurrentICP: excludeCurrentICP,
            }),
        });

        const icpResp = await generateICPs(icpReq);
        const icpData = await icpResp.json();

        if (!icpData.icps || icpData.icps.length === 0) {
            return { error: "Could not generate ICPs from requirements" };
        }

        // Get first 3 ICPs
        const icpsToShow = icpData.icps.slice(0, 3);

        // Save all ICPs to database
        for (const icp of icpsToShow) {
            await saveICP({
                ...icp,
                fitScore: 90,
                profilesFound: 12,
            }, flowId);
        }

        // Create ICP cards component JSON
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
                    fitScore: 90,
                    profilesFound: 12,
                })),
                websiteUrl: null,
                flowId: flowId,
                businessDescription: requirements.business_description || requirements.product_description || "",
                painPointsWithMetrics: [],
            }
        };

        // Format as component tag
        const icpContent = `<component>${JSON.stringify(icpComponent)}</component>`;

        // Stream ICP component if controller and encoder are provided
        if (controller && encoder) {
            controller.enqueue(encoder.encode(icpContent));
        }

        return {
            success: true,
            icpsGenerated: icpsToShow.length,
            note: excludeExisting
                ? "New Ideal Customer Profiles have been generated from stored requirements."
                : "Ideal Customer Profiles have been generated from stored requirements.",
        };
    } catch (error) {
        console.error("Error generating ICPs from requirements:", error);
        return { error: error instanceof Error ? error.message : String(error) };
    }
}

// Scrape URL using webcrawlerapi, analyze with OpenAI, and generate ICP
async function scrapeUrl(url: string, controller: ReadableStreamDefaultController<Uint8Array>, encoder: TextEncoder, flowId?: string, req?: NextRequest, excludeICP?: any): Promise<string> {
    try {
        // Check if site already exists
        const existingSite = await checkExistingSite(url, flowId);
        if (existingSite) {
            // Stream the card component
            const siteCardComponent = {
                type: "site-already-scraped",
                props: {
                    url: url,
                    siteId: existingSite.id,
                    title: existingSite.title || url,
                    summary: existingSite.summary || existingSite.description || "This site has already been scraped.",
                    createdAt: existingSite.created_at,
                    flowId: flowId,
                }
            };
            const cardContent = `<component>${JSON.stringify(siteCardComponent)}</component>`;
            controller.enqueue(encoder.encode(cardContent));
            // Return empty string to avoid adding component data to context
            return "";
        }

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

            // Save scraped content to sites table FIRST (before ICP generation)
            // This ensures data is saved even if ICP generation fails
            if (flowId) {
                try {
                    const supabase = await createClient();
                    const { data: { user } } = await supabase.auth.getUser();

                    if (user) {
                        // Check if site already exists
                        const { data: existingSite } = await supabase
                            .from("sites")
                            .select("id")
                            .eq("parent_flow", flowId)
                            .eq("url", url)
                            .maybeSingle();

                        if (!existingSite) {
                            // Extract basic metadata from scraped content
                            const titleMatch = crawledContent.match(/^#\s+(.+)$/m);
                            const title = titleMatch ? titleMatch[1] : new URL(url).hostname;

                            const siteInsert: SiteInsert = {
                                parent_flow: flowId,
                                url: url,
                                content: crawledContent,
                                source: "webcrawlerapi",
                                title: title,
                                description: crawledContent.substring(0, 500) || null,
                                summary: null, // Will be updated after ICP generation if successful
                                facts_json: null, // Will be updated after ICP generation if successful
                                pages: 1,
                            };

                            const { data: insertedSite, error: siteError } = await supabase
                                .from("sites")
                                .insert(siteInsert)
                                .select("id")
                                .single();

                            if (siteError) {
                                console.error("Error saving scraped site:", siteError);
                            } else {
                                console.log("✅ Scraped site saved to database");
                                // Update flows table with selected_site (last created site)
                                if (insertedSite?.id) {
                                    await supabase
                                        .from("flows")
                                        .update({ selected_site: insertedSite.id })
                                        .eq("id", flowId);
                                }
                            }
                        }
                    }
                } catch (saveError) {
                    console.error("Error saving scraped site:", saveError);
                    // Don't fail the request if save fails
                }
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
                // Site is already saved above, so we can return
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

            // Update site with ICP summary if available
            if (flowId && icpData.summary) {
                try {
                    const supabase = await createClient();
                    const { data: { user } } = await supabase.auth.getUser();

                    if (user) {
                        const { data: existingSite } = await supabase
                            .from("sites")
                            .select("id")
                            .eq("parent_flow", flowId)
                            .eq("url", url)
                            .maybeSingle();

                        if (existingSite) {
                            // Update existing site with ICP summary
                            await supabase
                                .from("sites")
                                .update({
                                    summary: icpData.summary.businessDescription,
                                    facts_json: { summary: icpData.summary },
                                })
                                .eq("id", existingSite.id);
                        }
                    }
                } catch (updateError) {
                    console.error("Error updating site with ICP summary:", updateError);
                    // Don't fail the request if update fails
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
            name: "store",
            description: "Store ICP requirements and business information collected from user prompts. Use this to save information about the business, product, customers, and ICP requirements. The AI will automatically generate ICPs once minimum requirements are met.",
            parameters: {
                type: "object",
                properties: {
                    business_description: {
                        type: "string",
                        description: "Short text description of the business or URL",
                    },
                    core_value_prop: {
                        type: "string",
                        description: "What problem the product/service solves",
                    },
                    industry: {
                        type: "string",
                        description: "Category or sector (e.g., SaaS, Healthcare, E-commerce)",
                    },
                    customer_size: {
                        type: "string",
                        description: "B2B/B2C + SMB/Mid/Enterprise (e.g., 'B2B SMB', 'B2C Enterprise')",
                    },
                    existing_customers: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of example customers (optional, improves precision)",
                    },
                    target_geography: {
                        type: "string",
                        description: "Target geography or region (optional)",
                    },
                    buyer_roles: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of buyer roles (e.g., CTO, Founder, Teacher) (optional)",
                    },
                    competitors: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of competitors (optional)",
                    },
                    unique_selling_point: {
                        type: "string",
                        description: "Unique selling point or differentiator (optional)",
                    },
                    product_description: {
                        type: "string",
                        description: "Product description (fallback mode)",
                    },
                    target_user: {
                        type: "string",
                        description: "Target user description (fallback mode)",
                    },
                    primary_pain_point: {
                        type: "string",
                        description: "Primary pain point the product addresses (fallback mode)",
                    },
                    regenerate: {
                        type: "boolean",
                        description: "Set to true if user wants to regenerate ICPs (e.g., 'generate different ones', 'not happy with results', 'try again'). This will generate new ICPs excluding existing ones.",
                    },
                },
                required: [],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "update",
            description: "Update the currently selected ICP with new information provided by the user. Use this when the user indicates that existing ICP information needs to be corrected or updated (e.g., 'the business is based in Paris', 'update the location', 'change the company name', 'the pain point is different'). Only update fields that the user explicitly mentions or provides new information for.",
            parameters: {
                type: "object",
                properties: {
                    persona_name: {
                        type: "string",
                        description: "Update the persona name if user provides new information",
                    },
                    persona_role: {
                        type: "string",
                        description: "Update the persona role if user provides new information",
                    },
                    persona_company: {
                        type: "string",
                        description: "Update the company name if user provides new information",
                    },
                    location: {
                        type: "string",
                        description: "Update the location/city if user provides new information (e.g., 'Paris', 'New York')",
                    },
                    country: {
                        type: "string",
                        description: "Update the country if user provides new information",
                    },
                    title: {
                        type: "string",
                        description: "Update the ICP title/category if user provides new information",
                    },
                    description: {
                        type: "string",
                        description: "Update the ICP description if user provides new information",
                    },
                    pain_points: {
                        type: "array",
                        items: { type: "string" },
                        description: "Update the pain points array if user provides new information",
                    },
                    goals: {
                        type: "array",
                        items: { type: "string" },
                        description: "Update the goals array if user provides new information",
                    },
                },
                required: [],
            },
        },
    }

];

// Execute a tool call by importing and calling route handlers directly
async function executeTool(toolName: string, args: any, req: NextRequest, flowId?: string, controller?: ReadableStreamDefaultController<Uint8Array>, encoder?: TextEncoder, scrapedUrls?: Set<string>, excludeICP?: any, skipCrawlerCheck?: boolean): Promise<string> {
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

                // Check if site already exists (skip if skipCrawlerCheck is true)
                if (!skipCrawlerCheck) {
                    const existingSite = await checkExistingSite(args.url, flowId);
                    if (existingSite) {
                        // Stream the card component if controller is available
                        if (controller && encoder) {
                            const siteCardComponent = {
                                type: "site-already-scraped",
                                props: {
                                    url: args.url,
                                    siteId: existingSite.id,
                                    title: existingSite.title || args.url,
                                    summary: existingSite.summary || existingSite.description || "This site has already been scraped.",
                                    createdAt: existingSite.created_at,
                                    flowId: flowId,
                                }
                            };
                            const cardContent = `<component>${JSON.stringify(siteCardComponent)}</component>`;
                            controller.enqueue(encoder.encode(cardContent));
                        }

                        // Return simple message without component data
                        return JSON.stringify({
                            success: true,
                            url: args.url,
                            note: "Site already scraped."
                        });
                    }
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

                    // Save scraped content to sites table FIRST (before ICP generation)
                    // This ensures data is saved even if ICP generation fails
                    if (flowId) {
                        try {
                            const supabase = await createClient();
                            const { data: { user } } = await supabase.auth.getUser();

                            if (user) {
                                // Check if site already exists
                                const { data: existingSite } = await supabase
                                    .from("sites")
                                    .select("id")
                                    .eq("parent_flow", flowId)
                                    .eq("url", args.url)
                                    .maybeSingle();

                                if (!existingSite) {
                                    // Extract basic metadata from scraped content
                                    const titleMatch = scrapeResult.markdown.match(/^#\s+(.+)$/m);
                                    const title = titleMatch ? titleMatch[1] : new URL(args.url).hostname;

                                    const siteInsert: SiteInsert = {
                                        parent_flow: flowId,
                                        url: args.url,
                                        content: scrapeResult.markdown,
                                        source: "webcrawlerapi",
                                        title: title,
                                        description: scrapeResult.markdown.substring(0, 500) || null,
                                        summary: null, // Will be updated after ICP generation if successful
                                        facts_json: null, // Will be updated after ICP generation if successful
                                        pages: 1,
                                    };

                                    const { data: insertedSite, error: siteError } = await supabase
                                        .from("sites")
                                        .insert(siteInsert)
                                        .select("id")
                                        .single();

                                    if (siteError) {
                                        console.error("Error saving scraped site:", siteError);
                                    } else {
                                        console.log("✅ Scraped site saved to database");
                                        // Update flows table with selected_site (last created site)
                                        if (insertedSite?.id) {
                                            await supabase
                                                .from("flows")
                                                .update({ selected_site: insertedSite.id })
                                                .eq("id", flowId);
                                        }
                                    }
                                }
                            }
                        } catch (saveError) {
                            console.error("Error saving scraped site:", saveError);
                            // Don't fail the request if save fails
                        }
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

                    // Update site with ICP summary if available
                    if (flowId && icpData.summary) {
                        try {
                            const supabase = await createClient();
                            const { data: { user } } = await supabase.auth.getUser();

                            if (user) {
                                const { data: existingSite } = await supabase
                                    .from("sites")
                                    .select("id")
                                    .eq("parent_flow", flowId)
                                    .eq("url", args.url)
                                    .maybeSingle();

                                if (existingSite) {
                                    // Update existing site with ICP summary
                                    await supabase
                                        .from("sites")
                                        .update({
                                            summary: icpData.summary.businessDescription,
                                            facts_json: { summary: icpData.summary },
                                        })
                                        .eq("id", existingSite.id);
                                }
                            }
                        } catch (updateError) {
                            console.error("Error updating site with ICP summary:", updateError);
                            // Don't fail the request if update fails
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
            case "store": {
                if (!flowId) {
                    return JSON.stringify({ error: "Flow ID is required to store ICP requirements" });
                }

                // Check if this is a regeneration request
                const isRegeneration = args.regenerate === true || args.regenerate === "true";

                // Store the requirements (unless it's just a regeneration request)
                if (!isRegeneration) {
                    const storeResult = await storeICPRequirements(args, flowId);
                    if (storeResult.error) {
                        return JSON.stringify({ error: storeResult.error });
                    }
                }

                // Get updated requirements to check if minimum is met
                const supabase = await createClient();
                let { data: updatedRequirements } = await supabase
                    .from("icp_requirements")
                    .select("*")
                    .eq("parent_flow", flowId)
                    .maybeSingle();

                // If no requirements found but this is a regeneration request, check for existing scraped sites
                if ((!updatedRequirements || isRegeneration) && flowId) {
                    const { data: existingSites } = await supabase
                        .from("sites")
                        .select("content, facts_json, url, title, description, summary")
                        .eq("parent_flow", flowId)
                        .order("created_at", { ascending: false })
                        .limit(1);

                    if (existingSites && existingSites.length > 0) {
                        const site = existingSites[0];
                        // Extract requirements from scraped site data
                        const extractedRequirements: any = {};

                        if (site.facts_json) {
                            const facts = site.facts_json as any;
                            if (facts.summary?.businessDescription) {
                                extractedRequirements.business_description = facts.summary.businessDescription;
                            }
                            if (facts.summary?.coreValueProp) {
                                extractedRequirements.core_value_prop = facts.summary.coreValueProp;
                            }
                            if (facts.summary?.industry) {
                                extractedRequirements.industry = facts.summary.industry;
                            }
                        }

                        // Use site metadata as fallback
                        if (!extractedRequirements.business_description) {
                            extractedRequirements.business_description = site.summary || site.description || site.title || site.url;
                        }

                        // Store extracted requirements if they don't exist
                        if (!updatedRequirements) {
                            const storeResult = await storeICPRequirements(extractedRequirements, flowId);
                            if (storeResult.success && storeResult.data) {
                                updatedRequirements = storeResult.data;
                            }
                        } else {
                            // Merge with existing requirements
                            updatedRequirements = { ...updatedRequirements, ...extractedRequirements };
                        }
                    }
                }

                if (!updatedRequirements) {
                    return JSON.stringify({
                        success: true,
                        note: "Requirements stored successfully. Continue collecting information."
                    });
                }

                // Check if minimum requirements are met
                const checkResult = checkMinimumRequirements(updatedRequirements);

                if (checkResult.met) {
                    // Generate ICPs automatically (exclude existing if regenerating)
                    if (controller && encoder) {
                        sendStatus(controller, encoder, isRegeneration ? "Regenerating ICPs from requirements" : "Generating ICPs from requirements");
                    }

                    const icpResult = await generateICPsFromRequirements(
                        updatedRequirements,
                        flowId,
                        controller,
                        encoder,
                        isRegeneration // Exclude existing ICPs when regenerating
                    );

                    if (icpResult.error) {
                        return JSON.stringify({
                            success: true,
                            note: "Requirements stored successfully. Error generating ICPs: " + icpResult.error
                        });
                    }

                    // Clear status after generating
                    if (controller && encoder) {
                        sendStatus(controller, encoder, "");
                    }

                    return JSON.stringify({
                        success: true,
                        note: isRegeneration
                            ? `New ICPs generated successfully! ${icpResult.icpsGenerated} new ICPs have been created.`
                            : `Requirements stored and ICPs generated successfully! ${icpResult.icpsGenerated} ICPs have been created.`,
                        icpsGenerated: icpResult.icpsGenerated,
                    });
                } else {
                    // Still need more information
                    const missingList = checkResult.missing.join(", ");
                    return JSON.stringify({
                        success: true,
                        note: `Requirements stored successfully. Still need: ${missingList}. Continue collecting information.`,
                        missing: checkResult.missing,
                    });
                }
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
            case "update": {
                if (!flowId) {
                    return JSON.stringify({ error: "Flow ID is required to update ICP" });
                }

                try {
                    const supabase = await createClient();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        return JSON.stringify({ error: "User not authenticated" });
                    }

                    // Get the selected ICP from the flow
                    const { data: flow, error: flowError } = await supabase
                        .from("flows")
                        .select("selected_icp")
                        .eq("id", flowId)
                        .single();

                    if (flowError || !flow?.selected_icp) {
                        return JSON.stringify({
                            error: "No ICP selected for this flow. Please select an ICP first."
                        });
                    }

                    // Get the current ICP
                    const { data: currentICP, error: icpError } = await supabase
                        .from("icps")
                        .select("*")
                        .eq("id", flow.selected_icp)
                        .single();

                    if (icpError || !currentICP) {
                        return JSON.stringify({ error: "Selected ICP not found" });
                    }

                    // Build update object with only provided fields
                    const updateData: any = {};
                    if (args.persona_name !== undefined) updateData.persona_name = args.persona_name;
                    if (args.persona_role !== undefined) updateData.persona_role = args.persona_role;
                    if (args.persona_company !== undefined) updateData.persona_company = args.persona_company;
                    if (args.location !== undefined) updateData.location = args.location;
                    if (args.country !== undefined) updateData.country = args.country;
                    if (args.title !== undefined) updateData.title = args.title;
                    if (args.description !== undefined) updateData.description = args.description;
                    if (args.pain_points !== undefined) updateData.pain_points = args.pain_points;
                    if (args.goals !== undefined) updateData.goals = args.goals;

                    // If no fields to update, return error
                    if (Object.keys(updateData).length === 0) {
                        return JSON.stringify({
                            error: "No fields provided to update. Please specify which ICP fields to update."
                        });
                    }

                    // Update the ICP
                    const { data: updatedICP, error: updateError } = await supabase
                        .from("icps")
                        .update(updateData)
                        .eq("id", flow.selected_icp)
                        .select()
                        .single();

                    if (updateError) {
                        console.error("Error updating ICP:", updateError);
                        return JSON.stringify({ error: `Failed to update ICP: ${updateError.message}` });
                    }

                    // Stream success message with updated fields
                    const updatedFields = Object.keys(updateData).join(", ");
                    const successMessage = `ICP updated successfully. Updated fields: ${updatedFields}.`;

                    if (controller && encoder) {
                        controller.enqueue(encoder.encode(successMessage));
                    }

                    return JSON.stringify({
                        success: true,
                        message: successMessage,
                        updatedFields: Object.keys(updateData),
                        icp: updatedICP,
                    });
                } catch (error) {
                    console.error("Error in update tool:", error);
                    return JSON.stringify({
                        error: `Failed to update ICP: ${error instanceof Error ? error.message : String(error)}`
                    });
                }
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
        const { message, flowId, excludeCurrentICP, savedSiteData, skipCrawlerCheck } = await req.json() as {
            message?: string;
            flowId?: string;
            excludeCurrentICP?: string;
            savedSiteData?: {
                content: string;
                facts_json: any;
                title?: string;
                description?: string;
                summary?: string;
                url?: string;
            };
            skipCrawlerCheck?: boolean;
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

                    // If savedSiteData is provided, use it instead of scraping
                    let hasICPComponent = false;
                    let hasSiteAlreadyScrapedComponent = false;
                    if (savedSiteData) {
                        sendStatus(controller, encoder, "Generating ICPs from saved data...");

                        try {
                            // Generate ICPs from saved content
                            const { POST: generateICPs } = await import("@/app/api/generate-icps/route");
                            const icpReq = new NextRequest(req?.url || "http://localhost", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    content: savedSiteData.content,
                                    excludeCurrentICP: excludeICP,
                                }),
                            });

                            const icpResp = await generateICPs(icpReq);
                            const icpData = await icpResp.json();

                            if (icpData.icps && icpData.icps.length > 0) {
                                // Get first 3 ICPs
                                const icpsToShow = icpData.icps.slice(0, 3);

                                // Save all ICPs to database
                                if (flowId) {
                                    for (const icp of icpsToShow) {
                                        await saveICP({
                                            ...icp,
                                            fitScore: 90,
                                            profilesFound: 12,
                                        }, flowId, savedSiteData.url || savedSiteData.facts_json?.websiteUrl || "");
                                    }
                                }

                                // Create ICP cards component with company overview
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
                                            fitScore: 90,
                                            profilesFound: 12,
                                        })),
                                        websiteUrl: savedSiteData.url || savedSiteData.facts_json?.websiteUrl || "",
                                        flowId: flowId,
                                        businessDescription: savedSiteData.summary || savedSiteData.description || savedSiteData.facts_json?.summary?.businessDescription || "",
                                        painPointsWithMetrics: savedSiteData.facts_json?.summary?.painPointsWithMetrics || [],
                                    }
                                };

                                const icpContent = `<component>${JSON.stringify(icpComponent)}</component>`;
                                controller.enqueue(encoder.encode(icpContent));
                                hasICPComponent = true;
                            }
                        } catch (error) {
                            console.error("Error generating ICPs from saved data:", error);
                            controller.enqueue(encoder.encode("\n[Error generating ICPs from saved data]\n\n"));
                        }

                        // Close stream after generating ICPs
                        if (hasICPComponent) {
                            sendStatus(controller, encoder, "");
                            controller.close();
                            return;
                        }
                    }

                    // If URLs detected or scraping mentioned, scrape them
                    if (needsScraping && urls.length > 0 && !savedSiteData) {
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
                            } else {
                                // Empty content means site-already-scraped component was displayed
                                hasSiteAlreadyScrapedComponent = true;
                            }
                        }

                        // If component was generated, close stream immediately (no additional AI text needed)
                        if (hasICPComponent || hasSiteAlreadyScrapedComponent) {
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
                    // Skip AI call entirely if component was already generated to save tokens
                    if (hasICPComponent || hasSiteAlreadyScrapedComponent) {
                        // Already closed stream above, but double-check
                        sendStatus(controller, encoder, "");
                        controller.close();
                        return;
                    }

                    sendStatus(controller, encoder, "Generating response");

                    // Build system message with scraped content context
                    let systemContent = `You are a business growth specialist AI assistant with expertise in helping businesses identify and target their Ideal Customer Profiles (ICPs). Your role is to guide users through collecting the necessary information to create accurate ICPs.

Available tools:
- crawler: Analyze a website URL to extract content, facts, and metadata (ICPs are automatically generated)
- analyst: Generate Ideal Customer Profiles from website content
- store: Store ICP requirements and business information collected from user prompts. Use this tool frequently to save information as users provide it. The system will automatically generate ICPs once minimum requirements are met.
- update: Update the currently selected ICP with new information. Use this when the user indicates that existing ICP information needs to be corrected or updated (e.g., "the business is based in Paris", "update the location", "change the company name", "the pain point is different"). Only update fields that the user explicitly mentions or provides new information for.
- generate_value_prop: Generate value propositions based on ICP and website

YOUR PRIMARY ROLE AS A BUSINESS GROWTH SPECIALIST:
1. Actively collect ICP requirements from user conversations using the "store" tool
2. Extract and store information about: business description, core value proposition, industry, customer size, existing customers, target geography, buyer roles, competitors, unique selling points
3. Guide users to provide minimum required information:
   - business_description (or product_description as fallback)
   - core_value_prop (or primary_pain_point as fallback)
   - industry
   - customer_size (or target_user as fallback)
4. Once minimum requirements are met, ICPs will be automatically generated
5. Use natural conversation to extract this information - don't be too formal or robotic
6. If user expresses dissatisfaction with ICPs or asks to "generate different ones", "try again", "not happy", "regenerate", "I don't want to work with [X]", etc., call the "store" tool with regenerate: true to generate new ICPs excluding existing ones
7. IMPORTANT: When regenerating ICPs, the system will automatically use existing scraped content or stored requirements - DO NOT ask for context again if ICPs were already generated from a website

CRITICAL: ANSWERING QUESTIONS ABOUT EXISTING ICPs:
- If user asks questions about existing ICPs (e.g., "Explain the pain point", "What does this mean?", "Help me understand", "I don't understand"), ANSWER DIRECTLY using the conversation history
- The conversation history includes all previous ICPs that were generated - reference them when answering questions
- DO NOT call any tools when answering questions - just provide helpful explanations based on the ICPs already shown in the conversation
- Questions starting with "explain", "what is", "help me understand", "why", "how", "tell me about", "I don't understand" should be answered conversationally WITHOUT calling tools
- Only use tools when user explicitly wants to GENERATE NEW ICPs, STORE NEW INFORMATION, or UPDATE EXISTING ICP INFORMATION
- When user asks about pain points, penalties, goals, or any ICP details, look at the conversation history for the ICP content and explain it clearly

UPDATING EXISTING ICPs:
- If user indicates that existing ICP information is incorrect or needs to be updated (e.g., "the business is based in Paris", "update the location to New York", "change the company name", "the pain point is different", "update the description"), use the "update" tool
- Only update fields that the user explicitly mentions or provides new information for
- Examples of update prompts: "the location should be Paris", "update the company to XYZ Corp", "change the pain points to include...", "the business is actually in London"
- The update tool will automatically find the currently selected ICP and update only the specified fields

IMPORTANT: When a URL is provided and scraped, Ideal Customer Profiles (ICPs) are AUTOMATICALLY generated and displayed as interactive card components.

CRITICAL RULES FOR ICP RESPONSES:
1. When ICPs are generated and displayed as card components, DO NOT add any additional text, explanations, or summaries after the component
2. The ICP card component is self-contained and includes action buttons - no additional commentary is needed
3. If you see an ICP component in the conversation, DO NOT add text like "Here are the details:" or "The ICPs have been generated" - the component speaks for itself
4. Only generate the ICP component and stop - do not add any follow-up text
5. HOWEVER, if user asks a QUESTION about the ICPs after they're displayed, ANSWER IT DIRECTLY without calling tools

CRITICAL: Do NOT call the Crawler tool if URLs have already been scraped. The ICPs are already generated and displayed above.

When a user asks you to analyze a website or generate content:
1. If URLs were already scraped (you'll see ICPs displayed above), DO NOT call the Crawler tool
2. If ICPs are already displayed as components and user asks a QUESTION, ANSWER IT DIRECTLY - do not regenerate ICPs
3. Only use tools if the user explicitly asks for something that hasn't been generated yet (e.g., "generate new ones", "regenerate", "create different ICPs")

Remember: Answer questions about existing ICPs directly. Only use tools to generate NEW ICPs or store NEW information.`;

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
                        systemContent += `\nCRITICAL: When ICP components are displayed, DO NOT add any follow-up text. The component is self-contained with action buttons. Just let it be displayed without any additional commentary.\n\nEXCEPTION: If the user asks a QUESTION about the ICPs (e.g., "explain", "what does this mean", "help me understand"), ANSWER IT DIRECTLY using the conversation history. Do NOT regenerate ICPs or call tools - just provide a helpful explanation.`;
                    }

                    // Fetch conversation history if flowId exists
                    const conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
                    if (flowId) {
                        try {
                            const supabase = await createClient();
                            // Get previous speeches - limit to last 20 messages to control token usage
                            // Order by created_at DESC to get most recent, then reverse to maintain chronological order
                            const { data: previousSpeeches } = await supabase
                                .from("speech")
                                .select("id, content, author, model_id, created_at")
                                .eq("parent_flow", flowId)
                                .order("created_at", { ascending: false })
                                .limit(20);

                            if (previousSpeeches && previousSpeeches.length > 0) {
                                // Reverse to get chronological order (oldest first)
                                const chronologicalSpeeches = previousSpeeches.reverse();

                                // Convert speeches to OpenAI message format
                                for (const speech of chronologicalSpeeches) {
                                    // Skip user messages that match the current message exactly
                                    // This prevents including the message that was just saved to DB
                                    if (speech.author && speech.content.trim() === message.trim()) {
                                        continue;
                                    }

                                    if (speech.author) {
                                        // User message
                                        conversationHistory.push({
                                            role: "user",
                                            content: speech.content,
                                        });
                                    } else if (speech.model_id) {
                                        // AI message (has model_id, no author)
                                        conversationHistory.push({
                                            role: "assistant",
                                            content: speech.content,
                                        });
                                    }
                                }
                            }
                        } catch (historyError) {
                            console.error("Error fetching conversation history:", historyError);
                            // Continue without history if fetch fails
                        }
                    }

                    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                        {
                            role: "system",
                            content: systemContent,
                        },
                        ...conversationHistory, // Add conversation history before current message
                        { role: "user", content: message }, // Current user message
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
                        let hasStreamedContent = false; // Track if we've already streamed content

                        for await (const chunk of stream) {
                            const delta = chunk.choices[0]?.delta;
                            if (delta?.content) {
                                // Filter out any component tags that might be echoed by AI
                                let filteredContent = delta.content;
                                // Remove component tags from AI's text response
                                filteredContent = filteredContent.replace(/<component>[\s\S]*?<\/component>/g, '');
                                // Remove any raw JSON that looks like component data
                                filteredContent = filteredContent.replace(/\{"type":"site-already-scraped"[\s\S]*?\}/g, '');
                                // Remove JSON tool results that might be echoed (e.g., {"success":true,"icpsGenerated":3,...})
                                filteredContent = filteredContent.replace(/\{"success":\s*true[^}]*"icpsGenerated"[^}]*\}/g, '');
                                filteredContent = filteredContent.replace(/\{"success":\s*true[^}]*"note"[^}]*\}/g, '');
                                filteredContent = filteredContent.replace(/\{"success":\s*true[^}]*"message"[^}]*"updatedFields"[^}]*\}/g, '');
                                // Remove any JSON objects that look like tool results
                                filteredContent = filteredContent.replace(/\{[^}]*"url"[^}]*"note"[^}]*\}/g, '');

                                if (filteredContent) {
                                    accumulatedContent += filteredContent;
                                    controller.enqueue(encoder.encode(filteredContent));
                                    hasStreamedContent = true; // Mark that we've streamed content
                                }
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

                                // Only enqueue if we haven't already streamed it chunk by chunk
                                // Content was already streamed during the loop above, so don't duplicate it
                                if (!hasStreamedContent) {
                                    // This case shouldn't happen, but handle it just in case
                                    const filteredAccumulated = accumulatedContent
                                        .replace(/<component>[\s\S]*?<\/component>/g, '')
                                        .replace(/\{"type":"site-already-scraped"[\s\S]*?\}/g, '')
                                        .replace(/\{"type":"site-already-scraped"[\s\S]*?\}\}/g, '')
                                        .replace(/\{"type":"site-already-scraped"[\s\S]*?"\}/g, '')
                                        // Remove JSON tool results
                                        .replace(/\{"success":\s*true[^}]*"icpsGenerated"[^}]*\}/g, '')
                                        .replace(/\{"success":\s*true[^}]*"note"[^}]*\}/g, '')
                                        .replace(/\{"success":\s*true[^}]*"message"[^}]*"updatedFields"[^}]*\}/g, '')
                                        .replace(/\{[^}]*"url"[^}]*"note"[^}]*\}/g, '');
                                    if (filteredAccumulated.trim()) {
                                        controller.enqueue(encoder.encode(filteredAccumulated));
                                    }
                                }
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

                                const result = await executeTool(functionName, functionArgs, req, flowId, controller, encoder, scrapedUrls, excludeICP, skipCrawlerCheck);

                                // Clear status after tool execution
                                sendStatus(controller, encoder, "");

                                // Check if result indicates a component was displayed (site-already-scraped or ICP cards)
                                let resultData;
                                try {
                                    resultData = JSON.parse(result);
                                } catch {
                                    resultData = null;
                                }

                                // Check if ICP components were streamed (check if result contains ICP component or success with ICPs)
                                const hasICPComponent = result.includes("<component>") &&
                                    (result.includes('"type":"icp-card"') || result.includes('"type":"icp-cards"'));
                                const hasICPsGenerated = resultData?.icpsGenerated || resultData?.note?.includes("ICPs generated") || resultData?.note?.includes("ICPs have been");

                                // If site-already-scraped component was displayed, close stream immediately
                                // Don't add tool result to messages to prevent AI from echoing it
                                if (resultData?.note?.includes("Site already scraped") || resultData?.note?.includes("card has been displayed")) {
                                    controller.close();
                                    return;
                                }

                                // If ICP components were generated and displayed, close stream and don't add tool result
                                // This prevents the AI from echoing the JSON tool result
                                if (hasICPComponent || hasICPsGenerated) {
                                    controller.close();
                                    return;
                                }

                                // Only add tool result if component wasn't displayed
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

