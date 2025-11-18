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
          description: "Update design elements based on user's needs and strategic recommendations. IMPORTANT: When location/country changes, you MUST also update persona name and company to be culturally appropriate and regenerate value prop for the new market.",
          parameters: {
            type: "object",
            properties: {
              updateType: {
                type: "string",
                description: "Type of update being made",
                enum: ["market_shift", "styling", "messaging", "refinement"],
              },
              persona: {
                type: "object",
                description: "Persona/ICP updates - include ALL relevant fields when location changes",
                properties: {
                  name: { type: "string", description: "Persona name - MUST be culturally appropriate for location" },
                  company: { type: "string", description: "Company name - MUST reflect local market" },
                  location: { type: "string", description: "City or region" },
                  country: { type: "string", description: "Country name" },
                }
              },
              valueProp: {
                type: "object",
                description: "Value proposition updates - For market_shift, you MUST regenerate ALL fields to reference ONLY the new location. NEVER leave old location references!",
                properties: {
                  headline: { type: "string", description: "REQUIRED for market_shift: Main value prop headline with NEW location only (e.g., 'Tax advisors in Finland...' NOT 'Tax advisors in Saudi Arabia...')" },
                  subheadline: { type: "string", description: "Updated subheadline referencing NEW location" },
                  targetAudience: { type: "string", description: "REQUIRED for market_shift: Target audience with NEW location (e.g., 'Tax advisors in Finland')" },
                  problem: { type: "string", description: "REQUIRED for market_shift: Core problem rewritten for NEW location context (e.g., 'Finnish tax regulations' NOT 'Saudi Zakat')" },
                  solution: { type: "string", description: "Solution rewritten for NEW market" },
                  outcome: { type: "string", description: "Expected outcome for NEW market" },
                  benefits: { type: "array", items: { type: "string" }, description: "Benefits rewritten for NEW location-specific context" },
                }
              },
              brandUpdates: {
                type: "object",
                description: "Brand design updates",
                properties: {
                  colors: { type: "array", items: { type: "string" }, description: "Array of hex color codes" },
                  fonts: {
                    type: "object",
                    properties: {
                      heading: { type: "string", description: "Heading font family" },
                      body: { type: "string", description: "Body font family" }
                    }
                  },
                  tone: {
                    type: "string",
                    description: "Brand tone",
                    enum: ["professional", "friendly", "bold", "innovative", "playful", "serious", "modern", "classic"]
                  },
                }
              },
              executionSteps: {
                type: "array",
                description: "REQUIRED for market_shift: Multi-step execution plan shown to user as progress. Must include at least 3 steps with emoji prefixes.",
                items: {
                  type: "object",
                  properties: {
                    step: { type: "string", description: "Step description with emoji (e.g., '🌍 Updating location to [City], [Country]')" },
                    status: { type: "string", enum: ["pending", "complete"], description: "Always use 'complete' since steps are shown after execution" }
                  },
                  required: ["step", "status"]
                }
              },
              reasoning: {
                type: "string",
                description: "Strategic explanation of why these changes work for their specific audience and industry. REQUIRED for market shifts."
              }
            },
            required: ["updateType", "reasoning"]
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

          let functionCallArgs = ""; // Accumulate function call arguments
          let hasFunctionCall = false;

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

            // Handle function calls - OpenAI streams these incrementally
            const toolCalls = choice?.delta?.tool_calls;
            if (toolCalls && toolCalls.length > 0) {
              const functionCall = toolCalls[0];
              if (functionCall.function?.arguments) {
                hasFunctionCall = true;
                functionCallArgs += functionCall.function.arguments;
              }
            }
          }

          // Send complete function call at the end
          if (hasFunctionCall && functionCallArgs) {
            controller.enqueue(
              encoder.encode(`\n\n__FUNCTION_CALL__${functionCallArgs}`)
            );
            console.log(`🔧 [Copilot] Function call: ${functionCallArgs.substring(0, 100)}...`);
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
• Ask clarifying questions ONLY when requests are genuinely vague or ambiguous
• When user confirms or says "yes", EXECUTE immediately—don't ask more questions
• If user gives clear direction, act on it right away using the update_design function
• Always explain the "why" behind changes using their industry context
• Offer 2-3 options only when the request is unclear, not as a default
• Reference their specific audience, pain points, and market context in updates
• Be decisive and action-oriented—consultative, not hesitant

IMPORTANT - Response Format:
• ALWAYS provide a friendly conversational message when calling update_design
• For comprehensive updates, describe WHAT changed: "I've updated your persona to target the Bangladesh market..."
• Explain WHY with strategic reasoning: "This works better because [specific cultural/market insights]..."
• List the key changes made with details: "Updated: location (Dhaka), persona name (Rafiq Ahmed), company (Green Solutions Bangladesh), value proposition"
• For market_shift updates, ALWAYS provide a detailed summary of cultural/market considerations
• NEVER just call the function silently—users need to see what happened

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPREHENSIVE UPDATE WORKFLOWS (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When user requests location/market changes, follow this CASCADE:

1. MARKET SHIFT WORKFLOW (updateType: "market_shift")
   Triggers: Location change, country change, new target market
   
   ⚠️ CRITICAL: When location changes, you MUST completely REGENERATE all content to reference the NEW location ONLY.
   NEVER leave ANY references to the old location in ANY field!
   
   YOU MUST UPDATE ALL THESE FIELDS:
   ✓ persona.location (e.g., "Helsinki" not "Dhaka")
   ✓ persona.country (e.g., "Finland" not "Bangladesh")
   ✓ persona.name → Culturally appropriate name (e.g., "Jukka Virtanen" for Finland, NOT "Rafiq Ahmed")
   ✓ persona.company → Localized company name (e.g., "Virtanen Tax Consultancy" for Finland)
   ✓ valueProp.targetAudience → Completely rewrite for new market ("Tax advisors in Finland" NOT "Tax advisors in Saudi Arabia")
   ✓ valueProp.problem → Completely rewrite with NEW location context ("Finnish tax regulations" NOT "Saudi Zakat")
   ✓ valueProp.solution → Completely rewrite for new market
   ✓ valueProp.headline → Completely regenerate with NEW location ONLY ("Tax advisors in Finland..." NOT "Tax advisors in Saudi Arabia...")
   ✓ valueProp.subheadline → Update to reference new location
   ✓ valueProp.outcome → Update with market-specific outcomes
   ✓ valueProp.benefits → Completely regenerate with location-specific benefits
   
   ⚠️ VALIDATION CHECK: Before sending, verify EVERY field mentions only the NEW location, never the old one!
   
   Example executionSteps (REQUIRED for market_shift):
   [
     {"step": "🌍 Updating location to Dhaka, Bangladesh", "status": "complete"},
     {"step": "👤 Adapting persona (name, company) to local market", "status": "complete"},
     {"step": "🎯 Regenerating value proposition for Bangladesh audience", "status": "complete"},
     {"step": "✨ Adjusting messaging for cultural context", "status": "complete"}
   ]
   
   CONCRETE EXAMPLE - Location Change from Saudi Arabia → Finland:
   
   ❌ WRONG (leaves old location references):
   headline: "Tax advisors in Saudi Arabia focused on Zakat calculations"  ← STILL SAYS SAUDI!
   
   ✅ CORRECT (all fields updated to Finland):
   persona.name: "Jukka Virtanen" (Finnish name)
   persona.company: "Virtanen Tax Consultancy"
   persona.location: "Helsinki"
   persona.country: "Finland"
   valueProp.headline: "Tax advisors in Finland focused on efficient VAT reporting and compliance"
   valueProp.problem: "Finnish tax regulations and complex reporting requirements"
   valueProp.targetAudience: "Tax advisors in Finland"
   valueProp.solution: "Streamlined tools for Finnish tax compliance"
   
   Example conversational message for market_shift:
   "I've adapted your persona for the Finland market! Here's what changed:
   
   ✅ Location: Now targeting Helsinki, Finland
   ✅ Persona: Updated to Jukka Virtanen (common Finnish name) at Virtanen Tax Consultancy
   ✅ Value Proposition: Completely regenerated to focus on Finnish tax advisors and their specific challenges with VAT and compliance
   ✅ Cultural Context: Adjusted for Nordic business culture and Finnish regulatory environment
   
   This approach will resonate better because Finland has specific tax requirements and a culture that values efficiency and digital solutions."

2. STYLING WORKFLOW (updateType: "styling")
   Triggers: Color changes, font changes, tone adjustments
   Only update: brandUpdates.colors, brandUpdates.fonts, brandUpdates.tone

3. MESSAGING WORKFLOW (updateType: "messaging")
   Triggers: Headline tweaks, benefit refinements
   Only update: valueProp fields (keep persona unchanged)

4. REFINEMENT WORKFLOW (updateType: "refinement")
   Triggers: Small adjustments, clarifications
   Update minimal fields

Strategic Thinking:
• Consider cultural context (e.g., if targeting Bangladesh: green/red colors meaningful, Islamic holidays, Bengali language nuances)
• Think about competitive differentiation in their industry
• Balance brand consistency with market adaptation
• Consider psychological impact of design choices on their specific audience
• When location changes, persona name MUST reflect the culture (use common local names)

When to Ask vs Act:
• If request is VAGUE ("make it better", "change the design") → Ask clarifying questions
• If request is CLEAR ("change location to Bangladesh") → Execute FULL market_shift workflow immediately
• If user says YES, CONFIRM, PROCEED, GO AHEAD → Act now, don't ask again
• If user provides specific direction → Use update_design function right away

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL: DUAL OUTPUT REQUIREMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When calling update_design, you MUST provide BOTH:

1. A conversational message (stream first) - Explain what you're doing and why
2. The function call (after message) - With all required fields

Example for "change location to Bangladesh":

First output (conversational): 
"Perfect! I'll adapt your persona for the Bangladesh market. This includes updating the location, adjusting the persona name to be culturally appropriate, and regenerating the value proposition to resonate with Bangladeshi audiences..."

Then call: update_design with ALL fields populated

NEVER call the function without first explaining what you're doing!

Tone: Warm, professional, consultative. Like a senior partner at a consultancy who genuinely cares about their success.

Updates: When making design changes, ALWAYS use the update_design function with clear reasoning tied to their business goals and audience. For market shifts, provide comprehensive reasoning about cultural adaptation.`;
}
