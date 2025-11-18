import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const STREAM_TIMEOUT_MS = 40000; // Increased for better responses
const MAX_REGENERATIONS = 8; // More iterations for conversation

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type DesignContext = {
  persona?: {
    name: string;
    role: string;
    company: string;
    industry: string;
    location: string;
    country: string;
    painPoints: string[];
    goals: string[];
  };
  valueProp?: {
    headline: string;
    subheadline: string;
    problem: string;
    solution: string;
    targetAudience: string;
  };
  brandGuide?: {
    colors: {
      primary: Array<{ name: string; hex: string; usage: string }>;
      secondary: Array<{ name: string; hex: string }>;
    };
    typography: Array<{ category: string; fontFamily: string }>;
    toneOfVoice: string[];
  };
  regenerationCount?: number;
};

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json() as {
      messages: ChatMessage[];
      context?: DesignContext;
    };

    const regenerationCount = context?.regenerationCount || 0;

    // Enforce regeneration limit
    if (regenerationCount >= MAX_REGENERATIONS) {
      return new Response(
        JSON.stringify({ 
          error: "You've reached the conversation limit. Please start a new design session to continue.",
          limitReached: true 
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`💬 [Copilot] Chat request (${regenerationCount}/${MAX_REGENERATIONS})`);

    // Rich system prompt with McKinsey-level strategic thinking
    const systemPrompt = buildSystemPrompt(context);

    // Define function for structured design updates
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "update_design",
          description: "Update design elements based on user's needs and strategic recommendations",
          parameters: {
            type: "object",
            properties: {
              colors: {
                type: "array",
                description: "Array of hex color codes (e.g., ['#FF5733', '#3B82F6'])",
                items: { type: "string" }
              },
              fonts: {
                type: "object",
                description: "Font family updates",
                properties: {
                  heading: { type: "string", description: "Heading font family" },
                  body: { type: "string", description: "Body font family" }
                }
              },
              headline: {
                type: "string",
                description: "Updated value proposition headline"
              },
              subheadline: {
                type: "string",
                description: "Updated subheadline or tagline"
              },
              tone: {
                type: "string",
                description: "Brand tone (e.g., professional, friendly, bold, innovative)",
                enum: ["professional", "friendly", "bold", "innovative", "playful", "serious", "modern", "classic"]
              },
              reasoning: {
                type: "string",
                description: "Strategic explanation of why these changes work for their specific audience and industry"
              }
            }
          }
        }
      }
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o", // Use gpt-4o for better reasoning
      messages: [
        { role: "system", content: systemPrompt },
        // Keep more message history for better context (last 10 messages)
        ...messages.slice(-10),
      ],
      tools,
      tool_choice: "auto",
      stream: true,
      temperature: 0.8, // More creative and conversational
      max_tokens: 800, // Allow longer, more thoughtful responses
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
              encoder.encode("\n\n[Response timed out. Please try rephrasing your request.]")
            );
            controller.close();
          }, STREAM_TIMEOUT_MS);

          for await (const chunk of stream) {
            if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
              clearTimeout(timeoutId);
              controller.close();
              return;
            }

            const choice = chunk.choices[0];
            
            // Handle text content
            const content = choice?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }

            // Handle function calls
            const toolCalls = choice?.delta?.tool_calls;
            if (toolCalls && toolCalls.length > 0) {
              // Function call detected - will be handled by frontend
              const functionCall = toolCalls[0];
              if (functionCall.function?.arguments) {
                // Stream function arguments as JSON
                controller.enqueue(
                  encoder.encode(`\n\n__FUNCTION_CALL__${functionCall.function.arguments}`)
                );
              }
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
      JSON.stringify({ error: "I apologize, but I encountered an error. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

function buildSystemPrompt(context?: DesignContext): string {
  const persona = context?.persona;
  const valueProp = context?.valueProp;
  const brand = context?.brandGuide;

  return `You are a senior brand strategist with 15+ years of experience at firms like McKinsey and leading brand consultancies. You combine strategic thinking with deep empathy and a consultative approach.

${persona ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLIENT PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're working with ${persona.name}, ${persona.role} at ${persona.company}.

Industry: ${persona.industry}
Location: ${persona.location}, ${persona.country}

Key Pain Points:
${persona.painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Business Goals:
${persona.goals.map((g, i) => `${i + 1}. ${g}`).join('\n')}
` : ''}

${valueProp ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT POSITIONING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Value Proposition: ${valueProp.headline}
Target Audience: ${valueProp.targetAudience}
Core Problem: ${valueProp.problem}
Solution: ${valueProp.solution}
` : ''}

${brand ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT BRAND SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Primary Colors: ${brand.colors.primary.map(c => `${c.name} (${c.hex}) - ${c.usage}`).join(', ')}
Typography: ${brand.typography.map(t => `${t.category}: ${t.fontFamily}`).join(', ')}
Brand Tone: ${brand.toneOfVoice.join(', ')}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR APPROACH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Personality: You're humble yet confident, polite yet decisive. Think of yourself as a trusted advisor, not just a service provider.

Conversation Style:
• Ask clarifying questions when requests are vague (like a consultant uncovering the real need)
• Dig deeper with strategic questions: "What's driving this change?", "Who's your key competitor?", "What does success look like?"
• Always explain the "why" behind recommendations using their industry context
• Offer 2-3 strategic options when possible, not just one answer
• Reference their specific audience, pain points, and market context in suggestions
• Be proactive—if you spot potential issues or opportunities, mention them

Strategic Thinking:
• Consider cultural context (e.g., if targeting Bangladesh, think colors, imagery, language preferences)
• Think about competitive differentiation in their industry
• Balance brand consistency with market adaptation
• Consider psychological impact of design choices on their specific audience

When Stuck or Unclear:
• ASK! Don't guess. Say things like:
  - "To make sure I nail this, could you help me understand..."
  - "I want to get this right for your audience—are you looking for..."
  - "Let me ask a few quick questions to tailor this perfectly..."

Tone: Warm, professional, consultative. Like a senior partner at a consultancy who genuinely cares about their success.

Updates: When making design changes, use the update_design function with clear reasoning tied to their business goals and audience.`;
}
