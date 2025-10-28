import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { icp, websiteUrl, valueProp, sequenceLength = 7 } = await req.json();

    if (!icp) {
      return NextResponse.json(
        { error: "ICP data is required" },
        { status: 400 }
      );
    }

    // Validate sequence length
    const validLengths = [5, 7, 10];
    const length = validLengths.includes(sequenceLength) ? sequenceLength : 7;

    const prompt = `You are an expert email marketing strategist specializing in B2B nurture sequences.

Context:
- Website: ${websiteUrl || 'Not provided'}
- Target Persona: ${icp.title}
- Persona Details: ${icp.description}
- Pain Points: ${icp.painPoints.join(', ')}
- Goals: ${icp.goals.join(', ')}
- Demographics: ${icp.demographics}
${valueProp ? `- Value Proposition: ${valueProp}` : ''}

Task: Create a ${length}-email nurture sequence designed to convert cold leads into qualified opportunities.

Return a JSON object with this structure:
{
  "sequenceGoal": "<1-2 sentence goal for this sequence>",
  "emails": [
    {
      "id": "email-1",
      "step": 1,
      "type": "intro",
      "dayNumber": 1,
      "subjectLines": [
        "<Subject line A - curiosity-driven>",
        "<Subject line B - benefit-driven>",
        "<Subject line C - personalized>"
      ],
      "body": "<Email body 150-200 words. Focus on identifying with their pain point. No hard sell yet.>",
      "cta": "<Soft CTA: asking a question or offering value>",
      "openRateBenchmark": "25-35%",
      "replyRateBenchmark": "3-5%",
      "tips": [
        "<Tip 1>",
        "<Tip 2>",
        "<Tip 3>"
      ]
    },
    {
      "id": "email-2",
      "step": 2,
      "type": "value",
      "dayNumber": ${length === 5 ? 2 : length === 7 ? 3 : 4},
      "subjectLines": [
        "<Subject line A>",
        "<Subject line B>",
        "<Subject line C>"
      ],
      "body": "<Email body 150-200 words. Share your value prop, how you solve their pain.>",
      "cta": "<CTA: offer demo, call, or resource>",
      "openRateBenchmark": "20-30%",
      "replyRateBenchmark": "5-8%",
      "tips": [
        "<3 tips>"
      ]
    }${length >= 3 ? `,
    {
      "id": "email-3",
      "step": 3,
      "type": "social-proof",
      "dayNumber": ${length === 5 ? 3 : length === 7 ? 5 : 7},
      "subjectLines": [
        "<Subject line A>",
        "<Subject line B>",
        "<Subject line C>"
      ],
      "body": "<Email body 150-200 words. Share case study, testimonial, or results.>",
      "cta": "<CTA: specific meeting request>",
      "openRateBenchmark": "18-25%",
      "replyRateBenchmark": "6-10%",
      "tips": [
        "<3 tips>"
      ]
    }` : ''}${length >= 4 ? `,
    {
      "id": "email-4",
      "step": 4,
      "type": "urgency",
      "dayNumber": ${length === 5 ? 4 : length === 7 ? 6 : 9},
      "subjectLines": [
        "<Subject line A>",
        "<Subject line B>",
        "<Subject line C>"
      ],
      "body": "<Email body 100-150 words. Create gentle urgency - limited spots, seasonal offer, etc.>",
      "cta": "<CTA: clear action with deadline>",
      "openRateBenchmark": "15-22%",
      "replyRateBenchmark": "8-12%",
      "tips": [
        "<3 tips>"
      ]
    }` : ''}${length >= 5 ? `,
    {
      "id": "email-5",
      "step": 5,
      "type": "breakup",
      "dayNumber": ${length === 5 ? 5 : length === 7 ? 7 : 10},
      "subjectLines": [
        "<Subject line A - 'Should I close your file?'>",
        "<Subject line B - 'Last email'>",
        "<Subject line C - creative breakup>"
      ],
      "body": "<Email body 80-120 words. Friendly breakup email. Often gets highest response.>",
      "cta": "<CTA: yes/no question to keep door open>",
      "openRateBenchmark": "30-40%",
      "replyRateBenchmark": "15-25%",
      "tips": [
        "<3 tips>"
      ]
    }` : ''}${length >= 6 ? `,
    {
      "id": "email-6",
      "step": 6,
      "type": "nurture",
      "dayNumber": ${length === 7 ? 8 : 12},
      "subjectLines": [
        "<Subject line A>",
        "<Subject line B>",
        "<Subject line C>"
      ],
      "body": "<Email body 120-180 words. Additional value content, industry insights, or helpful resources.>",
      "cta": "<CTA: soft ask for engagement>",
      "openRateBenchmark": "12-20%",
      "replyRateBenchmark": "4-8%",
      "tips": [
        "<3 tips>"
      ]
    }` : ''}${length >= 7 ? `,
    {
      "id": "email-7",
      "step": 7,
      "type": "final-ask",
      "dayNumber": ${length === 7 ? 10 : 14},
      "subjectLines": [
        "<Subject line A>",
        "<Subject line B>",
        "<Subject line C>"
      ],
      "body": "<Email body 100-150 words. Final attempt with clear value proposition and urgency.>",
      "cta": "<CTA: specific meeting request with deadline>",
      "openRateBenchmark": "15-25%",
      "replyRateBenchmark": "8-15%",
      "tips": [
        "<3 tips>"
      ]
    }` : ''}${length >= 8 ? `,
    {
      "id": "email-8",
      "step": 8,
      "type": "nurture",
      "dayNumber": 16,
      "subjectLines": [
        "<Subject line A>",
        "<Subject line B>",
        "<Subject line C>"
      ],
      "body": "<Email body 120-180 words. Educational content or industry insights.>",
      "cta": "<CTA: soft engagement ask>",
      "openRateBenchmark": "10-18%",
      "replyRateBenchmark": "3-6%",
      "tips": [
        "<3 tips>"
      ]
    }` : ''}${length >= 9 ? `,
    {
      "id": "email-9",
      "step": 9,
      "type": "nurture",
      "dayNumber": 18,
      "subjectLines": [
        "<Subject line A>",
        "<Subject line B>",
        "<Subject line C>"
      ],
      "body": "<Email body 120-180 words. Additional value content or case studies.>",
      "cta": "<CTA: soft ask for engagement>",
      "openRateBenchmark": "10-18%",
      "replyRateBenchmark": "3-6%",
      "tips": [
        "<3 tips>"
      ]
    }` : ''}${length >= 10 ? `,
    {
      "id": "email-10",
      "step": 10,
      "type": "breakup",
      "dayNumber": 20,
      "subjectLines": [
        "<Subject line A - 'Should I close your file?'>",
        "<Subject line B - 'Last email'>",
        "<Subject line C - creative breakup>"
      ],
      "body": "<Email body 80-120 words. Friendly breakup email. Often gets highest response.>",
      "cta": "<CTA: yes/no question to keep door open>",
      "openRateBenchmark": "30-40%",
      "replyRateBenchmark": "15-25%",
      "tips": [
        "<3 tips>"
      ]
    }` : ''}
  ],
  "bestPractices": [
    "<Best practice 1>",
    "<Best practice 2>",
    "<Best practice 3>",
    "<Best practice 4>",
    "<Best practice 5>",
    "<Best practice 6>"
  ],
  "expectedOutcome": "<Realistic outcome description: expected reply rate, meeting rate, and typical time to conversion>"
}

Guidelines:
- Write in a conversational, human tone
- Address pain points directly but empathetically
- Each email should stand alone (they might not read previous ones)
- Subject lines should be under 50 characters
- Body text should be skimmable with short paragraphs
- CTAs should be specific and low-friction
- Use realistic benchmarks based on B2B email best practices
- Make emails feel personal, not templated`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert B2B email marketing strategist. Write conversion-optimized emails that feel human. Return only valid JSON.",
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
    console.error("Error generating email sequence:", error);
    return NextResponse.json(
      { error: "Failed to generate email sequence" },
      { status: 500 }
    );
  }
}
