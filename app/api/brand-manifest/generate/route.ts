import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { updateBrandManifest, fetchBrandManifest, createBrandManifest } from "@/lib/brand-manifest";
import { createClient } from '@/lib/supabase/server';
import { generateLogosForVariations } from "@/lib/generation/logo-generator";

// Helper to normalize color fields - GPT sometimes returns strings instead of arrays
function normalizeColorField(value: any): { name: string; hex: string; usage?: string }[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    // GPT returned hex string instead of array - wrap it
    return [{ name: 'Color', hex: value }];
  }
  if (typeof value === 'object' && value.hex) {
    // GPT returned single object instead of array - wrap it
    return [value];
  }
  return [];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { flowId, icpId, section } = await req.json();

    if (!flowId || !section) {
      return NextResponse.json(
        { error: "flowId and section are required" },
        { status: 400 }
      );
    }

    console.log(`🎨 [Generate] Starting ${section} generation for flow ${flowId}`);

    // Fetch current manifest (or create if doesn't exist)
    let manifest = await fetchBrandManifest(flowId, icpId || '');

    if (!manifest) {
      console.log('📦 [Generate] No manifest found, creating initial manifest...');

      // Fetch ICP and value prop data from legacy tables to bootstrap
      const supabase = await createClient();
      const { data: icp } = await supabase
        .from('positioning_icps')
        .select('*')
        .eq('id', icpId)
        .single();

      const { data: valueProp } = await supabase
        .from('positioning_value_props')
        .select('*')
        .eq('icp_id', icpId)
        .single();

      // Create initial manifest with ICP and value prop data
      manifest = await createBrandManifest(flowId, icpId || '', {
        brandName: icp?.persona_company || 'Untitled Brand',
        strategy: {
          persona: {
            name: icp?.persona_name || '',
            role: icp?.persona_role || '',
            company: icp?.persona_company || '',
            industry: icp?.title || '',
            location: icp?.location || '',
            country: icp?.country || '',
            painPoints: icp?.pain_points || [],
            goals: icp?.goals || []
          },
          valueProp: {
            headline: valueProp?.headline || valueProp?.summary?.mainInsight || '',
            subheadline: valueProp?.subheadline || valueProp?.summary?.approachStrategy || '',
            problem: valueProp?.problem || '',
            solution: valueProp?.solution || valueProp?.summary?.approachStrategy || '',
            outcome: valueProp?.outcome || valueProp?.summary?.expectedImpact || '',
            benefits: valueProp?.benefits || [],
            targetAudience: valueProp?.target_audience || icp?.title || ''
          }
        }
      });

      console.log('✅ [Generate] Initial manifest created');
    }

    let updates: any = {};

    switch (section) {
      case "brand":
        updates = await generateBrandGuide(manifest);
        break;
      case "style":
        updates = await generateStyleGuide(manifest);
        break;
      case "landing":
        updates = await generateLandingPage(manifest);
        break;
      default:
        return NextResponse.json(
          { error: `Invalid section: ${section}` },
          { status: 400 }
        );
    }

    // Apply dot-notation updates
    const updatedManifest = applyDotNotationUpdates(manifest, updates);
    
    // 🔍 DEBUG: Log logo variations before saving
    if (section === 'brand') {
      const logoVars = updatedManifest.identity?.logo?.variations || [];
      console.log('🔍 [DEBUG] Logo variations before saving to DB:', logoVars.length);
      logoVars.forEach((v: any, idx: number) => {
        console.log(`  - Variation ${idx + 1} (${v.name}):`);
        console.log(`    - imageUrl: ${v.imageUrl ? '✅ ' + v.imageUrl.substring(0, 50) + '...' : '❌ Missing'}`);
      });
    }
    
    const finalManifest = await updateBrandManifest(flowId, updatedManifest, `${section}_generated`);

    // 🔍 DEBUG: Verify what was actually saved
    if (section === 'brand') {
      const savedLogoVars = finalManifest.identity?.logo?.variations || [];
      console.log('🔍 [DEBUG] Logo variations after saving to DB:', savedLogoVars.length);
      savedLogoVars.forEach((v: any, idx: number) => {
        console.log(`  - Variation ${idx + 1} (${v.name}):`);
        console.log(`    - imageUrl: ${v.imageUrl ? '✅ Saved' : '❌ Missing'}`);
      });
    }

    console.log(`✅ [Generate] ${section} generated successfully`);

    return NextResponse.json({
      manifest: finalManifest,
      section,
    });
  } catch (error: any) {
    console.error(`❌ [Generate] Error:`, error);
    return NextResponse.json(
      { error: "Generation failed", details: error.message },
      { status: 500 }
    );
  }
}

