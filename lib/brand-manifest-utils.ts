import { BrandManifest } from '@/lib/types/brand-manifest';
import { nanoid } from 'nanoid';

export function generateBrandKey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars
    let key = '';
    for (let i = 0; i < 8; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `FLOW-${key.substring(0, 4)}-${key.substring(4)}`;
}

export function mapLegacyDataToManifest(
    flow: any,
    workspaceData: any,
    designAssets: any
): BrandManifest {
    const now = new Date().toISOString();
    const brandKey = generateBrandKey();

    // Extract Colors
    const primaryHex = designAssets?.brand_guide?.colors?.primary?.[0]?.hex || '#000000';
    const secondaryHex = designAssets?.brand_guide?.colors?.secondary?.[0]?.hex || '#333333';

    return {
        version: '1.0',
        brandName: workspaceData?.persona?.persona_company || flow.title || 'Brand',
        brandKey,
        lastUpdated: now,

        strategy: {
            persona: {
                name: workspaceData?.persona?.persona_name || 'Persona',
                role: workspaceData?.persona?.persona_role || 'Role',
                company: workspaceData?.persona?.persona_company || 'Company',
                industry: workspaceData?.persona?.industry || 'Industry',
                location: workspaceData?.persona?.location || 'Location',
                country: workspaceData?.persona?.country || 'Country',
                painPoints: workspaceData?.persona?.pain_points || [],
                goals: workspaceData?.persona?.goals || []
            },
            valueProp: {
                headline: workspaceData?.valueProp?.headline || '',
                subheadline: workspaceData?.valueProp?.subheadline || '',
                problem: workspaceData?.valueProp?.problem || '',
                solution: workspaceData?.valueProp?.solution || '',
                outcome: workspaceData?.valueProp?.outcome || '',
                benefits: workspaceData?.valueProp?.benefits || [],
                targetAudience: workspaceData?.valueProp?.targetAudience || ''
            }
        },

        identity: {
            colors: {
                primary: [{ name: 'Primary', hex: primaryHex, usage: 'Main brand color' }],
                secondary: [{ name: 'Secondary', hex: secondaryHex }],
                accent: [],
                neutral: [] // Populate with generated neutrals if needed
            },
            typography: {
                heading: {
                    family: designAssets?.brand_guide?.typography?.find((t: any) => t.category === 'heading')?.fontFamily || 'Inter',
                    weights: ['700'],
                    sizes: { h1: '48px', h2: '36px', h3: '30px' }
                },
                body: {
                    family: designAssets?.brand_guide?.typography?.find((t: any) => t.category === 'body')?.fontFamily || 'Inter',
                    weights: ['400'],
                    sizes: { base: '16px', small: '14px' }
                }
            },
            logo: {
                variations: designAssets?.brand_guide?.logoVariations || []
            },
            tone: {
                keywords: designAssets?.brand_guide?.toneOfVoice || [],
                personality: (designAssets?.brand_guide?.personalityTraits || []).map((trait: any) => ({
                    trait: trait.label || trait,
                    value: trait.value || 50,
                    leftLabel: trait.leftLabel || '',
                    rightLabel: trait.rightLabel || ''
                }))
            }
        },

        components: {
            buttons: {
                primary: {
                    style: designAssets?.style_guide?.buttons?.[0]?.style || 'solid',
                    borderRadius: designAssets?.style_guide?.borderRadius || '8px',
                    shadow: 'none'
                },
                secondary: { style: 'outline', borderRadius: '8px', shadow: 'none' },
                outline: { style: 'ghost', borderRadius: '8px', shadow: 'none' }
            },
            cards: {
                style: designAssets?.style_guide?.cards?.[0]?.style || 'flat',
                borderRadius: designAssets?.style_guide?.borderRadius || '12px',
                shadow: 'sm'
            },
            inputs: { style: 'outlined', borderRadius: '8px', focusStyle: 'ring' },
            spacing: { scale: {} }
        },

        previews: {
            landingPage: {
                navigation: {
                    logo: designAssets?.landing_page?.navigation?.logo || workspaceData?.persona?.persona_company || 'Brand',
                    links: designAssets?.landing_page?.navigation?.links || ['Product', 'Features', 'Pricing', 'About']
                },
                hero: {
                    headline: designAssets?.landing_page?.hero?.headline || '',
                    subheadline: designAssets?.landing_page?.hero?.subheadline || '',
                    cta: {
                        primary: 'Get Started',
                        secondary: 'Learn More'
                    }
                },
                features: designAssets?.landing_page?.features || [],
                socialProof: designAssets?.landing_page?.social_proof || [],
                footer: {
                    sections: designAssets?.landing_page?.footer?.sections || []
                }
            }
        },

        metadata: {
            generationHistory: [],
            regenerationCount: 0,
            sourceFlowId: flow.id,
            sourceIcpId: workspaceData?.persona?.id || ''
        }
    };
}

// Alias for backward compatibility if needed, or just update call sites
export const generateManifestFromDesignStudio = mapLegacyDataToManifest;
