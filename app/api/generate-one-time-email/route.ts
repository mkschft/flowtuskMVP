import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { callWithQualityCheck, truncateInput, executeWithRetryAndTimeout } from "@/lib/api-handler";
import { validateOneTimeEmailResponse } from "@/lib/validators";
import { createErrorResponse, ErrorContext } from "@/lib/error-mapper";
import { buildEmailPrompt, type FactsJSON, type ICP, type ValueProp, type EmailUserChoices } from "@/lib/prompt-templates";
import { scoreOutput } from "@/lib/quality-scorer";
import { evalTracker } from "@/lib/eval-tracker";
import { logQuality, createLogEntry } from "@/lib/quality-logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { icp, websiteContext, factsJson, valueProp, userChoices } = await request.json();

    if (!icp) {
      return NextResponse.json({ error: "ICP is required" }, { status: 400 });
    }

    console.log('📧 [Generate One-Time Email] Starting generation for:', icp.title);

    const startTime = Date.now();

    // ========================================================================
    // NEW FLOW: Use Facts JSON + ICP + Value Prop with 3-layer prompt + Quality Check
    // ========================================================================
    if (factsJson && valueProp) {
      console.log('📊 [Generate One-Time Email] Using Facts JSON with', factsJson.facts?.length || 0, 'facts');
      console.log('💎 [Generate One-Time Email] Using Value Prop with', valueProp.variations?.length || 0, 'variations');

      const result = await callWithQualityCheck(
        () => buildEmailPrompt(
          factsJson as FactsJSON,
          icp as ICP,
          valueProp as ValueProp,
          userChoices as EmailUserChoices || {}
        ),
        validateOneTimeEmailResponse,
        (data, facts) => scoreOutput(data, facts),
        factsJson,
        {
          model: "gpt-4o-mini",
          temperature: 0.7,
          timeout: 30000,
          maxRetries: 3,
        },
        openai,
        'one-time-email'
      );

      const genTime = Date.now() - startTime;
      console.log(`⚡ [Generate One-Time Email] Operation completed in ${genTime}ms`);

      if (!result.success || !result.data) {
        console.error('❌ [Generate One-Time Email] API call failed:', result.error);
        const errorResponse = createErrorResponse(
          result.error?.code || 'UNKNOWN_ERROR',
          ErrorContext.EMAIL_GENERATION,
          500
        );
        return NextResponse.json(errorResponse.body, { status: errorResponse.status });
      }

      const emailData = result.data;

      // Track metrics
      if (emailData.qualityScore) {
        evalTracker.track({
          timestamp: Date.now(),
          operation: 'one-time-email',
          validationPassed: true,
          repairAttempted: emailData.qualityScore.totalScore < 0.6,
          qualityScore: emailData.qualityScore,
          evidenceCount: emailData.qualityScore.details.citationCount,
          model: 'gpt-4o-mini',
        });

        // Log to database (async, non-blocking)
        logQuality(createLogEntry(
          'one-time-email',
          'gpt-4o-mini',
          emailData.qualityScore,
          true,
          emailData.qualityScore.totalScore < 0.6,
          { icp_title: icp.title }
        ));
      }

      console.log('✅ [Generate One-Time Email] Generated successfully with quality evaluation');

      // Log evidence tracking
      if (emailData.sourceFactIds && emailData.sourceFactIds.length > 0) {
        console.log(`📎 [Email] Evidence: ${emailData.sourceFactIds.join(', ')}`);
      }

      return NextResponse.json(emailData);
    }

    // ========================================================================
    // FALLBACK FLOW: Use legacy prompt without Facts JSON
    // ========================================================================
    console.log('⚠️ [Generate One-Time Email] Using legacy prompt (no Facts JSON)');

    const prompt = `You are an expert email marketing strategist. Create a high-converting one-time email for the following ICP:

ICP Details:
- Title: ${icp.title}
- Description: ${icp.description}
- Pain Points: ${icp.painPoints.join(", ")}
- Goals: ${icp.goals.join(", ")}
- Demographics: ${icp.demographics}
- Persona: ${icp.personaName} - ${icp.personaRole} at ${icp.personaCompany}
- Location: ${icp.location}, ${icp.country}

Website Context: ${websiteContext || "No specific website context provided"}

Create a one-time email with:

1. THREE subject line variations (A, B, C) for A/B testing:
   - Each should be 30-50 characters
   - Use different approaches: benefit-focused, curiosity-driven, urgency-based
   - Make them compelling and relevant to the persona

2. Email body (150-200 words):
   - Start with a personalized hook
   - Address their main pain point
   - Present a clear value proposition
   - Include social proof or credibility
   - End with a strong call to action

3. Call to Action (CTA):
   - Clear, action-oriented
   - Creates urgency or value
   - Easy to understand

4. Expected benchmarks:
   - Open rate: 25-35%
   - Reply rate: 5-8%
   - Conversion rate: 2-5%

5. Optimization tips (3-4 tips):
   - Best send times
   - Personalization suggestions
   - A/B testing recommendations
   - Follow-up strategies

Return the response as JSON with this exact structure:
{
  "subjectLines": {
    "A": "Subject line A here",
    "B": "Subject line B here", 
    "C": "Subject line C here"
  },
  "emailBody": "Full email body text here...",
  "cta": "Call to action text here",
  "benchmarks": {
    "openRate": "25-35%",
    "replyRate": "5-8%",
    "conversionRate": "2-5%"
  },
  "tips": [
    "Tip 1 here",
    "Tip 2 here",
    "Tip 3 here",
    "Tip 4 here"
  ]
}`;

    const truncatedContext = truncateInput(websiteContext || "", 10000);

    const result = await executeWithRetryAndTimeout(
      async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert email marketing strategist who creates high-converting one-time emails. Always respond with valid JSON only."
            },
            {
              role: "user",
              content: prompt.replace(websiteContext || "", truncatedContext)
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        });
      },
      { timeout: 30000, maxRetries: 3 },
      ErrorContext.EMAIL_GENERATION
    );

    const genTime = Date.now() - startTime;
    console.log(`⚡ [Generate One-Time Email] Operation completed in ${genTime}ms`);

    if (!result.success || !result.data) {
      console.error('❌ [Generate One-Time Email] API call failed:', result.error);
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

    let emailData;
    try {
      emailData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", responseText);
      const errorResponse = createErrorResponse(
        'PARSE_ERROR',
        ErrorContext.EMAIL_GENERATION,
        500
      );
      return NextResponse.json(errorResponse.body, { status: errorResponse.status });
    }

    const validation = validateOneTimeEmailResponse(emailData);

    if (!validation.ok) {
      console.error('❌ [Generate One-Time Email] Validation failed:', validation.errors);
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

    console.log('✅ [Generate One-Time Email] Generated successfully');

    return NextResponse.json(emailData);

  } catch (error) {
    console.error("Error generating one-time email:", error);
    const errorResponse = createErrorResponse(
      'UNKNOWN_ERROR',
      ErrorContext.EMAIL_GENERATION,
      500
    );
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}