// Helper to apply dot-notation updates
function applyDotNotationUpdates(target: any, updates: Record<string, any>): any {
  const result = JSON.parse(JSON.stringify(target)); // Deep clone

  for (const [path, value] of Object.entries(updates)) {
    const keys = path.split('.');
    let current = result;

    // Navigate to the parent object
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    // Set the final value
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
  }

  return result;
}

async function generateBrandGuide(manifest: any) {
  // Validate manifest has required data
  if (!manifest?.strategy?.persona || !manifest?.strategy?.valueProp) {
    throw new Error('Manifest missing required strategy data (persona or valueProp). Cannot generate brand guide.');
  }

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

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = JSON.parse(response.choices[0].message.content || "{}");

  // 🔍 DEBUG: Log raw GPT response for brand guide
  console.log('🔍 [DEBUG] GPT Brand Guide Response:');
  console.log('  - Colors (primary):', JSON.stringify(content.colors?.primary || []));
  console.log('  - Colors (neutral):', JSON.stringify(content.colors?.neutral || []));
  console.log('  - Colors (accent):', JSON.stringify(content.colors?.accent || []));
  console.log('  - Tone keywords:', JSON.stringify(content.tone?.keywords || []));
  console.log('  - Tone personality:', JSON.stringify(content.tone?.personality || []));
  console.log('  - Logo variations:', JSON.stringify(content.logo?.variations || []));

  // 🔧 NORMALIZE: Ensure colors are always arrays of objects
  const normalizedColors = {
    primary: normalizeColorField(content.colors?.primary),
    secondary: normalizeColorField(content.colors?.secondary),
    accent: normalizeColorField(content.colors?.accent),
    neutral: normalizeColorField(content.colors?.neutral)
  };

  console.log('✅ [DEBUG] Normalized colors:', JSON.stringify(normalizedColors));

  // 🔧 NORMALIZE: Transform personality traits to add id and label fields
  const personality = (content.tone?.personality || []).map((trait: any, index: number) => ({
    id: `trait-${index + 1}`,
    label: trait.trait || `Trait ${index + 1}`,
    value: trait.value || 50,
    leftLabel: trait.leftLabel || 'Left',
    rightLabel: trait.rightLabel || 'Right'
  }));

  console.log('✅ [DEBUG] Normalized personality traits:', JSON.stringify(personality));

  // Generate logo images if feature is enabled
  const logoVariations = content.logo?.variations || [];
  const primaryColor = normalizedColors.primary[0]?.hex || '#000000';
  const accentColor = normalizedColors.accent[0]?.hex || normalizedColors.primary[0]?.hex || '#000000';

  // 🔍 DEBUG: Check feature flag
  const logoGenEnabled = process.env.NEXT_PUBLIC_ENABLE_LOGO_GENERATION !== 'false';
  const logoGenCount = manifest?.metadata?.logoGenerationCount || 0;
  
  console.log('🔍 [DEBUG] Logo Generation Status:');
  console.log('  - Feature enabled:', logoGenEnabled);
  console.log('  - Current generation count:', logoGenCount);
  console.log('  - Logo variations to generate:', logoVariations.length);
  console.log('  - Primary color:', primaryColor);
  console.log('  - Accent color:', accentColor);

  let logoVariationsWithImages = logoVariations;
  let logoGenerationIncremented = false;

  try {
    console.log('🎨 [Brand Guide] Generating logos for', logoVariations.length, 'variations');
    logoVariationsWithImages = await generateLogosForVariations(
      manifest.brandName,
      logoVariations,
      primaryColor,
      accentColor,
      manifest
    );

    // 🔍 DEBUG: Log what was actually generated
    console.log('🔍 [DEBUG] Logo Generation Results:');
    logoVariationsWithImages.forEach((variation, idx) => {
      console.log(`  - Variation ${idx + 1} (${variation.name}):`);
      console.log(`    - SVG: ${variation.imageUrl ? '✅ Generated' : '❌ Missing'}`);
      if (variation.imageUrl) {
        console.log(`    - SVG Data URL: ${variation.imageUrl.substring(0, 60)}...`);
      }
    });

    // Check if any logos were actually generated (not skipped due to limit)
    const logosGenerated = logoVariationsWithImages.some(v => v.imageUrl);
    if (logosGenerated) {
      logoGenerationIncremented = true;
      console.log('✅ [Brand Guide] Logos were successfully generated');
    } else {
      console.warn('⚠️ [Brand Guide] No logos were generated - check feature flag and API keys');
    }
  } catch (error: any) {
    // Gracefully handle logo generation errors - don't break brand guide generation
    console.error('❌ [Brand Guide] Logo generation failed, continuing without logos:', error.message);
    console.error('❌ [Brand Guide] Error stack:', error.stack);
    logoVariationsWithImages = logoVariations; // Use original variations without images
  }

  const result: any = {
    "identity": {
      colors: normalizedColors,
      typography: content.typography,
      tone: {
        keywords: content.tone?.keywords || [],
        personality
      },
      logo: {
        variations: logoVariationsWithImages
      }
    }
  };

  // Increment logo generation count in metadata if logos were generated
  if (logoGenerationIncremented) {
    result["metadata.logoGenerationCount"] = ((manifest?.metadata?.logoGenerationCount || 0) + 1);
  }

  return result;
}

