import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const icpId = searchParams.get("icpId");
    const flowId = searchParams.get("flowId");

    if (!icpId || !flowId) {
      return NextResponse.json(
        { error: "icpId and flowId are required" },
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

    // Fetch design assets (RLS will handle authorization)
    const { data: designAssets, error } = await supabase
      .from('positioning_design_assets')
      .select('*')
      .eq('icp_id', icpId)
      .eq('parent_flow', flowId)
      .single();

    if (error) {
      // Not found is okay - design assets might not be generated yet
      if (error.code === 'PGRST116') {
        return NextResponse.json({ designAssets: null });
      }
      console.error('❌ [Design Assets API] Error fetching design assets:', error);
      return NextResponse.json(
        { error: "Failed to fetch design assets", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ designAssets });
  } catch (error) {
    console.error('❌ [Design Assets API] Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

