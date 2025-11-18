import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const flowId = searchParams.get("flowId");

    if (!id || !flowId) {
      return NextResponse.json(
        { error: "id and flowId are required" },
        { status: 400 }
      );
    }

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Demo mode support
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    if (!user && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch ICP (RLS will handle authorization)
    const { data: icp, error } = await supabase
      .from('positioning_icps')
      .select('*')
      .eq('id', id)
      .eq('parent_flow', flowId)
      .single();

    if (error) {
      console.error('❌ [Positioning ICPs API] Error fetching ICP:', error);
      return NextResponse.json(
        { error: "ICP not found", details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ icp });
  } catch (error) {
    console.error('❌ [Positioning ICPs API] Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { icps, flowId, websiteUrl } = await req.json();

    if (!icps || !Array.isArray(icps) || !flowId) {
      return NextResponse.json(
        { error: "icps (array) and flowId are required" },
        { status: 400 }
      );
    }

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Demo mode support
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    if (!user && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('💾 [Positioning ICPs API] Attempting to save', icps.length, 'ICPs');
    console.log('📝 [Positioning ICPs API] flowId:', flowId);
    console.log('👤 [Positioning ICPs API] user:', user?.id || 'NULL (demo mode)');
    console.log('🎯 [Positioning ICPs API] isDemoMode:', isDemoMode);

    // Verify parent flow exists
    const { data: flow, error: flowError } = await supabase
      .from('positioning_flows')
      .select('id, user_id')
      .eq('id', flowId)
      .single();
    
    if (flowError || !flow) {
      console.error('❌ [Positioning ICPs API] Parent flow not found:', flowError?.message || 'No flow');
      return NextResponse.json(
        { error: "Parent flow not found", details: flowError?.message || 'Flow does not exist' },
        { status: 404 }
      );
    }
    
    console.log('✅ [Positioning ICPs API] Parent flow found:', flow.id, 'user_id:', flow.user_id || 'NULL');

    // Map ICPs to database format
    const icpsToInsert = icps.map((icp: any) => ({
      parent_flow: flowId,
      website_url: websiteUrl || null,
      persona_name: icp.personaName,
      persona_role: icp.personaRole,
      persona_company: icp.personaCompany,
      location: icp.location,
      country: icp.country,
      title: icp.title,
      description: icp.description,
      pain_points: icp.painPoints || [],
      goals: icp.goals || [],
      fit_score: 90,
      profiles_found: 12,
    }));

    console.log('📦 [Positioning ICPs API] Prepared', icpsToInsert.length, 'ICPs for insert');

    // Insert ICPs (RLS will handle authorization)
    const { data: insertedIcps, error } = await supabase
      .from('positioning_icps')
      .insert(icpsToInsert)
      .select();

    if (error) {
      console.error('❌ [Positioning ICPs API] Error inserting ICPs:', error);
      return NextResponse.json(
        { error: "Failed to save ICPs", details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [Positioning ICPs API] Saved', insertedIcps?.length || 0, 'ICPs to database');

    return NextResponse.json({ icps: insertedIcps });
  } catch (error) {
    console.error('❌ [Positioning ICPs API] Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

