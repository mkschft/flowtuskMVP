import { createClient } from '@/lib/supabase/server';
import { BrandManifest } from '@/lib/types/brand-manifest';
import { generateBrandKey } from '@/lib/brand-manifest-utils';
import { cascadeColorUpdates } from './utils/cascade-updates';

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
            logoGenerationCount: 0,
            sourceFlowId: flowId,
            sourceIcpId: icpId
        }
    };

    // Normalize icpId: convert empty string to null, validate UUID format
    const normalizedIcpId = icpId && icpId.trim() !== '' ? icpId : null;

    // Build insert data - only include selected_icp if column exists (graceful fallback)
    const insertData: any = {
        user_id: user.id,
        flow_id: flowId,
        manifest,
        brand_key: manifest.brandKey,
        version: '1.0'
    };

    // Only add selected_icp if it's not null (and column exists)
    if (normalizedIcpId) {
        insertData.selected_icp = normalizedIcpId;
    }

    const { data, error } = await supabase
        .from('brand_manifests')
        .insert(insertData)
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

    // CASCADE: If colors are being updated, automatically cascade to related components
    let finalUpdates = updates;
    
    if (updates.identity?.colors) {
        console.log('🔄 [Manifest Update] Colors detected, cascading to related components...');
        
        // Create an intermediate state that represents "Current + Updates"
        // This ensures we cascade based on the NEW components (if they were updated) 
        // rather than the OLD components
        const intermediateState = deepMerge(current, updates) as BrandManifest;
        
        const cascaded = cascadeColorUpdates(intermediateState, updates.identity.colors);

        // Merge cascaded updates into the updates object
        finalUpdates = deepMerge(updates, cascaded);

        console.log('✅ [Manifest Update] Cascaded color updates to components and previews');
    }

    // Deep merge updates
    const updated = deepMerge(current, finalUpdates);

    // Ensure colors are always arrays (fix any wrong format that might have been saved)
    if (updated.identity?.colors) {
        const ensureColorArray = (value: any, colorType: string): { name: string; hex: string; usage?: string }[] => {
            if (!value) return [];
            if (Array.isArray(value)) {
                // Validate array items have correct structure
                return value.map((item: any) => {
                    if (!item) return null;
                    if (typeof item === 'string') {
                        return { name: 'Color', hex: item };
                    }
                    if (typeof item === 'object' && item.hex) {
                        return {
                            name: item.name || 'Color',
                            hex: item.hex,
                            usage: item.usage
                        };
                    }
                    return item;
                }).filter(Boolean);
            }
            if (typeof value === 'string') {
                console.log(`🔧 [Manifest] Normalizing ${colorType} color from string to array: ${value}`);
                return [{ name: 'Color', hex: value }];
            }
            if (typeof value === 'object' && value.hex) {
                console.log(`🔧 [Manifest] Normalizing ${colorType} color from object to array`);
                return [value];
            }
            // Handle object with hex values like { primary: "#FF6B9D" }
            if (typeof value === 'object' && !Array.isArray(value)) {
                console.log(`🔧 [Manifest] Normalizing ${colorType} color from object format to array`);
                return Object.entries(value).map(([key, hex]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),
                    hex: String(hex),
                    usage: `${key} color`
                }));
            }
            return [];
        };

        const beforePrimary = JSON.stringify(updated.identity.colors.primary);
        updated.identity.colors = {
            primary: ensureColorArray(updated.identity.colors.primary, 'primary'),
            secondary: ensureColorArray(updated.identity.colors.secondary, 'secondary'),
            accent: ensureColorArray(updated.identity.colors.accent, 'accent'),
            neutral: ensureColorArray(updated.identity.colors.neutral, 'neutral'),
        };
        const afterPrimary = JSON.stringify(updated.identity.colors.primary);

        if (beforePrimary !== afterPrimary) {
            console.log(`✅ [Manifest] Colors normalized - primary before: ${beforePrimary}, after: ${afterPrimary}`);
        }
    }

    // Update metadata with null safety
    updated.lastUpdated = new Date().toISOString();

    // Preserve logoGenerationCount from updates if provided, otherwise keep existing
    const logoGenerationCount = updates?.metadata?.logoGenerationCount !== undefined
        ? updates.metadata.logoGenerationCount
        : (current.metadata?.logoGenerationCount || 0);

    updated.metadata = {
        ...(current.metadata || {}),
        regenerationCount: ((current.metadata?.regenerationCount) || 0) + 1,
        logoGenerationCount,
        generationHistory: [
            ...(current.metadata?.generationHistory || []),
            {
                timestamp: new Date().toISOString(),
                action,
                changedFields: Object.keys(updates || {})
            }
        ]
    };

    // Extract sourceIcpId from updated manifest to sync with selected_icp column
    // Normalize: convert empty string to null, validate UUID format
    const rawSourceIcpId = updated.metadata?.sourceIcpId;
    const sourceIcpId = rawSourceIcpId && rawSourceIcpId.trim() !== '' ? rawSourceIcpId : null;

    console.log('🔄 [Manifest Update] Syncing selected_icp column:', {
        rawSourceIcpId,
        sourceIcpId,
        hasValue: sourceIcpId !== null
    });

    // Build update data - always include selected_icp if we have a value
    const updateData: any = {
        manifest: updated,
        updated_at: new Date().toISOString()
    };

    // Always try to sync selected_icp column when we have a value
    // If column doesn't exist, Supabase will error (migration not run)
    if (sourceIcpId !== null) {
        updateData.selected_icp = sourceIcpId;
        console.log('✅ [Manifest Update] Adding selected_icp to update:', sourceIcpId);
    } else {
        console.log('⚠️ [Manifest Update] No sourceIcpId found, skipping selected_icp update');
    }

    // Save to database
    const { data, error } = await supabase
        .from('brand_manifests')
        .update(updateData)
        .eq('flow_id', flowId)
        .select()
        .single();

    if (error) {
        // Check if error is about missing column (migration not run)
        if (error.message?.includes('selected_icp') || error.message?.includes('column')) {
            console.warn('⚠️ [Manifest Update] Column selected_icp may not exist. Run migration: 20251123000000_add_selected_icp_to_brand_manifests.sql');
            // Try again without selected_icp
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('brand_manifests')
                .update({ manifest: updated, updated_at: new Date().toISOString() })
                .eq('flow_id', flowId)
                .select()
                .single();
            if (fallbackError) throw fallbackError;
            return fallbackData.manifest as BrandManifest;
        }
        throw error;
    }

    console.log('✅ [Manifest Update] Successfully updated manifest and selected_icp column');

    // Sync ICP table if persona changed in market_shift
    if (action === 'market_shift' && updated.metadata?.sourceIcpId && updated.strategy?.persona) {
        await syncIcpTable(flowId, updated.metadata.sourceIcpId, updated.strategy.persona);
    }

    return data.manifest as BrandManifest;
}

