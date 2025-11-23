import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mapLegacyDataToManifest } from '@/lib/brand-manifest-utils';
import { createBrandManifest, fetchBrandManifest } from '@/lib/brand-manifest';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { flowId } = await req.json();

        if (!flowId) {
            return NextResponse.json({ error: 'Missing flowId' }, { status: 400 });
        }

        // Check authentication (Admin only ideally, but for now user check)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if manifest already exists
        const existing = await fetchBrandManifest(flowId, '');
        if (existing) {
            return NextResponse.json({ message: 'Manifest already exists', manifest: existing });
        }

        // Fetch legacy data
        // 1. Flow
        const { data: flow } = await supabase.from('positioning_flows').select('*').eq('id', flowId).single();
        if (!flow) return NextResponse.json({ error: 'Flow not found' }, { status: 404 });

        // 2. ICP (Persona)
        const { data: icp } = await supabase.from('positioning_icps').select('*').eq('parent_flow', flowId).single();

        // 3. Value Prop
        const { data: valueProp } = await supabase.from('positioning_value_props').select('*').eq('parent_flow', flowId).single();

        // 4. Design Assets
        const { data: designAssets } = await supabase.from('positioning_design_assets').select('*').eq('parent_flow', flowId).single();

        if (!icp || !designAssets) {
            return NextResponse.json({ error: 'Missing legacy data (ICP or Design Assets)' }, { status: 404 });
        }

        // Construct workspaceData object expected by mapper
        const workspaceData = {
            persona: {
                id: icp.id,
                persona_name: icp.persona_name,
                persona_role: icp.persona_role,
                persona_company: icp.persona_company,
                industry: icp.title, // Mapping title to industry
                location: icp.location,
                country: icp.country,
                pain_points: icp.pain_points,
                goals: icp.goals
            },
            valueProp: valueProp ? {
                headline: valueProp.summary?.mainInsight || '',
                subheadline: valueProp.summary?.approachStrategy || '',
                problem: icp.pain_points?.[0] || '',
                solution: valueProp.summary?.approachStrategy || '',
                outcome: valueProp.summary?.expectedImpact || '',
                benefits: valueProp.variations?.map((v: any) => v.text) || [],
                targetAudience: icp.title
            } : null
        };

        // Map to Manifest
        const manifestData = mapLegacyDataToManifest(flow, workspaceData, designAssets);

        // Create Manifest in DB
        const newManifest = await createBrandManifest(flowId, icp.id, manifestData);

        return NextResponse.json({ success: true, manifest: newManifest });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
