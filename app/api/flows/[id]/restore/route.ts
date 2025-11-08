import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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

    // Restore flow (set archived_at to null)
    const { data: flow, error } = await supabase
      .from("flows")
      .update({ archived_at: null })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error restoring flow:", error);
      return NextResponse.json(
        { error: "Failed to restore flow" },
        { status: 500 }
      );
    }

    console.log("♻️ Restored flow:", id);

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error in POST /api/flows/[id]/restore:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

