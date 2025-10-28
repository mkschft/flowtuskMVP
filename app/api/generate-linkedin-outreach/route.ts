import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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

    const completion = await openai.chat.completions.create({
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

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating LinkedIn outreach:", error);
    return NextResponse.json(
      { error: "Failed to generate LinkedIn outreach sequence" },
      { status: 500 }
    );
  }
}

