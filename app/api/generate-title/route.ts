import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json() as { content?: string };
    if (!content || !content.trim()) {
      return new Response(JSON.stringify({ error: "Missing content" }), { status: 400 });
    }

    const prompt = `You are naming a new conversation (a flow) for a chat app.
From the user's message below, create a short, specific title within 20 words.
Do not use quotes. Avoid generic words like Conversation, Chat, Flow. Return ONLY the title.

User message:
"""
${content}
"""`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You write concise, descriptive titles." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 60,
    });

    const title = completion.choices[0]?.message?.content?.trim() || "New Flow";
    // hard trim to 20 words as safeguard
    const safeTitle = title.split(/\s+/).slice(0, 20).join(" ").slice(0, 120);

    return new Response(JSON.stringify({ title: safeTitle }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-title error", e);
    return new Response(JSON.stringify({ error: "Failed to generate title" }), { status: 500 });
  }
}


