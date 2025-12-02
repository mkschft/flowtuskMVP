import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { updateBrandManifest, fetchBrandManifest, createBrandManifest } from "@/lib/brand-manifest";
import { createClient } from '@/lib/supabase/server';
import { generateLogosForVariations } from "@/lib/generation/logo-generator";
import {
  validateBrandGuideOutput,
  validateStyleGuideOutput,
  validateLandingPageOutput
} from "@/lib/utils/validation";
import { detectIndustry, getArchetype, getSuggestedGradientMood } from "@/lib/industry-archetypes";
import { generateIntelligentGradient, generateGradientVariations } from "@/lib/utils/color-utils";

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
      case "strategy":
        updates = await generateStrategyContent(manifest);
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
    console.error(`❌ [Generate] [Critical Failure] Error during ${req.body ? 'request processing' : 'generation'}:`, error.message);
    return NextResponse.json(
      { error: "Generation failed", details: error.message, stage: "unknown" }, // You could refine 'stage' if you passed it down
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

  // Detect industry and get archetype for personalized guidance
  const industry = detectIndustry({}, persona);
  const archetype = getArchetype(industry);
  const suggestedMood = getSuggestedGradientMood(industry);

  console.log(`🎨 [Brand Guide] Detected industry: ${industry}, mood: ${suggestedMood}`);

  const prompt = `You are an award-winning brand designer with deep expertise in ${industry} branding and color psychology.

BUSINESS CONTEXT:
Company: ${manifest.brandName}
Industry: ${persona.industry || industry}
Target Persona: ${persona.name} - ${persona.role} at ${persona.company}
Pain Points: ${persona.painPoints?.join(', ') || 'Not specified'}
Goals: ${persona.goals?.join(', ') || 'Not specified'}
Value Proposition: ${valueProp.headline || 'Innovative solution'}

INDUSTRY-SPECIFIC DESIGN GUIDANCE:
This is a ${industry} brand. Follow these design principles:

COLOR PSYCHOLOGY:
- Recommended primary colors: ${archetype.colorPsychology.primary.join(', ')}
- Reasoning: ${archetype.colorPsychology.reasoning}
${archetype.colorPsychology.avoid ? `- AVOID: ${archetype.colorPsychology.avoid.join(', ')} - ${archetype.colorPsychology.avoidReason}` : ''}
${archetype.colorPsychology.accent ? `- Accent colors: ${archetype.colorPsychology.accent.join(', ')} - ${archetype.colorPsychology.accentReason}` : ''}

VISUAL STYLE:
- Border Radius: ${archetype.visualStyle.borderRadius}
- Shadows: ${archetype.visualStyle.shadows}
- Icon Style: ${archetype.visualStyle.iconStyle}
- Pattern Inspiration: ${archetype.visualStyle.patterns}

TYPOGRAPHY:
- Heading Fonts: ${archetype.typography.heading}
- Body Fonts: ${archetype.typography.body}
${archetype.typography.code ? `- Code Fonts: ${archetype.typography.code}` : ''}
${archetype.typography.avoid ? `- AVOID: ${archetype.typography.avoid}` : ''}

TONE ARCHETYPE: ${archetype.toneArchetype}
Suggested Keywords: ${archetype.toneKeywords.join(', ')}

IMPORTANT: Use these guidelines as inspiration, but make the brand UNIQUE to ${manifest.brandName}.
Don't just copy the suggestions - adapt them to reflect this specific business's personality and value proposition.

1. COLOR PALETTE (with sophisticated range and psychology):

PRIMARY Colors (2-3 variations):
- Choose colors aligned with ${industry} psychology
- If value prop emphasizes SPEED → Warmer, energetic tones
- If value prop emphasizes TRUST → Cooler, stable tones
- If value prop emphasizes INNOVATION → Bolder, unexpected combinations
- Provide light, standard, AND dark variations for depth
- Example:
  { "name": "Ocean Blue", "hex": "#0066FF", "usage": "Primary CTAs, hero sections" }
  { "name": "Ocean Blue Light", "hex": "#3399FF", "usage": "Hover states, highlights" }
  { "name": "Ocean Blue Dark", "hex": "#004499", "usage": "Text on light backgrounds" }

SECONDARY Colors (2-3):
- Must complement primary through color theory (analogous or complementary)
- Add visual interest and hierarchy
- NOT just a darker version of primary
- Example: { "name": "Coral Accent", "hex": "#FF6B6B", "usage": "Important highlights, success states" }

ACCENT Colors (2-3):
- Bold, attention-grabbing for key moments
- High contrast with primary for visibility
- Use industry-appropriate accent hues
- Example: { "name": "Electric Lime", "hex": "#CCFF00", "usage": "CTAs, achievement badges, alerts" }

NEUTRAL Colors (4-6 REQUIRED):
- Full grayscale range: Pure white → 2-3 light grays → 1 mid gray → 2 dark grays → Rich black
- AVOID pure black (#000000), use warm or cool blacks (#0A0A0A, #1A1A1A)
- Example:
  { "name": "Soft White", "hex": "#FAFAFA", "usage": "Main backgrounds" }
  { "name": "Light Gray", "hex": "#F5F5F5", "usage": "Card backgrounds" }
  { "name": "Medium Gray", "hex": "#E5E5E5", "usage": "Borders, dividers" }
  { "name": "Slate Gray", "hex": "#71717A", "usage": "Secondary text" }
  { "name": "Dark Gray", "hex": "#27272A", "usage": "Primary text" }
  { "name": "Rich Black", "hex": "#0A0A0A", "usage": "Headings, strong emphasis" }

2. TYPOGRAPHY (industry-appropriate fonts):

Heading Font:
- Choose based on brand personality: ${archetype.typography.heading}
- Provide weights: [600, 700, 800] for hierarchy
- Sizes: h1 (48-60px), h2 (36-42px), h3 (24-30px), h4 (18-24px)

Body Font:
- Readable, accessible: ${archetype.typography.body}
- Weights: [400, 500, 600]
- Sizes: large (18-20px), regular (16px), small (14px)

${archetype.typography.code ? `Code Font: ${archetype.typography.code} (weights: [400, 500])` : ''}

3. TONE OF VOICE (specific, not generic):

Keywords (5-7 specific descriptors):
- DON'T use: "Professional", "Trustworthy", "Innovative" (too generic)
- DO use specific descriptors that reflect THIS business
- Example for tax software: ["No-jargon clarity", "Stress-free expertise", "15-minute simple", "Reassuring neighbor", "IRS-proof confident"]

Personality Traits (3-4 with specific labels):
- Make traits SPECIFIC to ${industry}
- Example:
  { "trait": "Formal expertise vs Friendly guidance", "value": 35, "leftLabel": "Formal expertise", "rightLabel": "Friendly guidance" }
  { "trait": "Serious business vs Lighthearted approach", "value": 60, "leftLabel": "Serious business", "rightLabel": "Lighthearted approach" }

4. LOGO VARIATIONS (2-3 types):

Provide varied logo types:
- "Primary": Full color for main usage
- "Monochrome": Single color for special contexts
- "Inverted": For dark backgrounds
Optional: "Icon-only" for favicons

⚠️ CRITICAL VALIDATION REQUIREMENTS - Your response will be automatically validated:

**Colors (REQUIRED):**
- ✅ At least 2 primary colors (including variations)
- ✅ At least 2 secondary colors
- ✅ At least 2 accent colors
- ✅ At least 4 neutral colors (FULL grayscale range required)
- ✅ All colors MUST have "name", "hex", AND "usage" fields
- ✅ Usage field must be specific and contextual
- ❌ DO NOT return generic names like "Color 1", "Color 2"
- ❌ DO NOT skip variations (light/dark)

**Typography (REQUIRED):**
- ✅ Must include both "heading" and "body" font configs
- ✅ Each must have: family, weights (array), sizes (object)

**Tone (REQUIRED):**
- ✅ At least 5 specific keywords (not generic)
- ✅ At least 3 personality traits
- ✅ Each trait must have: trait, value (0-100), leftLabel, rightLabel

**Logo (REQUIRED):**
- ✅ At least 2 variations
- ✅ Each must have: name, description

Return ONLY valid JSON in this EXACT format (no markdown, no code blocks):
{
  "colors": {
    "primary": [
      { "name": "Ocean Blue", "hex": "#0066FF", "usage": "Primary CTAs, hero sections" },
      { "name": "Ocean Blue Light", "hex": "#3399FF", "usage": "Hover states, highlights" }
    ],
    "secondary": [
      { "name": "Coral Accent", "hex": "#FF6B6B", "usage": "Important highlights, success states" },
      { "name": "Coral Deep", "hex": "#E63946", "usage": "Strong emphasis, alerts" }
    ],
    "accent": [
      { "name": "Electric Lime", "hex": "#CCFF00", "usage": "CTAs, achievement badges" },
      { "name": "Bright Cyan", "hex": "#00D9FF", "usage": "Links, interactive elements" }
    ],
    "neutral": [
      { "name": "Soft White", "hex": "#FAFAFA", "usage": "Main backgrounds" },
      { "name": "Light Gray", "hex": "#F5F5F5", "usage": "Card backgrounds" },
      { "name": "Medium Gray", "hex": "#E5E5E5", "usage": "Borders, dividers" },
      { "name": "Slate Gray", "hex": "#71717A", "usage": "Secondary text" },
      { "name": "Dark Gray", "hex": "#27272A", "usage": "Primary text" },
      { "name": "Rich Black", "hex": "#0A0A0A", "usage": "Headings, strong emphasis" }
    ]
  },
  "typography": {
    "heading": {
      "family": "Inter",
      "weights": ["600", "700", "800"],
      "sizes": { "h1": "48px", "h2": "36px", "h3": "24px", "h4": "20px" }
    },
    "body": {
      "family": "Inter",
      "weights": ["400", "500", "600"],
      "sizes": { "large": "18px", "regular": "16px", "small": "14px" }
    }
  },
  "tone": {
    "keywords": ["No-jargon clarity", "Stress-free expertise", "15-minute simple", "Reassuring neighbor", "IRS-proof confident"],
    "personality": [
      { "trait": "Formal expertise vs Friendly guidance", "value": 35, "leftLabel": "Formal expertise", "rightLabel": "Friendly guidance" },
      { "trait": "Serious business vs Lighthearted approach", "value": 60, "leftLabel": "Serious business", "rightLabel": "Lighthearted approach" },
      { "trait": "Technical precision vs Plain language", "value": 75, "leftLabel": "Technical precision", "rightLabel": "Plain language" }
    ]
  },
  "logo": {
    "variations": [
      { "name": "Primary", "description": "Full color logo for light backgrounds" },
      { "name": "Monochrome", "description": "Single color version" }
    ]
  },
  "designSystem": {
    "shadows": {
      "xs": "0 1px 2px rgba(0,0,0,0.05)",
      "sm": "0 2px 8px rgba(0,0,0,0.08)",
      "md": "0 4px 16px rgba(0,0,0,0.12)",
      "lg": "0 8px 32px rgba(0,0,0,0.16)",
      "xl": "0 16px 64px rgba(0,0,0,0.20)",
      "colored": "0 8px 32px rgba(0, 102, 255, 0.20)"
    },
    "elevation": {
      "base": 0,
      "raised": 1,
      "overlay": 2,
      "modal": 3,
      "popover": 4
    },
    "blur": {
      "sm": "4px",
      "md": "8px",
      "lg": "16px",
      "xl": "40px"
    },
    "transitions": {
      "fast": "150ms ease",
      "normal": "250ms ease",
      "slow": "400ms ease",
      "bounce": "500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    },
    "iconography": {
      "style": "outlined",
      "library": "lucide",
      "sizes": {
        "sm": "16px",
        "md": "24px",
        "lg": "32px",
        "xl": "48px"
      }
    }
  }
}

5. DESIGN SYSTEM (for visual depth and polish):

SHADOWS (6 levels):
Generate shadow values that create depth and hierarchy:
- xs: Subtle (for borders, dividers) - "0 1px 2px rgba(0,0,0,0.05)"
- sm: Card elevation - "0 2px 8px rgba(0,0,0,0.08)"
- md: Elevated elements - "0 4px 16px rgba(0,0,0,0.12)"
- lg: Modals, dropdowns - "0 8px 32px rgba(0,0,0,0.16)"
- xl: Hero elements - "0 16px 64px rgba(0,0,0,0.20)"
- colored: Brand shadow using primary color at 20% opacity
  Example: If primary is #0066FF, colored shadow is "0 8px 32px rgba(0, 102, 255, 0.20)"

ELEVATION (z-index scale):
- base: 0 (flat elements)
- raised: 1 (slightly lifted)
- overlay: 2 (cards, panels)
- modal: 3 (dialogs)
- popover: 4 (tooltips, dropdowns)

BLUR (for glassmorphism effects):
- sm: 4px (subtle blur)
- md: 8px (standard glassmorphism)
- lg: 16px (heavy blur)
- xl: 40px (backdrop effects)

TRANSITIONS (animation timings):
- fast: 150ms ease (hover states, small interactions)
- normal: 250ms ease (default transitions)
- slow: 400ms ease (complex animations)
- bounce: 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55) (playful effects)

ICONOGRAPHY:
- style: Choose based on ${industry} archetype
  * ${archetype.visualStyle.iconStyle} is recommended
  * "outlined" = minimal, modern
  * "solid" = bold, impactful
  * "duo-tone" = tech-forward, sophisticated
- library: "lucide" (default), "heroicons", or "phosphor"
- sizes: sm (16px), md (24px), lg (32px), xl (48px)

6. BRAND RATIONALE (CRITICAL - Show your reasoning):

This is YOUR UNIQUE MOAT. Provide transparent, evidence-based reasoning for WHY you made each design choice.

COLORS RATIONALE (2-3 sentences):
Explain why these specific colors were chosen for ${manifest.brandName}:
- Reference the industry (${industry})
- Reference the target persona's pain points: ${persona?.painPoints?.join(', ') || 'their needs'}
- If possible, reference the value proposition: ${valueProp?.headline}
- Explain the psychological impact

Example: "Tax-season green (#2ECC71) was chosen because it evokes 'money saved' and financial growth, directly addressing the pain point of 'stressful tax filing'. The warm green creates a reassuring, optimistic feel rather than the intimidating blues often used in finance, making tax prep feel approachable for small business owners."

TYPOGRAPHY RATIONALE (1-2 sentences):
Explain why these fonts match ${manifest.brandName}:
- How they reflect the brand personality
- Why they work for ${industry}
- How they serve the ${persona?.role || 'target audience'}

Example: "Inter was chosen for its clean readability and professional tech aesthetic, perfect for software that needs to feel 'no-jargon' and accessible. The rounded letterforms soften the technical nature of tax filing."

TONE RATIONALE (1-2 sentences):
Explain why this specific tone (not generic "professional"):
- How it differentiates from competitors
- How it addresses the persona's emotional needs
- Why it fits the ${industry} archetype

Example: "The 'Expert neighbor' tone balances authority with approachability - ${persona?.name} needs to trust the tool but doesn't want to feel talked down to. This tone avoids both the sterile corporate speak of traditional tax software and the overly casual tone that might undermine credibility."

OVERALL BRAND DIRECTION (2-3 sentences):
Synthesize everything - why does this complete brand system work for ${manifest.brandName}?
- How all elements work together
- What makes it unique in ${industry}
- What emotional response it creates

Add rationale field to JSON:
{
  "rationale": {
    "colors": "Tax-season green (#2ECC71) was chosen because...",
    "typography": "Inter was chosen for its clean readability...",
    "tone": "The 'Expert neighbor' tone balances...",
    "overall": "This brand system creates a reassuring, no-nonsense experience..."
  }
}

Return JSON matching the example above with ALL fields including designSystem AND rationale.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = JSON.parse(response.choices[0].message.content || "{}");

  // Validate content with Zod schema
  try {
    validateBrandGuideOutput(content);
    console.log('✅ [Generate] [Brand Guide] Validation passed');
  } catch (error: any) {
    console.error('❌ [Generate] [Brand Guide] Validation Failed:', error.message);
    console.error('❌ [Generate] [Brand Guide] Raw AI response:', JSON.stringify(content, null, 2));
    throw new Error(`Brand guide generation failed validation: ${error.message}`);
  }

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
    logoVariationsWithImages.forEach((variation: any, idx: number) => {
      console.log(`  - Variation ${idx + 1} (${variation.name}):`);
      console.log(`    - SVG: ${variation.imageUrl ? '✅ Generated' : '❌ Missing'}`);
      if (variation.imageUrl) {
        console.log(`    - SVG Data URL: ${variation.imageUrl.substring(0, 60)}...`);
      }
    });

    // Check if any logos were actually generated (not skipped due to limit)
    const logosGenerated = logoVariationsWithImages.some((v: any) => v.imageUrl);
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
      },
      designSystem: content.designSystem || undefined,
      rationale: content.rationale || undefined
    }
  };

  // Log rationale for debugging
  if (content.rationale) {
    console.log('✅ [Brand Guide] Rationale generated:');
    console.log('  - Colors:', content.rationale.colors?.substring(0, 80) + '...');
    console.log('  - Typography:', content.rationale.typography?.substring(0, 80) + '...');
    console.log('  - Tone:', content.rationale.tone?.substring(0, 80) + '...');
    console.log('  - Overall:', content.rationale.overall?.substring(0, 80) + '...');
  }

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

  const persona = manifest?.strategy?.persona;
  const valueProp = manifest?.strategy?.valueProp;
  const tone = manifest?.identity?.tone?.keywords || [];

  // Detect industry and get archetype for personalized guidance
  const industry = detectIndustry({}, persona);
  const archetype = getArchetype(industry);

  console.log(`🎨 [Style Guide] Detected industry: ${industry}`);

  const prompt = `Generate a comprehensive, brand-specific style guide for ${manifest.brandName}.

BRAND CONTEXT:
- Target: ${persona?.name || 'customers'} (${persona?.role || 'users'} at ${persona?.company || 'companies'})
- Industry: ${persona?.industry || industry}
- Pain Points: ${persona?.painPoints?.join(', ') || 'Not specified'}
- Value Proposition: ${valueProp?.headline || 'Delivering value'}
- Brand Tone: ${tone.join(', ') || 'Professional'}

INDUSTRY-SPECIFIC GUIDANCE (${industry}):
- CTA Style: ${archetype.copyPatterns.ctaStyle}
- Energy Level: ${archetype.copyPatterns.energyLevel || 'MEDIUM'}
- Use Words: ${archetype.copyPatterns.useWords?.join(', ') || 'Not specified'}
- Avoid Jargon: ${archetype.copyPatterns.avoidJargon?.join(', ') || 'None'}
${archetype.copyPatterns.canUseJargon ? `- Can Use Industry Jargon: ${archetype.copyPatterns.canUseJargon.join(', ')}` : ''}

IMPORTANT: All content must be SPECIFIC to ${manifest.brandName}, not generic templates.
- CTAs should reference actual pain points: ${persona?.painPoints?.[0] || 'customer needs'}
- Forms should be industry-appropriate
- Card content should reflect real business value

Generate:

1. Component Styles:
   - Button styles (primary, secondary, outline)
   - Card styles (style, borderRadius, shadow)
   - Input styles (style, borderRadius, focusStyle)
   - Badge styles (style, borderRadius)
   - Spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)

