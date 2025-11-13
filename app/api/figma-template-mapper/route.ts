import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CORS headers for Figma plugin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

interface TextLayerMetadata {
  id: string;
  name: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: number;
  parentName?: string;
}

interface TemplateMappingRequest {
  textLayers: TextLayerMetadata[];
  icpData: any;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as TemplateMappingRequest;
    const { textLayers, icpData } = body;

    if (!textLayers || textLayers.length === 0) {
      return NextResponse.json(
        { error: "textLayers is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!icpData) {
      return NextResponse.json(
        { error: "icpData is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('🎨 [Figma Mapper] Analyzing template with', textLayers.length, 'text layers');

    // Step 1: Identify template type using GPT
    const templateType = await identifyTemplateType(textLayers);
    console.log('📋 [Figma Mapper] Detected template type:', templateType);

    // Step 2: Generate field mappings using GPT
    const mappings = await generateFieldMappings(textLayers, icpData, templateType);
    console.log('✅ [Figma Mapper] Generated', mappings.length, 'field mappings');

    return NextResponse.json(
      {
        templateType,
        mappings,
        confidence: calculateAverageConfidence(mappings),
      },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('❌ [Figma Mapper] Error:', error);
    return NextResponse.json(
      { error: error.message || "Mapping failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Step 1: Identify what type of template this is
async function identifyTemplateType(textLayers: TextLayerMetadata[]): Promise<string> {
  const layerSummary = textLayers.map(l => ({
    name: l.name,
    content: l.content.substring(0, 50),
    fontSize: l.fontSize,
  })).slice(0, 20); // Only send first 20 layers for efficiency

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a Figma template analyzer. Identify what type of template this is based on the text layer names and content.

Common template types:
- persona: User persona cards (name, role, goals, pain points, demographics)
- landing-page: Landing page wireframe (hero, features, CTA, pricing)
- website: Full website mockup (navigation, sections, footer)
- email: Email template (subject, body, signature)
- presentation: Slide deck (title, bullet points, images)
- social-media: Social media post (caption, hashtags, handle)
- other: Generic or unknown template

Return ONLY the template type as a single word (lowercase).`,
      },
      {
        role: "user",
        content: `Analyze these Figma text layers:\n\n${JSON.stringify(layerSummary, null, 2)}\n\nWhat type of template is this?`,
      },
    ],
    temperature: 0.3,
    max_tokens: 50,
  });

  const templateType = response.choices[0].message.content?.trim().toLowerCase() || 'other';
  return templateType;
}

// Step 2: Generate intelligent field mappings
async function generateFieldMappings(
  textLayers: TextLayerMetadata[],
  icpData: any,
  templateType: string
) {
  // Build a summary of available ICP fields
  const icpFields = {
    personaName: icpData.personaName,
    personaRole: icpData.personaRole,
    personaCompany: icpData.personaCompany,
    location: icpData.location,
    country: icpData.country,
    goals: icpData.goals,
    painPoints: icpData.painPoints,
    demographics: icpData.demographics,
    description: icpData.description,
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an intelligent Figma template mapper. Your job is to map ICP persona data to text layers in a Figma template.

Template Type: ${templateType}

Rules:
1. Match text layers to ICP fields based on:
   - Layer name (e.g., "Name" → personaName)
   - Current content (e.g., "John Doe" → personaName)
   - Position/hierarchy (e.g., top-left large text → name)
   - Context (e.g., bullets → goals/painPoints)

2. Only map fields where there's a clear match
3. Assign confidence score (0-100):
   - 90-100: Very confident (exact name match)
   - 70-89: Confident (content pattern match)
   - 50-69: Moderate (position-based guess)
   - Below 50: Don't map

4. For arrays (goals, painPoints), prefer multi-line text fields or fields with bullets

5. Return JSON array of mappings:
[
  {
    "layerId": "text-layer-id",
    "icpField": "personaName",
    "confidence": 95,
    "reason": "Layer named 'Persona Name' matches exactly"
  }
]

Return ONLY valid JSON, no other text.`,
      },
      {
        role: "user",
        content: `Map ICP data to these Figma text layers:

TEXT LAYERS:
${JSON.stringify(textLayers, null, 2)}

AVAILABLE ICP FIELDS:
${JSON.stringify(icpFields, null, 2)}

Generate field mappings:`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result.mappings || [];
}

function calculateAverageConfidence(mappings: any[]): number {
  if (mappings.length === 0) return 0;
  const total = mappings.reduce((sum, m) => sum + m.confidence, 0);
  return Math.round(total / mappings.length);
}

