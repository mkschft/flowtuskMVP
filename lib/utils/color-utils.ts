import type { BrandManifest } from "@/lib/types/brand-manifest";

/**
 * Get primary color hex from manifest
 */
export function getPrimaryColor(manifest: BrandManifest | null | undefined): string {
  if (!manifest?.identity?.colors?.primary?.[0]?.hex) {
    return "#8B5CF6"; // Default purple fallback
  }
  return manifest.identity.colors.primary[0].hex;
}

/**
 * Get secondary color hex from manifest
 */
export function getSecondaryColor(manifest: BrandManifest | null | undefined): string {
  if (!manifest?.identity?.colors?.secondary?.[0]?.hex) {
    return "#EC4899"; // Default pink fallback
  }
  return manifest.identity.colors.secondary[0].hex;
}

/**
 * Get accent color hex from manifest
 */
export function getAccentColor(manifest: BrandManifest | null | undefined): string {
  if (!manifest?.identity?.colors?.accent?.[0]?.hex) {
    return getPrimaryColor(manifest); // Fallback to primary
  }
  return manifest.identity.colors.accent[0].hex;
}

/**
 * Convert hex to RGB for CSS gradients
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Generate gradient style string from manifest colors
 */
export function getGradientStyle(
  manifest: BrandManifest | null | undefined,
  direction: "to-r" | "to-br" | "to-b" = "to-r"
): string {
  const primary = getPrimaryColor(manifest);
  const secondary = getSecondaryColor(manifest);
  const deg = direction === "to-r" ? "90deg" : direction === "to-br" ? "135deg" : "180deg";
  return `linear-gradient(${deg}, ${primary} 0%, ${secondary} 100%)`;
}

/**
 * Generate inline style object for gradient background
 */
export function getGradientBgStyle(
  manifest: BrandManifest | null | undefined,
  direction: "to-r" | "to-br" | "to-b" = "to-r"
): React.CSSProperties {
  return {
    background: getGradientStyle(manifest, direction),
  };
}

/**
 * Generate text gradient style
 */
