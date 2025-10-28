import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { messages, landingPage, websiteUrl, icp } = await req.json() as {
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
    landingPage?: Record<string, unknown>;
    websiteUrl?: string;
    icp?: Record<string, unknown>;
  };

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

  // Create a ReadableStream
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (error) {
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
}
