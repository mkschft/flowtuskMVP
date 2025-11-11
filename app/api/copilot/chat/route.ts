import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cost control: 30 second timeout, gpt-4o-mini model
const STREAM_TIMEOUT_MS = 30000;
const MAX_REGENERATIONS = 4;

export async function POST(req: NextRequest) {
  try {
    const { messages, project, regenerationCount = 0 } = await req.json() as {
      messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
      project?: {
        name: string;
        colors?: string[];
        fonts?: { heading?: string; body?: string };
      };
      regenerationCount?: number;
    };

    // Enforce regeneration limit
    if (regenerationCount >= MAX_REGENERATIONS) {
      return new Response(
        JSON.stringify({ 
          error: "Regeneration limit reached. Start a new conversation to continue.",
          limitReached: true 
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`💬 [Copilot] Chat request (${regenerationCount}/${MAX_REGENERATIONS})`);

    // Minimal system prompt for cost efficiency
    const systemPrompt = `You are a design assistant for "${project?.name || "a project"}".

Current brand:
- Colors: ${project?.colors?.slice(0, 3).join(", ") || "Not set"}
- Fonts: ${project?.fonts?.heading || "Not set"} / ${project?.fonts?.body || "Not set"}

When user requests changes, respond with:
1. A brief message explaining the change
2. JSON with updates in this format:
{
  "updates": {
    "colors": ["#hex1", "#hex2", "#hex3"],
    "fonts": { "heading": "Font Name", "body": "Font Name" },
    "headline": "New headline text",
    "subheadline": "New subheadline",
    "tone": "professional|creative|bold"
  }
}

Only include fields that change. Keep responses under 150 words.`;

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        // Only keep last 4 messages for cost control
        ...messages.slice(-4),
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 500, // Cost control
    });

    // Streaming with timeout
    const encoder = new TextEncoder();
    const streamStartTime = Date.now();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const timeoutId = setTimeout(() => {
            console.warn(`⚠️ [Copilot] Stream timeout`);
            controller.enqueue(
              encoder.encode("\n\n[Response ended. Please try again.]")
            );
            controller.close();
          }, STREAM_TIMEOUT_MS);

          for await (const chunk of stream) {
            if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
              clearTimeout(timeoutId);
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
          console.log(`✅ [Copilot] Completed in ${elapsed}ms`);
        } catch (error) {
          console.error('❌ [Copilot] Stream error:', error);
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
    console.error('❌ [Copilot] Request error:', error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