2. Form Content (match brand tone):
   - Newsletter subscribe: title, description, emailLabel, buttonText, incentiveText
   - Contact us: title, description, fields array (label, placeholder, type), buttonText
   - Lead magnet: title, description, offerName, fields array, buttonText
   - Demo request: title, description, fields array, buttonText

3. CTA Variations (6-8 each):
   - Primary CTAs: conversion-focused actions
   - Secondary CTAs: supporting actions
   - Tertiary CTAs: minimal emphasis/ghost buttons
   - Social CTAs: engagement actions
   - Destructive CTAs: cancellations/deletions

4. Card Content (realistic examples):
   - Feature cards: title, description, 3 features, CTA
   - Stat cards: metric (number), label, optional trend
   - Pricing cards: tier name, description, price, period, 4 features, CTA, highlighted flag
   - Testimonial cards: quote, author name, role, company, rating (1-5)

All content must match the brand tone and persona. Use realistic, specific examples.

Return ONLY valid JSON matching this structure:
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
  "badges": {
    "style": "soft",
    "borderRadius": "full"
  },
  "spacing": {
    "scale": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px", "2xl": "48px", "3xl": "64px" }
  },
  "forms": {
    "newsletter": {
      "title": "Stay Updated",
      "description": "Get weekly insights delivered to your inbox",
      "emailLabel": "Email Address",
      "buttonText": "Subscribe Now",
      "incentiveText": "Join 10,000+ subscribers • Unsubscribe anytime"
    },
    "contact": {
      "title": "Get in Touch",
      "description": "We'd love to hear from you",
      "fields": [
        { "label": "Name", "placeholder": "Your name", "type": "text" },
        { "label": "Email", "placeholder": "your@email.com", "type": "email" },
        { "label": "Message", "placeholder": "How can we help?", "type": "textarea" }
      ],
      "buttonText": "Send Message"
    },
    "leadMagnet": {
      "title": "Download Free Guide",
      "description": "Get instant access to our comprehensive guide",
      "offerName": "Ultimate Guide to Success",
      "fields": [
        { "label": "Name", "placeholder": "Your name", "required": true },
        { "label": "Work Email", "placeholder": "you@company.com", "required": true },
        { "label": "Company", "placeholder": "Company name", "required": false }
      ],
      "buttonText": "Download Now"
    },
    "demoRequest": {
      "title": "Request a Demo",
      "description": "See how we can help your team",
      "fields": [
        { "label": "Full Name", "placeholder": "Jane Smith", "type": "text" },
        { "label": "Work Email", "placeholder": "jane@company.com", "type": "email" },
        { "label": "Company", "placeholder": "Company name", "type": "text" },
        { "label": "Phone", "placeholder": "+1 (555) 000-0000", "type": "tel" }
      ],
      "buttonText": "Schedule Demo"
    }
  },
  "ctas": {
    "primary": ["Get Started", "Start Free Trial", "Sign Up Now", "Claim Your Spot", "Download Now", "Book Demo"],
    "secondary": ["Learn More", "Watch Demo", "See Pricing", "Read Docs", "Talk to Sales", "Browse Resources"],
    "tertiary": ["View All", "Skip for Now", "No Thanks", "Show More", "Go Back", "Get Help"],
    "social": ["Share", "Save", "Join Community", "Follow Us"],
    "destructive": ["Cancel Subscription", "Delete Account", "Remove Item"]
  },
  "cardContent": {
    "feature": [
      {
        "title": "AI-Powered Automation",
        "description": "Automate your workflow with intelligent AI",
        "features": ["Smart detection", "Auto-updates", "24/7 monitoring"],
        "cta": "Learn More"
      }
    ],
    "stat": [
      {
        "metric": "98%",
        "label": "Customer Satisfaction",
        "trend": "+12%"
      }
    ],
    "pricing": [
      {
        "tier": "Professional",
        "description": "For growing teams",
        "price": "$49",
        "period": "month",
        "features": ["Unlimited projects", "Advanced analytics", "Priority support", "Custom integrations"],
        "cta": "Get Started",
        "highlighted": true
      }
    ],
    "testimonial": [
      {
        "quote": "This tool transformed how we approach brand strategy.",
        "author": "Sarah Chen",
        "role": "Marketing Director",
        "company": "TechCorp",
        "rating": 5
      }
    ]
  }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = JSON.parse(response.choices[0].message.content || "{}");

  // Validate content with Zod schema
  try {
    validateStyleGuideOutput(content);
    console.log('✅ [Generate] [Style Guide] Validation passed');
  } catch (error: any) {
    console.error('❌ [Generate] [Style Guide] Validation Failed:', error.message);
    console.error('❌ [Generate] [Style Guide] Raw AI response:', JSON.stringify(content, null, 2));
    throw new Error(`Style guide generation failed validation: ${error.message}`);
  }

  return {
    "components": {
      buttons: content.buttons,
      cards: content.cards,
      inputs: content.inputs,
      badges: content.badges,
      spacing: content.spacing,
      forms: content.forms,
      ctas: content.ctas,
      cardContent: content.cardContent
    }
  };
}

