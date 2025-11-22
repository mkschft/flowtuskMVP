import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin endpoint to delete all brand manifests and trigger regeneration
 * This is needed after fixing the manifest structure
 */
export async function POST(req: NextRequest) {
    try {
        const { flowId } = await req.json();

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

        if (flowId) {
            // Delete specific flow's manifest
            const { error } = await supabase
                .from('brand_manifests')
                .delete()
                .eq('flow_id', flowId);

            if (error) {
                console.error('Error deleting manifest:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                message: `Deleted manifest for flow ${flowId}`
            });
        } else {
            // Delete all manifests (use with caution!)
            const { error, count } = await supabase
                .from('brand_manifests')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (error) {
                console.error('Error deleting manifests:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                message: `Deleted ${count} manifests`,
                count
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
