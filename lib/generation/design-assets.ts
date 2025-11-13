import OpenAI from "openai";
import type {
  BrandGuide,
  StyleGuide,
  LandingPage,
  PositioningValueProp,
} from "@/lib/types/design-assets";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ICP {
  persona_name: string;
  persona_role: string;
  persona_company: string;
  location: string;
  country: string;
  title: string;
  description: string;
  pain_points: string[];
  goals: string[];
}

// Helper to extract industry from company name
function extractIndustry(companyName: string): string {
  const keywords: Record<string, string> = {
    'tech|software|saas|app|digital': 'Technology',
    'consulting|advisory|strategy': 'Consulting',
    'agency|marketing|creative|design': 'Agency',
    'finance|bank|investment|capital': 'Finance',
    'healthcare|medical|health|hospital': 'Healthcare',
    'education|school|university|learning': 'Education',
    'retail|ecommerce|shop|store': 'Retail',
    'manufacturing|industrial|factory': 'Manufacturing',
    'real estate|property': 'Real Estate',
  };

  const lowerCompany = companyName.toLowerCase();
  for (const [pattern, industry] of Object.entries(keywords)) {
    if (new RegExp(pattern).test(lowerCompany)) {
      return industry;
    }
  }
  return 'Professional Services';
}

// Helper to determine tone from pain points
function determineTone(painPoints: string[]): string {
  const painText = painPoints.join(' ').toLowerCase();
  
  if (painText.includes('complex') || painText.includes('technical')) {
    return 'professional and technical';
  }
  if (painText.includes('time') || painText.includes('fast') || painText.includes('speed')) {
    return 'energetic and efficient';
  }
  if (painText.includes('trust') || painText.includes('security') || painText.includes('compliance')) {
    return 'trustworthy and reliable';
  }
  if (painText.includes('creative') || painText.includes('innovative')) {
    return 'bold and creative';
  }
  
  return 'confident and approachable';
}