async function generateLandingPage(manifest: any) {
  // Validate manifest has required data
  if (!manifest?.strategy?.persona || !manifest?.strategy?.valueProp) {
    console.error('❌ [Generate] [Landing Page] Pre-flight Check Failed: Missing strategy data', {
      hasPersona: !!manifest?.strategy?.persona,
      hasValueProp: !!manifest?.strategy?.valueProp
    });
    throw new Error('Manifest missing required strategy data. Cannot generate landing page.');
  }

  const persona = manifest.strategy.persona;
  const valueProp = manifest.strategy.valueProp;

  // NEW: Detect industry for landing page guidance
  const industry = detectIndustry({}, persona);
  const archetype = getArchetype(industry);

  console.log(`🎨 [Landing Page] Detected industry: ${industry}, using archetype guidance`);
  console.log(`🎨 [Landing Page] Tone: ${archetype.toneArchetype}, CTA Style: ${archetype.copyPatterns.ctaStyle}`);

  const prompt = `You are a conversion-focused landing page designer specializing in ${industry} businesses.

BUSINESS CONTEXT:
Company: ${manifest.brandName}
Industry: ${persona.industry || industry}
Target Persona: ${persona.name} - ${persona.role} at ${persona.company}
Pain Points: ${persona.painPoints?.join(', ') || 'Not specified'}
Goals: ${persona.goals?.join(', ') || 'Not specified'}
Value Proposition: ${valueProp.headline}
Key Benefits: ${valueProp.benefits?.join(', ') || 'Value delivery'}

INDUSTRY-SPECIFIC LANDING PAGE GUIDANCE (${industry}):

TONE & COPY:
- Tone Archetype: ${archetype.toneArchetype}
- CTA Style: ${archetype.copyPatterns.ctaStyle}
- Use Words: ${archetype.copyPatterns.useWords?.join(', ') || 'effective, reliable'}
${archetype.copyPatterns.avoidJargon ? `- AVOID Jargon: ${archetype.copyPatterns.avoidJargon.join(', ')}` : ''}
${archetype.copyPatterns.canUseJargon ? `- Can Use Industry Terms: ${archetype.copyPatterns.canUseJargon.join(', ')}` : ''}
- Energy Level: ${archetype.copyPatterns.energyLevel || 'MEDIUM'}

VISUAL STYLE:
- Border Radius: ${archetype.visualStyle.borderRadius}
- Shadow Style: ${archetype.visualStyle.shadows}
- Icon Style: ${archetype.visualStyle.iconStyle}
- Pattern Style: ${archetype.visualStyle.patterns}

CRITICAL REQUIREMENTS:

1. VISUAL HIERARCHY:
   - Hero headline: 48-64px (bold, attention-grabbing)
   - Hero subheadline: 18-24px (supporting detail)
   - Section headlines: 32-40px
   - Feature titles: 20-24px
   - Body text: 16-18px
   - Use size contrast to guide eye flow: Hero → Features → Social Proof → CTA

2. REALISTIC CONTENT (NOT GENERIC):
   - Hero headline must reference ACTUAL pain points: "${persona.painPoints?.join(' or ') || 'their challenges'}"
   - Features must solve SPECIFIC problems, not vague "improve workflow"
   - Testimonials must sound like REAL people, not marketing copy
   - Stats must be concrete: "15 minutes saved per day" NOT "faster workflow"
   - Example (tax-prep): "File your taxes in 15 minutes, not 3 hours" NOT "Simplify your taxes"
   - Example (dev-tools): "Deploy to production in 60 seconds" NOT "Ship faster"

3. LAYOUT VARIETY (choose one style per section):
   HERO OPTIONS:
   - Single-column centered (calm, focused)
   - Two-column split (visual + text)
   - Full-width background with overlay (bold, immersive)

   FEATURES LAYOUT:
   - 3-column grid (standard, scannable)
   - 2-column alternating (detailed, visual)
   - Single column with large icons (mobile-friendly, simple)

   SOCIAL PROOF:
   - Testimonial cards in grid (trust-focused)
   - Stats banner (metrics-driven)
   - Logo wall + quote (authority)

4. INDUSTRY-SPECIFIC HERO SECTIONS:
   ${industry === 'tax-prep' ? '- Emphasize TIME SAVED and STRESS REDUCTION\n   - Use urgency: "File before the deadline" or "Done in 15 minutes"\n   - Reference IRS compliance, accuracy, no jargon' : ''}
   ${industry === 'dev-tools' ? '- Emphasize SPEED and TECHNICAL POWER\n   - Use action verbs: "Ship", "Deploy", "Build", "Scale"\n   - Include code snippets, terminal examples, or CLI references\n   - Can use technical jargon: API, SDK, CLI, localhost' : ''}
   ${industry === 'fitness' ? '- Emphasize TRANSFORMATION and ENERGY\n   - Use motivational language: "Crush your goals", "Transform your body"\n   - Include before/after visuals, progress metrics\n   - High energy, bold CTAs' : ''}
   ${industry === 'finance' ? '- Emphasize TRUST, SECURITY, and WEALTH GROWTH\n   - Use professional tone: "Secure your future", "Strategic growth"\n   - Avoid "cheap" or "easy" - use "intelligent", "optimized", "strategic"\n   - Include security badges, certifications' : ''}
   ${industry === 'healthcare' ? '- Emphasize CARE, COMPASSION, and EXPERTISE\n   - Use reassuring tone: "Get the care you need", "We understand"\n   - Include credentials, certifications, compassionate language' : ''}

5. SOCIAL PROOF:
   - Generate 2-3 testimonials with realistic customer quotes relevant to the value proposition
   - Generate 1-2 stats (e.g., "10,000+ customers", "50% time saved")
   - Testimonials must include: full name, realistic role, company name
   - Stats must be SPECIFIC and industry-relevant
   - socialProof MUST include a "type" field: either "testimonial" or "stat"
   - For testimonials, use "content" field with the full testimonial text

6. FEATURES:
   - Generate 6 features that directly address the persona's pain points: ${persona.painPoints?.join(', ') || 'their challenges'}
   - Each feature must be SPECIFIC, not generic
   - Use industry-appropriate icons (${archetype.visualStyle.iconStyle})
   - Example (tax-prep): "Auto-fill from W-2 scan" NOT "Smart automation"
   - Example (dev-tools): "One-click Vercel deploy" NOT "Easy deployment"

7. VISUAL ELEMENTS:
   - Specify gradient backgrounds for hero (if energetic brand)
   - Suggest illustration style (abstract, product screenshot, diagram)
   - Include icon references (using Lucide icon names)
   - Specify color usage (primary for CTAs, accent for highlights)

Return ONLY valid JSON in this EXACT format:
{
  "navigation": {
    "logo": "${manifest.brandName}",
    "links": ["Features", "Pricing", "Customers", "Resources", "Company"]
  },
  "hero": {
    "headline": "${valueProp.headline || 'Transform your workflow'}",
    "subheadline": "${valueProp.subheadline || 'Relevant supporting text based on the value prop'}",
    "cta": { "primary": "Get Started", "secondary": "Learn More" },
    "layout": "two-column",
    "visualElement": {
      "type": "product-screenshot",
      "description": "Dashboard preview showing key features",
      "position": "right"
    }
  },
  "features": [
    { "title": "Specific Feature Title", "description": "Detailed benefit that solves a specific pain point", "icon": "zap" },
    { "title": "Feature Title", "description": "Benefit description", "icon": "shield" },
    { "title": "Feature Title", "description": "Benefit description", "icon": "clock" },
    { "title": "Feature Title", "description": "Benefit description", "icon": "users" },
    { "title": "Feature Title", "description": "Benefit description", "icon": "trending-up" },
    { "title": "Feature Title", "description": "Benefit description", "icon": "check-circle" }
  ],
  "featuresLayout": "grid-3-column",
  "socialProof": [
    { "type": "testimonial", "content": "\\"Detailed testimonial quote that sounds realistic and references actual benefits\\" - Full Name, Realistic Role at Realistic Company Name" },
    { "type": "testimonial", "content": "\\"Another realistic testimonial with specific outcomes\\" - Full Name, Job Title at Company" },
    { "type": "stat", "content": "10,000+ teams saved 15 hours/week with ${manifest.brandName}" },
    { "type": "stat", "content": "Specific metric: 3x faster time to value" }
  ],
  "socialProofLayout": "testimonial-grid",
  "footer": {
    "sections": [
      { "title": "Product", "links": ["Features", "Pricing", "Integration", "Updates"] },
      { "title": "Company", "links": ["About", "Careers", "Contact", "Blog"] },
      { "title": "Resources", "links": ["Documentation", "Help Center", "Community", "API"] }
    ]
  }
}

IMPORTANT:
- Match tone and content to target persona: ${persona.role}
- Reference actual pain points: ${persona.painPoints?.join(', ') || 'their challenges'}
- Use ${industry}-appropriate language and CTAs
- Make hero headline SPECIFIC to pain points, not generic
- Features must solve REAL problems with concrete examples
- Testimonials must sound authentic, not marketing-speak
- Stats must be concrete and industry-relevant`;

  console.log('🎨 [Generate] Generating landing page with prompt length:', prompt.length);

  let response;
  try {
    response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });
  } catch (err: any) {
    console.error('❌ [Generate] OpenAI API error for landing page:', err);
    throw new Error(`OpenAI API error: ${err.message}`);
  }

  const content = JSON.parse(response.choices[0].message.content || "{}");

  // Validate content with Zod schema
  try {
    validateLandingPageOutput(content);
    console.log('✅ [Generate] [Landing Page] Validation passed');
  } catch (error: any) {
    console.error('❌ [Generate] [Landing Page] Validation Failed:', error.message);
    console.error('❌ [Generate] [Landing Page] Raw AI response:', JSON.stringify(content, null, 2));
    throw new Error(`Landing page generation failed validation: ${error.message}`);
  }

  return {
    "previews": {
      landingPage: content
    }
  };
}