async function generateStyleGuide(manifest: any) {
  // Validate manifest exists
  if (!manifest?.brandName) {
    throw new Error('Manifest missing brandName. Cannot generate style guide.');
  }

  const prompt = `Generate a style guide for ${manifest.brandName} with button, card, and input styles.

IMPORTANT: You MUST include a spacing scale with at least xs, sm, md, lg, and xl values.

Return ONLY valid JSON:
{
  "buttons": {
    "primary": { "style": "solid", "borderRadius": "8px", "shadow": "md" },
    "secondary": { "style": "outline", "borderRadius": "8px", "shadow": "none" },
    "outline": { "style": "ghost", "borderRadius": "8px", "shadow": "none" }
  },
  "cards": {
    "style": "elevated",
    "borderRadius": "12px",
    "shadow": "lg"
  },
  "inputs": {
    "style": "outlined",
    "borderRadius": "8px",
    "focusStyle": "ring"
  },
  "spacing": {
    "scale": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px" }
  }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = JSON.parse(response.choices[0].message.content || "{}");

  // 🔍 DEBUG: Log raw GPT response for style guide
  console.log('🔍 [DEBUG] GPT Style Guide Response:');
  console.log('  - Buttons:', JSON.stringify(content.buttons || {}));
  console.log('  - Spacing:', JSON.stringify(content.spacing?.scale || {}));
  console.log('  - Cards borderRadius:', content.cards?.borderRadius);

  return {
    "components": {
      buttons: content.buttons,
      cards: content.cards,
      inputs: content.inputs,
      spacing: content.spacing
    }
  };
}

async function generateLandingPage(manifest: any) {
  // Validate manifest has required data
  if (!manifest?.strategy?.persona || !manifest?.strategy?.valueProp) {
    throw new Error('Manifest missing required strategy data. Cannot generate landing page.');
  }

  const persona = manifest.strategy.persona;
  const valueProp = manifest.strategy.valueProp;

  const prompt = `Generate a landing page for:
Company: ${manifest.brandName}
Value Prop: ${valueProp.headline}
Target: ${persona.role}

IMPORTANT: Include ALL sections - navigation, hero, features, social proof, and footer.

Return ONLY valid JSON:
{
  "navigation": {
    "logo": "${manifest.brandName}",
    "links": ["Product", "Features", "Pricing", "About", "Contact"]
  },
  "hero": {
    "headline": "Compelling headline",
    "subheadline": "Supporting text",
    "cta": { "primary": "Get Started", "secondary": "Learn More" }
  },
  "features": [
    { "title": "Feature 1", "description": "Benefit description", "icon": "sparkles" },
    { "title": "Feature 2", "description": "Benefit description", "icon": "layers" },
    { "title": "Feature 3", "description": "Benefit description", "icon": "chart" }
  ],
  "socialProof": [
    { "quote": "Testimonial text", "author": "John Doe", "role": "CEO", "company": "TechCo" }
  ],
  "footer": {
    "sections": [
      { "title": "Product", "links": ["Features", "Pricing", "FAQ"] },
      { "title": "Company", "links": ["About", "Blog", "Careers"] }
    ]
  }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = JSON.parse(response.choices[0].message.content || "{}");

  // 🔍 DEBUG: Log raw GPT response for landing page
  console.log('🔍 [DEBUG] GPT Landing Page Response:');
  console.log('  - Navigation:', JSON.stringify(content.navigation || {}));
  console.log('  - Hero:', JSON.stringify(content.hero || {}));
  console.log('  - Features count:', content.features?.length || 0);
  console.log('  - Social proof count:', content.socialProof?.length || 0);
  console.log('  - Footer sections:', content.footer?.sections?.length || 0);

  return {
    "previews": {
      landingPage: content
    }
  };
}
