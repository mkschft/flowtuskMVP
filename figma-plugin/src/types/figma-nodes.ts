// Figma Node Types
// Defines the structure for Figma nodes that will be created by the plugin

export interface FigmaRectangleNode {
    type: 'RECTANGLE';
    name: string;
    width: number;
    height: number;
    x?: number;
    y?: number;
    fills: Paint[];
    cornerRadius?: number;
}

export interface FigmaTextNode {
    type: 'TEXT';
    name: string;
    characters: string;
    fontSize: number;
    fontName: { family: string; style: string };
    x?: number;
    y?: number;
    width?: number;
    fills?: Paint[];
    textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT';
    textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
}

export interface FigmaFrameNode {
    type: 'FRAME';
    name: string;
    width: number;
    height: number;
    x?: number;
    y?: number;
    children: FigmaNode[];
    fills?: Paint[];
    cornerRadius?: number;

    // Auto-layout properties
    layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
    primaryAxisSizingMode?: 'FIXED' | 'AUTO';
    counterAxisSizingMode?: 'FIXED' | 'AUTO';
    itemSpacing?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
}

export type FigmaNode = FigmaRectangleNode | FigmaTextNode | FigmaFrameNode;

export interface Paint {
    type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL';
    color?: RGB;
    opacity?: number;
}

export interface RGB {
    r: number; // 0-1
    g: number; // 0-1
    b: number; // 0-1
}

// Component transformation result types

export interface TransformedComponents {
    brandGuide?: FigmaFrameNode;
    landingPage?: FigmaFrameNode;
    styleGuide?: FigmaFrameNode;
    valueProp?: FigmaFrameNode;
}
