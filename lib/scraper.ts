export interface ScrapeResult {
  markdown: string;
  metadata: {
    title?: string;
    description?: string;
    url: string;
    heroImage?: string | null;
  };
}

/**
 * Scrape website using Jina AI Reader, formatted by OpenAI
 * Falls back to direct fetch if Jina fails
 */
export async function scrapeWebsite(
  url: string,
  options?: {
    include_text?: boolean;
    include_links?: boolean;
    include_images?: boolean;
    timeout?: number;
  }
): Promise<ScrapeResult> {
  console.log(`🔍 [Scraper] Starting scrape for: ${url}`);

  // Primary: Jina AI Reader (fast, reliable, free)
  try {
    console.log("📡 [Scraper] Using Jina AI Reader...");
    // Add query params to optimize response size and speed
    const jinaUrl = new URL(`https://r.jina.ai/${url}`);
    jinaUrl.searchParams.set('max-length', '12000'); // Limit response size for faster processing
    
    const response = await fetch(jinaUrl.toString(), {
      headers: {
        Accept: "text/markdown",
        "X-Return-Format": "markdown",
      },
      signal: AbortSignal.timeout(15000), // Reduced from 30s - fail fast for slow sites
    });

    if (response.ok) {
      const rawMarkdown = await response.text();
      console.log(`✅ [Scraper] Jina success: ${rawMarkdown.length} chars`);

      // Jina AI already returns clean markdown - no additional formatting needed
      // Truncate early to prevent processing huge responses
      const MAX_SCRAPE_LENGTH = 12000; // Keep slightly larger than analyze-website truncation
      const markdown = rawMarkdown.length > MAX_SCRAPE_LENGTH 
        ? rawMarkdown.substring(0, MAX_SCRAPE_LENGTH) + '\n\n[Content truncated for performance]'
        : rawMarkdown;

      return {
        markdown,
        metadata: {
          url,
          title: undefined,
          description: undefined,
          heroImage: null,
        },
      };
    } else {
      console.error(
        `❌ [Scraper] Jina failed with status: ${response.status}`
      );
    }
  } catch (error) {
    console.error("❌ [Scraper] Jina failed:", error);
  }

  // Last resort: Direct fetch and extract text
  try {
    console.log("📡 [Scraper] Attempting direct fetch fallback...");
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FlowtuskBot/1.0; +https://flowtusk.com)",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      const html = await response.text();
      // Simple text extraction (remove HTML tags)
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 10000);

      console.log(`✅ [Scraper] Direct fetch success: ${text.length} chars`);

      return {
        markdown: text,
        metadata: {
          url,
          title: undefined,
          description: undefined,
          heroImage: null,
        },
      };
    }
  } catch (error) {
    console.error("❌ [Scraper] Direct fetch failed:", error);
  }

  // All methods failed
  console.error("❌ [Scraper] All scraping methods failed for:", url);
  throw new Error(
    "Failed to scrape website. Please check the URL and try again."
  );
}

/**
 * Stream scraping results for real-time updates (optional)
 */
export async function* streamScrapeWebsite(
  url: string
): AsyncGenerator<string> {
  // First get the content
  const result = await scrapeWebsite(url);

  // Stream it back in chunks for UI updates
  const chunks = result.markdown.split("\n\n");
  for (const chunk of chunks) {
    yield chunk + "\n\n";
    await new Promise((resolve) => setTimeout(resolve, 50)); // Smooth streaming
  }
}

