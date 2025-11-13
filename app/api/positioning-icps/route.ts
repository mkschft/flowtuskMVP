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

