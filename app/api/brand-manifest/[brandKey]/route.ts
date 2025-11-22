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

    const response = NextResponse.json({
        success: true,
        manifest: data.manifest,
        created_at: data.created_at
    });

    // Allow CORS for Figma plugin
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
}

export async function OPTIONS() {
    const response = NextResponse.json({}, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}
