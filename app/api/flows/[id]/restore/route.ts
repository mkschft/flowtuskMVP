import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Restore flow (set archived_at to null)
    const { data: flow, error } = await supabase
      .from('positioning_flows')
      .update({ archived_at: null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Flow not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error restoring flow:", error);
    return NextResponse.json(
      { error: "Failed to restore flow" },
      { status: 500 }
    );
  }
}
