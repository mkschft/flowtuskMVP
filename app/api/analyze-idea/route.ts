import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildAnalyzeFromIdeaPrompt, type IdeaInput } from "@/lib/prompt-templates";
import { validateFactsJSON } from "@/lib/validators";
import { executeWithRetryAndTimeout } from "@/lib/api-handler";
import { createErrorResponse, ErrorContext } from "@/lib/error-mapper";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idea, targetMarket, problemStatement, solutionHypothesis, brandVibe } = body;

    // Validate required fields
    if (!idea || !targetMarket) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Both 'idea' and 'targetMarket' are required."
        },
        { status: 400 }
      );
    }

    // Validate idea length
    if (idea.trim().length < 50) {
      return NextResponse.json(
        {
          error: "Idea description too short",
          details: "Please provide at least 50 characters describing your startup idea."
        },
        { status: 400 }
      );
    }

    if (idea.trim().length > 500) {
      return NextResponse.json(
        {
          error: "Idea description too long",
          details: "Please keep your idea description under 500 characters."
        },
        { status: 400 }
      );
    }

    console.log('💡 [Analyze Idea] Starting analysis for:', idea.substring(0, 50) + '...');
    console.log('🎯 [Analyze Idea] Target market:', targetMarket);

    // ========================================================================
    // STEP 1: Build prompt from idea input
    // ========================================================================
    const ideaInput: IdeaInput = {
      idea: idea.trim(),
      targetMarket: targetMarket.trim(),
      problemStatement: problemStatement?.trim(),
      solutionHypothesis: solutionHypothesis?.trim(),
      brandVibe: brandVibe?.trim(),
    };

    const { system, developer, user } = buildAnalyzeFromIdeaPrompt(ideaInput);

    console.log('🧠 [Analyze Idea] Generating facts JSON with GPT-4o...');

    // ========================================================================
    // STEP 2: Extract Facts JSON using GPT-4o
    // ========================================================================
    const extractStartTime = Date.now();

    // Use GPT-4o for best reasoning on fact generation
    const result = await executeWithRetryAndTimeout(
      async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o", // Using GPT-4o for best reasoning
          messages: [
            { role: "system", content: system },
            { role: "developer" as any, content: developer }, // Cast to avoid TS error
            { role: "user", content: user },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4, // Slightly higher than website analysis for creativity
        });
      },
      { timeout: 45000, maxRetries: 1 }, // 45s with 1 retry
      ErrorContext.WEBSITE_ANALYSIS // Reuse same error context
    );

    const extractTime = Date.now() - extractStartTime;
    console.log(`⚡ [Analyze Idea] Facts generation completed in ${extractTime}ms`);

    // Handle API call failure
    if (!result.success || !result.data) {
      console.error('❌ [Analyze Idea] Facts generation failed:', result.error);

      return NextResponse.json(
        {
          error: "Failed to generate brand facts from idea",
          details: result.error?.message || "The AI couldn't process your idea. Please try rephrasing it with more specific details.",
        },
        { status: 500 }
      );
    }

    // Parse Facts JSON response
    const completion = result.data;
    const factsJson = JSON.parse(completion.choices[0].message.content || "{}");

    // ========================================================================
    // STEP 3: Validate Facts JSON structure
    // ========================================================================
    const validation = validateFactsJSON(factsJson);

    if (!validation.ok) {
      console.error('❌ [Analyze Idea] Facts validation failed:', validation.errors);

      return NextResponse.json(
        {
          error: "Invalid facts structure generated",
          details: "The AI generated invalid data. Please try again with a more detailed idea description.",
          validationErrors: validation.errors,
        },
        { status: 500 }
      );
    }

    console.log('✅ [Analyze Idea] Facts JSON generated:', {
      facts: factsJson.facts?.length || 0,
      valueProps: factsJson.valueProps?.length || 0,
      pains: factsJson.pains?.length || 0,
      brandName: factsJson.brand?.name || 'unknown',
      targetRegion: factsJson.targetMarket?.primaryRegion || 'unknown',
    });

    // ========================================================================
    // STEP 4: Add source metadata to facts
    // ========================================================================
    // Mark all facts as coming from user prompt for traceability
    if (factsJson.facts && Array.isArray(factsJson.facts)) {
      factsJson.facts = factsJson.facts.map((fact: any) => ({
        ...fact,
        source: "user-prompt", // Add source field for UI differentiation
      }));
    }

    console.log('✅ [Analyze Idea] Analysis complete with Facts JSON');

    // ========================================================================
    // STEP 5: Return Facts JSON with metadata
    // ========================================================================
    return NextResponse.json({
      factsJson,
      source: "idea-analysis",
      metadata: {
        idea: idea.substring(0, 100) + (idea.length > 100 ? '...' : ''), // Truncate for storage
        targetMarket,
        hasProblemStatement: !!problemStatement,
        hasSolutionHypothesis: !!solutionHypothesis,
        brandVibe: brandVibe || null,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("Error analyzing idea:", error);

    // Provide better error context based on error type
    let errorCode = 'UNKNOWN_ERROR';
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('timeout') || error.name === 'AbortError') {
        errorCode = 'TIMEOUT';
      } else if (message.includes('parse') || message.includes('json')) {
        errorCode = 'PARSE_ERROR';
      }
    }

    const errorResponse = createErrorResponse(
      errorCode,
      ErrorContext.WEBSITE_ANALYSIS, // Reuse same context
      500
    );
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }
}
