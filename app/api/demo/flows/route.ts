import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Demo mode API - allows guest users to create temporary flows
export async function POST(req: NextRequest) {
  try {
    // Check if demo mode is enabled
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    
    if (!isDemoMode) {
      return NextResponse.json(
        { error: "Demo mode is not enabled" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, website_url, facts_json, selected_icp, step } = body;

    const supabase = await createClient();

    // Create demo flow without user_id
    const { data: flow, error } = await supabase
      .from("positioning_flows")
      .insert({
        user_id: null, // Demo flows have no user_id
        title: title || "Demo Flow",
        website_url: website_url || null,
        facts_json: facts_json || null,
        selected_icp: selected_icp || null,
        step: step || "initial",
        metadata: {
          analysis: {
            dropoff_step: null,
            completion_time_ms: null,
            confidence_score: null,
          },
          generation: {
            prompt_version: "v1",
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
            is_demo: true,
            is_template: false,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
          },
        },
        schema_version: 1,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating demo flow:", error);
      return NextResponse.json(
        { error: "Failed to create demo flow" },
        { status: 500 }
      );
    }

    console.log("✅ Created demo flow:", flow.id);

    return NextResponse.json({ flow }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/demo/flows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Cleanup endpoint for expired demo flows (can be called by cron job)
export async function DELETE(req: NextRequest) {
  try {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    
    if (!isDemoMode) {
      return NextResponse.json(
        { error: "Demo mode is not enabled" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Delete demo flows older than 24 hours
    const { error } = await supabase
      .from("positioning_flows")
      .delete()
      .is("user_id", null)
      .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error("Error cleaning up demo flows:", error);
      return NextResponse.json(
        { error: "Failed to cleanup demo flows" },
        { status: 500 }
      );
    }

    console.log("🧹 Cleaned up expired demo flows");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/demo/flows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

