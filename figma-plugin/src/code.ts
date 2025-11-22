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
            const { manifest } = msg;

            figma.ui.postMessage({ type: 'status', message: 'Creating color styles...' });
            await createColorStyles(manifest.design_tokens.colors);

            figma.ui.postMessage({ type: 'status', message: 'Creating text styles...' });
            await createTextStyles(manifest.design_tokens.typography);

            figma.ui.postMessage({ type: 'status', message: 'Building brand page...' });
            await createBrandLibraryPage(manifest);

            figma.ui.postMessage({
                type: 'success',
                message: '✅ Brand System imported successfully!'
            });

            figma.notify('✅ Brand System imported successfully!');

        } catch (error: any) {
            figma.ui.postMessage({
                type: 'error',
                message: error.message || 'Failed to import brand system'
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

    // Primary
    if (colors.primary) createStyle('Brand/Primary', colors.primary.hex);
    if (colors.secondary) createStyle('Brand/Secondary', colors.secondary.hex);
    if (colors.accent) createStyle('Brand/Accent', colors.accent.hex);

    // Neutrals
    if (colors.neutral) {
        Object.entries(colors.neutral).forEach(([key, hex]) => {
            createStyle(`Neutral/${key}`, hex as string);
        });
    }
}

async function createTextStyles(typography: any) {
    // Helper to load font and create style
    const createStyle = async (name: string, family: string, weight: string, size: number, lineHeight?: number) => {
        await figma.loadFontAsync({ family, style: weight });

        const style = figma.createTextStyle();
        style.name = name;
        style.fontName = { family, style: weight };
        style.fontSize = size;
        if (lineHeight) {
            style.lineHeight = { value: lineHeight * 100, unit: 'PERCENT' };
        }
    };

    // Headings
    const hFont = typography.heading.font;
    const hWeight = typography.heading.weight === 700 ? 'Bold' : 'Regular'; // Simplified mapping

    // We need to try/catch font loading as it might fail if font not available
    try {
        await figma.loadFontAsync({ family: hFont, style: hWeight });

        const sizes = typography.heading.sizes;
        await createStyle('Heading/H1', hFont, hWeight, sizes.h1, 1.2);
        await createStyle('Heading/H2', hFont, hWeight, sizes.h2, 1.3);
        await createStyle('Heading/H3', hFont, hWeight, sizes.h3, 1.4);
        await createStyle('Heading/H4', hFont, hWeight, sizes.h4 || 24, 1.4);
    } catch (e) {
        console.error(`Could not load font ${hFont}`, e);
        figma.notify(`Could not load font ${hFont}. Using Inter instead.`);
    }

    // Body
    const bFont = typography.body.font;
    const bWeight = typography.body.weight === 400 ? 'Regular' : 'Bold';

    try {
        await figma.loadFontAsync({ family: bFont, style: bWeight });

        const sizes = typography.body.sizes;
        await createStyle('Body/Base', bFont, bWeight, sizes.base, 1.5);
        await createStyle('Body/Small', bFont, bWeight, sizes.small, 1.5);
    } catch (e) {
        console.error(`Could not load font ${bFont}`, e);
    }
}

async function createBrandLibraryPage(manifest: any) {
    const page = figma.createPage();
    page.name = `Brand System - ${manifest.identity.brand_name}`;

    let yOffset = 0;

    // Title
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    const title = figma.createText();
    title.characters = manifest.identity.brand_name;
    title.fontSize = 64;
    title.y = yOffset;
    page.appendChild(title);
    yOffset += 100;

    const tagline = figma.createText();
    tagline.characters = manifest.identity.tagline;
    tagline.fontSize = 24;
    tagline.y = yOffset;
    page.appendChild(tagline);
    yOffset += 150;

    // Colors Section
    const colorFrame = figma.createFrame();
    colorFrame.name = "Colors";
    colorFrame.y = yOffset;
    colorFrame.resize(800, 200);
    colorFrame.fills = []; // Transparent

    let xOffset = 0;
    const addSwatch = (name: string, hex: string) => {
        const rect = figma.createRectangle();
        rect.resize(100, 100);
        rect.x = xOffset;
        rect.fills = [{ type: 'SOLID', color: hexToRgb(hex) }];
        rect.cornerRadius = 8;

        const label = figma.createText();
        label.characters = name;
        label.x = xOffset;
        label.y = 110;
        label.fontSize = 12;

        colorFrame.appendChild(rect);
        colorFrame.appendChild(label);
        xOffset += 120;
    };

    if (manifest.design_tokens.colors.primary) addSwatch("Primary", manifest.design_tokens.colors.primary.hex);
    if (manifest.design_tokens.colors.secondary) addSwatch("Secondary", manifest.design_tokens.colors.secondary.hex);
    if (manifest.design_tokens.colors.accent) addSwatch("Accent", manifest.design_tokens.colors.accent.hex);

    page.appendChild(colorFrame);

    figma.currentPage = page;
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
