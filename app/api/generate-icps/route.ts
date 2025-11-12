import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { executeWithRetryAndTimeout, truncateInput } from "@/lib/api-handler";
import { validateICPResponse } from "@/lib/validators";
import { createErrorResponse, ErrorContext } from "@/lib/error-mapper";
import { buildICPPrompt, type FactsJSON } from "@/lib/prompt-templates";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { content, factsJson } = await req.json();

    // Prefer factsJson if available, otherwise fall back to raw content
    if (!factsJson && !content) {
      return NextResponse.json(
        { error: "Either factsJson or content is required" },
        { status: 400 }
      );
    }

    console.log('🧠 [Generate ICPs] Starting generation');
    
    if (factsJson) {
      console.log('📊 [Generate ICPs] Using Facts JSON with', factsJson.facts?.length || 0, 'facts');
    } else {
      console.log('📊 [Generate ICPs] Using raw content (fallback mode)');
    }

    const startTime = Date.now();

    // ========================================================================
    // NEW FLOW: Use Facts JSON with 3-layer prompt
    // ========================================================================
    if (factsJson) {
      const { system, developer, user } = buildICPPrompt(factsJson as FactsJSON);

      const result = await executeWithRetryAndTimeout(
        async () => {
          return await openai.chat.completions.create({
            model: "gpt-4o", // Using gpt-4o for better ICP quality
            messages: [
              { role: "system", content: system },
              { role: "developer" as any, content: developer },
              { role: "user", content: user },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7, // Moderate creativity for personas
          });
        },
        { timeout: 30000, maxRetries: 3 },
        ErrorContext.ICP_GENERATION
      );

      const genTime = Date.now() - startTime;
      console.log(`⚡ [Generate ICPs] Operation completed in ${genTime}ms`);

      if (!result.success || !result.data) {
        console.error('❌ [Generate ICPs] API call failed:', result.error);
        const errorResponse = createErrorResponse(
          result.error?.code || 'UNKNOWN_ERROR',
          ErrorContext.ICP_GENERATION,
          500
        );
        return NextResponse.json(errorResponse.body, { status: errorResponse.status });
      }

      const completion = result.data;
      const parsedResult = JSON.parse(completion.choices[0].message.content || "{}");

      // Validate response structure
      const validation = validateICPResponse({
        icps: parsedResult.icps || [],
        summary: parsedResult.summary,
      });

      if (!validation.ok) {
        console.error('❌ [Generate ICPs] Validation failed:', validation.errors);
        const errorResponse = createErrorResponse(
          'VALIDATION_ERROR',
          ErrorContext.ICP_GENERATION,
          500
        );
        return NextResponse.json({
          ...errorResponse.body,
          validationErrors: validation.errors,
          icps: [],
          brandColors: { primary: "#FF6B9D", secondary: "#A78BFA" },
          summary: {
            businessDescription: "",
            targetMarket: "",
            painPointsWithMetrics: [],
            opportunityMultiplier: "3"
          }
        }, { status: errorResponse.status });
      }

      console.log('✅ [Generate ICPs] Generated', parsedResult.icps?.length || 0, 'profiles with evidence tracking');

      // Log evidence tracking
      parsedResult.icps?.forEach((icp: any) => {
        if (icp.evidence && icp.evidence.length > 0) {
          console.log(`📎 [ICP: ${icp.title}] Evidence: ${icp.evidence.join(', ')}`);
        }
      });

      return NextResponse.json({
        icps: parsedResult.icps || [],
        brandColors: parsedResult.brandColors || { primary: "#FF6B9D", secondary: "#A78BFA" },
        summary: parsedResult.summary || {
          businessDescription: "",
          targetMarket: "",
          painPointsWithMetrics: [],
          opportunityMultiplier: "3"
        }
      });
    }

    // ========================================================================
    // FALLBACK FLOW: Use raw content (legacy mode)
    // ========================================================================
    console.log('⚠️ [Generate ICPs] Using legacy prompt (no Facts JSON)');

    const truncatedContent = truncateInput(content, 50000);

    const result = await executeWithRetryAndTimeout(
      async () => {
        return await openai.chat.completions.create({
      model: "gpt-4o", // Using gpt-4o for better ICP quality (legacy fallback)
      messages: [
        {
          role: "system",
          content: `You are a B2B marketing expert. Analyze the website content and generate 3 distinct Ideal Customer Profiles (ICPs) with realistic personas.
          
Each ICP should be unique and target a different segment. Create believable persona details that represent the archetype.

Return ONLY valid JSON in this exact format:
{
  "icps": [
    {
      "id": "unique-id",
      "title": "Short segment title (e.g., 'Enterprise CTOs')",
      "description": "One sentence description of the segment",
      "painPoints": ["Short pain 1-2 words", "Another short pain", "Third pain"],
      "goals": ["goal1", "goal2", "goal3"],
      "demographics": "Brief demographics and firmographics",
      "personaName": "Full name (realistic, diverse)",
      "personaRole": "Job title",
      "personaCompany": "Company type with size (e.g., 'Acme Corp (200 employees)')",
      "location": "City name",
      "country": "Country"
    }
  ],
  "brandColors": {
    "primary": "#000000",
    "secondary": "#666666"
  },
  "summary": {
    "businessDescription": "2-3 sentences about what the business does and who they serve",
    "targetMarket": "Description of their ideal market",
    "painPointsWithMetrics": [
      {
        "pain": "Pain point description",
        "metric": "Quantified impact with numbers (e.g., '15+ hours/week wasted' or '$5,000 penalty risk')"
      }
    ],
    "opportunityMultiplier": "2-5"
  }
}

IMPORTANT: Keep painPoints very SHORT (1-3 words max) like "Time constraints", "Budget limits", "Manual processes"`,
        },
        {
          role: "user",
          content: `Website content:\n\n${truncatedContent}\n\nGenerate 3 ICPs in JSON format.`,
        },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
        });
      },
      { timeout: 30000, maxRetries: 3 },
      ErrorContext.ICP_GENERATION
    );

    const genTime = Date.now() - startTime;
    console.log(`⚡ [Generate ICPs] Operation completed in ${genTime}ms`);

    if (!result.success || !result.data) {
      console.error('❌ [Generate ICPs] API call failed:', result.error);
      const errorResponse = createErrorResponse(
        result.error?.code || 'UNKNOWN_ERROR',
        ErrorContext.ICP_GENERATION,
        500
      );
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    const completion = result.data;
    const parsedResult = JSON.parse(completion.choices[0].message.content || "{}");

    const validation = validateICPResponse({
      icps: parsedResult.icps || [],
      summary: parsedResult.summary,
    });

    if (!validation.ok) {
      console.error('❌ [Generate ICPs] Validation failed:', validation.errors);
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        ErrorContext.ICP_GENERATION,
        500
      );
      return NextResponse.json({
        ...errorResponse.body,
        validationErrors: validation.errors,
        icps: [],
        brandColors: { primary: "#FF6B9D", secondary: "#A78BFA" },
        summary: {
          businessDescription: "",
          targetMarket: "",
          painPointsWithMetrics: [],
          opportunityMultiplier: "3"
        }
      }, { status: errorResponse.status });
    }

    console.log('✅ [Generate ICPs] Generated', parsedResult.icps?.length || 0, 'profiles');

    return NextResponse.json({
      icps: parsedResult.icps || [],
      brandColors: parsedResult.brandColors || { primary: "#FF6B9D", secondary: "#A78BFA" },
      summary: parsedResult.summary || {
        businessDescription: "",
        targetMarket: "",
        painPointsWithMetrics: [],
        opportunityMultiplier: "3"
      }
    });
  } catch (error) {
    console.error("Error generating ICPs:", error);
    const errorResponse = createErrorResponse(
      'UNKNOWN_ERROR',
      ErrorContext.ICP_GENERATION,
      500
    );
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}
