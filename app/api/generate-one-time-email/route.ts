import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { icp, websiteContext } = await request.json();

    if (!icp) {
      return NextResponse.json({ error: "ICP is required" }, { status: 400 });
    }

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert email marketing strategist who creates high-converting one-time emails. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let emailData;
    try {
      emailData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", responseText);
      throw new Error("Invalid response format from AI");
    }

    return NextResponse.json(emailData);

  } catch (error) {
    console.error("Error generating one-time email:", error);
    return NextResponse.json(
      { error: "Failed to generate one-time email" },
      { status: 500 }
    );
  }
}
