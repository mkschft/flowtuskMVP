import { createClient } from '@/lib/supabase/server';
import { BrandManifest } from '@/lib/types/brand-manifest';
import { generateBrandKey } from '@/lib/brand-manifest-utils';

// --- CRUD Operations ---

export async function fetchBrandManifest(flowId: string, icpId: string): Promise<BrandManifest | null> {
    const supabase = await createClient();

    // Try to find an existing manifest for this flow
    const { data, error } = await supabase
        .from('brand_manifests')
        .select('manifest')
        .eq('flow_id', flowId)
        .single();

    if (error || !data) return null;

    return data.manifest as BrandManifest;
}

export async function createBrandManifest(
    flowId: string,
    icpId: string,
    initialData: Partial<BrandManifest>
): Promise<BrandManifest> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const manifest: BrandManifest = {
        version: '1.0',
        brandName: initialData.brandName || 'Untitled Brand',
        brandKey: initialData.brandKey || generateBrandKey(),
        lastUpdated: new Date().toISOString(),
        strategy: initialData.strategy || {
            persona: {
                name: '', role: '', company: '', industry: '', location: '', country: '', painPoints: [], goals: []
            },
            valueProp: {
                headline: '', subheadline: '', problem: '', solution: '', outcome: '', benefits: [], targetAudience: ''
            }
        },
        identity: initialData.identity || {
            colors: { primary: [], secondary: [], accent: [], neutral: [] },
            typography: { heading: { family: 'Inter', weights: [], sizes: {} }, body: { family: 'Inter', weights: [], sizes: {} } },
            logo: { variations: [] },
            tone: { keywords: [], personality: [] }
        },
        components: initialData.components || {
            buttons: {
                primary: { style: 'solid', borderRadius: '8px', shadow: 'none' },
                secondary: { style: 'outline', borderRadius: '8px', shadow: 'none' },
                outline: { style: 'ghost', borderRadius: '8px', shadow: 'none' }
            },
            cards: { style: 'flat', borderRadius: '12px', shadow: 'sm' },
            inputs: { style: 'outlined', borderRadius: '8px', focusStyle: 'ring' },
            spacing: { scale: {} }
        },
        previews: initialData.previews || {
            landingPage: {
                navigation: {
                    logo: initialData.brandName || 'Brand',
                    links: ['Product', 'Features', 'Pricing', 'About']
                },
                hero: { headline: '', subheadline: '', cta: { primary: '', secondary: '' } },
                features: [],
                socialProof: [],
                footer: { sections: [] }
            }
        },
        metadata: {
            generationHistory: [],
            regenerationCount: 0,
            sourceFlowId: flowId,
            sourceIcpId: icpId
        }
    };

    const { data, error } = await supabase
        .from('brand_manifests')
        .insert({
            user_id: user.id,
            flow_id: flowId,
            manifest,
            brand_key: manifest.brandKey,
            version: '1.0'
        })
        .select()
        .single();

    if (error) throw error;

    return data.manifest as BrandManifest;
}

export async function updateBrandManifest(
    flowId: string,
    updates: Partial<BrandManifest>,
    action: string
): Promise<BrandManifest> {
    const supabase = await createClient();

    // Fetch current manifest
    const current = await fetchBrandManifest(flowId, '');
    if (!current) throw new Error('Manifest not found');

    // Handle null/undefined updates
    if (!updates || typeof updates !== 'object') {
        console.warn('⚠️ [Brand Manifest] Updates is null/undefined, returning current manifest');
        return current;
    }

    // Deep merge updates
    const updated = deepMerge(current, updates);

    // Update metadata with null safety
    updated.lastUpdated = new Date().toISOString();
    updated.metadata = {
        ...(current.metadata || {}),
        regenerationCount: ((current.metadata?.regenerationCount) || 0) + 1,
        generationHistory: [
            ...(current.metadata?.generationHistory || []),
            {
                timestamp: new Date().toISOString(),
                action,
                changedFields: Object.keys(updates || {})
            }
        ]
    };

    // Save to database
    const { data, error } = await supabase
        .from('brand_manifests')
        .update({ manifest: updated, updated_at: new Date().toISOString() })
        .eq('flow_id', flowId)
        .select()
        .single();

    if (error) throw error;

    return data.manifest as BrandManifest;
}

function deepMerge(target: any, source: any): any {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
