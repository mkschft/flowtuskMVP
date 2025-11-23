// Template Filler
// Fills existing Figma templates with manifest data

import { BrandManifest } from './types/manifest';

export interface TemplateFillOptions {
    currentPageOnly?: boolean;
    preserveStyles?: boolean;
}

/**
 * Fills the current Figma page with manifest data
 */
export async function fillTemplate(
    manifest: BrandManifest,
    options: TemplateFillOptions = {}
): Promise<{ filled: number; skipped: number; details: any[] }> {
    const { currentPageOnly = true, preserveStyles = true } = options;

    let filled = 0;
    let skipped = 0;
    const details: any[] = [];

    // Get all text nodes on current page
    const page = figma.currentPage;
    const textNodes = page.findAll(node => node.type === 'TEXT') as TextNode[];

    console.log(`\n🔍 TEMPLATE FILLER - Starting scan...`);
    console.log(`📄 Page: "${page.name}"`);
    console.log(`📝 Found ${textNodes.length} text nodes to process\n`);

    for (const node of textNodes) {
        const result = await fillTextNode(node, manifest, preserveStyles);
        if (result.filled) {
            filled++;
            details.push({
                layerName: node.name,
                field: result.field,
                value: result.value,
                source: result.source
            });
        } else {
            skipped++;
        }
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`✅ Filled: ${filled} fields`);
    console.log(`⏭️  Skipped: ${skipped} fields`);
    console.log(`\n🎉 Template filling complete!\n`);

    return { filled, skipped, details };
}

/**
 * Attempts to fill a single text node with manifest data
 * Returns object with details about what was filled
 */
async function fillTextNode(
    node: TextNode,
    manifest: BrandManifest,
    preserveStyles: boolean
): Promise<{ filled: boolean; field?: string; value?: string; source?: string }> {
    const name = node.name.toLowerCase();
    const currentText = node.characters.toLowerCase();

    // Load font before modifying
    await figma.loadFontAsync(node.fontName as FontName);

    // Helper to fill and log
    const fillField = (value: string, fieldName: string, source: string) => {
        node.characters = value;
        console.log(`✅ Filled "${node.name}" with "${value}" from manifest.${source}`);
        return { filled: true, field: fieldName, value, source };
    };

    // Persona Data
    if (matchesField(name, currentText, ['persona name', 'name', 'user name'])) {
        return fillField(manifest.strategy.persona.name, 'Persona Name', 'strategy.persona.name');
    }

    if (matchesField(name, currentText, ['persona role', 'role', 'job title', 'position'])) {
        return fillField(manifest.strategy.persona.role, 'Persona Role', 'strategy.persona.role');
    }

    if (matchesField(name, currentText, ['company', 'organization'])) {
        return fillField(manifest.strategy.persona.company, 'Company', 'strategy.persona.company');
    }

    if (matchesField(name, currentText, ['industry', 'sector'])) {
        return fillField(manifest.strategy.persona.industry, 'Industry', 'strategy.persona.industry');
    }

    if (matchesField(name, currentText, ['location', 'city', 'country'])) {
        const locationValue = `${manifest.strategy.persona.location}, ${manifest.strategy.persona.country}`;
        return fillField(locationValue, 'Location', 'strategy.persona.location+country');
    }

    // Pain Points (check for numbered items)
    const painPointMatch = name.match(/pain\s?point\s?(\d+)/i);
    if (painPointMatch) {
        const index = parseInt(painPointMatch[1]) - 1;
        if (manifest.strategy.persona.painPoints[index]) {
            return fillField(
                manifest.strategy.persona.painPoints[index],
                `Pain Point ${index + 1}`,
                `strategy.persona.painPoints[${index}]`
            );
        }
    }

    // Goals (check for numbered items)
    const goalMatch = name.match(/goal\s?(\d+)/i);
    if (goalMatch) {
        const index = parseInt(goalMatch[1]) - 1;
        if (manifest.strategy.persona.goals[index]) {
            return fillField(
                manifest.strategy.persona.goals[index],
                `Goal ${index + 1}`,
                `strategy.persona.goals[${index}]`
            );
        }
    }

    // Brand Data
    if (matchesField(name, currentText, ['brand name', 'brand'])) {
        return fillField(manifest.brandName, 'Brand Name', 'brandName');
    }

    // Value Prop
    if (matchesField(name, currentText, ['headline', 'tagline', 'slogan'])) {
        return fillField(manifest.strategy.valueProp.headline, 'Headline', 'strategy.valueProp.headline');
    }

    if (matchesField(name, currentText, ['subheadline', 'subtitle', 'description'])) {
        return fillField(manifest.strategy.valueProp.subheadline, 'Subheadline', 'strategy.valueProp.subheadline');
    }

    if (matchesField(name, currentText, ['problem', 'challenge'])) {
        return fillField(manifest.strategy.valueProp.problem, 'Problem', 'strategy.valueProp.problem');
    }

    if (matchesField(name, currentText, ['solution'])) {
        return fillField(manifest.strategy.valueProp.solution, 'Solution', 'strategy.valueProp.solution');
    }

    // Template placeholders ({{field}})
    if (node.characters.includes('{{')) {
        const newText = replacePlaceholders(node.characters, manifest);
        if (newText !== node.characters) {
            node.characters = newText;
            console.log(`✅ Filled "${node.name}" with placeholder replacement`);
            return { filled: true, field: 'Placeholder', value: newText, source: 'placeholder syntax' };
        }
    }

    console.log(`⏭️  Skipped "${node.name}" (no match found)`);
    return { filled: false };
}

