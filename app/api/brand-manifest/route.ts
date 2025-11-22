import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateBrandKey } from '@/lib/brand-manifest';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { flowId, manifest } = await req.json();

        if (!flowId || !manifest) {
            return NextResponse.json({ error: 'Missing flowId or manifest' }, { status: 400 });
        }

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate a unique brand key
        const brandKey = generateBrandKey();

        // Upsert the manifest
        // Note: In a real scenario, we might want to check if a manifest already exists for this flow
        // and update it, keeping the same brandKey if possible.
        // For now, we'll try to find existing one first.

        const { data: existing } = await supabase
            .from('brand_manifests')
            .select('brand_key')
            .eq('flow_id', flowId)
            .single();

        const finalBrandKey = existing?.brand_key || brandKey;

        const { data, error } = await supabase
            .from('brand_manifests')
            .upsert({
                user_id: user.id,
                flow_id: flowId,
                manifest,
                brand_key: finalBrandKey,
                updated_at: new Date().toISOString()
            }, { onConflict: 'flow_id' })
            .select()
            .single();

        if (error) {
            console.error('Error saving manifest:', error);
            return NextResponse.json({ error: 'Failed to save manifest' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            brandKey: finalBrandKey,
            manifestId: data.id
        });

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
