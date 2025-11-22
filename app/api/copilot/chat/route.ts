import { NextRequest } from "next/server";
import OpenAI from "openai";
import { fetchBrandManifest, updateBrandManifest } from "@/lib/brand-manifest";
import { BrandManifest } from "@/lib/types/brand-manifest";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const STREAM_TIMEOUT_MS = 40000;
const MAX_REGENERATIONS = 15; // Increased for longer sessions

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const { messages, flowId, icpId } = await req.json() as {
      messages: ChatMessage[];
      flowId: string;
      icpId: string;
    };

    // Fetch the FULL brand manifest
    // We use flowId to find the manifest. icpId is used for context if needed.
    const manifest = await fetchBrandManifest(flowId, icpId);

    if (!manifest) {
      return new Response(
        JSON.stringify({ error: "Brand manifest not found. Please generate a brand first." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const regenerationCount = manifest.metadata.regenerationCount || 0;

    if (regenerationCount >= MAX_REGENERATIONS) {
      return new Response(
        JSON.stringify({
          error: "You've reached the conversation limit for this session.",
          limitReached: true
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`💬 [Copilot] Chat request for flow ${flowId} (${regenerationCount}/${MAX_REGENERATIONS})`);

    const systemPrompt = buildMetaPrompt(manifest);

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "update_manifest",
          description: "Update the brand manifest based on user's needs and strategic recommendations.",
          parameters: {
            type: "object",
            properties: {
              updateType: {
                type: "string",
                enum: ["market_shift", "styling", "messaging", "refinement"],
                description: "The type of strategic update being applied."
              },
              updates: {
                type: "object",
                description: "Partial JSON object matching the Brand Manifest structure. Only include fields that need to change. Nested objects will be merged.",
                additionalProperties: true
              },
              reasoning: {
                type: "string",
                description: "Strategic explanation of why these changes work for their specific audience and industry."
              }
            },
            required: ["updateType", "updates", "reasoning"]
          }
        }
      }
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10),
      ],
      tools,
      tool_choice: "auto",
      stream: true,
      temperature: 0.8,
      max_tokens: 1000,
    });

    const encoder = new TextEncoder();
    const streamStartTime = Date.now();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const timeoutId = setTimeout(() => {
            console.warn(`⚠️ [Copilot] Stream timeout`);
            controller.close();
          }, STREAM_TIMEOUT_MS);

          let functionCallArgs = "";
          let hasFunctionCall = false;

          for await (const chunk of stream) {
            if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
              clearTimeout(timeoutId);
              controller.close();
              return;
            }

            const choice = chunk.choices[0];
            const content = choice?.delta?.content || "";

            if (content) {
              controller.enqueue(encoder.encode(content));
            }

            const toolCalls = choice?.delta?.tool_calls;
            if (toolCalls && toolCalls.length > 0) {
              const functionCall = toolCalls[0];
              if (functionCall.function?.arguments) {
                hasFunctionCall = true;
                functionCallArgs += functionCall.function.arguments;
              }
            }
          }

          if (hasFunctionCall && functionCallArgs) {
            try {
              console.log(`🔧 [Copilot] Function call args: ${functionCallArgs.substring(0, 100)}...`);
              const { updateType, updates, reasoning } = JSON.parse(functionCallArgs);

              // Apply updates to manifest
              const updatedManifest = await updateBrandManifest(flowId, updates, updateType);

              // Send function call result to frontend
              controller.enqueue(
                encoder.encode(`\n\n__MANIFEST_UPDATED__${JSON.stringify(updatedManifest)}`)
              );

              console.log(`✅ [Copilot] Manifest updated: ${updateType}`);
            } catch (err) {
              console.error('❌ [Copilot] Failed to apply manifest update:', err);
              controller.enqueue(encoder.encode(`\n\n[Error applying updates. Please try again.]`));
            }
          }

          clearTimeout(timeoutId);
          controller.close();
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
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function buildMetaPrompt(manifest: BrandManifest): string {
  return `You are BrandOS, a senior AI brand strategist with 15+ years of experience. Your goal is to help the user define, generate, and refine their brand identity in a friendly, expert, and conversational manner.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT BRAND STATE (Brand Manifest v${manifest.version})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<brandManifest>
${JSON.stringify(manifest, null, 2)}
</brandManifest>

This manifest contains:
- Strategy: Persona, value proposition, target audience
- Identity: Colors, typography, logo, tone of voice
- Components: Buttons, cards, inputs, spacing
- Previews: Landing page content
- History: ${manifest.metadata.generationHistory.length} previous changes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **Analyze the user's request:** Understand their intent. Are they asking for a new generation, a refinement, or just a question?

2. **Act as a Strategist:** Don't just follow orders. If the user's request might create brand inconsistency, gently challenge it with expert advice.
   Example: "Using yellow for a 'trustworthy' banking app might feel a bit too playful. How about a stable blue or green instead?"

3. **Formulate a Plan:** Briefly state what you are about to do in your conversational response.

4. **Generate the Output:** Create a JSON object (partial manifest) that updates ONLY the necessary fields.
   - Use the \`update_manifest\` tool.
   - Ensure your updates are consistent across all layers (e.g., if you change the primary color, consider if the button styles need adjustment).

5. **Provide a Conversational Response:** Add a friendly message confirming the change and explaining the strategic reasoning.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE WORKFLOWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **MARKET SHIFT** (updateType: "market_shift")
   - Triggers: Location change, country change, new target market.
   - ACTION: You MUST regenerate strategy.persona, strategy.valueProp, and previews.landingPage to match the new market.
   - CRITICAL: Do not leave references to the old location/market.

2. **STYLING** (updateType: "styling")
   - Triggers: Color changes, font changes, "make it pop", "more modern".
   - ACTION: Update identity.colors, identity.typography, identity.tone, and components.*.

3. **MESSAGING** (updateType: "messaging")
   - Triggers: Headline tweaks, tone adjustments.
   - ACTION: Update strategy.valueProp, identity.tone, previews.landingPage.

4. **REFINEMENT** (updateType: "refinement")
   - Triggers: Small tweaks.
   - ACTION: Surgical updates to specific fields.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- **Dual Output:** You must provide a conversational message AND call the \`update_manifest\` tool (if changes are needed).
- **Partial Updates:** The \`updates\` parameter should only contain the fields you want to change. Nested objects will be merged.
  - Example: \`{ "identity": { "colors": { "primary": [...] } } }\` will update primary colors but keep other identity fields.
- **Consistency:** Ensure the brand remains cohesive.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER'S REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}
