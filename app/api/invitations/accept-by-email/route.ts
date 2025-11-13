import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// This endpoint allows the inviter to manually accept an invitation
// by providing the invitation ID (useful for debugging/admin purposes)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invitationId, email } = await req.json();

    if (!invitationId && !email) {
      return NextResponse.json({ error: "Invitation ID or email is required" }, { status: 400 });
    }

    // Find the invitation
    let query = supabase
      .from("invitations")
      .select("*");

    if (invitationId) {
      query = query.eq("id", invitationId);
    } else if (email) {
      query = query.eq("email", email.toLowerCase()).eq("status", "pending");
    }

    const { data: invitations, error: fetchError } = await query
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError || !invitations || invitations.length === 0) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const invitation = invitations[0];

    // Verify the current user is the one who sent the invitation
    if (invitation.invited_by !== user.id) {
      return NextResponse.json({ error: "You can only accept invitations you sent" }, { status: 403 });
    }

    // Check if already accepted
    if (invitation.status === "accepted") {
      return NextResponse.json({ 
        success: true, 
        message: "Invitation already accepted",
        invitation 
      });
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ 
        error: "Invitation has expired" 
      }, { status: 400 });
    }

    // For manual acceptance by inviter, we need to check if the invitee has an account
    // and if so, mark it as accepted. But we can't easily check this without admin API.
    // So we'll just mark it as accepted if the inviter wants to manually accept it.
    // In practice, this should be done by the invitee, but this is for admin/debugging.

    // Actually, we shouldn't allow inviters to accept invitations - only invitees can.
    // This endpoint is just for checking status. Let me remove this functionality.

    return NextResponse.json({ 
      error: "Only the invitee can accept invitations. The invitation will be auto-accepted when they log in.",
      invitation 
    }, { status: 400 });

  } catch (error) {
    console.error("Error in accept-by-email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

