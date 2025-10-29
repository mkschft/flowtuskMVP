import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { executeWithRetryAndTimeout } from "@/lib/api-handler";
import { validateValuePropResponse } from "@/lib/validators";
import { createErrorResponse, ErrorContext } from "@/lib/error-mapper";
import { buildValuePropPrompt, type FactsJSON, type ICP } from "@/lib/prompt-templates";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { icp, websiteUrl, factsJson } = await req.json();

    if (!icp) {
      return NextResponse.json(
        { error: "ICP data is required" },
        { status: 400 }
      );
    }

    console.log('🎯 [Generate Value Prop] Starting generation for:', icp.title);

    const startTime = Date.now();

    // ========================================================================
    // NEW FLOW: Use Facts JSON + ICP with 3-layer prompt
    // ========================================================================
    if (factsJson) {
      console.log('📊 [Generate Value Prop] Using Facts JSON with', factsJson.facts?.length || 0, 'facts');

      const { system, developer, user } = buildValuePropPrompt(factsJson as FactsJSON, icp as ICP);

      const result = await executeWithRetryAndTimeout(
        async () => {
          return await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: system },
              { role: "developer" as any, content: developer },
              { role: "user", content: user },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7, // Moderate creativity for copy
          });
        },
        { timeout: 30000, maxRetries: 3 },
        ErrorContext.VALUE_PROP_GENERATION
      );

      const genTime = Date.now() - startTime;
      console.log(`⚡ [Generate Value Prop] Operation completed in ${genTime}ms`);

      if (!result.success || !result.data) {
        console.error('❌ [Generate Value Prop] API call failed:', result.error);
        const errorResponse = createErrorResponse(
          result.error?.code || 'UNKNOWN_ERROR',
          ErrorContext.VALUE_PROP_GENERATION,
          500
        );
        return NextResponse.json(errorResponse.body, { status: errorResponse.status });
      }

      const completion = result.data;
      const parsedResult = JSON.parse(completion.choices[0].message.content || "{}");

      // Validate response structure
      const validation = validateValuePropResponse(parsedResult);

      if (!validation.ok) {
        console.error('❌ [Generate Value Prop] Validation failed:', validation.errors);
        const errorResponse = createErrorResponse(
          'VALIDATION_ERROR',
          ErrorContext.VALUE_PROP_GENERATION,
          500
        );
        return NextResponse.json({
          ...errorResponse.body,
          validationErrors: validation.errors,
        }, { status: errorResponse.status });
      }

      console.log('✅ [Generate Value Prop] Generated successfully with evidence tracking');

      // Log evidence tracking for each variation
      parsedResult.variations?.forEach((variation: any) => {
        if (variation.sourceFactIds && variation.sourceFactIds.length > 0) {
          console.log(`📎 [${variation.id}] Evidence: ${variation.sourceFactIds.join(', ')}`);
        }
      });

      return NextResponse.json(parsedResult);
    }

    // ========================================================================
    // FALLBACK FLOW: Use legacy prompt without Facts JSON
    // ========================================================================
    console.log('⚠️ [Generate Value Prop] Using legacy prompt (no Facts JSON)');

    const prompt = `You are an expert conversion copywriter specializing in value propositions.

Context:
- Website: ${websiteUrl || 'Not provided'}
- Target Persona: ${icp.title}
- Persona Details: ${icp.description}
- Pain Points: ${icp.painPoints.join(', ')}
- Goals: ${icp.goals.join(', ')}
- Demographics: ${icp.demographics}

Task: Generate a value proposition template with customizable variables, 5 variations, and a compact summary.

Return a JSON object with this exact structure:
{
  "summary": {
    "mainInsight": "<1-2 sentences: The core value proposition strategy and why it works for this persona>",
    "painPointsAddressed": [
      "<Top pain point 1 being solved>",
      "<Top pain point 2 being solved>",
      "<Top pain point 3 being solved>"
    ],
    "approachStrategy": "<1 sentence: The positioning approach - e.g., 'Time-saving automation', 'Cost reduction through AI', 'Quality improvement via data'>",
    "expectedImpact": "<Quantified benefit - e.g., '40% faster workflows', '2x more qualified leads', '$50k annual savings'>"
  },
  "variables": [
    {
      "key": "role",
      "label": "Target Role",
      "type": "dropdown",
      "options": ["VP of Marketing", "Marketing Manager", "Growth Lead", "Founder", "CEO"],
      "selectedValue": "<most relevant from options>",
      "placeholder": "Select role"
    },
    {
      "key": "industry",
      "label": "Industry",
      "type": "dropdown",
      "options": ["B2B SaaS companies", "E-commerce brands", "Marketing agencies", "Consulting firms", "Tech startups"],
      "selectedValue": "<most relevant from options>",
      "placeholder": "Select industry"
    },
    {
      "key": "region",
      "label": "Region",
      "type": "dropdown",
      "options": ["North America", "Europe", "APAC", "Global", "UK & Ireland"],
      "selectedValue": "<most relevant from options or Global>",
      "placeholder": "Select region"
    },
    {
      "key": "pain",
      "label": "Pain Point",
      "type": "dropdown",
      "options": ["<create 4-5 specific pain points from the persona's pain points>"],
      "selectedValue": "<most pressing pain point>",
      "placeholder": "Select pain point"
    },
    {
      "key": "metric",
      "label": "Metric",
      "type": "input",
      "selectedValue": "<realistic improvement metric like '40%' or '2x'>",
      "placeholder": "e.g., 40%"
    },
    {
      "key": "method",
      "label": "Method",
      "type": "dropdown",
      "options": ["AI-powered", "Psychology-informed", "Data-driven", "Automated", "Scientific"],
      "selectedValue": "<most relevant from options>",
      "placeholder": "Select method"
    },
    {
      "key": "solution",
      "label": "Solution",
      "type": "dropdown",
      "options": ["<create 4-5 solution types based on website/persona>"],
      "selectedValue": "<most relevant solution>",
      "placeholder": "Select solution"
    }
  ],
  "variations": [
    {
      "id": "benefit-first",
      "style": "Benefit-First",
      "text": "<Write a benefit-first variation>",
      "useCase": "Website hero, ad copy",
      "emoji": "🔥"
    },
    {
      "id": "pain-first",
      "style": "Pain-First",
      "text": "<Write a pain-first variation that starts with the problem>",
      "useCase": "LinkedIn posts, emails",
      "emoji": "💔"
    },
    {
      "id": "social-proof",
      "style": "Social Proof",
      "text": "<Write a social proof variation mentioning numbers or clients>",
      "useCase": "Landing pages, testimonials",
      "emoji": "⭐"
    },
    {
      "id": "question",
      "style": "Question Format",
      "text": "<Write as an engaging question that hooks the reader>",
      "useCase": "Cold outreach, hooks",
      "emoji": "❓"
    },
    {
      "id": "story",
      "style": "Story Format",
      "text": "<Write as a brief story or 'after X experience' format>",
      "useCase": "About pages, founder story",
      "emoji": "📖"
    }
  ]
}

Important:
- Make variations concise (1-2 sentences max)
- Use specific, quantifiable metrics
- Tailor everything to the persona's actual pain points and goals
- Make variations feel different from each other
- Ensure all text is ready to copy-paste (no placeholders)
- Summary should be compact and focused (~150 words total)
- Pain points should be specific to the persona, not generic
- Expected impact should include realistic numbers/metrics`;

    const result = await executeWithRetryAndTimeout(
      async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert conversion copywriter. Return only valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.8,
        });
      },
      { timeout: 30000, maxRetries: 3 },
      ErrorContext.VALUE_PROP_GENERATION
    );

    const genTime = Date.now() - startTime;
    console.log(`⚡ [Generate Value Prop] Operation completed in ${genTime}ms`);

    if (!result.success || !result.data) {
      console.error('❌ [Generate Value Prop] API call failed:', result.error);
      const errorResponse = createErrorResponse(
        result.error?.code || 'UNKNOWN_ERROR',
        ErrorContext.VALUE_PROP_GENERATION,
        500
      );
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    const completion = result.data;
    const parsedResult = JSON.parse(completion.choices[0].message.content || "{}");

    const validation = validateValuePropResponse(parsedResult);

    if (!validation.ok) {
      console.error('❌ [Generate Value Prop] Validation failed:', validation.errors);
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        ErrorContext.VALUE_PROP_GENERATION,
        500
      );
      return NextResponse.json({
        ...errorResponse.body,
        validationErrors: validation.errors,
      }, { status: errorResponse.status });
    }

    console.log('✅ [Generate Value Prop] Generated successfully');

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error("Error generating value prop:", error);
    const errorResponse = createErrorResponse(
      'UNKNOWN_ERROR',
      ErrorContext.VALUE_PROP_GENERATION,
      500
    );
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}
