import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import OpenAI from "openai";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { buildAnalyzePrompt } from "@/lib/prompt-templates";
import { validateFactsJSON } from "@/lib/validators";
import { executeWithRetryAndTimeout } from "@/lib/api-handler";
import { createErrorResponse, ErrorContext } from "@/lib/error-mapper";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log('🔍 [Analyze] Starting analysis for:', url);

    // ========================================================================
    // STEP 1: Fetch website content (Firecrawl or Jina)
    // ========================================================================
    let rawContent = "";
    let source = "jina";
    let metadata = {
      heroImage: null as string | null,
      faviconUrl: `${new URL(url).origin}/favicon.ico`,
    };

    // Use Firecrawl only if explicitly enabled (it's slower but more comprehensive)
    if (process.env.FIRECRAWL_API_KEY && process.env.FIRECRAWL_ENABLED === 'true') {
      console.log('🔥 [Analyze] Using Firecrawl');
      const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

      // Crawl only homepage for fastest results
      const crawlResult = await firecrawl.crawlUrl(url, {
        limit: 1, // Only homepage for speed
        scrapeOptions: {
          formats: ["markdown"],
        },
      });

      console.log('✅ [Analyze] Firecrawl complete, pages:', 'data' in crawlResult ? crawlResult.data?.length || 0 : 0);

      if (crawlResult.success && 'data' in crawlResult) {
        // Combine all pages into one markdown
        let fullMarkdown = `# Website Crawl: ${url}\n\n`;

        for (const page of crawlResult.data || []) {
          fullMarkdown += `## Page: ${page.metadata?.title || page.url}\n`;
          fullMarkdown += `URL: ${page.url}\n\n`;
          fullMarkdown += page.markdown || "";
          fullMarkdown += "\n\n---\n\n";
        }

        rawContent = fullMarkdown;
        source = "firecrawl";

        // Extract metadata from Firecrawl
        const firstPage = crawlResult.data?.[0];
        metadata.heroImage = firstPage?.metadata?.ogImage || null;
      }
    }

    // Fallback to Jina AI Reader if Firecrawl not used or failed
    if (!rawContent) {
      console.log('🌐 [Analyze] Using Jina AI Reader');
      const jinaUrl = `https://r.jina.ai/${url}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // Increased to 30s

      try {
        const startTime = Date.now();
        const response = await fetch(jinaUrl, {
          headers: {
            Accept: "application/json",
            "X-Return-Format": "markdown",
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const fetchTime = Date.now() - startTime;
        console.log(`⚡ [Analyze] Jina fetch completed in ${fetchTime}ms`);

        if (response.ok) {
          const data = await response.json();
          rawContent = data.data?.content || "";

          // Extract visual metadata from Jina response
          metadata.heroImage = data.data?.images?.[0] || null;

          // Try to extract Open Graph image from content
          const ogImageMatch = rawContent.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
          if (ogImageMatch && ogImageMatch[1]) {
            metadata.heroImage = ogImageMatch[1];
          }
        }
      } catch (jinaError) {
        console.warn('⚠️ [Analyze] Jina failed, trying direct fetch:', jinaError);
        clearTimeout(timeout);
      }
    }

    // Final fallback: direct fetch if Jina failed
    if (!rawContent) {
      console.log('🌐 [Analyze] Using direct fetch fallback');
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FlowtuskBot/1.0)',
          },
          signal: AbortSignal.timeout(15000),
        });

        if (response.ok) {
          const html = await response.text();
          // Basic HTML to markdown conversion (strip tags, keep text)
          rawContent = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          console.log('✅ [Analyze] Direct fetch successful');
        }
      } catch (fetchError) {
        console.error('❌ [Analyze] All fetch methods failed:', fetchError);
        return NextResponse.json(
          {
            error: "Unable to access website. Please check the URL and try again.",
            details: "The website may be blocking automated access or taking too long to respond."
          },
          { status: 500 }
        );
      }
    }

    // Aggressive truncation for speed (prioritize fast results over comprehensiveness)
    const MAX_CONTENT_LENGTH = 8000;
    if (rawContent.length > MAX_CONTENT_LENGTH) {
      console.log(`⚡ [Analyze] Truncating content: ${rawContent.length} → ${MAX_CONTENT_LENGTH} chars`);
      rawContent = rawContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated for performance]';
    }

    console.log(`📊 [Analyze] Content size: ${rawContent.length} chars`);

    // ========================================================================
    // STEP 2: Extract Facts JSON using GPT-4o with 3-layer prompt
    // ========================================================================
    console.log('🧠 [Analyze] Extracting Facts JSON with GPT-4o...');

    const { system, developer, user } = buildAnalyzePrompt(rawContent);
    const extractStartTime = Date.now();

    // Use GPT-4o for best reasoning on fact extraction
    const result = await executeWithRetryAndTimeout(
      async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o", // Using GPT-4o for better reasoning
          messages: [
            { role: "system", content: system },
            { role: "developer" as any, content: developer }, // Cast to avoid TS error
            { role: "user", content: user },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3, // Low temperature for factual extraction
        });
      },
      { timeout: 45000, maxRetries: 1 }, // 45s with 1 retry = max 90s (fits frontend timeout)
      ErrorContext.WEBSITE_ANALYSIS
    );

    const extractTime = Date.now() - extractStartTime;
    console.log(`⚡ [Analyze] Facts extraction completed in ${extractTime}ms`);

    // Handle API call failure
    if (!result.success || !result.data) {
      console.error('❌ [Analyze] Facts extraction failed:', result.error);

      // Fallback: Return raw content without facts
      return NextResponse.json({
        content: rawContent,
        source,
        pages: source === "firecrawl" ? 3 : 1,
        metadata,
        factsJson: null,
        extractionError: result.error?.message || "Failed to extract facts",
      });
    }

    // Parse Facts JSON response
    const completion = result.data;
    const factsJson = JSON.parse(completion.choices[0].message.content || "{}");

    // Validate Facts JSON structure
    const validation = validateFactsJSON(factsJson);

    if (!validation.ok) {
      console.error('❌ [Analyze] Facts validation failed:', validation.errors);

      // Fallback: Return raw content without facts
      return NextResponse.json({
        content: rawContent,
        source,
        pages: source === "firecrawl" ? 3 : 1,
        metadata,
        factsJson: null,
        validationErrors: validation.errors,
      });
    }

    console.log('✅ [Analyze] Facts JSON extracted:', {
      facts: factsJson.facts?.length || 0,
      valueProps: factsJson.valueProps?.length || 0,
      pains: factsJson.pains?.length || 0,
      brandName: factsJson.brand?.name || 'unknown',
    });

    // ========================================================================
    // STEP 3: Optional - Save to file system in development
    // ========================================================================
    if (process.env.NODE_ENV === 'development') {
      try {
        const blueprintsDir = join(process.cwd(), "blueprints");
        await mkdir(blueprintsDir, { recursive: true });

        const hostname = new URL(url).hostname.replace(/\./g, "_");

        // Save raw content
        const contentFilepath = join(blueprintsDir, `${hostname}_content.md`);
        await writeFile(contentFilepath, rawContent, "utf-8");

        // Save facts JSON
        const factsFilepath = join(blueprintsDir, `${hostname}_facts.json`);
        await writeFile(factsFilepath, JSON.stringify(factsJson, null, 2), "utf-8");

        console.log('💾 [Analyze] Saved blueprints:', hostname);
      } catch (err) {
        console.warn('⚠️ [Analyze] Failed to save blueprints:', err);
      }
    }

    console.log('✅ [Analyze] Analysis complete with Facts JSON');

    // ========================================================================
    // STEP 4: Return both Facts JSON and raw content
    // ========================================================================
    return NextResponse.json({
      content: rawContent, // Keep for fallback
      source,
      pages: source === "firecrawl" ? 3 : 1,
      metadata,
      factsJson, // NEW: Structured facts for reuse
    });

  } catch (error) {
    console.error("Error analyzing website:", error);

    // Provide better error context based on error type
    let errorCode = 'UNKNOWN_ERROR';
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('timeout') || error.name === 'AbortError') {
        errorCode = 'TIMEOUT';
      } else if (message.includes('fetch') || message.includes('network') || message.includes('econnreset')) {
        errorCode = 'ECONNRESET';
      } else if (message.includes('parse') || message.includes('json')) {
        errorCode = 'PARSE_ERROR';
      }
    }

    const errorResponse = createErrorResponse(
      errorCode,
      ErrorContext.WEBSITE_ANALYSIS,
      500
    );
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}
