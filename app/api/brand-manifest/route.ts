import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBrandManifest, fetchBrandManifest, updateBrandManifest } from '@/lib/brand-manifest';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const flowId = searchParams.get('flowId');
    const icpId = searchParams.get('icpId') || '';

    if (!flowId) {
        return NextResponse.json({ error: 'Missing flowId' }, { status: 400 });
    }

    try {
        console.log('🔌 [Manifest] Connecting to Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 [Manifest] User:', user?.id);

        // 1. Try to fetch existing manifest
        let manifest = await fetchBrandManifest(flowId, icpId);

        // 2. If not found, try to migrate from legacy data
        if (!manifest) {
            console.log(`⚠️ [Manifest] Not found for flow ${flowId}. Attempting migration...`);

            // Use service role key to bypass RLS for migration if available
            let migrationSupabase = supabase;
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (serviceRoleKey) {
                console.log('🔐 [Manifest] Using service role for migration');
                const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
                migrationSupabase = createSupabaseClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    serviceRoleKey,
                    {
                        auth: {
                            autoRefreshToken: false,
                            persistSession: false
                        }
                    }
                ) as any;
            } else {
                console.warn('⚠️ [Manifest] Service role key not found, using user session');
            }

            // Fetch all necessary legacy data
            const [
                { data: flow, error: flowError },
                { data: designAssets, error: assetsError },
                { data: icp, error: icpError },
                { data: valueProp, error: vpError }
            ] = await Promise.all([
                migrationSupabase.from('positioning_flows').select('*').eq('id', flowId).single(),
                migrationSupabase.from('positioning_design_assets').select('*').eq('parent_flow', flowId).single(),
                // If icpId is not provided, we might need to find it from designAssets or flow
                // For now, let's try to find ANY icp for this flow if icpId is missing
                icpId
                    ? migrationSupabase.from('positioning_icps').select('*').eq('id', icpId).single()
                    : migrationSupabase.from('positioning_icps').select('*').eq('parent_flow', flowId).limit(1).single(),
                icpId
                    ? migrationSupabase.from('positioning_value_props').select('*').eq('icp_id', icpId).single()
                    : migrationSupabase.from('positioning_value_props').select('*').eq('parent_flow', flowId).limit(1).single()
            ]);

            if (flow && designAssets && icp) {
                console.log('✅ [Manifest] Found legacy data. Migrating...');

                // Construct workspaceData for the mapper
                const workspaceData = {
                    persona: icp,
                    valueProp: valueProp ? {
                        headline: valueProp.summary?.mainInsight, // Mapping summary to headline as fallback
                        subheadline: valueProp.summary?.approachStrategy,
                        problem: icp.pain_points?.join(', '),
                        solution: valueProp.summary?.approachStrategy,
                        outcome: valueProp.summary?.expectedImpact,
                        benefits: valueProp.variations?.map((v: any) => v.text) || [],
                        targetAudience: icp.title
                    } : {}
                };

                // Import mapper dynamically to avoid circular deps if any (though imports are clean)
                const { mapLegacyDataToManifest } = await import('@/lib/brand-manifest-utils');

                const newManifest = mapLegacyDataToManifest(flow, workspaceData, designAssets);

                // Save the new manifest
                // We need to use the same client (admin if available) to insert
                const { data, error } = await migrationSupabase
                    .from('brand_manifests')
                    .insert({
                        user_id: flow.user_id, // Ensure we assign to the flow owner
                        flow_id: flowId,
                        manifest: newManifest,
                        brand_key: newManifest.brandKey,
                        version: '1.0'
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('❌ [Manifest] Failed to save migrated manifest:', error);
                } else {
                    manifest = data.manifest;
                    console.log('✅ [Manifest] Migration successful');
                }
            } else {
                console.warn('❌ [Manifest] Legacy data incomplete. Cannot migrate.', {
                    hasFlow: !!flow,
                    flowError,
                    hasAssets: !!designAssets,
                    assetsError,
                    hasIcp: !!icp,
                    icpError
                });
            }
        }

        if (!manifest) {
            return NextResponse.json({ error: 'Manifest not found' }, { status: 404 });
        }

        return NextResponse.json({ manifest });
    } catch (error) {
        console.error('Error fetching manifest:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { flowId, manifest } = await req.json();

        if (!flowId || !manifest) {
            return NextResponse.json({ error: 'Missing flowId or manifest' }, { status: 400 });
        }

        // Check if manifest exists
        const existing = await fetchBrandManifest(flowId, '');

        let result;
        if (existing) {
            result = await updateBrandManifest(flowId, manifest, 'manual_update');
        } else {
            // For creation, we need icpId. If not provided in body, we might need to extract it or pass empty.
            // The current frontend sends the full manifest which includes metadata.sourceIcpId if generated correctly.
            const icpId = manifest.metadata?.sourceIcpId || '';
            result = await createBrandManifest(flowId, icpId, manifest);
        }

        return NextResponse.json({
            success: true,
            brandKey: result.brandKey,
            manifest: result
        });

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
