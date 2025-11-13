/**
 * Scraper utility for calling the internal scrape service
 */

import OpenAI from "openai";
import webcrawlerapi from "webcrawlerapi-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Scraper service URL - can be configured via environment variable
// Defaults to localhost:5001 (where the Flask scraper service runs)
const SCRAPER_SERVICE_URL =
  process.env.SCRAPER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_SCRAPER_SERVICE_URL ||
  'http://localhost:5001';

export interface ScrapeResult {
  markdown: string;
  metadata: {
    title?: string;
    description?: string;
    url: string;
    heroImage?: string | null;
  };
}

export interface ScrapeChunk {
  type: 'status' | 'metadata' | 'text' | 'links' | 'images' | 'structured_data' | 'done' | 'error';
  message?: string;
  data?: any;
  chunk?: string;
  index?: number;
  total_chunks?: number;
  count?: number;
}

/**
 * Scrape a website using the internal scrape service (synchronous)
 * Uses OpenAI to format the content into clean markdown
 */
export async function scrapeWebsite(url: string, options?: {
  include_text?: boolean;
  include_links?: boolean;
  include_images?: boolean;
  timeout?: number;
}): Promise<ScrapeResult> {
  try {
    // Get raw scraped data
    const response = await fetch(`${SCRAPER_SERVICE_URL}/scrape/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        options: {
          include_text: options?.include_text ?? true,
          include_links: options?.include_links ?? true,
          include_images: options?.include_images ?? false,
          timeout: options?.timeout ?? 30,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Scrape service error: ${error}`);
    }

    const result = await response.json();

    if (result.status !== 'success' || !result.data) {
      throw new Error('Invalid response from scrape service');
    }

    // Extract metadata
    const metadataChunk = result.data.find((chunk: ScrapeChunk) => chunk.type === 'metadata');
    const metadata = {
      title: metadataChunk?.data?.title || null,
      description: metadataChunk?.data?.description || null,
      url: url,
      heroImage: metadataChunk?.data?.heroImage || null,
      language: metadataChunk?.data?.language || null,
    };

    // Convert raw chunks to text for OpenAI
    const rawContent = convertChunksToRawText(result.data);

    // Use OpenAI to format into clean markdown
    const systemPrompt = `You are an expert analyst explaining what a website is about. Format the scraped website content into professional markdown that explains the website's purpose, features, and content.

Rules:
- Write in third person (avoid "I", "we", "our", "us")
- Act as an expert explaining the website objectively
- Use clear headings and hierarchy
- Organize content into logical sections
- Include proper paragraph breaks
- Preserve all important information
- Write as if explaining to someone what this website does and offers

Make it readable, well-structured, and informative while maintaining all important content.`;

    const userPrompt = `Website: ${url}
Title: ${metadata.title || 'Unknown'}
Description: ${metadata.description || 'No description'}

Raw scraped content:
${rawContent}

Format this into clean, well-structured markdown that explains what this website is about. Write as an expert analyst describing the website objectively in third person. Include:
1. A main title with the website title
2. An overview section explaining what the website does and its purpose
3. Well-organized content sections with proper headings explaining features, services, or content
4. Links section if available (explain what they link to)
5. Images section if available (describe what they show)
6. Any structured data in a readable format

Write in third person perspective. Avoid using "I", "we", "our", "us", or "my". Instead, describe the website as an external expert would. For example, say "The website offers..." instead of "We offer..." or "The company provides..." instead of "We provide...".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for consistent formatting
    });

    const markdown = completion.choices[0]?.message?.content || '';

    return {
      markdown,
      metadata,
    };
  } catch (error) {
    console.error('Error scraping website:', error);
    throw error;
  }
}

/**
 * Convert scrape chunks to markdown format
 */
function convertChunksToMarkdown(chunks: ScrapeChunk[]): string {
  let markdown = '';

  // Extract metadata
  const metadataChunk = chunks.find(chunk => chunk.type === 'metadata');
  if (metadataChunk?.data) {
    const { title, description } = metadataChunk.data;
    if (title) {
      markdown += `# ${title}\n\n`;
    }
    if (description) {
      markdown += `${description}\n\n`;
    }
  }

  // Combine text chunks
  const textChunks = chunks
    .filter(chunk => chunk.type === 'text')
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .map(chunk => chunk.chunk || '');

  if (textChunks.length > 0) {
    markdown += textChunks.join(' ') + '\n\n';
  }

  // Add links section if available
  const linksChunk = chunks.find(chunk => chunk.type === 'links');
  if (linksChunk?.data && Array.isArray(linksChunk.data) && linksChunk.data.length > 0) {
    markdown += '## Links\n\n';
    linksChunk.data.slice(0, 20).forEach((link: any) => {
      if (link.text && link.url) {
        markdown += `- [${link.text}](${link.url})\n`;
      }
    });
    markdown += '\n';
  }

  // Add images section if available
  const imagesChunk = chunks.find(chunk => chunk.type === 'images');
  if (imagesChunk?.data && Array.isArray(imagesChunk.data) && imagesChunk.data.length > 0) {
    markdown += '## Images\n\n';
    imagesChunk.data.slice(0, 10).forEach((img: any) => {
      if (img.url) {
        markdown += `![${img.alt || ''}](${img.url})\n`;
      }
    });
    markdown += '\n';
  }

  // Add structured data if available
  const structuredChunk = chunks.find(chunk => chunk.type === 'structured_data');
  if (structuredChunk?.data && Array.isArray(structuredChunk.data)) {
    markdown += '## Structured Data\n\n';
    structuredChunk.data.forEach((item: any) => {
      if (item.data) {
        markdown += '```json\n' + JSON.stringify(item.data, null, 2) + '\n```\n\n';
      }
    });
  }

  return markdown.trim();
}