export async function generateBrandGuide(
  icp: ICP,
  valueProp: PositioningValueProp | null
): Promise<BrandGuide> {
  const industry = extractIndustry(icp.persona_company);
  const tone = determineTone(icp.pain_points);
  const valueProposition = valueProp?.variations?.[0]?.text || icp.description;

  const prompt = `You are a brand strategist. Create a comprehensive brand guide for a company targeting this ICP:

Target Persona: ${icp.persona_name}, ${icp.persona_role} at ${icp.persona_company}
Industry: ${industry}
Location: ${icp.location}, ${icp.country}
Value Proposition: ${valueProposition}
Key Pain Points: ${icp.pain_points.join(', ')}
Desired Tone: ${tone}

Generate a complete brand guide with:
1. Color palette (4 primary, 4 secondary, 2 accent, 4 neutral colors with hex, RGB, and usage)
2. Typography (heading, body, code fonts with sizes and weights)
3. 4 logo variations
4. 5 tone of voice keywords
5. 4 personality trait sliders (0-100 scale)

Return ONLY valid JSON matching this structure:
{
  "colors": {
    "primary": [{"name": "Blue 600", "hex": "#3B82F6", "rgb": "59, 130, 246", "usage": "Primary actions"}],
    "secondary": [{"name": "Purple 600", "hex": "#8B5CF6", "rgb": "139, 92, 246", "usage": "Secondary"}],
    "accent": [{"name": "Teal 500", "hex": "#14B8A6", "rgb": "20, 184, 166", "usage": "Success"}],
    "neutral": [{"name": "Slate 900", "hex": "#0F172A", "rgb": "15, 23, 42", "usage": "Text"}]
  },
  "typography": [
    {"category": "heading", "fontFamily": "Inter", "sizes": [{"name": "H1", "size": "48px", "weight": "700"}]},
    {"category": "body", "fontFamily": "Inter", "sizes": [{"name": "Base", "size": "16px", "weight": "400"}]},
    {"category": "code", "fontFamily": "JetBrains Mono", "sizes": [{"name": "Code", "size": "14px", "weight": "400"}]}
  ],
  "logoVariations": [
    {"name": "Primary Logo", "description": "Full color with wordmark"},
    {"name": "Icon Only", "description": "Compact icon"},
    {"name": "Wordmark", "description": "Text only"},
    {"name": "Monochrome", "description": "Single color"}
  ],
  "toneOfVoice": ["Confident", "Innovative", "Approachable", "Clear", "Energetic"],
  "personalityTraits": [
    {"id": "professional", "label": "Tone", "leftLabel": "Playful", "rightLabel": "Professional", "value": 65},
    {"id": "formal", "label": "Style", "leftLabel": "Casual", "rightLabel": "Formal", "value": 55},
    {"id": "technical", "label": "Language", "leftLabel": "Simple", "rightLabel": "Technical", "value": 60},
    {"id": "bold", "label": "Visuals", "leftLabel": "Minimal", "rightLabel": "Bold", "value": 70}
  ]
}

Make colors appropriate for ${industry} industry and ${tone} tone.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a brand strategist. Output only valid JSON." },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as BrandGuide;
}

export async function generateStyleGuide(brandGuide: BrandGuide): Promise<StyleGuide> {
  const primaryColor = brandGuide.colors.primary[0]?.hex || '#3B82F6';
  const headingFont = brandGuide.typography.find(t => t.category === 'heading')?.fontFamily || 'Inter';

  const prompt = `Create a style guide for UI components based on this brand:
Primary Color: ${primaryColor}
Heading Font: ${headingFont}
Tone: ${brandGuide.toneOfVoice.join(', ')}

Generate style specifications for:
1. 5 button variants (Primary, Secondary, Outline, Ghost, Destructive)
2. 4 card variants (Default, Elevated, Outlined, Interactive)
3. 6 form elements (Text Input, Textarea, Select, Checkbox, Radio, Toggle)
4. 7 spacing values (xs to 3xl)
5. 5 border radius values (sm to full)
6. 4 shadow values (sm to xl)

Return ONLY valid JSON:
{
  "buttons": [{"variant": "Primary", "description": "Main CTAs"}],
  "cards": [{"variant": "Default", "description": "Standard containers"}],
  "formElements": [{"element": "Text Input", "description": "Single-line entry"}],
  "spacing": [{"name": "xs", "value": "4px"}],
  "borderRadius": [{"name": "sm", "value": "4px"}],
  "shadows": [{"name": "sm", "value": "0 1px 2px 0 rgb(0 0 0 / 0.05)"}]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a UI designer. Output only valid JSON." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as StyleGuide;
}

export async function generateLandingPage(
  icp: ICP,
  valueProp: PositioningValueProp | null,
  brandGuide: BrandGuide
): Promise<LandingPage> {
  const headline = valueProp?.variations?.find(v => v.id === 'benefit-first')?.text || 
                   `Transform ${icp.title} with our solution`;
  const subheadline = valueProp?.summary?.mainInsight || icp.description;
  const industry = extractIndustry(icp.persona_company);

  const prompt = `Create a landing page structure for this product:
Target: ${icp.title} - ${icp.description}
Headline: ${headline}
Subheadline: ${subheadline}
Pain Points: ${icp.pain_points.join(', ')}
Goals: ${icp.goals.join(', ')}
Industry: ${industry}
Brand Tone: ${brandGuide.toneOfVoice.join(', ')}

Generate:
1. Navigation with logo and 5 links
2. Hero section with headline, subheadline, primary and secondary CTA
3. 6 feature sections with titles, descriptions, and icon names
4. 3 social proof items (2 testimonials, 1 stat)
5. 3 pricing tiers (if applicable) or remove
6. Footer with 3 sections of links

Return ONLY valid JSON:
{
  "navigation": {"logo": "CompanyName", "links": ["Features", "Pricing"]},
  "hero": {
    "headline": "${headline}",
    "subheadline": "${subheadline}",
    "cta": {"primary": "Start Free Trial", "secondary": "Watch Demo"}
  },
  "features": [{"title": "Feature", "description": "Description", "icon": "sparkles"}],
  "socialProof": [{"type": "testimonial", "content": "Quote"}],
  "pricing": [{"tier": "Starter", "price": "$12/user/month", "features": ["Feature 1"]}],
  "footer": {"sections": [{"title": "Product", "links": ["Features"]}]}
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a landing page copywriter. Output only valid JSON." },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as LandingPage;
}

