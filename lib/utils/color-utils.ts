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
    background: `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`,
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

