// Figma Plugin Main Code
// Handles manifest import and component creation

import { transformBrandGuideToFigma, transformLandingPageToFigma } from './transformers';
import { buildFigmaNode } from './builders';
import { fillTemplate, fillPainPointsList, fillGoalsList } from './template-filler';

// Show the plugin UI
figma.showUI(__html__, { width: 400, height: 500 });

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'generate-personas') {
        // ... (Port existing logic later if needed, focusing on Brand Import first)
        figma.notify("Persona generation coming soon to this version!");
    }

    if (msg.type === 'import-manifest') {
        try {
            const { manifest, selectedComponents } = msg;

            // Create Figma styles (existing functionality)
            figma.ui.postMessage({ type: 'status', message: 'Creating color styles...' });
            await createColorStyles(manifest.identity.colors);

            figma.ui.postMessage({ type: 'status', message: 'Creating text styles...' });
            await createTextStyles(manifest.identity.typography);

            // NEW: Create component pages if selected
            if (selectedComponents?.brandGuide) {
                figma.ui.postMessage({ type: 'status', message: 'Building Brand Guide...' });
                const brandGuideFrame = transformBrandGuideToFigma(manifest);
                const brandGuidePage = figma.createPage();
                brandGuidePage.name = `Brand Guide - ${manifest.brandName}`;
                const builtFrame = await buildFigmaNode(brandGuideFrame);
                brandGuidePage.appendChild(builtFrame);
            }

            if (selectedComponents?.landingPage) {
                figma.ui.postMessage({ type: 'status', message: 'Building Landing Page...' });
                const landingPageFrame = transformLandingPageToFigma(manifest);
                const landingPage = figma.createPage();
                landingPage.name = `Landing Page - ${manifest.brandName}`;
                const builtFrame = await buildFigmaNode(landingPageFrame);
                landingPage.appendChild(builtFrame);
                figma.currentPage = landingPage;
                figma.viewport.scrollAndZoomIntoView([builtFrame]);
            }

            figma.ui.postMessage({
                type: 'success',
                message: '✅ Brand System and Components imported successfully!'
            });

            figma.notify('✅ Import complete!');

        } catch (error: any) {
            console.error('Import error:', error);
            figma.ui.postMessage({
                type: 'error',
                message: error.message || 'Failed to import brand system'
            });
        }
    }

    if (msg.type === 'fill-template') {
        try {
            const { manifest } = msg;

            figma.ui.postMessage({ type: 'status', message: 'Scanning template...' });

            // Fill main text fields
            const result = await fillTemplate(manifest);

            figma.ui.postMessage({ type: 'status', message: 'Filling pain points...' });
            const painPoints = await fillPainPointsList(manifest);

            figma.ui.postMessage({ type: 'status', message: 'Filling goals...' });
            const goals = await fillGoalsList(manifest);

            const total = result.filled + painPoints + goals;

            figma.ui.postMessage({
                type: 'success',
                message: `✅ Filled ${total} fields in template!`
            });

            figma.notify(`✅ Template filled: ${total} fields updated`);

        } catch (error: any) {
            console.error('Template fill error:', error);
            figma.ui.postMessage({
                type: 'error',
                message: error.message || 'Failed to fill template'
            });
        }
    }

    if (msg.type === 'close') {
        figma.closePlugin();
    }
};

// --- Helper Functions ---

async function createColorStyles(colors: any) {
    // Helper to create a solid paint style
    const createStyle = (name: string, hex: string) => {
        const style = figma.createPaintStyle();
        style.name = name;
        style.paints = [{
            type: 'SOLID',
            color: hexToRgb(hex)
        }];
    };

    // Primary colors (array of color tokens)
    if (colors.primary && colors.primary.length > 0) {
        colors.primary.forEach((color: any, idx: number) => {
            createStyle(`Brand/Primary/${color.name || `Color ${idx + 1}`}`, color.hex);
        });
    }

    // Secondary colors
    if (colors.secondary && colors.secondary.length > 0) {
        colors.secondary.forEach((color: any, idx: number) => {
            createStyle(`Brand/Secondary/${color.name || `Color ${idx + 1}`}`, color.hex);
        });
    }

    // Accent colors
    if (colors.accent && colors.accent.length > 0) {
        colors.accent.forEach((color: any, idx: number) => {
            createStyle(`Brand/Accent/${color.name || `Color ${idx + 1}`}`, color.hex);
        });
    }

    // Neutral colors
    if (colors.neutral && colors.neutral.length > 0) {
        colors.neutral.forEach((color: any, idx: number) => {
            createStyle(`Brand/Neutral/${color.name || `Color ${idx + 1}`}`, color.hex);
        });
    }
}


async function createTextStyles(typography: any) {
    // Helper to load font and create style
    const createStyle = async (name: string, family: string, weight: string, size: number, lineHeight?: number) => {
        try {
            await figma.loadFontAsync({ family, style: weight });

            const style = figma.createTextStyle();
            style.name = name;
            style.fontName = { family, style: weight };
            style.fontSize = size;
            if (lineHeight) {
                style.lineHeight = { value: lineHeight * 100, unit: 'PERCENT' };
            }
        } catch (e) {
            console.error(`Could not create text style ${name}:`, e);
        }
    };

    // Headings
    const heading = typography.heading;
    const hWeight = heading.weights && heading.weights[0] ? mapFontWeight(heading.weights[0]) : 'Bold';

    try {
        await figma.loadFontAsync({ family: heading.family, style: hWeight });

        const sizes = heading.sizes;
        if (sizes.h1) await createStyle('Heading/H1', heading.family, hWeight, parseInt(sizes.h1), 1.2);
        if (sizes.h2) await createStyle('Heading/H2', heading.family, hWeight, parseInt(sizes.h2), 1.3);
        if (sizes.h3) await createStyle('Heading/H3', heading.family, hWeight, parseInt(sizes.h3), 1.4);
        if (sizes.h4) await createStyle('Heading/H4', heading.family, hWeight, parseInt(sizes.h4 || '24'), 1.4);
    } catch (e) {
        console.error(`Could not load  font ${heading.family}`, e);
        figma.notify(`Could not load font ${heading.family}. Using Inter instead.`);
    }

    // Body
    const body = typography.body;
    const bWeight = body.weights && body.weights[0] ? mapFontWeight(body.weights[0]) : 'Regular';

    try {
        await figma.loadFontAsync({ family: body.family, style: bWeight });

        const sizes = body.sizes;
        if (sizes.base) await createStyle('Body/Base', body.family, bWeight, parseInt(sizes.base), 1.5);
        if (sizes.small) await createStyle('Body/Small', body.family, bWeight, parseInt(sizes.small), 1.5);
    } catch (e) {
        console.error(`Could not load font ${body.family}`, e);
    }
}

// Helper to map font weight to Figma style
function mapFontWeight(weight: string | number): string {
    const weightNum = typeof weight === 'string' ? parseInt(weight) : weight;

    if (weightNum >= 700) return 'Bold';
    if (weightNum >= 600) return 'SemiBold';
    if (weightNum >= 500) return 'Medium';
    return 'Regular';
}

function hexToRgb(hex: string): { r: number, g: number, b: number } {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
}