export function getTextGradientStyle(manifest: BrandManifest | null | undefined): React.CSSProperties {
  const primary = getPrimaryColor(manifest);
  const secondary = getSecondaryColor(manifest);
  return {
    backgroundImage: `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };
}

/**
 * Get lighter shade of color (for backgrounds)
 */
export function getLightShade(hex: string, opacity: number = 0.1): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Get contrast color (black or white) for text on colored background
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Calculate relative luminance for WCAG contrast
 */
function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculate contrast ratio between two hex colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Get WCAG score (AAA, AA, AA Large, Fail)
 */
export function getWCAGScore(ratio: number, isLargeText: boolean = false): "AAA" | "AA" | "Fail" {
  if (isLargeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
    return "Fail";
  }
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
}

// ============================================================================
// INTELLIGENT GRADIENT GENERATION
// ============================================================================

/**
 * Convert hex color to HSL (Hue, Saturation, Lightness)
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(h: number, s: number, l: number): string {
  // Normalize inputs
  h = h % 360;
  if (h < 0) h += 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));

  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`.toUpperCase();
}

/**
 * Mood type for gradient generation
 */
export type GradientMood = 'energetic' | 'calm' | 'professional' | 'creative' | 'trustworthy';

/**
 * Color theory type for gradient generation
 */
export type GradientType = 'analogous' | 'complementary' | 'triadic' | 'split-complementary' | 'monochromatic';

/**
 * Generated gradient with start and end colors
 */
export interface GeneratedGradient {
  start: string;
  end: string;
  middle?: string;
  type: GradientType;
  mood: GradientMood;
  reasoning: string;
}

/**
 * Generate intelligent gradient based on color psychology and color theory
 *
 * @param baseColor - Starting color in hex format
 * @param mood - Emotional tone for the gradient
 * @param type - Color theory relationship to use
 * @returns Generated gradient with start, end, and optional middle colors
 *
 * @example
 * ```ts
 * const gradient = generateIntelligentGradient('#FFD700', 'energetic', 'analogous');
 * // Returns: { start: '#FFD700', end: '#FF8C00', type: 'analogous', mood: 'energetic' }
 * ```
 */
export function generateIntelligentGradient(
  baseColor: string,
  mood: GradientMood = 'professional',
  type: GradientType = 'analogous'
): GeneratedGradient {
  const hsl = hexToHsl(baseColor);
  if (!hsl) {
    // Fallback to simple gradient
    return {
      start: baseColor,
      end: '#000000',
      type,
      mood,
      reasoning: 'Fallback gradient due to invalid base color'
    };
  }

  let endHue = hsl.h;
  let endSat = hsl.s;
  let endLight = hsl.l;
  let middleHue: number | undefined;
  let middleSat: number | undefined;
  let middleLight: number | undefined;

  // Apply color theory rules
  switch (type) {
    case 'analogous':
      // Shift hue by ±30° for harmonious, smooth gradient
      endHue = hsl.h + 30;
      break;

    case 'complementary':
      // Shift hue by 180° for high contrast, bold gradient
      endHue = hsl.h + 180;
      break;

    case 'triadic':
      // 120° shift for balanced, vibrant gradient
      endHue = hsl.h + 120;
      break;

    case 'split-complementary':
      // 150° shift for sophisticated contrast
      endHue = hsl.h + 150;
      middleHue = hsl.h + 210;
      middleSat = hsl.s;
      middleLight = hsl.l;
      break;

    case 'monochromatic':
      // Same hue, vary saturation and lightness for elegant, refined gradient
      endHue = hsl.h;
      endSat = Math.max(10, hsl.s - 30);
      endLight = Math.max(15, hsl.l - 25);
      break;
  }

  // Apply mood adjustments
  switch (mood) {
    case 'energetic':
      // High saturation, warm shifts
      endSat = Math.min(100, hsl.s + 15);
      if (type !== 'monochromatic') {
        endHue += 10; // Warmer
      }
      break;

    case 'calm':
      // Low saturation, cool shifts
      endSat = Math.max(20, hsl.s - 20);
      endLight = Math.min(75, hsl.l + 10);
      if (type !== 'monochromatic') {
        endHue -= 10; // Cooler
      }
      break;

    case 'professional':
      // Mid saturation, subtle shifts
      endSat = Math.max(30, Math.min(70, hsl.s - 10));
      endLight = Math.max(20, hsl.l - 15);
      break;

    case 'creative':
      // Bold saturation, unexpected shifts
      endSat = Math.min(95, hsl.s + 20);
      if (type === 'analogous') {
        // Make it more unexpected
        endHue += 45;
      }
      break;

    case 'trustworthy':
      // Blue/green bias, stable
      if (hsl.h < 180) {
        endHue = Math.min(240, hsl.h + 40); // Shift toward blue
      }
      endSat = Math.max(40, hsl.s - 5);
      break;
  }

  // Generate colors
  const start = baseColor;
  const end = hslToHex(endHue, endSat, endLight);
  const middle = middleHue !== undefined && middleSat !== undefined && middleLight !== undefined
    ? hslToHex(middleHue, middleSat, middleLight)
    : undefined;

  // Generate reasoning
  const reasoning = generateGradientReasoning(baseColor, { start, end, middle }, type, mood);

  return { start, end, middle, type, mood, reasoning };
}

/**
 * Generate human-readable reasoning for gradient choice
 */
function generateGradientReasoning(
  baseColor: string,
  gradient: { start: string; end: string; middle?: string },
  type: GradientType,
  mood: GradientMood
): string {
  const typeDescriptions: Record<GradientType, string> = {
    analogous: 'harmonious color harmony using neighboring hues',
    complementary: 'high-contrast pairing using opposite hues',
    triadic: 'balanced, vibrant combination using evenly-spaced hues',
    'split-complementary': 'sophisticated contrast with nuanced variety',
    monochromatic: 'elegant refinement using varied shades of the same hue'
  };

  const moodDescriptions: Record<GradientMood, string> = {
    energetic: 'energetic feel with high saturation and warm shifts',
    calm: 'calming atmosphere with reduced saturation and cool tones',
    professional: 'professional restraint with subtle, stable transitions',
    creative: 'creative boldness with unexpected color relationships',
    trustworthy: 'trustworthy stability with blue/green undertones'
  };

  return `${typeDescriptions[type]} creates ${moodDescriptions[mood]}.`;
}

/**
 * Generate multiple gradient options for a base color
 * Returns 3-5 variations with different moods and types
 */
export function generateGradientVariations(baseColor: string): GeneratedGradient[] {
  return [
    generateIntelligentGradient(baseColor, 'professional', 'analogous'),
    generateIntelligentGradient(baseColor, 'energetic', 'complementary'),
    generateIntelligentGradient(baseColor, 'calm', 'monochromatic'),
    generateIntelligentGradient(baseColor, 'creative', 'triadic'),
    generateIntelligentGradient(baseColor, 'trustworthy', 'split-complementary'),
  ];
}

/**
 * Format gradient as CSS linear-gradient string
 */
export function formatGradientCSS(
  gradient: GeneratedGradient,
  angle: number = 135
): string {
  if (gradient.middle) {
    return `linear-gradient(${angle}deg, ${gradient.start} 0%, ${gradient.middle} 50%, ${gradient.end} 100%)`;
  }
  return `linear-gradient(${angle}deg, ${gradient.start} 0%, ${gradient.end} 100%)`;
}

