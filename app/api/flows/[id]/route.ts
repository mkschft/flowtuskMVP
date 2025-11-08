import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: flow, error } = await supabase
      .from("flows")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Flow not found" },
          { status: 404 }
        );
      }

      console.error("Error fetching flow:", error);
      return NextResponse.json(
        { error: "Failed to fetch flow" },
        { status: 500 }
      );
    }

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error in GET /api/flows/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, website_url, facts_json, selected_icp, generated_content, step, metadata } = body;

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First, get the current flow to merge metadata
    const { data: currentFlow, error: fetchError } = await supabase
      .from("flows")
      .select("metadata, step")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching current flow:", fetchError);
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    // Merge metadata to preserve analytics
    const updatedMetadata = {
      ...currentFlow.metadata,
      ...metadata,
    };

    // Track prompt regeneration if generated_content is being updated
    if (generated_content && currentFlow.generated_content) {
      updatedMetadata.prompt_regeneration_count = 
        (currentFlow.metadata?.prompt_regeneration_count || 0) + 1;
    }

    // Prepare update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title;
    if (website_url !== undefined) updates.website_url = website_url;
    if (facts_json !== undefined) updates.facts_json = facts_json;
    if (selected_icp !== undefined) updates.selected_icp = selected_icp;
    if (generated_content !== undefined) updates.generated_content = generated_content;
    if (step !== undefined) {
      updates.step = step;
      // Track dropoff if step changed
      if (step !== currentFlow.step) {
        updatedMetadata.dropoff_step = currentFlow.step;
      }
      // Mark as completed if final step
      if (step === 'completed' || step === 'exported') {
        updates.completed_at = new Date().toISOString();
      }
    }
    if (metadata !== undefined) updates.metadata = updatedMetadata;

    // Update flow
    const { data: flow, error } = await supabase
      .from("flows")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
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

      console.error("Error updating flow:", error);
      return NextResponse.json(
        { error: "Failed to update flow" },
        { status: 500 }
      );
    }

    console.log("✅ Updated flow:", flow.id);

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error in PATCH /api/flows/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const hard = searchParams.get("hard") === "true";

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (hard) {
      // Hard delete (permanent)
      const { error } = await supabase
        .from("flows")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting flow:", error);
        return NextResponse.json(
          { error: "Failed to delete flow" },
          { status: 500 }
        );
      }

      console.log("🗑️ Hard deleted flow:", id);
    } else {
      // Soft delete (set archived_at)
      const { error } = await supabase
        .from("flows")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error archiving flow:", error);
        return NextResponse.json(
          { error: "Failed to archive flow" },
          { status: 500 }
        );
      }

      console.log("📦 Soft deleted (archived) flow:", id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/flows/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