// Sync ICP table when persona changes in market_shift
async function syncIcpTable(
    flowId: string,
    icpId: string | null | undefined,
    persona: BrandManifest['strategy']['persona']
): Promise<void> {
    if (!icpId || !persona) {
        console.log('⚠️ [ICP Sync] Skipping sync - missing icpId or persona', { hasIcpId: !!icpId, hasPersona: !!persona });
        return;
    }

    const supabase = await createClient();

    console.log('🔄 [ICP Sync] Syncing ICP table with persona changes', {
        icpId,
        flowId,
        personaName: persona.name,
        location: persona.location,
        country: persona.country
    });

    // Update positioning_icps table with new persona data
    const { error } = await supabase
        .from('positioning_icps')
        .update({
            persona_name: persona.name,
            persona_role: persona.role,
            persona_company: persona.company,
            location: persona.location,
            country: persona.country,
            pain_points: persona.painPoints || [],
            goals: persona.goals || [],
            updated_at: new Date().toISOString()
        })
        .eq('id', icpId)
        .eq('parent_flow', flowId);

    if (error) {
        console.warn('⚠️ [ICP Sync] Failed to sync ICP table:', error);
        // Don't throw - manifest update should still succeed even if ICP sync fails
    } else {
        console.log('✅ [ICP Sync] ICP table synced successfully with persona changes');
    }
}

function deepMerge(target: any, source: any): any {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceValue = source[key];
            const targetValue = target[key];

            // Special handling for colors - always replace arrays, never merge objects into arrays
            if (key === 'colors' && isObject(sourceValue) && isObject(targetValue)) {
                // Colors should always be arrays, so replace entirely
                output[key] = {
                    primary: Array.isArray(sourceValue.primary) ? sourceValue.primary : (targetValue.primary || []),
                    secondary: Array.isArray(sourceValue.secondary) ? sourceValue.secondary : (targetValue.secondary || []),
                    accent: Array.isArray(sourceValue.accent) ? sourceValue.accent : (targetValue.accent || []),
                    neutral: Array.isArray(sourceValue.neutral) ? sourceValue.neutral : (targetValue.neutral || []),
                };
            }
            // Arrays should be replaced, not merged
            else if (Array.isArray(sourceValue)) {
                output[key] = sourceValue;
            }
            // Objects should be merged recursively
            else if (isObject(sourceValue)) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: sourceValue });
                } else {
                    output[key] = deepMerge(targetValue, sourceValue);
                }
            }
            // Primitives should be replaced
            else {
                Object.assign(output, { [key]: sourceValue });
            }
        });
    }
    return output;
}

function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
