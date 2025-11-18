import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/workspace?icpId=...&flowId=...
// Returns a consolidated workspace payload: { icp, valueProp, designAssets }
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const icpId = searchParams.get("icpId");
    const flowId = searchParams.get("flowId");

    if (!icpId || !flowId) {
      return NextResponse.json({ error: "icpId and flowId are required" }, { status: 400 });
    }

    // Auth or demo mode
    const { data: { user } } = await supabase.auth.getUser();
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    if (!user && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch ICP
    const { data: icp, error: icpErr } = await supabase
      .from('positioning_icps')
      .select('*')
      .eq('id', icpId)
      .eq('parent_flow', flowId)
      .single();

    if (icpErr) {
      return NextResponse.json({ error: "ICP not found", details: icpErr.message }, { status: 404 });
    }

    // Fetch Value Prop (single per ICP by constraint)
    const { data: valueProp } = await supabase
      .from('positioning_value_props')
      .select('*')
      .eq('icp_id', icpId)
      .eq('parent_flow', flowId)
      .maybeSingle();

    // Fetch Design Assets (single per ICP by constraint)
    const { data: designAssets } = await supabase
      .from('positioning_design_assets')
      .select('*')
      .eq('icp_id', icpId)
      .eq('parent_flow', flowId)
      .maybeSingle();

    return NextResponse.json({ icp, valueProp, designAssets });
  } catch (error: any) {
    console.error('❌ [Workspace API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}