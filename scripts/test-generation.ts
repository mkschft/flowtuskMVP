import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testGeneration() {
    const manifest = {
        brandName: "Tech Solutions ME",
        strategy: {
            persona: {
                name: "Khalid Al Mansour",
                role: "Business Development Manager",
                company: "Tech Solutions ME",
                industry: "ERP Resellers",
                location: "Sharjah, UAE",
                painPoints: ["Integration challenges", "Customer satisfaction"],
                goals: ["Streamline integrations", "Enhance client offerings"]
            },
            valueProp: {
                headline: "Streamline tax compliance integrations with our AI-powered software.",
                subheadline: "Tax Star’s solution automates returns and keeps your clients FTA-compliant.",
                problem: "ERP resellers face integration challenges.",
                solution: "AI-driven Corporate Tax software.",
                outcome: "Upgrade your offerings and enhance client satisfaction.",
                benefits: ["AI-powered", "Automated returns"],
                targetAudience: "ERP Resellers"
            }
        }
    };

    const persona = manifest.strategy.persona;
    const valueProp = manifest.strategy.valueProp;

    const prompt = `You are a brand designer. Generate a comprehensive brand guide for:

Company: ${manifest.brandName}
Persona: ${persona.name} - ${persona.role} at ${persona.company}
Value Prop: ${valueProp.headline || 'Innovative solution'}

Generate a brand guide with:
1. Color palette (primary, secondary, accent, AND NEUTRAL colors - whites, grays, blacks)
2. Typography (heading and body fonts with sizes)
3. Tone of voice (3-5 keywords and personality traits)
4. Logo variations (2-3 types)

CRITICAL REQUIREMENTS:
- You MUST include at least 2 neutral colors (e.g., White #FFFFFF, Light Gray #F5F5F5, Dark Gray #333333, Black #000000)
- You MUST include at least 1 accent color
- You MUST include at least 2 logo variations
- You MUST include at least 2 personality traits with trait, value, leftLabel, and rightLabel fields
- All color arrays (primary, secondary, accent, neutral) must contain objects with name and hex fields
- DO NOT skip or omit neutral colors - they are required for the UI

Return ONLY valid JSON in this format:
{
  "colors": {
    "primary": [{ "name": "Brand Blue", "hex": "#0066FF", "usage": "CTA buttons, links" }],
    "secondary": [{ "name": "Deep Navy", "hex": "#1a2332", "usage": "Headers, accents" }],
    "accent": [{ "name": "Bright Cyan", "hex": "#00D9FF", "usage": "Highlights, links" }],
    "neutral": [
      { "name": "White", "hex": "#FFFFFF", "usage": "Backgrounds" },
      { "name": "Light Gray", "hex": "#F5F5F5", "usage": "Subtle backgrounds" },
      { "name": "Dark Gray", "hex": "#333333", "usage": "Text" }
    ]
  },
  "typography": {
    "heading": {
      "family": "Inter",
      "weights": ["600", "700"],
      "sizes": { "h1": "48px", "h2": "36px", "h3": "24px" }
    },
    "body": {
      "family": "Inter",
      "weights": ["400", "500"],
      "sizes": { "large": "18px", "regular": "16px", "small": "14px" }
    }
  },
  "tone": {
    "keywords": ["Professional", "Innovative", "Trustworthy"],
    "personality": [
      { "trait": "Formal vs Casual", "value": 60, "leftLabel": "Formal", "rightLabel": "Casual" },
      { "trait": "Serious vs Playful", "value": 40, "leftLabel": "Serious", "rightLabel": "Playful" }
    ]
  },
  "logo": {
    "variations": [
      { "name": "Primary", "description": "Full color logo for light backgrounds" },
      { "name": "Monochrome", "description": "Single color version" }
    ]
  }
}`;

    console.log("Sending prompt to OpenAI...");
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.8,
        });

        console.log("Response received:");
        console.log(response.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error);
    }
}

testGeneration();
