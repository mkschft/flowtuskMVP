import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json() as { message?: string };
        if (!message || !message.trim()) {
            return new Response(JSON.stringify({ error: "Missing message" }), { status: 400 });
        }

        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant. Respond to the user's message in a helpful and concise manner.",
                },
                { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: 1000,
            stream: true,
        });

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
                    console.error("Stream error:", error);
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
    } catch (e) {
        console.error("generate-ai-response error", e);
        return new Response(JSON.stringify({ error: "Failed to generate AI response" }), { status: 500 });
    }
}

