/**
 * Scraper utility for calling the internal scrape service
 */

import OpenAI from "openai";

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

