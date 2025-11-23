// Builder Utilities
// Helper functions for creating Figma nodes

import { RGB } from '../types/figma-nodes';

/**
 * Converts hex color to RGB (0-1 range for Figma)
 */
export function hexToRgb(hex: string): RGB {
    // Remove # if present
    hex = hex.replace('#', '');

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    return { r, g, b };
}

/**
 * Safely loads a font, falling back to Inter if unavailable
 */
export async function loadFontSafe(
    family: string,
    style: string
): Promise<boolean> {
    try {
        await figma.loadFontAsync({ family, style });
        return true;
    } catch (e) {
        console.warn(`Failed to load font ${family} ${style}, falling back to Inter`);
        try {
            await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
            return false;
        } catch (fallbackError) {
            console.error('Failed to load fallback font Inter Regular');
            return false;
        }
    }
}

/**
 * Maps font weight string to Figma font style
 */
export function mapFontWeight(weight: string | number): string {
    const weightNum = typeof weight === 'string' ? parseInt(weight) : weight;

    if (weightNum >= 700) return 'Bold';
    if (weightNum >= 600) return 'SemiBold';
    if (weightNum >= 500) return 'Medium';
    return 'Regular';
}
