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

    const regenerationCount = manifest.metadata?.regenerationCount || 0;

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
      max_tokens: 4000, // Increased for market_shift updates which require extensive content
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
              console.log(`🔧 [Copilot] Function call args received (length: ${functionCallArgs.length})`);
              console.log(`🔧 [Copilot] First 200 chars: ${functionCallArgs.substring(0, 200)}...`);
              
              // Parse with error handling for malformed JSON
              let parsedArgs: { updateType?: string; updates?: any; reasoning?: string };
              try {
                parsedArgs = JSON.parse(functionCallArgs);
              } catch (parseError) {
                console.error('❌ [Copilot] Failed to parse function call args as JSON:', parseError);
                console.error('❌ [Copilot] Raw args:', functionCallArgs);
                // Try to extract JSON from malformed string
                const jsonMatch = functionCallArgs.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    parsedArgs = JSON.parse(jsonMatch[0]);
                    console.log('✅ [Copilot] Recovered JSON from malformed string');
                  } catch (e) {
                    throw new Error('Could not parse function call arguments');
                  }
                } else {
                  throw new Error('No JSON found in function call arguments');
                }
              }

              const { updateType, updates, reasoning } = parsedArgs;

              // VALIDATION: Check if updates are actually provided
              const hasValidUpdates = updates && 
                typeof updates === 'object' && 
                Object.keys(updates).length > 0 &&
                !(Object.keys(updates).length === 1 && updates.reasoning); // Don't count reasoning as an update

              if (!hasValidUpdates) {
                console.error('❌ [Copilot] CRITICAL: Updates object is empty or missing!');
                console.error('❌ [Copilot] Full parsed function call:', JSON.stringify({ updateType, updates, reasoning }, null, 2));
                console.error('❌ [Copilot] Updates keys:', updates ? Object.keys(updates) : 'null');
                
                // Generate fallback updates based on reasoning and updateType
                const fallbackUpdates = await generateFallbackUpdates(
                  manifest,
                  updateType || 'refinement',
                  reasoning || 'User requested changes'
                );

                if (fallbackUpdates && Object.keys(fallbackUpdates).length > 0) {
                  console.log('🔄 [Copilot] Using fallback updates:', Object.keys(fallbackUpdates));
                  try {
                    const updatedManifest = await updateBrandManifest(flowId, fallbackUpdates, updateType || 'refinement');
                    const manifestUpdateSignal = `\n\n__MANIFEST_UPDATED__${JSON.stringify(updatedManifest)}`;
                    controller.enqueue(encoder.encode(manifestUpdateSignal));
                    // Add a note to the response explaining fallback was used
                    controller.enqueue(encoder.encode('\n\n[Note: Applied changes based on your request. If this isn\'t what you wanted, please provide more specific details.]'));
                    console.log(`✅ [Copilot] Applied fallback updates`);
                    return;
                  } catch (fallbackError) {
                    console.error('❌ [Copilot] Failed to apply fallback updates:', fallbackError);
                    // Continue to send current manifest
                  }
                }

                // If fallback fails, send current manifest and error message
                const currentManifest = await fetchBrandManifest(flowId, '');
                if (currentManifest) {
                  const manifestUpdateSignal = `\n\n__MANIFEST_UPDATED__${JSON.stringify(currentManifest)}`;
                  controller.enqueue(encoder.encode(manifestUpdateSignal));
                  controller.enqueue(encoder.encode('\n\n[I couldn\'t determine the specific changes you wanted. Could you please provide more details? For example: "Change the primary color to #FFD700" or "Update the headline to..."]'));
                  console.log(`📤 [Copilot] Sent current manifest (no updates to apply)`);
                }
                return; // Don't try to save empty updates
              }

              console.log(`🔄 [Copilot] Applying manifest update...`, {
                updateType,
                hasUpdates: !!updates,
                updatesKeys: updates ? Object.keys(updates) : [],
                flowId
              });

              // Apply updates to manifest
              const updatedManifest = await updateBrandManifest(flowId, updates, updateType);

              console.log(`✅ [Copilot] Manifest updated in DB`, {
                updateType,
                hasStrategy: !!updatedManifest.strategy,
                hasIdentity: !!updatedManifest.identity,
                hasComponents: !!updatedManifest.components,
                lastUpdated: updatedManifest.lastUpdated
              });

              // Send function call result to frontend
              const manifestUpdateSignal = `\n\n__MANIFEST_UPDATED__${JSON.stringify(updatedManifest)}`;
              controller.enqueue(encoder.encode(manifestUpdateSignal));

              console.log(`📤 [Copilot] Manifest update signal sent to frontend`, {
                signalLength: manifestUpdateSignal.length,
                updateType
              });
            } catch (err) {
              console.error('❌ [Copilot] Failed to apply manifest update:', err);
              
              // Always send current manifest even on error so frontend has latest state
              try {
                const currentManifest = await fetchBrandManifest(flowId, '');
                if (currentManifest) {
                  const manifestUpdateSignal = `\n\n__MANIFEST_UPDATED__${JSON.stringify(currentManifest)}`;
                  controller.enqueue(encoder.encode(manifestUpdateSignal));
                  console.log(`📤 [Copilot] Sent current manifest after error`);
                }
              } catch (fetchError) {
                console.error('❌ [Copilot] Failed to fetch manifest after error:', fetchError);
              }
              
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
- History: ${manifest.metadata?.generationHistory?.length || 0} previous changes

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
CRITICAL: FUNCTION CALL REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ **YOU MUST ALWAYS PROVIDE ACTUAL UPDATES WHEN CALLING update_manifest**

- If you call \`update_manifest\`, the \`updates\` parameter MUST contain at least one field to change
- DO NOT call the function with an empty \`updates: {}\` object
- If you're only providing advice without making changes, DO NOT call the function
- The \`updates\` object must match the Brand Manifest structure (see examples below)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE WORKFLOWS WITH EXAMPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **MARKET SHIFT** (updateType: "market_shift")
   - Triggers: Location change, country change, new target market.
   - ⚠️ **CRITICAL**: You MUST provide a complete \`updates\` object with ALL required fields. DO NOT call the function with only \`updateType\` and \`reasoning\` - the \`updates\` object is REQUIRED.
   - ACTION: You MUST regenerate ALL persona fields (name, role, company, industry, location, country, painPoints, goals), strategy.valueProp, and previews.landingPage to match the new market.
   - CRITICAL: Do not leave references to the old location/market. ALL persona fields must be regenerated with market-appropriate, culturally relevant values.
   - CRITICAL: Persona name, role, and company MUST match the new location/country (e.g., Mexican names for Mexico, Spanish roles, local companies).
   - CRITICAL: The \`updates\` object MUST include at minimum: \`strategy.persona\`, \`strategy.valueProp\`, and \`previews.landingPage.hero\`.
   - EXAMPLE UPDATES for Mexico:
     {
       "strategy": {
         "persona": {
           "name": "Carlos Rodriguez",  // ← MUST regenerate: Market-appropriate name
           "role": "Director de Cumplimiento Fiscal",  // ← MUST regenerate: Market-appropriate role (in local language if applicable)
           "company": "Grupo Financiero México",  // ← MUST regenerate: Market-appropriate company
           "industry": "Servicios Financieros",  // ← MUST regenerate: Market-appropriate industry
           "location": "Mexico City",  // ← MUST update: New location
           "country": "Mexico",  // ← MUST update: New country
           "painPoints": ["Cumplimiento fiscal complejo", "Procesos manuales lentos"],  // ← MUST regenerate: Market-specific pain points
           "goals": ["Automatizar procesos", "Reducir errores fiscales"]  // ← MUST regenerate: Market-specific goals
         },
         "valueProp": {
           "headline": "Simplifique el cumplimiento fiscal con software impulsado por IA",
           "subheadline": "Diseñada específicamente para empresas en México",
           "problem": "Los oficiales de cumplimiento fiscal enfrentan procesos complejos y lentos",
           "solution": "Nuestra solución automatiza las obligaciones fiscales",
           "outcome": "Cumplimiento garantizado con la autoridad fiscal",
           "benefits": ["Ahorro de tiempo", "Reducción de errores", "Cumplimiento garantizado"],
           "targetAudience": "Oficiales de Cumplimiento Fiscal Corporativo en México"
         }
       },
       "previews": {
         "landingPage": {
           "hero": {
             "headline": "Simplifique el cumplimiento fiscal",
             "subheadline": "Software diseñado para empresas mexicanas",
             "cta": { "primary": "Comenzar", "secondary": "Aprender más" }
           }
         }
       }
     }

2. **STYLING** (updateType: "styling")
   - Triggers: Color changes, font changes, "make it pop", "more modern", "change color to X".
   - ACTION: Update identity.colors, identity.typography, identity.tone, and components.*.
   - ⚠️ **CASCADING RULE**: When you update colors, the system will automatically cascade them to components and landing page. However, you should ALSO explicitly update related fields for consistency:
     - If primary color changes → Consider updating components.buttons.primary for consistency
     - If secondary color changes → Consider updating components.buttons.secondary for consistency
     - Always ensure color harmony across all components
   - EXAMPLE UPDATES for color change (with cascading awareness):
     {
       "identity": {
         "colors": {
           "primary": [
             { "name": "Brand Blue", "hex": "#0066FF", "usage": "Primary brand color" }
           ],
           "accent": [
             { "name": "Gold Accent", "hex": "#FFD700", "usage": "Accent highlights" }
           ]
         }
       },
       "components": {
         "buttons": {
           "primary": {
             "style": "solid",
             "borderRadius": "8px",
             "shadow": "none"
           }
         }
       }
     }
   - EXAMPLE UPDATES for typography:
     {
       "identity": {
         "typography": {
           "heading": {
             "family": "Inter",
             "weights": ["600", "700"],
             "sizes": { "h1": "48px", "h2": "36px", "h3": "24px" }
           },
           "body": {
             "family": "Inter",
             "weights": ["400", "500"],
             "sizes": { "large": "18px", "regular": "16px", "small": "14px" }
           }
         }
       }
     }
   - EXAMPLE UPDATES for tone:
     {
       "identity": {
         "tone": {
           "keywords": ["Professional", "Innovative", "Trustworthy"],
           "personality": [
             { "trait": "Formal vs Casual", "value": 60, "leftLabel": "Formal", "rightLabel": "Casual" },
             { "trait": "Serious vs Playful", "value": 40, "leftLabel": "Serious", "rightLabel": "Playful" }
           ]
         }
       }
     }

3. **MESSAGING** (updateType: "messaging")
   - Triggers: Headline tweaks, tone adjustments, "generate value proposition", "update headline".
   - ACTION: Update strategy.valueProp, identity.tone, previews.landingPage.
   - VALUE PROP STRUCTURE (REQUIRED - ALL FIELDS):
     {
       "strategy": {
         "valueProp": {
           "headline": "Clear, compelling main message",
           "subheadline": "Supporting detail that elaborates",
           "problem": "Specific pain point you're solving",
           "solution": "How you solve it uniquely",
           "outcome": "Result/benefit customers get",
           "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
           "targetAudience": "Who this is for (from persona)"
         }
       }
     }
   - CRITICAL: ALL fields (headline, subheadline, problem, solution, outcome, benefits, targetAudience) are REQUIRED.
   - Use persona.company, persona.role, and persona.painPoints to inform your value prop.

4. **REFINEMENT** (updateType: "refinement")
   - Triggers: Small tweaks, specific field changes.
   - ACTION: Surgical updates to specific fields.
   - EXAMPLE: User says "make the primary color darker"
     {
       "identity": {
         "colors": {
           "primary": [
             { "name": "Dark Blue", "hex": "#0033CC", "usage": "Primary brand color" }
           ]
         }
       }
     }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- **Dual Output:** You must provide a conversational message AND call the \`update_manifest\` tool (if changes are needed).
- **Partial Updates:** The \`updates\` parameter should only contain the fields you want to change. Nested objects will be merged.
  - Example: \`{ "identity": { "colors": { "primary": [...] } } }\` will update primary colors but keep other identity fields.
- **Consistency:** Ensure the brand remains cohesive.
- **Color Format:** Colors MUST be arrays of objects with \`name\` and \`hex\` fields:
  - ✅ CORRECT: \`{ "primary": [{ "name": "Brand Blue", "hex": "#0066FF" }] }\`
  - ❌ WRONG: \`{ "primary": "#0066FF" }\` or \`{ "primary": {} }\`
- **Never Empty:** The \`updates\` object MUST contain at least one field. If you can't determine what to update, ask the user for clarification instead of calling the function.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER'S REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

// Fallback function to generate updates when AI returns empty updates
async function generateFallbackUpdates(
  manifest: BrandManifest,
  updateType: string,
  reasoning: string
): Promise<Partial<BrandManifest> | null> {
  console.log('🔄 [Copilot] Generating fallback updates...', { updateType, reasoning });
  
  // Try to infer what the user wanted based on reasoning and updateType
  const lowerReasoning = reasoning.toLowerCase();
  const updates: Partial<BrandManifest> = {};

  if (updateType === 'styling') {
    // Check if reasoning mentions colors
    const colorKeywords = ['color', 'gold', 'yellow', 'blue', 'green', 'red', 'purple', 'orange', 'pink', 'teal', 'cyan'];
    const hasColorMention = colorKeywords.some(keyword => lowerReasoning.includes(keyword));
    
    if (hasColorMention) {
      // Extract color hints from reasoning
      let colorHex = '#0066FF'; // default
      let colorName = 'Brand Color';
      let colorType: 'primary' | 'secondary' | 'accent' = 'accent';
      
      // Determine color type
      if (lowerReasoning.includes('primary') || lowerReasoning.includes('main')) {
        colorType = 'primary';
      } else if (lowerReasoning.includes('secondary')) {
        colorType = 'secondary';
      }
      
      // Extract specific color
      if (lowerReasoning.includes('gold')) {
        colorHex = '#FFD700';
        colorName = 'Gold Accent';
      } else if (lowerReasoning.includes('yellow')) {
        colorHex = '#FFD700';
        colorName = 'Yellow Accent';
      } else if (lowerReasoning.includes('blue')) {
        colorHex = '#0066FF';
        colorName = 'Brand Blue';
      } else if (lowerReasoning.includes('green')) {
        colorHex = '#00AA44';
        colorName = 'Green Accent';
      } else if (lowerReasoning.includes('red')) {
        colorHex = '#FF4444';
        colorName = 'Red Accent';
      } else if (lowerReasoning.includes('purple')) {
        colorHex = '#8B5CF6';
        colorName = 'Purple Accent';
      } else if (lowerReasoning.includes('orange')) {
        colorHex = '#FF8800';
        colorName = 'Orange Accent';
      } else if (lowerReasoning.includes('pink')) {
        colorHex = '#FF6B9D';
        colorName = 'Pink Accent';
      } else if (lowerReasoning.includes('teal')) {
        colorHex = '#14B8A6';
        colorName = 'Teal Accent';
      } else if (lowerReasoning.includes('cyan')) {
        colorHex = '#00D9FF';
        colorName = 'Cyan Accent';
      }

      // Preserve existing colors and add/update the target color type
      const existingColors = manifest.identity?.colors || {
        primary: [],
        secondary: [],
        accent: [],
        neutral: []
      };

      updates.identity = {
        ...manifest.identity,
        colors: {
          ...existingColors,
          [colorType]: [
            { name: colorName, hex: colorHex, usage: `${colorType} color for brand identity` }
          ]
        }
      };
    }
  } else if (updateType === 'messaging') {
    // For messaging updates, we can't easily infer what to change
    // Return null to let the system handle it gracefully
    console.warn('⚠️ [Copilot] Cannot generate fallback for messaging updates');
    return null;
  } else if (updateType === 'market_shift') {
    // For market_shift, we need to extract location/country from reasoning
    // This is a minimal fallback - ideally the AI should provide full updates
    const locationMatch = reasoning.match(/(?:location|country|market).*?(?:to|in|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const countryMatch = reasoning.match(/(?:india|mexico|brazil|china|japan|germany|france|spain|uk|united kingdom|usa|united states)/i);
    
    if (locationMatch || countryMatch) {
      const location = locationMatch ? locationMatch[1] : (countryMatch ? countryMatch[0] : '');
      const country = countryMatch ? countryMatch[0] : location;
      
      // Minimal update - just location/country
      // Full market_shift should be generated by AI with all persona fields
      if (manifest.strategy?.persona) {
        updates.strategy = {
          ...manifest.strategy,
          persona: {
            ...manifest.strategy.persona,
            location: location || manifest.strategy.persona.location,
            country: country || manifest.strategy.persona.country,
          }
        };
      }
    } else {
      console.warn('⚠️ [Copilot] Could not extract location/country from reasoning for market_shift');
      return null;
    }
  }

  // If we couldn't generate meaningful updates, return null
  if (Object.keys(updates).length === 0) {
    console.warn('⚠️ [Copilot] Could not generate fallback updates');
    return null;
  }

  console.log('✅ [Copilot] Generated fallback updates:', Object.keys(updates));
  return updates;
}
