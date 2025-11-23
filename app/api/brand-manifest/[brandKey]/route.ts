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
        console.error('❌ [Brand Key API] Manifest not found:', brandKey, error);
        return NextResponse.json({ error: 'Manifest not found' }, { status: 404 });
    }

    console.log('✅ [Brand Key API] Manifest fetched successfully:', brandKey);

    const response = NextResponse.json({
        success: true,
        manifest: data.manifest,
        created_at: data.created_at
    });

    // CORS headers for Figma plugin (runs with origin: null)
    const origin = req.headers.get('origin') || 'null';
    response.headers.set('Access-Control-Allow-Origin', origin === 'null' ? '*' : origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'false');

    return response;
}

export async function OPTIONS(req: NextRequest) {
    const response = NextResponse.json({}, { status: 200 });

    // CORS headers for preflight
    const origin = req.headers.get('origin') || 'null';
    response.headers.set('Access-Control-Allow-Origin', origin === 'null' ? '*' : origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'false');

    return response;
}
