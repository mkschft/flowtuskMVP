import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Demo mode support
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    if (!user && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build query
    let query = supabase
      .from('positioning_flows')
      .select('*')
      .eq('id', id)
      .single();

    const { data: flow, error } = await query;

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Flow not found" }, { status: 404 });
      }
      throw error;
    }

    // Verify ownership (RLS should handle this, but double-check)
    if (user && flow.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error fetching flow:", error);
    return NextResponse.json(
      { error: "Failed to fetch flow" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await req.json();
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Demo mode support
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    if (!user && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current flow to merge metadata
    const { data: currentFlow } = await supabase
      .from('positioning_flows')
      .select('metadata, step')
      .eq('id', id)
      .single();

    // Prepare update data
    const updateData: any = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.website_url !== undefined) updateData.website_url = body.website_url;
    if (body.facts_json !== undefined) updateData.facts_json = body.facts_json;
    if (body.selected_icp !== undefined) updateData.selected_icp = body.selected_icp;
    if (body.generated_content !== undefined) updateData.generated_content = body.generated_content;
    if (body.step !== undefined) {
      updateData.step = body.step;
      
      // Mark as completed if reaching final step
      if (body.step === 'completed' || body.step === 'exported') {
        updateData.completed_at = new Date().toISOString();
      }
    }

    // Merge metadata with nested structure
    if (body.metadata || currentFlow) {
      const existingMetadata = currentFlow?.metadata || {};
      const newMetadata = body.metadata || {};
      
      // Handle both old flat structure and new nested structure defensively
      const existingAnalysis = existingMetadata.analysis || {};
      const existingGeneration = existingMetadata.generation || {};
      const existingFeedback = existingMetadata.feedback || {};
      const existingFeatureFlags = existingMetadata.feature_flags || {};
      
      updateData.metadata = {
        analysis: {
          dropoff_step: (currentFlow && body.step && body.step !== currentFlow.step && !updateData.completed_at) 
            ? body.step 
            : existingAnalysis?.dropoff_step || null,
          completion_time_ms: existingAnalysis?.completion_time_ms || null,
          confidence_score: existingAnalysis?.confidence_score || null,
          ...(newMetadata.analysis || {}),
        },
        generation: {
          prompt_version: existingGeneration?.prompt_version || 'v1',
          regeneration_count: body.regenerated 
            ? (existingGeneration?.regeneration_count || 0) + 1 
            : existingGeneration?.regeneration_count || 0,
          last_regeneration_at: body.regenerated ? new Date().toISOString() : existingGeneration?.last_regeneration_at || null,
          ...(newMetadata.generation || {}),
        },
        feedback: {
          user_rating: existingFeedback?.user_rating || null,
          user_notes: existingFeedback?.user_notes || null,
          liked_icps: existingFeedback?.liked_icps || [],
          disliked_icps: existingFeedback?.disliked_icps || [],
          ...(newMetadata.feedback || {}),
        },
        feature_flags: {
          is_demo: existingFeatureFlags?.is_demo || false,
          is_template: existingFeatureFlags?.is_template || false,
          ...(newMetadata.feature_flags || {}),
        },
      };
    }

    // Update flow
    const { data: flow, error } = await supabase
      .from('positioning_flows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Flow not found" }, { status: 404 });
      }
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: "A flow with this title already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error updating flow:", error);
    console.error("Update data size:", JSON.stringify(updateData).length, "bytes");
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Failed to update flow", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get('hard') === 'true';
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (hardDelete) {
      // Hard delete (permanent) - admin only or for demo cleanup
      const { error } = await supabase
        .from('positioning_flows')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } else {
      // Soft delete (set archived_at)
      const { error } = await supabase
        .from('positioning_flows')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting flow:", error);
    return NextResponse.json(
      { error: "Failed to delete flow" },
      { status: 500 }
    );
  }
}
