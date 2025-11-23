// Brand Guide Transformer
// Converts Brand Manifest identity data to Figma node structure

import { BrandManifest } from '../types/manifest';
import { FigmaFrameNode, FigmaNode, RGB } from '../types/figma-nodes';

export function transformBrandGuideToFigma(manifest: BrandManifest): FigmaFrameNode {
    const colors = manifest.identity.colors;
    const typography = manifest.identity.typography;

    // Build color palette nodes
    const colorNodes: FigmaNode[] = [];
    let xOffset = 50;
    const yOffset = 100;

    // Helper to add color swatch
    const addColorSwatch = (colorToken: any, index: number) => {
        // Color rectangle
        colorNodes.push({
            type: 'RECTANGLE',
            name: colorToken.name,
            width: 100,
            height: 100,
            x: xOffset,
            y: yOffset,
            fills: [{ type: 'SOLID', color: hexToRgb(colorToken.hex) }],
            cornerRadius: 8
        });

        // Color label
        colorNodes.push({
            type: 'TEXT',
            name: `${colorToken.name} Label`,
            characters: `${colorToken.name}\n${colorToken.hex}`,
            fontSize: 12,
            fontName: { family: 'Inter', style: 'Regular' },
            x: xOffset,
            y: yOffset + 110,
            fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }]
        });

        xOffset += 120;
    };

    // Add primary colors
    colors.primary.forEach((color, idx) => addColorSwatch(color, idx));

    // Add secondary colors
    colors.secondary.forEach((color, idx) => addColorSwatch(color, idx));

    // Add accent colors if available
    if (colors.accent && colors.accent.length > 0) {
        colors.accent.forEach((color, idx) => addColorSwatch(color, idx));
    }

    // Typography section title
    const typoYOffset = yOffset + 250;
    colorNodes.push({
        type: 'TEXT',
        name: 'Typography Section',
        characters: 'Typography',
        fontSize: 24,
        fontName: { family: 'Inter', style: 'Bold' },
        x: 50,
        y: typoYOffset,
        fills: [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }]
    });

    // Typography samples
    let typoX = 50;
    let typoY = typoYOffset + 60;

    // Heading samples
    const headingSizes = typography.heading.sizes;
    Object.entries(headingSizes).forEach(([name, size], idx) => {
        colorNodes.push({
            type: 'TEXT',
            name: `Heading ${name}`,
            characters: `${name.toUpperCase()}: The quick brown fox`,
            fontSize: Math.min(parseInt(size), 36), // Cap at 36px for display
            fontName: { family: typography.heading.family, style: 'Bold' },
            x: typoX,
            y: typoY,
            fills: [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }]
        });

        typoY += Math.min(parseInt(size), 36) + 30;
    });

    // Calculate total frame dimensions
    const frameWidth = Math.max(xOffset + 50, 1200);
    const frameHeight = typoY + 100;

    return {
        type: 'FRAME',
        name: 'Brand Guide',
        width: frameWidth,
        height: frameHeight,
        children: colorNodes,
        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    };
}

// Helper function to convert hex to RGB (0-1 range for Figma)
function hexToRgb(hex: string): RGB {
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
