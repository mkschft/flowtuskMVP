import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/brand-manifest/history?flowId=xxx
 * Retrieve manifest history for a flow
 */
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const flowId = searchParams.get('flowId');

    if (!flowId) {
        return NextResponse.json({ error: 'Missing flowId' }, { status: 400 });
    }

    try {
        const supabase = await createClient();

        // Fetch manifest history from database
        const { data: historyData, error } = await supabase
            .from('brand_manifest_history')
            .select('*')
            .eq('flow_id', flowId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('❌ [History API] Error fetching history:', error);
            return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
        }

        // Transform database records to history entries
        const history = historyData?.map(record => ({
            id: record.id,
            manifest: record.manifest,
            timestamp: record.created_at,
            action: record.action,
            description: record.description
        })) || [];

        return NextResponse.json({
            history,
            currentIndex: history.length - 1 // Latest is current
        });

    } catch (error) {
        console.error('❌ [History API] Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/brand-manifest/history
 * Add a new entry to manifest history
 */
export async function POST(req: NextRequest) {
    try {
        const { flowId, manifest, action, description } = await req.json();

        if (!flowId || !manifest || !action) {
            return NextResponse.json(
                { error: 'Missing required fields: flowId, manifest, action' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Insert new history entry
        const { data, error } = await supabase
            .from('brand_manifest_history')
            .insert({
                flow_id: flowId,
                manifest,
                action,
                description: description || null,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('❌ [History API] Error saving history:', error);
            return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
        }

        console.log(`✅ [History API] Saved history entry: ${action}`);

        return NextResponse.json({
            success: true,
            entry: {
                id: data.id,
                manifest: data.manifest,
                timestamp: data.created_at,
                action: data.action,
                description: data.description
            }
        });

    } catch (error) {
        console.error('❌ [History API] Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/brand-manifest/history?flowId=xxx
 * Clear all history for a flow
 */
export async function DELETE(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const flowId = searchParams.get('flowId');

    if (!flowId) {
        return NextResponse.json({ error: 'Missing flowId' }, { status: 400 });
    }

    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('brand_manifest_history')
            .delete()
            .eq('flow_id', flowId);

        if (error) {
            console.error('❌ [History API] Error clearing history:', error);
            return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
        }

        console.log(`🗑️ [History API] Cleared history for flow: ${flowId}`);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('❌ [History API] Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
