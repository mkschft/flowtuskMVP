import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { InvitationUpdate } from "@/lib/types/database";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find invitation by token using the function (bypasses RLS)
    const { data: invitationData, error: fetchError } = await supabase
      .rpc("get_invitation_by_token", { invite_token: token });

    const invitation = invitationData && Array.isArray(invitationData) && invitationData.length > 0 
      ? invitationData[0] 
      : null;

    if (fetchError || !invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 404 });
    }

    // Check if invitation is already accepted
    if (invitation.status === "accepted") {
      return NextResponse.json({ error: "Invitation has already been accepted" }, { status: 400 });
    }

    // Check if invitation is expired
    if (invitation.status === "expired" || new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    // Check if invitation is cancelled
    if (invitation.status === "cancelled") {
      return NextResponse.json({ error: "Invitation has been cancelled" }, { status: 400 });
    }

    // Verify email matches
    if (invitation.email.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json({ 
        error: "This invitation was sent to a different email address" 
      }, { status: 403 });
    }

    // Update invitation status
    const update: InvitationUpdate = {
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
    };

    const { error: updateError } = await supabase
      .from("invitations")
      .update(update)
      .eq("id", invitation.id);

    if (updateError) {
      console.error("Error accepting invitation:", updateError);
      return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
    });

  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

