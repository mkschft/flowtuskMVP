import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { executeWithRetryAndTimeout } from "@/lib/api-handler";
import { validateLinkedInResponse } from "@/lib/validators";
import { createErrorResponse, ErrorContext } from "@/lib/error-mapper";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { icp, websiteUrl, valueProp } = await req.json();

    if (!icp) {
      return NextResponse.json(
        { error: "ICP data is required" },
        { status: 400 }
      );
    }

    console.log('💼 [Generate LinkedIn Outreach] Starting generation for:', icp.title);

    const prompt = `You are an expert LinkedIn outreach specialist with proven conversion rates.

Context:
- Website: ${websiteUrl || 'Not provided'}
- Target Persona: ${icp.title}
- Persona Details: ${icp.description}
- Pain Points: ${icp.painPoints.join(', ')}
- Goals: ${icp.goals.join(', ')}
- Demographics: ${icp.demographics}
${valueProp ? `- Value Proposition: ${valueProp}` : ''}

Task: Create a 3-message LinkedIn outreach sequence that feels human and personalized.

Return a JSON object with this structure:
{
  "overallStrategy": "<2-3 sentence explanation of the approach and why it works>",
  "messages": [
    {
      "id": "connection",
      "step": 1,
      "type": "connection",
      "title": "Connection Request",
      "timing": "Day 1",
      "characterCount": <actual character count>,
      "message": "<300 characters max - LinkedIn connection request message>",
      "personalizationTips": [
        "<Tip 1: specific thing to personalize>",
        "<Tip 2: where to find info>",
        "<Tip 3: what to avoid>"
      ],
      "expectedResponse": "<realistic acceptance rate and why>"
    },
    {
      "id": "follow-up-1",
      "step": 2,
      "type": "follow-up-1",
      "title": "First Follow-up (After Connection)",
      "timing": "2-3 days after acceptance",
      "characterCount": <actual character count>,
      "message": "<conversational message, not salesy, 400-600 characters>",
      "personalizationTips": [
        "<3-4 specific tips>"
      ],
      "expectedResponse": "<realistic reply rate and indicators of interest>"
    },
    {
      "id": "follow-up-2",
      "step": 3,
      "type": "follow-up-2",
      "title": "Value-Add Follow-up",
      "timing": "4-5 days after first message",
      "characterCount": <actual character count>,
      "message": "<share valuable resource or insight, soft CTA, 400-600 characters>",
      "personalizationTips": [
        "<3-4 specific tips>"
      ],
      "expectedResponse": "<expected engagement and next steps>"
    }
  ],
  "keyTakeaways": [
    "<Key insight 1>",
    "<Key insight 2>",
    "<Key insight 3>",
    "<Key insight 4>"
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

    const startTime = Date.now();

    // Wrap OpenAI call with retry and timeout logic
    const result = await executeWithRetryAndTimeout(
      async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o-mini",
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
          temperature: 0.8,
        });
      },
      { timeout: 30000, maxRetries: 3 },
      ErrorContext.LINKEDIN_GENERATION
    );

    const genTime = Date.now() - startTime;
    console.log(`⚡ [Generate LinkedIn Outreach] Operation completed in ${genTime}ms`);

    // Handle API call failure
    if (!result.success || !result.data) {
      console.error('❌ [Generate LinkedIn Outreach] API call failed:', result.error);
      const errorResponse = createErrorResponse(
        result.error?.code || 'UNKNOWN_ERROR',
        ErrorContext.LINKEDIN_GENERATION,
        500
      );
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    // Parse JSON response
    const completion = result.data;
    const parsedResult = JSON.parse(completion.choices[0].message.content || "{}");

    // Validate response structure
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

