import { nanoid } from 'nanoid';

// --- Types ---

export interface BrandManifest {
    id: string;
    version: string; // "1.0"
    created_at: string;
    updated_at: string;

    identity: {
        brand_name: string;
        tagline: string;
        elevator_pitch: string;
        website_url: string;
    };

    messaging: {
        positioning_statement: string;
        icps: Array<{
            name: string;
            role: string;
            pain_points: string[];
            goals: string[];
            company_size?: string;
        }>;
        value_props: Array<{
            headline: string;
            subheadline: string;
            benefits: string[];
        }>;
        tone_of_voice: string[];
        proof_points: string[];
    };

    design_tokens: {
        colors: ColorSystem;
        typography: TypographySystem;
        spacing: SpacingSystem;
        radii: RadiiSystem;
        shadows: ShadowSystem;
    };

    components: {
        button?: ComponentSpec;
        card?: ComponentSpec;
        hero?: HeroSpec;
    };

    evidence: {
        source_url: string;
        fact_ids: string[];
        generated_at: string;
    };
}

export interface ColorSystem {
    primary: ColorToken;
    secondary: ColorToken;
    accent: ColorToken;
    neutral: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
}

export interface ColorToken {
    hex: string;
    rgb: string;
    psychology: string;
    usage: string;
}

export interface TypographySystem {
    heading: FontSpec;
    body: FontSpec;
}

export interface FontSpec {
    font: string;
    weight: number;
    sizes: Record<string, number>; // e.g. { h1: 48, base: 16 }
    line_heights?: Record<string, number>;
}

export interface SpacingSystem {
    base: number;
    scale: number[];
}

export interface RadiiSystem {
    sm: number;
    base: number;
    lg: number;
    full: number;
}

export interface ShadowSystem {
    sm: string;
    md: string;
    lg: string;
}

export interface ComponentSpec {
    [key: string]: any;
}

export interface HeroSpec {
    layout: string;
    headline: string;
    subheadline: string;
    cta: string;
}

// --- Generators ---

export function generateBrandKey(): string {
    // Generate a short, readable key like "ACME-X7Y9"
    // Using nanoid with custom alphabet for readability
    const id = nanoid(4).toUpperCase();
    return `FLOW-${id}`;
}

export function generateManifestFromDesignStudio(
    flow: any, // Typed as any for now to avoid circular deps, ideally Flow type
    workspaceData: any, // CopilotWorkspaceData
    designAssets: any // PositioningDesignAssets
): BrandManifest {
    const now = new Date().toISOString();

    // Extract Colors
    const primaryHex = designAssets?.brand_guide?.colors?.primary?.[0]?.hex || '#000000';
    const secondaryHex = designAssets?.brand_guide?.colors?.secondary?.[0]?.hex || '#333333';

    // Helper to generate neutral palette (simple implementation)
    // In a real app, we'd use a color library like chroma-js
    const neutrals = {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    };

    return {
        id: flow.id,
        version: '1.0',
        created_at: now,
        updated_at: now,

        identity: {
            brand_name: workspaceData?.persona?.persona_company || flow.title || 'Brand',
            tagline: workspaceData?.valueProp?.headline || '',
            elevator_pitch: workspaceData?.valueProp?.solution || '',
            website_url: flow.website_url || ''
        },

        messaging: {
            positioning_statement: workspaceData?.valueProp?.summary?.mainInsight || '',
            icps: [
                {
                    name: workspaceData?.persona?.persona_name || 'Persona',
                    role: workspaceData?.persona?.persona_role || 'Role',
                    pain_points: workspaceData?.persona?.pain_points || [],
                    goals: workspaceData?.persona?.goals || [],
                    company_size: 'Unknown' // Not currently in schema
                }
            ],
            value_props: [
                {
                    headline: workspaceData?.valueProp?.headline || '',
                    subheadline: workspaceData?.valueProp?.subheadline || '',
                    benefits: workspaceData?.valueProp?.benefits || []
                }
            ],
            tone_of_voice: designAssets?.brand_guide?.toneOfVoice || [],
            proof_points: [] // Needs extraction logic
        },

        design_tokens: {
            colors: {
                primary: {
                    hex: primaryHex,
                    rgb: hexToRgb(primaryHex),
                    psychology: 'Trust, Professionalism', // Placeholder
                    usage: 'Primary actions, headings'
                },
                secondary: {
                    hex: secondaryHex,
                    rgb: hexToRgb(secondaryHex),
                    psychology: 'Support, Accent',
                    usage: 'Secondary actions, backgrounds'
                },
                accent: {
                    hex: secondaryHex, // Fallback
                    rgb: hexToRgb(secondaryHex),
                    psychology: 'Attention',
                    usage: 'Highlights'
                },
                neutral: neutrals
            },
            typography: {
                heading: {
                    font: designAssets?.brand_guide?.typography?.find((t: any) => t.category === 'heading')?.fontFamily || 'Inter',
                    weight: 700,
                    sizes: { h1: 48, h2: 36, h3: 30, h4: 24, h5: 20, h6: 16 },
                    line_heights: { h1: 1.2, h2: 1.3 }
                },
                body: {
                    font: designAssets?.brand_guide?.typography?.find((t: any) => t.category === 'body')?.fontFamily || 'Inter',
                    weight: 400,
                    sizes: { base: 16, small: 14 },
                    line_heights: { base: 1.5 }
                }
            },
            spacing: {
                base: 8,
                scale: [4, 8, 12, 16, 24, 32, 48, 64]
            },
            radii: {
                sm: 4,
                base: parseInt(designAssets?.style_guide?.borderRadius) || 8,
                lg: 12,
                full: 9999
            },
            shadows: {
                sm: '0 1px 2px rgba(0,0,0,0.05)',
                md: '0 4px 6px rgba(0,0,0,0.1)',
                lg: '0 10px 15px -3px rgba(0,0,0,0.1)'
            }
        },

        components: {
            button: {
                style: designAssets?.style_guide?.buttons?.[0]?.style || 'solid'
            },
            hero: {
                layout: 'centered',
                headline: designAssets?.landing_page?.hero?.headline || '',
                subheadline: designAssets?.landing_page?.hero?.subheadline || '',
                cta: 'Get Started'
            }
        },

        evidence: {
            source_url: flow.website_url || '',
            fact_ids: [], // Need to pass this through
            generated_at: now
        }
    };
}

// Helper
function hexToRgb(hex: string): string {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : 'rgb(0,0,0)';
}