/**
 * Stream scrape results from the scrape service, formatted by OpenAI
 */
export async function* streamScrapeWebsite(url: string, options?: {
  include_text?: boolean;
  include_links?: boolean;
  include_images?: boolean;
  timeout?: number;
}): AsyncGenerator<string> {
  try {
    // First, get all scraped data synchronously
    const response = await fetch(`${SCRAPER_SERVICE_URL}/scrape/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        options: {
          include_text: options?.include_text ?? true,
          include_links: options?.include_links ?? true,
          include_images: options?.include_images ?? false,
          timeout: options?.timeout ?? 30,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Scrape service error: ${error}`);
    }

    const result = await response.json();

    if (result.status !== 'success' || !result.data) {
      throw new Error('Invalid response from scrape service');
    }

    // Convert raw chunks to a basic structure for OpenAI
    const rawContent = convertChunksToRawText(result.data);
    const metadataChunk = result.data.find((chunk: ScrapeChunk) => chunk.type === 'metadata');
    const metadata = metadataChunk?.data || {};

    // Use OpenAI to format the scraped content into clean markdown
    const systemPrompt = `You are an expert analyst explaining what a website is about. Format the scraped website content into professional markdown that explains the website's purpose, features, and content.

Rules:
- Write in third person (avoid "I", "we", "our", "us")
- Act as an expert explaining the website objectively
- Use clear headings and hierarchy
- Organize content into logical sections
- Include proper paragraph breaks
- Preserve all important information
- Write as if explaining to someone what this website does and offers

Make it readable, well-structured, and informative while maintaining all important content.`;

    const userPrompt = `Website: ${url}
Title: ${metadata.title || 'Unknown'}
Description: ${metadata.description || 'No description'}

Raw scraped content:
${rawContent}

Format this into clean, well-structured markdown that explains what this website is about. Write as an expert analyst describing the website objectively in third person. Include:
1. A main title with the website title
2. An overview section explaining what the website does and its purpose
3. Well-organized content sections with proper headings explaining features, services, or content
4. Links section if available (explain what they link to)
5. Images section if available (describe what they show)
6. Any structured data in a readable format

Write in third person perspective. Avoid using "I", "we", "our", "us", or "my". Instead, describe the website as an external expert would. For example, say "The website offers..." instead of "We offer..." or "The company provides..." instead of "We provide...".`;

    // Stream OpenAI response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      temperature: 0.3, // Lower temperature for consistent formatting
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('Error streaming scrape with OpenAI formatting:', error);
    throw error;
  }
}

