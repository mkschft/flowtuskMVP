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
    const supabase = await createClient();
    const body = await req.json();
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Demo mode support
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    if (!user && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prepare flow data
    const flowData: any = {
      title: body.title || 'New Flow',
      website_url: body.website_url || null,
      facts_json: body.facts_json || null,
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
      schema_version: 1,
    };

    // Add user_id if authenticated
    if (user) {
      flowData.user_id = user.id;
    }

    // Insert flow
    const { data: flow, error } = await supabase
      .from('positioning_flows')
      .insert(flowData)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: "A flow with this title already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ flow }, { status: 201 });
  } catch (error) {
    console.error("Error creating flow:", error);
    return NextResponse.json(
      { error: "Failed to create flow" },
      { status: 500 }
    );
  }
}
