/**
 * Clean brand name by removing metadata and extra characters
 * Removes content in parentheses, extra spaces, and non-essential characters
 */
function cleanBrandName(brandName: string): string {
  if (!brandName) return brandName;
  
  let cleaned = brandName;
  
  // Remove content in parentheses (e.g., "(100,000 employees)", "(Series A)", etc.)
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
  
  // Remove content in brackets
  cleaned = cleaned.replace(/\s*\[[^\]]*\]/g, '');
  
  // Remove common metadata patterns
  cleaned = cleaned.replace(/\s*-\s*(Series [A-Z]|Seed|Series A|Series B|Series C)/gi, '');
  cleaned = cleaned.replace(/\s*,\s*(Inc\.?|LLC|Ltd\.?|Corp\.?|Corporation)/gi, '');
  
  // Remove extra whitespace and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Remove trailing punctuation that might be metadata
  cleaned = cleaned.replace(/[.,;:]+$/, '');
  
  return cleaned;
}

/**
 * Get Google Font configuration based on variation type
 * Returns font family, weight, letter spacing, and style
 */
function getFontConfigForVariation(
  variation: { name: string; description: string },
  defaultTypography?: { family: string; weight: string } | null
): {
  fontFamily: string;
  fontWeight: string;
  letterSpacing: string;
  fontStyle?: string;
  googleFontUrl?: string;
} {
  const variationName = variation.name.toLowerCase();
  
  // Popular B2B SaaS Google Fonts
  const googleFonts = {
    modern: { name: 'Poppins', weights: ['400', '600', '700'], url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap' },
    clean: { name: 'Inter', weights: ['400', '600', '700'], url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' },
    bold: { name: 'Montserrat', weights: ['600', '700', '800'], url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&display=swap' },
    elegant: { name: 'Playfair Display', weights: ['400', '600', '700'], url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap' },
    tech: { name: 'Space Grotesk', weights: ['400', '600', '700'], url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap' },
    minimal: { name: 'Work Sans', weights: ['400', '600', '700'], url: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600;700&display=swap' },
  };

  // Use default typography if available, otherwise select based on variation
  if (defaultTypography?.family) {
    // Map common font names to Google Fonts
    const fontName = defaultTypography.family.toLowerCase();
    let selectedFont = googleFonts.clean; // Default
    
    if (fontName.includes('poppins')) selectedFont = googleFonts.modern;
    else if (fontName.includes('montserrat')) selectedFont = googleFonts.bold;
    else if (fontName.includes('playfair') || fontName.includes('serif')) selectedFont = googleFonts.elegant;
    else if (fontName.includes('space') || fontName.includes('grotesk')) selectedFont = googleFonts.tech;
    else if (fontName.includes('work') || fontName.includes('sans')) selectedFont = googleFonts.minimal;
    
    return {
      fontFamily: `'${selectedFont.name}', ${defaultTypography.family}, sans-serif`,
      fontWeight: defaultTypography.weight || '600',
      letterSpacing: '0px',
      googleFontUrl: selectedFont.url
    };
  }

  // Variation-based font selection
  if (variationName.includes('bold') || variationName.includes('strong')) {
    return {
      fontFamily: `'${googleFonts.bold.name}', sans-serif`,
      fontWeight: '700',
      letterSpacing: '-0.5px',
      googleFontUrl: googleFonts.bold.url
    };
  }
  
  if (variationName.includes('light') || variationName.includes('thin')) {
    return {
      fontFamily: `'${googleFonts.minimal.name}', sans-serif`,
      fontWeight: '400',
      letterSpacing: '1px',
      googleFontUrl: googleFonts.minimal.url
    };
  }
  
  if (variationName.includes('elegant') || variationName.includes('serif')) {
    return {
      fontFamily: `'${googleFonts.elegant.name}', serif`,
      fontWeight: '600',
      letterSpacing: '0px',
      googleFontUrl: googleFonts.elegant.url
    };
  }
  
  if (variationName.includes('tech') || variationName.includes('modern')) {
    return {
      fontFamily: `'${googleFonts.tech.name}', sans-serif`,
      fontWeight: '600',
      letterSpacing: '-0.3px',
      googleFontUrl: googleFonts.tech.url
    };
  }
  
  // Default: Modern and clean
  return {
    fontFamily: `'${googleFonts.modern.name}', sans-serif`,
    fontWeight: '600',
    letterSpacing: '0px',
    googleFontUrl: googleFonts.modern.url
  };
}

/**
 * Generate professional text-based SVG logo (wordmark)
 * Uses Google Fonts and variation-specific styling
 */
export function generateTextBasedSVGLogo(
  brandName: string,
  variation: { name: string; description: string },
  primaryColor: string,
  accentColor?: string,
  typography?: { family: string; weight: string } | null
): string {
  // Clean the brand name before generating logo
  const cleanedBrandName = cleanBrandName(brandName);
  const isMonochrome = variation.name.toLowerCase().includes('monochrome') || 
                      variation.name.toLowerCase().includes('inverted');
  
  // Get font configuration based on variation
  const fontConfig = getFontConfigForVariation(variation, typography);
  
  // Determine colors
  const textColor = isMonochrome ? primaryColor : primaryColor;
  const hasAccent = accentColor && accentColor !== primaryColor && !isMonochrome;
  
  // Calculate dimensions based on text length
  const textLength = cleanedBrandName.length;
  
  // More generous width calculation with padding
  // Estimate: ~8-10px per character for most fonts, add 40% padding for safety
  const estimatedWidth = Math.ceil(textLength * 10 * 1.4);
  const baseWidth = Math.max(240, estimatedWidth);
  const padding = 20; // Padding on each side
  const viewBoxWidth = baseWidth + (padding * 2);
  const height = 60;
  
  // Adjust font size for very long names to ensure fit
  let fontSize = 32;
  if (textLength > 20) {
    fontSize = 28;
  } else if (textLength > 15) {
    fontSize = 30;
  }
  
  // Adjust letter spacing based on font config and text length
  let letterSpacing = fontConfig.letterSpacing;
  if (textLength > 15) {
    letterSpacing = '-0.5px';
  } else if (textLength > 10) {
    letterSpacing = fontConfig.letterSpacing || '-0.3px';
  }
  
  // Create gradient if we have accent color
  const gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`;
  const gradientDef = hasAccent ? `
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
      </linearGradient>
    </defs>
  ` : '';
  
  const fillColor = hasAccent ? `url(#${gradientId})` : textColor;
  
  // Note: Google Fonts work best when loaded in the HTML page
  // For SVG in img tags, we use font names with system font fallbacks
  // The fonts will render correctly if loaded on the page, otherwise fallback to system fonts
  
  // Center position with padding
  const textX = padding + (baseWidth / 2);
  const textY = height / 2 + fontSize / 3;
  
  return `
    <svg viewBox="0 0 ${viewBoxWidth} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      ${gradientDef}
      <text 
        x="${textX}" 
        y="${textY}" 
        font-family="${fontConfig.fontFamily}" 
        font-size="${fontSize}px" 
        font-weight="${fontConfig.fontWeight}"
        ${fontConfig.fontStyle ? `font-style="${fontConfig.fontStyle}"` : ''}
        letter-spacing="${letterSpacing}"
        fill="${fillColor}"
        text-anchor="middle"
        dominant-baseline="middle"
        style="text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased;"
      >${cleanedBrandName}</text>
    </svg>
  `.trim();
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
 * Generate logos for variations (limit to first 2 variations)
 * Returns variations with imageUrl added (or original if generation fails)
 * Respects MAX_LOGO_GENERATIONS limit per ICP/thread
 */
export async function generateLogosForVariations(
  brandName: string,
  variations: { name: string; description: string }[],
  primaryColor: string,
  accentColor?: string,
  manifest?: any
): Promise<{ name: string; description: string; imageUrl?: string }[]> {
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

  // Generate logos for first 3 variations
  const variationsToGenerate = variations.slice(0, 3);
  
  // Clean brand name to remove metadata like employee counts
  const cleanedBrandName = cleanBrandName(brandName);
  
  // Get typography from manifest
  // Typography structure: manifest.identity.typography.heading.family and .weights
  const headingTypography = manifest?.identity?.typography?.heading;
  const typography = headingTypography ? {
    family: headingTypography.family || headingTypography.fontFamily,
    weight: headingTypography.weights?.[0] || '600'
  } : null;

  console.log(`🎨 [Logo Generator] Generating ${variationsToGenerate.length} SVG text-based logos for "${cleanedBrandName}"`);
  console.log(`🔍 [Logo Generator] Typography from manifest:`, typography ? 
    `Family: ${typography.family}, Weight: ${typography.weight}` : 
    'Not found - using variation-based Google Fonts');

  // Generate SVG logos synchronously (no API calls needed)
  const results = variationsToGenerate.map((variation) => {
    try {
      const svg = generateTextBasedSVGLogo(
        cleanedBrandName,
        variation,
        primaryColor,
        accentColor,
        typography
      );
      
      // Convert SVG to data URL
      const encodedSvg = encodeURIComponent(svg.trim());
      const svgDataUrl = `data:image/svg+xml,${encodedSvg}`;
      
      return {
        ...variation,
        imageUrl: svgDataUrl
      };
    } catch (error: any) {
      console.error(`❌ [Logo Generator] Failed for variation "${variation.name}":`, error.message);
      // Return variation without imageUrl on error
      return variation;
    }
  });

  // Return results + remaining variations without logos
  const remainingVariations = variations.slice(3).map(v => ({ ...v }));
  const allResults = [...results, ...remainingVariations];
  
  const svgCount = results.filter(r => r.imageUrl).length;
  console.log(`✅ [Logo Generator] Generated ${svgCount} SVG logos successfully`);

  return allResults;
}

