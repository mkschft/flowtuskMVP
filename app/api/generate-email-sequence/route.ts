import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { callWithQualityCheck } from "@/lib/api-handler";
import { validateEmailSequenceResponse } from "@/lib/validators";
import { createErrorResponse, ErrorContext } from "@/lib/error-mapper";
import { buildEmailSequencePrompt, type FactsJSON, type ICP, type ValueProp, type EmailSequenceOptions } from "@/lib/prompt-templates";
import { scoreMultipleOutputs } from "@/lib/quality-scorer";
import { evalTracker } from "@/lib/eval-tracker";
import { logQuality, createLogEntry } from "@/lib/quality-logger";
import { MODEL_CONFIGS } from "@/lib/models";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { icp, websiteUrl, valueProp, sequenceLength = 7, factsJson, websiteContent } = await req.json();

    if (!icp) {
      return NextResponse.json(
        { error: "ICP data is required" },
        { status: 400 }
      );
    }

    // Validate sequence length
    const validLengths = [5, 7, 10] as const;
    const length = (validLengths.includes(sequenceLength as any) ? sequenceLength : 7) as 5 | 7 | 10;

    console.log('📨 [Generate Email Sequence] Starting generation for:', icp.title, `(${length} emails)`);

    const startTime = Date.now();
    const modelConfig = MODEL_CONFIGS.GENERATE_SEQUENCE;

    // ========================================================================
    // NEW FLOW: Use Facts JSON with 3-layer prompt
    // ========================================================================
    if (factsJson && valueProp) {
      console.log('📊 [Generate Email Sequence] Using Facts JSON with', factsJson.facts?.length || 0, 'facts');

      const result = await callWithQualityCheck(
        () => buildEmailSequencePrompt(
          factsJson as FactsJSON,
          icp as ICP,
          valueProp as ValueProp,
          { length } as EmailSequenceOptions
        ),
        validateEmailSequenceResponse,
        (data, facts) => scoreMultipleOutputs(data.emails || [], facts),
        factsJson,
        {
          model: modelConfig.model,
          temperature: modelConfig.temperature,
          timeout: modelConfig.timeout,
          maxRetries: modelConfig.maxRetries,
        },
        openai,
        'email-sequence'
      );

      const genTime = Date.now() - startTime;
      console.log(`⚡ [Generate Email Sequence] Operation completed in ${genTime}ms`);

      if (!result.success || !result.data) {
        console.error('❌ [Generate Email Sequence] API call failed:', result.error);
        const errorResponse = createErrorResponse(
          result.error?.code || 'UNKNOWN_ERROR',
          ErrorContext.EMAIL_GENERATION,
          500
        );
        return NextResponse.json(errorResponse.body, { status: errorResponse.status });
      }

      const sequenceData = result.data;

      // Track metrics
      if (sequenceData.qualityScore) {
        evalTracker.track({
          timestamp: Date.now(),
          operation: 'email-sequence',
          validationPassed: true,
          repairAttempted: sequenceData.qualityScore.totalScore < 0.6,
          qualityScore: sequenceData.qualityScore,
          evidenceCount: sequenceData.qualityScore.details.citationCount,
          model: modelConfig.model,
        });

        // Log to database (async, non-blocking)
        logQuality(createLogEntry(
          'email-sequence',
          modelConfig.model,
          sequenceData.qualityScore,
          true,
          sequenceData.qualityScore.totalScore < 0.6,
          { icp_title: icp.title, sequence_length: length }
        ));
      }

      console.log('✅ [Generate Email Sequence] Generated', sequenceData.emails?.length || 0, 'emails with quality evaluation');

      // Log evidence tracking
      sequenceData.emails?.forEach((email: any) => {
        if (email.sourceFactIds && email.sourceFactIds.length > 0) {
          console.log(`📎 [Email ${email.id}] Evidence: ${email.sourceFactIds.join(', ')}`);
        }
      });

      return NextResponse.json(sequenceData);
    }

    // ========================================================================
    // FALLBACK FLOW: Use legacy prompt without Facts JSON
    // ========================================================================
    console.log('⚠️ [Generate Email Sequence] Using legacy prompt (no Facts JSON)');

    const pacing = {
      5: [1, 2, 3, 4, 5],
      7: [1, 3, 5, 7, 10, 14, 21],
      10: [1, 3, 5, 7, 10, 14, 17, 21, 28, 35],
    };

    const prompt = `You are an expert email marketing strategist specializing in B2B nurture sequences.

Context:
- Website: ${websiteUrl || 'Not provided'}
- Target Persona: ${icp.title}
- Persona Details: ${icp.description}
- Pain Points: ${icp.painPoints.join(', ')}
- Goals: ${icp.goals.join(', ')}
- Demographics: ${icp.demographics}
${valueProp ? `- Value Proposition: ${JSON.stringify(valueProp)}` : ''}

Task: Create a ${length}-email nurture sequence designed to convert cold leads into qualified opportunities.

Sequence pacing (days between emails): ${pacing[length].join(', ')}

Return a JSON object with this structure:
{
  "sequenceGoal": "1-2 sentence goal for this sequence",
  "sequenceLength": ${length},
  "emails": [
    {
      "id": "email-1",
      "dayNumber": 1,
      "subject": "Subject line",
      "body": "Email body 100-150 words",
      "cta": "Call to action",
      "purpose": "Why this email exists"
    }
      ],
  "bestPractices": ["tip1", "tip2", "tip3"],
  "expectedOutcome": "What success looks like"
}

Important:
- Each email should be 100-150 words max
- Progressive value delivery (educate → persuade → close)
- Reference previous emails naturally
- Vary subject line approaches
- Include clear CTAs
- Keep tone professional and conversational`;

    const result = await executeWithRetryAndTimeout(
      async () => {
        return await openai.chat.completions.create({
          model: modelConfig.model,
          messages: [
            {
              role: "system",
              content: "You are an expert email marketing strategist. Return only valid JSON.",
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
      ErrorContext.EMAIL_GENERATION
    );

    const genTime = Date.now() - startTime;
    console.log(`⚡ [Generate Email Sequence] Operation completed in ${genTime}ms`);

    if (!result.success || !result.data) {
      console.error('❌ [Generate Email Sequence] API call failed:', result.error);
      const errorResponse = createErrorResponse(
        result.error?.code || 'UNKNOWN_ERROR',
        ErrorContext.EMAIL_GENERATION,
        500
      );
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    const completion = result.data;
    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      const errorResponse = createErrorResponse(
        'PARSE_ERROR',
        ErrorContext.EMAIL_GENERATION,
        500
      );
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    let sequenceData;
    try {
      sequenceData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", responseText);
      const errorResponse = createErrorResponse(
        'PARSE_ERROR',
        ErrorContext.EMAIL_GENERATION,
        500
      );
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    const validation = validateEmailSequenceResponse(sequenceData);

    if (!validation.ok) {
      console.error('❌ [Generate Email Sequence] Validation failed:', validation.errors);
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        ErrorContext.EMAIL_GENERATION,
        500
      );
      return NextResponse.json({
        ...errorResponse.body,
        validationErrors: validation.errors,
      }, { status: errorResponse.status });
    }

    console.log('✅ [Generate Email Sequence] Generated', sequenceData.emails?.length || 0, 'emails');

    return NextResponse.json(sequenceData);
  } catch (error) {
    console.error("Error generating email sequence:", error);
    const errorResponse = createErrorResponse(
      'UNKNOWN_ERROR',
      ErrorContext.EMAIL_GENERATION,
      500
    );
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}
