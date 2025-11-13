import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Use the RPC function to get invitation by token
    const { data: invitationData, error } = await supabase
      .rpc("get_invitation_by_token", { invite_token: token });

    const invitation = invitationData && Array.isArray(invitationData) && invitationData.length > 0 
      ? invitationData[0] 
      : null;

    if (error || !invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 404 });
    }

    // Check if invitation is expired or already accepted
    if (invitation.status === "accepted") {
      return NextResponse.json({ error: "Invitation has already been accepted" }, { status: 400 });
    }

    if (invitation.status === "expired" || new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    if (invitation.status === "cancelled") {
      return NextResponse.json({ error: "Invitation has been cancelled" }, { status: 400 });
    }

    // Return invitation data (email, etc.) without sensitive info
    return NextResponse.json({
      invitation: {
        email: invitation.email,
        expires_at: invitation.expires_at,
      },
    });

  } catch (error) {
    console.error("Error checking invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