/**
 * Convert scrape chunks to raw text for OpenAI processing
 */
function convertChunksToRawText(chunks: ScrapeChunk[]): string {
  let text = '';

  // Extract metadata
  const metadataChunk = chunks.find(chunk => chunk.type === 'metadata');
  if (metadataChunk?.data) {
    text += `Metadata: ${JSON.stringify(metadataChunk.data, null, 2)}\n\n`;
  }

  // Combine text chunks
  const textChunks = chunks
    .filter(chunk => chunk.type === 'text')
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .map(chunk => chunk.chunk || '');

  if (textChunks.length > 0) {
    text += `Content:\n${textChunks.join(' ')}\n\n`;
  }

  // Add links
  const linksChunk = chunks.find(chunk => chunk.type === 'links');
  if (linksChunk?.data && Array.isArray(linksChunk.data) && linksChunk.data.length > 0) {
    text += `Links (${linksChunk.data.length} total):\n`;
    linksChunk.data.slice(0, 20).forEach((link: any) => {
      if (link.text && link.url) {
        text += `- ${link.text}: ${link.url}\n`;
      }
    });
    text += '\n';
  }

  // Add images
  const imagesChunk = chunks.find(chunk => chunk.type === 'images');
  if (imagesChunk?.data && Array.isArray(imagesChunk.data) && imagesChunk.data.length > 0) {
    text += `Images (${imagesChunk.data.length} total):\n`;
    imagesChunk.data.slice(0, 10).forEach((img: any) => {
      if (img.url) {
        text += `- ${img.alt || 'Image'}: ${img.url}\n`;
      }
    });
    text += '\n';
  }

  // Add structured data
  const structuredChunk = chunks.find(chunk => chunk.type === 'structured_data');
  if (structuredChunk?.data && Array.isArray(structuredChunk.data)) {
    text += `Structured Data:\n${JSON.stringify(structuredChunk.data, null, 2)}\n\n`;
  }

  return text.trim();
}

/**
 * Crawl a website using webcrawlerapi
 */