/**
 * Checks if a field matches any of the keywords
 */
function matchesField(name: string, text: string, keywords: string[]): boolean {
    for (const keyword of keywords) {
        if (name.includes(keyword) || text.includes(keyword)) {
            return true;
        }
    }
    return false;
}

/**
 * Replaces {{placeholder}} syntax with manifest data
 */
function replacePlaceholders(text: string, manifest: BrandManifest): string {
    return text
        // Persona
        .replace(/\{\{persona\.name\}\}/gi, manifest.strategy.persona.name)
        .replace(/\{\{persona\.role\}\}/gi, manifest.strategy.persona.role)
        .replace(/\{\{persona\.company\}\}/gi, manifest.strategy.persona.company)
        .replace(/\{\{persona\.industry\}\}/gi, manifest.strategy.persona.industry)
        .replace(/\{\{persona\.location\}\}/gi, manifest.strategy.persona.location)
        .replace(/\{\{persona\.country\}\}/gi, manifest.strategy.persona.country)

        // Brand
        .replace(/\{\{brand\.name\}\}/gi, manifest.brandName)

        // Value Prop
        .replace(/\{\{value\.headline\}\}/gi, manifest.strategy.valueProp.headline)
        .replace(/\{\{value\.subheadline\}\}/gi, manifest.strategy.valueProp.subheadline)
        .replace(/\{\{value\.problem\}\}/gi, manifest.strategy.valueProp.problem)
        .replace(/\{\{value\.solution\}\}/gi, manifest.strategy.valueProp.solution)
        .replace(/\{\{value\.outcome\}\}/gi, manifest.strategy.valueProp.outcome);
}

/**
 * Fills pain points into a list (detects frames with numbered children)
 */
export async function fillPainPointsList(
    manifest: BrandManifest,
    containerName: string = 'pain points'
): Promise<number> {
    const page = figma.currentPage;
    const container = page.findOne(
        node => node.name.toLowerCase().includes(containerName) && node.type === 'FRAME'
    ) as FrameNode;

    if (!container) return 0;

    let filled = 0;
    const textNodes = container.findAll(node => node.type === 'TEXT') as TextNode[];

    for (let i = 0; i < Math.min(textNodes.length, manifest.strategy.persona.painPoints.length); i++) {
        const node = textNodes[i];
        await figma.loadFontAsync(node.fontName as FontName);
        node.characters = manifest.strategy.persona.painPoints[i];
        filled++;
    }

    return filled;
}

/**
 * Fills goals into a list
 */
export async function fillGoalsList(
    manifest: BrandManifest,
    containerName: string = 'goals'
): Promise<number> {
    const page = figma.currentPage;
    const container = page.findOne(
        node => node.name.toLowerCase().includes(containerName) && node.type === 'FRAME'
    ) as FrameNode;

    if (!container) return 0;

    let filled = 0;
    const textNodes = container.findAll(node => node.type === 'TEXT') as TextNode[];

    for (let i = 0; i < Math.min(textNodes.length, manifest.strategy.persona.goals.length); i++) {
        const node = textNodes[i];
        await figma.loadFontAsync(node.fontName as FontName);
        node.characters = manifest.strategy.persona.goals[i];
        filled++;
    }

    return filled;
}
