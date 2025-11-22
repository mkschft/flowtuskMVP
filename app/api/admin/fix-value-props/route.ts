import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin endpoint to check and fix missing value prop data
 * Backfills flat fields from JSONB if they exist, or triggers regeneration
 */
export async function POST(req: NextRequest) {
    try {
        const { flowId, icpId } = await req.json();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        console.log('🔍 [Fix Value Props] Checking for flow:', flowId);

        // Get the ICP
        const { data: icp, error: icpError } = await supabase
            .from('positioning_icps')
            .select('*')
            .eq('parent_flow', flowId)
            .limit(1)
            .single();

        if (icpError || !icp) {
            console.error('❌ [Fix Value Props] No ICP found for flow:', flowId);
            return NextResponse.json({
                error: 'No ICP found for this flow',
                details: icpError
            }, { status: 404 });
        }

        console.log('✅ [Fix Value Props] Found ICP:', icp.id, icp.title);

        // Get the value prop
        const { data: valueProp, error: vpError } = await supabase
            .from('positioning_value_props')
            .select('*')
            .eq('icp_id', icp.id)
            .single();

        if (vpError || !valueProp) {
            console.log('⚠️ [Fix Value Props] No value prop found, needs generation');
            return NextResponse.json({
                success: false,
                message: 'Value prop needs to be generated',
                icp: { id: icp.id, title: icp.title }
            });
        }

        console.log('📊 [Fix Value Props] Value prop exists, checking fields...');

        // Check if flat fields are empty but JSONB has data
        const hasEmptyFlat = !valueProp.headline && !valueProp.problem;
        const hasJsonbData = valueProp.summary || valueProp.variations;

        if (hasEmptyFlat && hasJsonbData) {
            console.log('🔄 [Fix Value Props] Backfilling flat fields from JSONB...');

            // Extract from JSONB
            const headline = valueProp.summary?.mainInsight || valueProp.variations?.[0]?.text || '';
            const subheadline = valueProp.summary?.approachStrategy || '';
            const problem = Array.isArray(valueProp.summary?.painPointsAddressed)
                ? valueProp.summary.painPointsAddressed.join(', ')
                : (Array.isArray(icp.pain_points) ? icp.pain_points.join(', ') : '');
            const solution = valueProp.summary?.approachStrategy || '';
            const outcome = valueProp.summary?.expectedImpact || '';
            const targetAudience = icp.title || '';
            const benefits = Array.isArray(valueProp.variations)
                ? valueProp.variations.map((v: any) => v.text)
                : [];

            // Update the record
            const { error: updateError } = await supabase
                .from('positioning_value_props')
                .update({
                    headline,
                    subheadline,
                    problem,
                    solution,
                    outcome,
                    target_audience: targetAudience,
                    benefits
                })
                .eq('id', valueProp.id);

            if (updateError) {
                console.error('❌ [Fix Value Props] Update failed:', updateError);
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }

            console.log('✅ [Fix Value Props] Backfilled successfully');
            return NextResponse.json({
                success: true,
                message: 'Backfilled flat fields from JSONB data',
                data: { headline, problem, solution, outcome, benefits: benefits.length }
            });
        }

        if (hasEmptyFlat && !hasJsonbData) {
            console.log('⚠️ [Fix Value Props] Both flat and JSONB fields are empty');
            return NextResponse.json({
                success: false,
                message: 'Value prop exists but has no data - needs regeneration',
                icp: { id: icp.id, title: icp.title }
            });
        }

        console.log('✅ [Fix Value Props] Value prop has data');
        return NextResponse.json({
            success: true,
            message: 'Value prop already has data',
            data: {
                headline: valueProp.headline,
                problem: valueProp.problem,
                hasData: true
            }
        });

    } catch (error) {
        console.error('❌ [Fix Value Props] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
