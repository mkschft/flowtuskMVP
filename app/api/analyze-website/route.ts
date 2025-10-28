import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log('🔍 [Analyze] Starting analysis for:', url);

    // Use Firecrawl only if explicitly enabled (it's slower but more comprehensive)
    // Set FIRECRAWL_ENABLED=true in .env.local to enable
    if (process.env.FIRECRAWL_API_KEY && process.env.FIRECRAWL_ENABLED === 'true') {
      console.log('🔥 [Analyze] Using Firecrawl');
      const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

      // Crawl only key pages for faster results
      const crawlResult = await firecrawl.crawlUrl(url, {
        limit: 3, // Only 3 pages (landing, about, team) for speed
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

        // Truncate if too large (keep first 15k chars for speed)
        const MAX_CONTENT_LENGTH = 15000;
        if (fullMarkdown.length > MAX_CONTENT_LENGTH) {
          console.log(`⚡ [Analyze] Truncating content: ${fullMarkdown.length} → ${MAX_CONTENT_LENGTH} chars`);
          fullMarkdown = fullMarkdown.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated for performance]';
        }

        console.log(`📊 [Analyze] Content size: ${fullMarkdown.length} chars`);

        // Extract metadata from Firecrawl
        const firstPage = crawlResult.data?.[0];
        const metadata = {
          heroImage: firstPage?.metadata?.ogImage || null,
          faviconUrl: `${new URL(url).origin}/favicon.ico`,
        };

        console.log('🖼️ [Analyze] Metadata:', { 
          heroImage: metadata.heroImage ? 'found' : 'not found',
          pages: crawlResult.data?.length 
        });

        // Optional: Save to file system only in development
        if (process.env.NODE_ENV === 'development') {
          try {
            const blueprintsDir = join(process.cwd(), "blueprints");
            await mkdir(blueprintsDir, { recursive: true });
            
            const filename = new URL(url).hostname.replace(/\./g, "_") + ".md";
            const filepath = join(blueprintsDir, filename);
            
            await writeFile(filepath, fullMarkdown, "utf-8");
            console.log('💾 [Analyze] Saved blueprint:', filename);
          } catch (err) {
            console.warn('⚠️ [Analyze] Failed to save blueprint:', err);
          }
        }

        return NextResponse.json({
          content: fullMarkdown,
          source: "firecrawl",
          pages: crawlResult.data?.length || 0,
          metadata,
        });
      }
    }

    // Fallback to Jina AI Reader
    console.log('🌐 [Analyze] Using Jina AI Reader (fast mode)');
    const jinaUrl = `https://r.jina.ai/${url}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // Reduced to 20s timeout
    
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

    if (!response.ok) {
      throw new Error("Failed to fetch website content");
    }

    const data = await response.json();
    let content = data.data?.content || "";
    
    // Truncate content for faster processing (10k chars is plenty for ICP generation)
    const MAX_CONTENT_LENGTH = 10000;
    if (content.length > MAX_CONTENT_LENGTH) {
      console.log(`⚡ [Analyze] Truncating content: ${content.length} → ${MAX_CONTENT_LENGTH} chars`);
      content = content.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated for performance]';
    }

    console.log(`📊 [Analyze] Final content size: ${content.length} chars`);

    // Extract visual metadata from Jina response
    const metadata = {
      heroImage: data.data?.images?.[0] || null, // First image if available
      faviconUrl: `${new URL(url).origin}/favicon.ico`,
    };

    // Try to extract Open Graph image from content
    const ogImageMatch = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
    if (ogImageMatch && ogImageMatch[1]) {
      metadata.heroImage = ogImageMatch[1];
    }

    console.log('🖼️ [Analyze] Metadata extracted:', {
      heroImage: metadata.heroImage ? 'found' : 'not found',
      images: data.data?.images?.length || 0
    });

    // Optional: Save Jina result only in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const blueprintsDir = join(process.cwd(), "blueprints");
        await mkdir(blueprintsDir, { recursive: true });
        
        const filename = new URL(url).hostname.replace(/\./g, "_") + "_jina.md";
        const filepath = join(blueprintsDir, filename);
        
        await writeFile(filepath, content, "utf-8");
        console.log('💾 [Analyze] Saved blueprint:', filename);
      } catch (err) {
        console.warn('⚠️ [Analyze] Failed to save blueprint:', err);
      }
    }

    console.log('✅ [Analyze] Analysis complete');

    return NextResponse.json({
      content,
      source: "jina",
      pages: 1,
      metadata,
    });
  } catch (error) {
    console.error("Error analyzing website:", error);
    return NextResponse.json(
      { error: "Failed to analyze website" },
      { status: 500 }
    );
  }
}
