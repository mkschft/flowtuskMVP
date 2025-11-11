import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Streaming timeout: 40 seconds
const STREAM_TIMEOUT_MS = 40000;

export async function POST(req: NextRequest) {
  try {
    const { messages, landingPage, websiteUrl, icp } = await req.json() as {
      messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
      landingPage?: Record<string, unknown>;
      websiteUrl?: string;
      icp?: Record<string, unknown>;
    };

    console.log('💬 [Chat] Starting streaming response');

  const systemPrompt = `You are an expert landing page designer helping refine a landing page for ${icp?.title || "a target audience"}.

Current landing page:
- Headline: ${landingPage?.headline || "None"}
- Subheadline: ${landingPage?.subheadline || "None"}
- CTA: ${landingPage?.cta || "None"}
- Features: ${Array.isArray(landingPage?.features) ? landingPage.features.map((f: Record<string, unknown>) => f.title).join(", ") : "None"}
- Website: ${websiteUrl}

When the user asks to make changes, respond with a JSON object containing the updates. Format:
{
  "message": "Brief explanation of changes",
  "updates": {
    "headline": "new headline" (optional),
    "subheadline": "new subheadline" (optional),
    "cta": "new cta" (optional),
    "testimonial": { "quote": "...", "author": "...", "role": "...", "company": "..." } (optional),
    "features": [{ "title": "...", "description": "..." }] (optional),
    "problemSolution": { "problems": [...], "solution": "..." } (optional),
    "stats": [{ "value": "...", "label": "..." }] (optional)
  }
}

Only include fields that need updating. Be conversational in your message.`;

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
      temperature: 0.7,
    });

    // Create a ReadableStream with timeout
    const encoder = new TextEncoder();
    const streamStartTime = Date.now();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const timeoutId = setTimeout(() => {
            const elapsed = Date.now() - streamStartTime;
            console.warn(`⚠️ [Chat] Stream timeout after ${elapsed}ms`);
            controller.enqueue(
              encoder.encode("\n\n[Response ended due to timeout. Please try again.]")
            );
            controller.close();
          }, STREAM_TIMEOUT_MS);

          for await (const chunk of stream) {
            // Check if we've exceeded timeout
            if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
              clearTimeout(timeoutId);
              controller.enqueue(
                encoder.encode("\n\n[Response truncated due to timeout.]")
              );
              controller.close();
              return;
            }

            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }

          clearTimeout(timeoutId);
          controller.close();

          const elapsed = Date.now() - streamStartTime;
          console.log(`✅ [Chat] Stream completed in ${elapsed}ms`);
        } catch (error) {
          console.error('❌ [Chat] Stream error:', error);
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
  } catch (error) {
    console.error('❌ [Chat] Request error:', error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
