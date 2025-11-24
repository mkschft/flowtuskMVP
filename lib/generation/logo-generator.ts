import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Fallback: Generate simple SVG logo programmatically
 * Use this if DALL-E results are unsatisfactory
 */
export function generateSimpleSVGLogo(
  brandName: string,
  variation: { name: string; description: string },
  primaryColor: string,
  accentColor?: string
): string {
  const initial = brandName.charAt(0).toUpperCase();
  const isMonochrome = variation.name.toLowerCase().includes('monochrome') || 
                      variation.name.toLowerCase().includes('inverted');
  const color = isMonochrome ? primaryColor : primaryColor;
  const accent = accentColor && accentColor !== primaryColor ? accentColor : primaryColor;

  // Simple geometric logo - circle with initial or abstract shape
  if (isMonochrome) {
    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="${color}" opacity="0.9"/>
        <text x="50" y="65" font-family="Arial, sans-serif" font-size="40" font-weight="bold" 
              fill="white" text-anchor="middle">${initial}</text>
      </svg>
    `;
  }

  // Primary: gradient or two-tone
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="20" y="20" width="60" height="60" rx="12" fill="url(#grad)"/>
      <text x="50" y="60" font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
            fill="white" text-anchor="middle">${initial}</text>
    </svg>
  `;
}

interface LogoGenerationOptions {
  brandName: string;
  variation: { name: string; description: string };
  primaryColor: string;
  accentColor?: string;
  manifest?: any;
}

/**
 * Check if logo generation is enabled via feature flag
 * Defaults to true if not set (enabled by default)
 */
export function shouldGenerateLogos(): boolean {
  const envValue = process.env.NEXT_PUBLIC_ENABLE_LOGO_GENERATION;
  // Default to true if not set, allow explicit false to disable
  const enabled = envValue !== 'false';
  // Only log in debug mode to avoid spam
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [Logo Generator] Feature flag check: NEXT_PUBLIC_ENABLE_LOGO_GENERATION=${envValue || 'not set'}, enabled=${enabled}`);
  }
  return enabled;
}

/**
 * Get logo generation count from manifest metadata
 */
export function getLogoGenerationCount(manifest: any): number {
  return manifest?.metadata?.logoGenerationCount || 0;
}

/**
 * Maximum logo generations allowed per ICP/thread
 */
const MAX_LOGO_GENERATIONS = 2;

/**
 * Generate a logo using Stockimg.ai API
 */
async function generateLogoWithStockimg(
  brandName: string,
  variation: { name: string; description: string },
  primaryColor: string,
  accentColor?: string,
  manifest?: any
): Promise<string | null> {
  const apiKey = process.env.STOCKIMG_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ [Logo Generator] Stockimg.ai API key not found, skipping Stockimg generation');
    return null;
  }

  try {
    // Build prompt for Stockimg.ai
    const colorInfo = accentColor && accentColor !== primaryColor
      ? `Primary color: ${primaryColor}, Accent color: ${accentColor}`
      : `Primary color: ${primaryColor}`;

    const industry = manifest?.strategy?.persona?.industry || '';
    const valueProp = manifest?.strategy?.valueProp?.headline || '';
    const toneKeywords = manifest?.identity?.tone?.keywords || [];
    const toneInfo = toneKeywords.length > 0 ? toneKeywords.join(', ') : '';

    const contextParts: string[] = [];
    if (industry) contextParts.push(`Industry: ${industry}`);
    if (valueProp) contextParts.push(`Value: ${valueProp}`);
    if (toneInfo) contextParts.push(`Tone: ${toneInfo}`);
    
    const contextInfo = contextParts.length > 0 
      ? `\n\nBrand Context:\n${contextParts.join('\n')}`
      : '';

    const prompt = `Create a sleek, modern B2B SaaS logo icon for "${brandName}".${contextInfo}

Logo Style: ${variation.name.toLowerCase()} - ${variation.description}
Colors: ${colorInfo}

Design Requirements:
- Professional B2B SaaS aesthetic (like Stripe, Linear, Vercel, Notion)
- Simple geometric shapes: circles, squares, triangles, abstract forms
- Minimalist, flat design, no gradients or shadows
- Transparent background
- Vector-style, clean lines
- Suitable for favicon use
- Professional, trustworthy, innovative`;

    console.log(`🎨 [Logo Generator] Generating Stockimg.ai logo for ${brandName} - ${variation.name}`);

    const response = await fetch('https://api.stockimg.ai/v1/image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        style: 'logo',
        output_format: 'png',
        size: '1024x1024'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Logo Generator] Stockimg.ai API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.image_url || data.url || data.data?.url;

    if (!imageUrl) {
      console.warn('⚠️ [Logo Generator] No image URL returned from Stockimg.ai');
      return null;
    }

    console.log(`✅ [Logo Generator] Successfully generated Stockimg.ai logo: ${imageUrl.substring(0, 50)}...`);
    return imageUrl;
  } catch (error: any) {
    console.error('❌ [Logo Generator] Failed to generate Stockimg.ai logo:', error.message);
    return null;
  }
}

/**
 * Generate a logo image using DALL-E 3
 * Returns the image URL or null if generation fails or is disabled
 */
export async function generateLogoSVG(
  options: LogoGenerationOptions
): Promise<string | null> {
  // Feature flag check
  if (!shouldGenerateLogos()) {
    console.log('🎨 [Logo Generator] Feature disabled, skipping logo generation');
    return null;
  }

  const { brandName, variation, primaryColor, accentColor, manifest } = options;

  // Use SVG fallback if enabled
  if (shouldUseSVGLogos()) {
    console.log('🎨 [Logo Generator] Using SVG fallback generation');
    const svg = generateSimpleSVGLogo(brandName, variation, primaryColor, accentColor);
    // Convert SVG to data URL for use in img tag (URL encode for browser compatibility)
    const encodedSvg = encodeURIComponent(svg.trim());
    const svgDataUrl = `data:image/svg+xml,${encodedSvg}`;
    return svgDataUrl;
  }

  try {
    // Build enhanced prompt with manifest context
    const colorInfo = accentColor && accentColor !== primaryColor
      ? `Primary color: ${primaryColor}, Accent color: ${accentColor}`
      : `Primary color: ${primaryColor}`;

    // Extract manifest context for richer prompt
    const industry = manifest?.strategy?.persona?.industry || '';
    const personaRole = manifest?.strategy?.persona?.role || '';
    const personaCompany = manifest?.strategy?.persona?.company || '';
    const valueProp = manifest?.strategy?.valueProp?.headline || '';
    const toneKeywords = manifest?.identity?.tone?.keywords || [];
    const toneInfo = toneKeywords.length > 0 ? toneKeywords.join(', ') : '';

    // Build context string
    const contextParts: string[] = [];
    if (industry) contextParts.push(`Industry: ${industry}`);
    if (personaRole && personaCompany) contextParts.push(`Target: ${personaRole} at ${personaCompany}`);
    if (valueProp) contextParts.push(`Value: ${valueProp}`);
    if (toneInfo) contextParts.push(`Tone: ${toneInfo}`);
    
    const contextInfo = contextParts.length > 0 
      ? `\n\nBrand Context:\n${contextParts.join('\n')}`
      : '';

    // Determine if this is a variation (monochrome/inverted) or primary
    const isVariation = variation.name.toLowerCase().includes('monochrome') || 
                       variation.name.toLowerCase().includes('inverted') ||
                       variation.name.toLowerCase().includes('single color');
    
    // Generate base logo concept for primary, variations for others
    const baseConcept = isVariation 
      ? `Create a ${variation.name.toLowerCase()} version of a professional B2B SaaS logo icon`
      : `Create a professional B2B SaaS logo icon`;

    const prompt = `${baseConcept} for "${brandName}".${contextInfo}

Logo Style: ${variation.name.toLowerCase()} - ${variation.description}
Colors: ${colorInfo}

CRITICAL Design Specifications:
- Use ONLY simple geometric shapes: perfect circles, squares, rectangles, triangles, or abstract interconnected nodes
- Maximum 2-3 shapes maximum - keep it extremely simple
- Flat design, no gradients, shadows, or 3D effects
- Solid colors only, no patterns or textures
- Transparent background (completely transparent, no white or colored background)
- Clean, crisp edges - vector-style precision
- Icon should be centered in frame with equal padding on all sides
- Suitable for favicon use (16x16px minimum readability)

B2B SaaS Style Reference:
- Similar to: Stripe (geometric S), Linear (clean lines), Vercel (triangle), Notion (abstract N)
- Professional, trustworthy, minimal, functional
- NOT decorative, playful, or illustrative
- Think: corporate, enterprise, software company

${isVariation ? `Variation Requirements:
- Convert to ${variation.name.toLowerCase()} style
- Use single color: ${primaryColor}
- Maintain exact same shape and proportions as primary logo
- Same geometric structure, just color variation` : `Primary Logo Requirements:
- Use colors: ${colorInfo}
- Create the base logo design that variations will be derived from`}

Technical Requirements:
- Vector-style rendering
- No text, letters, or typography
- No decorative elements
- Works on both light and dark backgrounds
- Professional B2B SaaS aesthetic only`;

    console.log(`🎨 [Logo Generator] Generating logo for ${brandName} - ${variation.name}`);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      console.warn('⚠️ [Logo Generator] No image URL returned from DALL-E');
      return null;
    }

    console.log(`✅ [Logo Generator] Successfully generated logo: ${imageUrl.substring(0, 50)}...`);
    return imageUrl;
  } catch (error: any) {
    console.error('❌ [Logo Generator] Failed to generate logo:', error.message);
    // Don't throw - gracefully return null so generation can continue
    return null;
  }
}

/**
 * Generate logos for all variations
 * Returns variations with imageUrl added (or original if generation fails)
 * Respects MAX_LOGO_GENERATIONS limit per ICP/thread
 */
export async function generateLogosForVariations(
  brandName: string,
  variations: { name: string; description: string }[],
  primaryColor: string,
  accentColor?: string,
  manifest?: any
): Promise<{ name: string; description: string; imageUrl?: string; imageUrlSvg?: string; imageUrlStockimg?: string }[]> {
  // Early return if disabled or no variations
  if (!shouldGenerateLogos() || variations.length === 0) {
    return variations;
  }

  // Check generation count limit
  const logoGenerationCount = getLogoGenerationCount(manifest);
  if (logoGenerationCount >= MAX_LOGO_GENERATIONS) {
    console.log(`⚠️ [Logo Generator] Max generations reached (${logoGenerationCount}/${MAX_LOGO_GENERATIONS}). Skipping logo generation.`);
    // Return existing variations (may already have imageUrl from previous generations)
    return variations;
  }

  const isFirstIteration = logoGenerationCount === 0;
  console.log(`🎨 [Logo Generator] Generating ${variations.length} logo variations (attempt ${logoGenerationCount + 1}/${MAX_LOGO_GENERATIONS})${isFirstIteration ? ' - First iteration: generating DALL-E, SVG, and Stockimg.ai for comparison' : ''}`);

  // Generate logos in parallel (with reasonable concurrency)
  const logoPromises = variations.map(async (variation) => {
    try {
      // Always generate DALL-E logo (unless SVG-only mode)
      let imageUrl: string | null = null;
      if (!shouldUseSVGLogos()) {
        imageUrl = await generateLogoSVG({
          brandName,
          variation,
          primaryColor,
          accentColor,
          manifest,
        });
      }

      // On first iteration, also generate SVG and Stockimg.ai logos for comparison
      let imageUrlSvg: string | undefined = undefined;
      let imageUrlStockimg: string | undefined = undefined;
      
      if (isFirstIteration) {
        // Generate SVG logo
        const svg = generateSimpleSVGLogo(brandName, variation, primaryColor, accentColor);
        const encodedSvg = encodeURIComponent(svg.trim());
        imageUrlSvg = `data:image/svg+xml,${encodedSvg}`;
        console.log(`✅ [Logo Generator] Generated SVG logo for "${variation.name}"`);

        // Generate Stockimg.ai logo
        imageUrlStockimg = await generateLogoWithStockimg(
          brandName,
          variation,
          primaryColor,
          accentColor,
          manifest
        ) || undefined;
      }

      return {
        ...variation,
        ...(imageUrl && { imageUrl }), // DALL-E logo
        ...(imageUrlSvg && { imageUrlSvg }), // SVG logo (first iteration only)
        ...(imageUrlStockimg && { imageUrlStockimg }), // Stockimg.ai logo (first iteration only)
      };
    } catch (error: any) {
      console.error(`❌ [Logo Generator] Failed for variation "${variation.name}":`, error.message);
      // Return variation without imageUrl on error
      return variation;
    }
  });

  const results = await Promise.all(logoPromises);
  
  const dalleCount = results.filter(r => r.imageUrl).length;
  const svgCount = results.filter(r => r.imageUrlSvg).length;
  const stockimgCount = results.filter(r => r.imageUrlStockimg).length;
  console.log(`✅ [Logo Generator] Generated ${dalleCount} DALL-E logos, ${svgCount} SVG logos, and ${stockimgCount} Stockimg.ai logos successfully`);

  return results;
}