export async function crawlWebsiteWithWebcrawler(url: string, options?: {
  items_limit?: number;
  allow_subdomains?: boolean;
  respect_robots_txt?: boolean;
}): Promise<ScrapeResult> {
  try {
    const apiKey = process.env.WEBCRAWLER_API_KEY;
    const client = new webcrawlerapi.WebcrawlerClient(apiKey as string);

    // Start crawl job
    const response = await client.crawl({
      url: url,
      scrape_type: "markdown",
      items_limit: options?.items_limit || 10,
      allow_subdomains: options?.allow_subdomains ?? false,
      respect_robots_txt: options?.respect_robots_txt ?? false,
    });

    // Wait for job to complete
    let jobStatus = response.status;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5 second intervals)
    let currentResponse = response;

    while (jobStatus !== "done" && jobStatus !== "failed" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      // Check job status - try getJob if available
      try {
        if (typeof (client as any).getJob === 'function') {
          currentResponse = await (client as any).getJob(response.id);
          jobStatus = currentResponse.status;
        } else {
          // If getJob doesn't exist, check if response already has job_items (might be done)
          if (response.job_items && response.job_items.length > 0) {
            // Check if all items are done
            const allDone = response.job_items.every((item: any) => item.status === "done");
            if (allDone) {
              jobStatus = "done";
              currentResponse = response;
              break;
            }
          }
          // If we can't check status, wait a bit more
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (err) {
        // If status check fails, check if we have job_items already
        if (response.job_items && response.job_items.length > 0) {
          const allDone = response.job_items.every((item: any) => item.status === "done");
          if (allDone) {
            jobStatus = "done";
            currentResponse = response;
            break;
          }
        }
        console.warn("Could not check job status:", err);
      }
      attempts++;
    }

    if (jobStatus !== "done") {
      throw new Error(`Crawl job failed or timed out. Status: ${jobStatus}`);
    }

    // Get content from all job items
    const markdownParts: string[] = [];
    const metadata: {
      title?: string;
      description?: string;
      url: string;
      heroImage?: string | null;
    } = {
      url: url,
    };

    for (const item of currentResponse.job_items || []) {
      if (item.status === "done" && item.getContent) {
        try {
          const content = await item.getContent();
          if (content) {
            markdownParts.push(`## ${item.title || item.original_url}\n\n${content}\n\n`);

            // Use first item's title as metadata
            if (!metadata.title && item.title) {
              metadata.title = item.title;
            }
          }
        } catch (err) {
          console.error(`Error getting content for ${item.original_url}:`, err);
        }
      }
    }

    const markdown = markdownParts.length > 0
      ? markdownParts.join("\n---\n\n")
      : `# ${url}\n\nNo content extracted from this URL.`;

    return {
      markdown,
      metadata,
    };
  } catch (error) {
    console.error('Error crawling website with webcrawlerapi:', error);
    throw error;
  }
}

/**
 * Stream crawl results from webcrawlerapi
 */
export async function* streamCrawlWebsite(url: string, options?: {
  items_limit?: number;
  allow_subdomains?: boolean;
  respect_robots_txt?: boolean;
}): AsyncGenerator<string> {
  try {
    const apiKey = process.env.WEBCRAWLER_API_KEY || "dc30cffa71d79742b2d4";
    const client = new webcrawlerapi.WebcrawlerClient(apiKey);

    // Start crawl job
    const response = await client.crawl({
      url: url,
      scrape_type: "markdown",
      items_limit: options?.items_limit || 10,
      allow_subdomains: options?.allow_subdomains ?? false,
      respect_robots_txt: options?.respect_robots_txt ?? false,
    });

    // Stream status update
    yield `\n\n**Crawling ${url}...**\n\n`;
    yield `Job ID: ${response.id}\n`;
    yield `Status: ${response.status}\n\n`;

    // Wait for job to complete
    let jobStatus = response.status;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    let currentResponse = response;
    while (jobStatus !== "done" && jobStatus !== "failed" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      try {
        if (typeof (client as any).getJob === 'function') {
          currentResponse = await (client as any).getJob(response.id);
        } else {
          // Fallback: assume done if we can't check status
          break;
        }
        jobStatus = currentResponse.status;
      } catch (err) {
        console.warn("Could not check job status:", err);
        break;
      }
      attempts++;

      yield `Waiting for crawl to complete... (${attempts * 5}s)\n`;
    }

    if (jobStatus !== "done") {
      yield `\n\n**Error:** Crawl job failed or timed out. Status: ${jobStatus}\n\n`;
      return;
    }

    yield `\n**Crawl completed!** Extracting content from ${currentResponse.job_items?.length || 0} pages...\n\n`;

    // Stream content from each job item
    for (const item of currentResponse.job_items || []) {
      if (item.status === "done" && item.getContent) {
        try {
          yield `\n### ${item.title || item.original_url}\n\n`;

          const content = await item.getContent();
          if (content) {
            // Stream content in chunks
            const chunkSize = 500;
            for (let i = 0; i < content.length; i += chunkSize) {
              yield content.substring(i, i + chunkSize);
            }
            yield "\n\n---\n\n";
          }
        } catch (err) {
          yield `\n**Error:** Failed to get content from ${item.original_url}\n\n`;
        }
      }
    }
  } catch (error) {
    console.error('Error streaming crawl with webcrawlerapi:', error);
    yield `\n\n**Error:** ${error instanceof Error ? error.message : String(error)}\n\n`;
  }
}

