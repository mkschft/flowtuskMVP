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

  const prompt = `You are a brand designer. Generate a comprehensive brand guide for:

Company: ${manifest.brandName}
Persona: ${persona.name} - ${persona.role} at ${persona.company}
Value Prop: ${valueProp.headline || 'Innovative solution'}

Generate a brand guide with:
1. Color palette (primary, secondary, accent, AND NEUTRAL colors - whites, grays, blacks)
2. Typography (heading and body fonts with sizes)
3. Tone of voice (3-5 keywords and personality traits)
4. Logo variations (2-3 types)

⚠️ CRITICAL VALIDATION REQUIREMENTS - Your response will be automatically validated. If ANY of these are missing, generation will FAIL:

**Colors (REQUIRED):**
- ✅ At least 1 primary color
- ✅ At least 1 secondary color  
- ✅ At least 1 accent color
- ✅ At least 2 neutral colors (e.g., White #FFFFFF, Light Gray #F5F5F5, Dark Gray #333333)
- ✅ All colors MUST have "name", "hex", AND "usage" fields
- ✅ Usage field must describe when/where to use this color (e.g., "CTA buttons", "Backgrounds", "Text")
- ❌ DO NOT return empty arrays for any color type
- ❌ DO NOT skip neutral colors (they are required for UI)
- ❌ DO NOT skip the usage field (it is required for design guidance)

**Typography (REQUIRED):**
- ✅ Must include both "heading" and "body" font configs
- ✅ Each must have: family, weights (array), sizes (object)

**Tone (REQUIRED):**
- ✅ At least 3 keywords
- ✅ At least 2 personality traits
- ✅ Each trait must have: trait, value (0-100), leftLabel, rightLabel

**Logo (REQUIRED):**
- ✅ At least 2 variations
- ✅ Each must have: name, description

Return ONLY valid JSON in this EXACT format (no markdown, no code blocks):
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

  const persona = manifest?.strategy?.persona;
  const valueProp = manifest?.strategy?.valueProp;
  const tone = manifest?.identity?.tone?.keywords || [];

  const prompt = `Generate a comprehensive style guide for ${manifest.brandName} targeting ${persona?.name || 'customers'} (${persona?.role || 'users'} at ${persona?.company || 'companies'}).

Brand Tone: ${tone.join(', ') || 'Professional'}
Value Proposition: ${valueProp?.headline || 'Delivering value'}

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

  const prompt = `Generate a landing page for:
Company: ${manifest.brandName}
Value Prop: ${valueProp.headline}
Target: ${persona.role}
Industry: ${persona.industry || 'Technology'}
Location: ${persona.location || 'Global'}

CRITICAL REQUIREMENTS:
1. Generate 2-3 testimonials with realistic customer quotes relevant to the value proposition
2. Generate 1-2 stats (e.g., "10,000+ customers", "50% faster workflow")
3. Generate 6 features that directly address the persona's pain points
4. Use the hero headline from the value proposition
5. socialProof MUST include a "type" field: either "testimonial" or "stat"
6. For testimonials, use "content" field (not "quote") with the full testimonial text

Return ONLY valid JSON in this EXACT format:
{
  "navigation": {
    "logo": "${manifest.brandName}",
    "links": ["Features", "Pricing", "Customers", "Resources", "Company"]
  },
  "hero": {
    "headline": "${valueProp.headline || 'Transform your workflow'}",
    "subheadline": "${valueProp.subheadline || 'Relevant supporting text based on the value prop'}",
    "cta": { "primary": "Get Started", "secondary": "Learn More" }
  },
  "features": [
    { "title": "Feature Title", "description": "Detailed benefit description", "icon": "sparkles" },
    { "title": "Feature Title", "description": "Detailed benefit description", "icon": "calendar" },
    { "title": "Feature Title", "description": "Detailed benefit description", "icon": "layers" },
    { "title": "Feature Title", "description": "Detailed benefit description", "icon": "chart" },
    { "title": "Feature Title", "description": "Detailed benefit description", "icon": "users" },
    { "title": "Feature Title", "description": "Detailed benefit description", "icon": "settings" }
  ],
  "socialProof": [
    { "type": "testimonial", "content": "\\"Detailed testimonial quote that sounds realistic\\" - Full Name, Role at Company" },
    { "type": "testimonial", "content": "\\"Another realistic testimonial\\" - Full Name, Position" },
    { "type": "stat", "content": "10,000+ teams use ${manifest.brandName}" }
  ],
  "footer": {
    "sections": [
      { "title": "Product", "links": ["Features", "Pricing", "Integration", "Updates"] },
      { "title": "Company", "links": ["About", "Careers", "Contact", "Blog"] },
      { "title": "Resources", "links": ["Documentation", "Help Center", "Community", "API"] }
    ]
  }
}

IMPORTANT: Match the tone and content to the target persona (${persona.role}) and value proposition.`;

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
