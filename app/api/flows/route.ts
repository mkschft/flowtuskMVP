import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const archived = searchParams.get("archived") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Build query
    let query = supabase
      .from("flows")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by archived status
    if (archived) {
      query = query.not("archived_at", "is", null);
    } else {
      query = query.is("archived_at", null);
    }

    const { data: flows, error, count } = await query;

    if (error) {
      console.error("Error fetching flows:", error);
      return NextResponse.json(
        { error: "Failed to fetch flows" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      flows: flows || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error in GET /api/flows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, website_url, facts_json, selected_icp, step } = body;

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create flow with initial metadata
    const { data: flow, error } = await supabase
      .from("flows")
      .insert({
        user_id: user.id,
        title: title || "New Flow",
        website_url: website_url || null,
        facts_json: facts_json || null,
        selected_icp: selected_icp || null,
        step: step || "initial",
        metadata: {
          prompt_regeneration_count: 0,
          dropoff_step: null,
          completion_time_ms: null,
          prompt_version: "v1",
          user_feedback: null,
        },
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A flow with this title already exists. Please choose a different title." },
          { status: 409 }
        );
      }

      console.error("Error creating flow:", error);
      return NextResponse.json(
        { error: "Failed to create flow" },
        { status: 500 }
      );
    }

    console.log("✅ Created flow:", flow.id);

    return NextResponse.json({ flow }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/flows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

