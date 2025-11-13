import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("invitations")
      .select("*")
      .eq("invited_by", user.id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: invitations, error } = await query;

    if (error) {
      console.error("Error fetching invitations:", error);
      return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
    }

    return NextResponse.json({ invitations: invitations || [] });

  } catch (error) {
    console.error("Error listing invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

