import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { buildAnalyzePrompt } from "@/lib/prompt-templates";
import { validateFactsJSON } from "@/lib/validators";
import { executeWithRetryAndTimeout } from "@/lib/api-handler";
import { createErrorResponse, ErrorContext } from "@/lib/error-mapper";
import { scrapeWebsite } from "@/lib/scraper";
import { getCachedScrape, setCachedScrape } from "@/lib/scrape-cache";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Normalize URL to ensure it has a protocol
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    console.log('🔍 [Analyze] Starting analysis for:', normalizedUrl);

    // ========================================================================
    // STEP 0: Check cache for recent scrape
    // ========================================================================
    const cached = getCachedScrape(normalizedUrl);
    if (cached) {
      console.log('⚡ [Analyze] Using cached scrape result');
      return NextResponse.json({
        content: cached.content,
        source: cached.source + ' (cached)',
        pages: 1,
        metadata: cached.metadata,
        factsJson: cached.factsJson,
        cached: true,
      });
    }

    // ========================================================================
    // STEP 1: Fetch website content (Webcrawler → Jina → Direct fallback)
    // ========================================================================
    let rawContent = "";
    let source = "jina";
    let metadata = {
      url: normalizedUrl,
      heroImage: null as string | null,
      faviconUrl: `${new URL(normalizedUrl).origin}/favicon.ico`,
    };

    // Try webcrawler scraper (includes fallbacks to Jina and direct fetch)
    try {
      const scrapeStartTime = Date.now();
      const scrapeResult = await scrapeWebsite(normalizedUrl, {
        include_text: true,
        include_links: true,
        include_images: false,
        timeout: 30,
      });

      rawContent = scrapeResult.markdown;
      metadata.heroImage = scrapeResult.metadata.heroImage || null;
      
      // Determine source based on result quality
      if (scrapeResult.metadata.title) {
        source = "webcrawler";
      } else {
        source = "jina";
      }

      const scrapeTime = Date.now() - scrapeStartTime;
      console.log(`✅ [Analyze] Scraping complete in ${scrapeTime}ms, source: ${source}, length: ${rawContent.length} chars`);
    } catch (scrapeError) {
      console.error('❌ [Analyze] All scraping methods failed:', scrapeError);
      return NextResponse.json(
        { 
          error: "Unable to access website. Please check the URL and try again.",
          details: "The website may be blocking automated access or taking too long to respond."
        }, 
        { status: 500 }
      );
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
        
        const hostname = new URL(normalizedUrl).hostname.replace(/\./g, "_");
        
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
    // STEP 4: Cache result for future requests
    // ========================================================================
    setCachedScrape(normalizedUrl, rawContent, metadata, factsJson, source);

    // ========================================================================
    // STEP 5: Return both Facts JSON and raw content
    // ========================================================================
    return NextResponse.json({
      content: rawContent, // Keep for fallback
      source,
      pages: 1,
      metadata,
      factsJson, // Structured facts for reuse
      cached: false,
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
