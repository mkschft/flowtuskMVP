import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { executeWithRetryAndTimeout } from "@/lib/api-handler";
import { validateLinkedInResponse } from "@/lib/validators";
import { createErrorResponse, ErrorContext } from "@/lib/error-mapper";
import { buildLinkedInPrompt, type FactsJSON, type ICP, type ValueProp, type LinkedInOptions } from "@/lib/prompt-templates";
import { MODEL_CONFIGS } from "@/lib/models";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { icp, websiteUrl, valueProp, factsJson, websiteContent, type = 'sequence' } = await req.json();

    if (!icp) {
      return NextResponse.json(
        { error: "ICP data is required" },
        { status: 400 }
      );
    }

    console.log('💼 [Generate LinkedIn Outreach] Starting generation for:', icp.title);

    const startTime = Date.now();
    const modelConfig = MODEL_CONFIGS.GENERATE_LINKEDIN;

    // ========================================================================
    // NEW FLOW: Use Facts JSON with 3-layer prompt
    // ========================================================================
    if (factsJson && valueProp) {
      console.log('📊 [Generate LinkedIn Outreach] Using Facts JSON with', factsJson.facts?.length || 0, 'facts');

      const { system, developer, user } = buildLinkedInPrompt(
        factsJson as FactsJSON,
        icp as ICP,
        valueProp as ValueProp,
        { type: type as 'post' | 'profile_bio' | 'inmail' | 'sequence' } as LinkedInOptions
      );

      const result = await executeWithRetryAndTimeout(
        async () => {
          return await openai.chat.completions.create({
            model: modelConfig.model,
            messages: [
              { role: "system", content: system },
              { role: "developer" as any, content: developer },
              { role: "user", content: user },
            ],
            response_format: { type: "json_object" },
            temperature: modelConfig.temperature,
          });
        },
        { timeout: modelConfig.timeout, maxRetries: modelConfig.maxRetries },
        ErrorContext.LINKEDIN_GENERATION
      );

      const genTime = Date.now() - startTime;
      console.log(`⚡ [Generate LinkedIn Outreach] Operation completed in ${genTime}ms`);

      if (!result.success || !result.data) {
        console.error('❌ [Generate LinkedIn Outreach] API call failed:', result.error);
        const errorResponse = createErrorResponse(
          result.error?.code || 'UNKNOWN_ERROR',
          ErrorContext.LINKEDIN_GENERATION,
          500
        );
        return NextResponse.json(errorResponse.body, { status: errorResponse.status });
      }

      const completion = result.data;
      const responseText = completion.choices[0]?.message?.content;

      if (!responseText) {
        const errorResponse = createErrorResponse(
          'PARSE_ERROR',
          ErrorContext.LINKEDIN_GENERATION,
          500
        );
        return NextResponse.json(errorResponse.body, { status: errorResponse.status });
      }

      let linkedInData;
      try {
        linkedInData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", responseText);
        const errorResponse = createErrorResponse(
          'PARSE_ERROR',
          ErrorContext.LINKEDIN_GENERATION,
          500
        );
        return NextResponse.json(errorResponse.body, { status: errorResponse.status });
      }

      // Validate response structure
      const validation = validateLinkedInResponse(linkedInData);

      if (!validation.ok) {
        console.error('❌ [Generate LinkedIn Outreach] Validation failed:', validation.errors);
        const errorResponse = createErrorResponse(
          'VALIDATION_ERROR',
          ErrorContext.LINKEDIN_GENERATION,
          500
        );
        return NextResponse.json({
          ...errorResponse.body,
          validationErrors: validation.errors,
        }, { status: errorResponse.status });
      }

      console.log('✅ [Generate LinkedIn Outreach] Generated successfully with evidence tracking');

      // Log evidence tracking
      if (linkedInData.messages) {
        linkedInData.messages?.forEach((msg: any) => {
          if (msg.sourceFactIds && msg.sourceFactIds.length > 0) {
            console.log(`📎 [LinkedIn ${msg.id}] Evidence: ${msg.sourceFactIds.join(', ')}`);
          }
        });
      } else if (linkedInData.sourceFactIds && linkedInData.sourceFactIds.length > 0) {
        console.log(`📎 [LinkedIn ${type}] Evidence: ${linkedInData.sourceFactIds.join(', ')}`);
      }

      return NextResponse.json(linkedInData);
    }

    // ========================================================================
    // FALLBACK FLOW: Use legacy prompt without Facts JSON
    // ========================================================================
    console.log('⚠️ [Generate LinkedIn Outreach] Using legacy prompt (no Facts JSON)');

    const prompt = `You are an expert LinkedIn outreach specialist with proven conversion rates.

Context:
- Website: ${websiteUrl || 'Not provided'}
- Target Persona: ${icp.title}
- Persona Details: ${icp.description || 'Not specified'}
- Pain Points: ${icp.painPoints?.join(', ') || 'Not specified'}
- Goals: ${icp.goals?.join(', ') || 'Not specified'}
- Demographics: ${icp.demographics || 'Not specified'}
${valueProp ? `- Value Proposition: ${JSON.stringify(valueProp)}` : ''}

Task: Create a 3-message LinkedIn outreach sequence that feels human and personalized.

Return a JSON object with this structure:
{
  "overallStrategy": "2-3 sentence explanation of the approach and why it works",
  "messages": [
    {
      "id": "connection",
      "step": 1,
      "type": "connection",
      "title": "Connection Request",
      "timing": "Day 1",
      "characterCount": 250,
      "message": "300 characters max - LinkedIn connection request message",
      "personalizationTips": [
        "Tip 1: specific thing to personalize",
        "Tip 2: where to find info",
        "Tip 3: what to avoid"
      ],
      "expectedResponse": "realistic acceptance rate and why"
    },
    {
      "id": "follow-up-1",
      "step": 2,
      "type": "follow-up-1",
      "title": "First Follow-up (After Connection)",
      "timing": "2-3 days after acceptance",
      "characterCount": 500,
      "message": "conversational message, not salesy, 400-600 characters",
      "personalizationTips": ["3-4 specific tips"],
      "expectedResponse": "realistic reply rate and indicators of interest"
    },
    {
      "id": "follow-up-2",
      "step": 3,
      "type": "follow-up-2",
      "title": "Value-Add Follow-up",
      "timing": "4-5 days after first message",
      "characterCount": 500,
      "message": "share valuable resource or insight, soft CTA, 400-600 characters",
      "personalizationTips": ["3-4 specific tips"],
      "expectedResponse": "expected engagement and next steps"
    }
  ],
  "keyTakeaways": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3",
    "Key insight 4"
  ]
}

Guidelines:
- Messages should feel conversational, not salesy
- Use the persona's pain points naturally
- Include specific personalization hooks
- Mention common ground or mutual interests
- Keep connection request under 300 characters
- Be genuinely helpful, not pushy
- Character counts must be accurate
- Make it feel human-written, not AI-generated`;

    const result = await executeWithRetryAndTimeout(
      async () => {
        return await openai.chat.completions.create({
          model: modelConfig.model,
          messages: [
            {
              role: "system",
              content: "You are an expert LinkedIn outreach specialist. Write conversational, human messages. Return only valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: modelConfig.temperature,
        });
      },
      { timeout: modelConfig.timeout, maxRetries: modelConfig.maxRetries },
      ErrorContext.LINKEDIN_GENERATION
    );

    const genTime = Date.now() - startTime;
    console.log(`⚡ [Generate LinkedIn Outreach] Operation completed in ${genTime}ms`);

    if (!result.success || !result.data) {
      console.error('❌ [Generate LinkedIn Outreach] API call failed:', result.error);
      const errorResponse = createErrorResponse(
        result.error?.code || 'UNKNOWN_ERROR',
        ErrorContext.LINKEDIN_GENERATION,
        500
      );
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    const completion = result.data;
    const parsedResult = JSON.parse(completion.choices[0].message.content || "{}");

    const validation = validateLinkedInResponse(parsedResult);

    if (!validation.ok) {
      console.error('❌ [Generate LinkedIn Outreach] Validation failed:', validation.errors);
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        ErrorContext.LINKEDIN_GENERATION,
        500
      );
      return NextResponse.json({
        ...errorResponse.body,
        validationErrors: validation.errors,
      }, { status: errorResponse.status });
    }

    console.log('✅ [Generate LinkedIn Outreach] Generated successfully');

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error("Error generating LinkedIn outreach:", error);
    const errorResponse = createErrorResponse(
      'UNKNOWN_ERROR',
      ErrorContext.LINKEDIN_GENERATION,
      500
    );
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}