async function generateStrategyContent(manifest: any) {
  // Validate manifest exists
  if (!manifest?.brandName || !manifest?.strategy?.persona || !manifest?.strategy?.valueProp) {
    throw new Error('Manifest missing required strategy data. Cannot generate strategy content.');
  }

  const persona = manifest.strategy.persona;
  const valueProp = manifest.strategy.valueProp;
  const brandName = manifest.brandName;
  const industry = persona.industry || 'Professional Services';

  const prompt = `Generate competitive positioning and messaging variations for ${brandName} targeting ${persona.name} (${persona.role} at ${persona.company} in ${industry}).

Value Proposition: ${valueProp.headline}
Key Benefits: ${valueProp.benefits?.join(', ') || 'Value delivery'}
Pain Points Addressed: ${persona.painPoints?.join(', ') || 'Business challenges'}

Generate:

1. Competitive Positioning Map:
   - 3-4 competitor names (realistic industry competitors)
   - X/Y coordinates (0-100) for each competitor
   - Your brand should be at x: 75, y: 75 (top-right quadrant - High Innovation + High Value)
   - Competitors should be spread across other quadrants

2. Key Differentiators (3-5):
   - Title (short, impactful)
   - Description (1-2 sentences explaining the advantage)
   - Optional icon name (e.g., "Zap", "Shield", "Users")

3. Messaging Variations (4-6):
   - Different message types for different contexts
   - Each with: type, text, context (where to use), useCase
   - Types: "Benefit-First", "Problem-Agitate-Solve", "Social Proof", "Urgency", "Question-Based", etc.

Return ONLY valid JSON:
{
  "competitivePositioning": {
    "competitors": [
      { "name": "Legacy Inc.", "x": 15, "y": 60 },
      { "name": "CheapTool", "x": 30, "y": 30 },
      { "name": "Enterprise Corp", "x": 65, "y": 45 },
      { "name": "${brandName}", "x": 75, "y": 75 }
    ],
    "differentiators": [
      {
        "title": "Speed to Value",
        "description": "Deploy in minutes, not months. 3x faster than legacy solutions.",
        "icon": "Zap"
      },
      {
        "title": "Enterprise Trust",
        "description": "SOC2 compliant security with consumer-grade usability.",
        "icon": "Shield"
      }
    ]
  },
  "messagingVariations": [
    {
      "type": "Benefit-First",
      "text": "${valueProp.headline}",
      "context": "Best for: Landing Page Hero, Ads",
      "useCase": "High-visibility conversion points"
    },
    {
      "type": "Problem-Agitate-Solve",
      "text": "${persona.painPoints?.[0] || 'Problem'} Stop the chaos. ${valueProp.solution}",
      "context": "Best for: Email Outreach, Sales Calls",
      "useCase": "Direct engagement with prospects"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = JSON.parse(response.choices[0].message.content || "{}");

  return {
    "strategy": {
      competitivePositioning: content.competitivePositioning,
      messagingVariations: content.messagingVariations
    }
  };
}
