import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: {
        Accept: "text/markdown",
        "X-Return-Format": "markdown",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (response.ok) {
      const rawMarkdown = await response.text();
      console.log(`✅ [Scraper] Jina success: ${rawMarkdown.length} chars`);

      // Use OpenAI to clean up and format the markdown for better analysis
      try {
        const systemPrompt = `You are a professional business analyst. Format the scraped website content into clean, structured markdown optimized for analysis. Focus on:
- What the company/product does (core offering)
- Key features and benefits
- Target customers and use cases
- Value propositions
- Pricing/business model (if mentioned)

Write in third person, be concise but comprehensive. Remove navigation, footers, and irrelevant content. Preserve all substantive business information.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Website: ${url}\n\nRaw scraped content:\n${rawMarkdown.slice(0, 10000)}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 3000,
        });

        const formattedMarkdown =
          completion.choices[0]?.message?.content || rawMarkdown;

        console.log(`✅ [Scraper] OpenAI formatting complete: ${formattedMarkdown.length} chars`);

        return {
          markdown: formattedMarkdown,
          metadata: {
            url,
            title: undefined,
            description: undefined,
            heroImage: null,
          },
        };
      } catch (aiError) {
        console.warn(
          "⚠️ [Scraper] OpenAI formatting failed, using raw Jina output:",
          aiError
        );
        return {
          markdown: rawMarkdown,
          metadata: {
            url,
            title: undefined,
            description: undefined,
            heroImage: null,
          },
        };
      }
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

