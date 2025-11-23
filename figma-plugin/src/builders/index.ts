// Figma Node Builder
// Creates actual Figma nodes from transformed data structures

import { FigmaNode, FigmaFrameNode, FigmaTextNode, FigmaRectangleNode } from '../types/figma-nodes';
import { loadFontSafe } from './utils';

/**
 * Recursively builds Figma nodes from transformed data
 */
export async function buildFigmaNode(nodeData: FigmaNode): Promise<SceneNode> {
    if (nodeData.type === 'RECTANGLE') {
        return buildRectangle(nodeData);
    }

    if (nodeData.type === 'TEXT') {
        return await buildText(nodeData);
    }

    if (nodeData.type === 'FRAME') {
        return await buildFrame(nodeData);
    }

    throw new Error(`Unknown node type: ${(nodeData as any).type}`);
}

/**
 * Builds a rectangle node
 */
function buildRectangle(nodeData: FigmaRectangleNode): RectangleNode {
    const rect = figma.createRectangle();
    rect.name = nodeData.name;
    rect.resize(nodeData.width, nodeData.height);

    if (nodeData.x !== undefined) rect.x = nodeData.x;
    if (nodeData.y !== undefined) rect.y = nodeData.y;

    rect.fills = nodeData.fills as Paint[];

    if (nodeData.cornerRadius !== undefined) {
        rect.cornerRadius = nodeData.cornerRadius;
    }

    return rect;
}

/**
 * Builds a text node
 */
async function buildText(nodeData: FigmaTextNode): Promise<TextNode> {
    // Load font (with fallback)
    const success = await loadFontSafe(
        nodeData.fontName.family,
        nodeData.fontName.style
    );

    const text = figma.createText();
    text.name = nodeData.name;

    // Set font (use what was successfully loaded)
    text.fontName = success
        ? nodeData.fontName as FontName
        : { family: 'Inter', style: 'Regular' };

    text.characters = nodeData.characters;
    text.fontSize = nodeData.fontSize;

    if (nodeData.x !== undefined) text.x = nodeData.x;
    if (nodeData.y !== undefined) text.y = nodeData.y;

    if (nodeData.width !== undefined) {
        text.resize(nodeData.width, text.height);
    }

    if (nodeData.fills) {
        text.fills = nodeData.fills as Paint[];
    }

    if (nodeData.textAlignHorizontal) {
        text.textAlignHorizontal = nodeData.textAlignHorizontal;
    }

    if (nodeData.textAlignVertical) {
        text.textAlignVertical = nodeData.textAlignVertical;
    }

    return text;
}

/**
 * Builds a frame node with children
 */
async function buildFrame(nodeData: FigmaFrameNode): Promise<FrameNode> {
    const frame = figma.createFrame();
    frame.name = nodeData.name;
    frame.resize(nodeData.width, nodeData.height);

    if (nodeData.x !== undefined) frame.x = nodeData.x;
    if (nodeData.y !== undefined) frame.y = nodeData.y;

    if (nodeData.fills) {
        frame.fills = nodeData.fills as Paint[];
    }

    if (nodeData.cornerRadius !== undefined) {
        frame.cornerRadius = nodeData.cornerRadius;
    }

    // Auto-layout settings
    if (nodeData.layoutMode && nodeData.layoutMode !== 'NONE') {
        frame.layoutMode = nodeData.layoutMode;

        if (nodeData.itemSpacing !== undefined) {
            frame.itemSpacing = nodeData.itemSpacing;
        }

        if (nodeData.paddingLeft !== undefined) frame.paddingLeft = nodeData.paddingLeft;
        if (nodeData.paddingRight !== undefined) frame.paddingRight = nodeData.paddingRight;
        if (nodeData.paddingTop !== undefined) frame.paddingTop = nodeData.paddingTop;
        if (nodeData.paddingBottom !== undefined) frame.paddingBottom = nodeData.paddingBottom;

        if (nodeData.primaryAxisSizingMode) {
            frame.primaryAxisSizingMode = nodeData.primaryAxisSizingMode;
        }
        if (nodeData.counterAxisSizingMode) {
            frame.counterAxisSizingMode = nodeData.counterAxisSizingMode;
        }
    }

    // Build children recursively
    for (const child of nodeData.children) {
        const childNode = await buildFigmaNode(child);
        frame.appendChild(childNode);
    }

    return frame;
}
