// Landing Page Transformer
// Converts Landing Page preview data to Figma node structure

import { BrandManifest } from '../types/manifest';
import { FigmaFrameNode, FigmaNode, RGB } from '../types/figma-nodes';

export function transformLandingPageToFigma(manifest: BrandManifest): FigmaFrameNode {
    const landing = manifest.previews.landingPage;
    const primaryColor = manifest.identity.colors.primary[0];

    const sections: FigmaNode[] = [];
    let yOffset = 0;

    // Hero Section
    const heroFrame: FigmaFrameNode = {
        type: 'FRAME',
        name: 'Hero Section',
        width: 1440,
        height: 600,
        x: 0,
        y: yOffset,
        children: [
            {
                type: 'TEXT',
                name: 'Headline',
                characters: landing.hero.headline,
                fontSize: 48,
                fontName: { family: 'Inter', style: 'Bold' },
                x: 120,
                y: 200,
                width: 1200,
                textAlignHorizontal: 'CENTER',
                fills: [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }]
            },
            {
                type: 'TEXT',
                name: 'Subheadline',
                characters: landing.hero.subheadline,
                fontSize: 20,
                fontName: { family: 'Inter', style: 'Regular' },
                x: 220,
                y: 280,
                width: 1000,
                textAlignHorizontal: 'CENTER',
                fills: [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }]
            },
            {
                type: 'FRAME',
                name: 'CTA Button',
                width: 200,
                height: 50,
                x: 620,
                y: 400,
                children: [
                    {
                        type: 'TEXT',
                        name: 'CTA Text',
                        characters: landing.hero.cta.primary,
                        fontSize: 16,
                        fontName: { family: 'Inter', style: 'Medium' },
                        x: 0,
                        y: 15,
                        width: 200,
                        textAlignHorizontal: 'CENTER',
                        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
                    }
                ],
                fills: primaryColor ? [{ type: 'SOLID', color: hexToRgb(primaryColor.hex) }] : [{ type: 'SOLID', color: { r: 0.39, g: 0.4, b: 0.95 } }],
                cornerRadius: 8
            }
        ],
        fills: [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }]
    };

    sections.push(heroFrame);
    yOffset += 600;

    // Features Section
    const featuresFrame: FigmaFrameNode = {
        type: 'FRAME',
        name: 'Features Grid',
        width: 1440,
        height: 800,
        x: 0,
        y: yOffset,
        children: [],
        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    };

    let featureX = 120;
    let featureY = 100;
    const cardWidth = 380;
    const cardHeight = 250;
    const gap = 40;

    landing.features.slice(0, 6).forEach((feature, idx) => {
        const featureCard: FigmaFrameNode = {
            type: 'FRAME',
            name: feature.title,
            width: cardWidth,
            height: cardHeight,
            x: featureX,
            y: featureY,
            children: [
                {
                    type: 'TEXT',
                    name: 'Feature Title',
                    characters: feature.title,
                    fontSize: 18,
                    fontName: { family: 'Inter', style: 'Bold' },
                    x: 24,
                    y: 24,
                    width: cardWidth - 48,
                    fills: [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }]
                },
                {
                    type: 'TEXT',
                    name: 'Feature Description',
                    characters: feature.description,
                    fontSize: 14,
                    fontName: { family: 'Inter', style: 'Regular' },
                    x: 24,
                    y: 60,
                    width: cardWidth - 48,
                    fills: [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }]
                }
            ],
            fills: [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }],
            cornerRadius: 12
        };

        featuresFrame.children.push(featureCard);

        // Grid layout (3 columns)
        featureX += cardWidth + gap;
        if ((idx + 1) % 3 === 0) {
            featureX = 120;
            featureY += cardHeight + gap;
        }
    });

    sections.push(featuresFrame);
    yOffset += 800;

    // Main landing page frame
    return {
        type: 'FRAME',
        name: 'Landing Page',
        width: 1440,
        height: yOffset,
        x: 0,
        y: 0,
        children: sections,
        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    };
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): RGB {
    hex = hex.replace('#', '');

    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    return { r, g, b };
}
