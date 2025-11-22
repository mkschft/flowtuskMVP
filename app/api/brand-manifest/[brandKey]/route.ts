import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ brandKey: string }> }
) {
    const { brandKey } = await params;

    if (!brandKey) {
        return NextResponse.json({ error: 'Missing brandKey' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch manifest by brandKey
    // This relies on the RLS policy allowing public read via brand_key
    const { data, error } = await supabase
        .from('brand_manifests')
        .select('manifest, created_at')
        .eq('brand_key', brandKey)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Manifest not found' }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        manifest: data.manifest,
        created_at: data.created_at
    });
}
