import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Demo mode support
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    if (!user && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const archived = searchParams.get('archived') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('positioning_flows')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user (or demo flows)
    if (user) {
      query = query.eq('user_id', user.id);
    } else if (isDemoMode) {
      query = query.is('user_id', null).eq('metadata->feature_flags->>is_demo', 'true');
    }

    // Filter by archived status
    if (archived) {
      query = query.not('archived_at', 'is', null);
    } else {
      query = query.is('archived_at', null);
    }

    const { data: flows, error } = await query;

    if (error) throw error;

    return NextResponse.json({ flows: flows || [] });
  } catch (error) {
    console.error("Error fetching flows:", error);
    return NextResponse.json(
      { error: "Failed to fetch flows" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Validate env early to avoid opaque failures
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      console.error('❌ [Flows API] Missing Supabase env (URL or ANON KEY)');
      return NextResponse.json(
        { error: 'Supabase is not configured on the server' },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const body = await req.json();
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.warn('⚠️ [Flows API] getUser error:', authError.message);
    }
    
    // Demo mode support
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    if (!user && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prepare flow data
    const flowData: any = {
      title: body.title || 'New Flow',
      website_url: body.website_url || null,
      website_analysis: body.facts_json || null, // map facts_json -> website_analysis (DB column)
      selected_icp: body.selected_icp || null,
      generated_content: body.generated_content || {},
      step: body.step || 'initial',
      metadata: {
        analysis: {
          dropoff_step: null,
          completion_time_ms: null,
          confidence_score: null,
        },
        generation: {
          prompt_version: 'v1',
          regeneration_count: 0,
          last_regeneration_at: null,
        },
        feedback: {
          user_rating: null,
          user_notes: null,
          liked_icps: [],
          disliked_icps: [],
        },
        feature_flags: {
          is_demo: isDemoMode && !user ? true : false,
          is_template: false,
        },
      },
    };

    // Validation: If website_analysis exists, website_url must also exist
    if (flowData.website_analysis && !flowData.website_url) {
      console.error('❌ [Flows API] Validation failed: website_url required when website_analysis provided');
      return NextResponse.json(
        { error: 'website_url is required when website_analysis (facts_json) is provided' },
        { status: 400 }
      );
    }

    // Add user_id if authenticated
    if (user) {
      flowData.user_id = user.id;
    }

    // Idempotency / dedupe: if recent active flow for same user + website exists, reuse
    const idempotencyKey = req.headers.get('Idempotency-Key') || body.idempotencyKey;
    if (idempotencyKey && (flowData.website_url || flowData.title)) {
      const { data: recent } = await supabase
        .from('positioning_flows')
        .select('*')
        .eq('website_url', flowData.website_url)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (recent) {
        const createdAt = new Date(recent.created_at).getTime();
        if (Date.now() - createdAt < 10 * 60 * 1000) {
          return NextResponse.json({ flow: recent }, { status: 200 });
        }
      }
    }

    // Insert flow
    const { data: flow, error } = await supabase
      .from('positioning_flows')
      .insert(flowData)
      .select()
      .single();

    if (error) {
      console.error('❌ [Flows API] Insert error:', { code: (error as any).code, message: error.message, details: (error as any).details, hint: (error as any).hint });
      // Handle unique constraint violation -> return existing active flow instead of 409
      if ((error as any).code === '23505') {
        let existingQuery = supabase
          .from('positioning_flows')
          .select('*')
          .eq('title', flowData.title)
          .is('archived_at', null)
          .order('created_at', { ascending: false })
          .limit(1);
        if (flowData.website_url) existingQuery = existingQuery.eq('website_url', flowData.website_url);
        if (user) existingQuery = existingQuery.eq('user_id', user.id); else existingQuery = existingQuery.is('user_id', null);
        const { data: existing } = await existingQuery.maybeSingle();
        if (existing) {
          return NextResponse.json({ flow: existing }, { status: 200 });
        }
        // Fallback if not found
        return NextResponse.json(
          { error: "A flow with this title already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create flow', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ flow }, { status: 201 });
  } catch (error: any) {
    console.error('❌ [Flows API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to create flow', details: error?.message },
      { status: 500 }
    );
  }
}
