import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find pending invitation for this user's email (case-insensitive)
    // Use ilike for case-insensitive matching
    const { data: invitations, error: fetchError } = await supabase
      .from("invitations")
      .select("*")
      .ilike("email", user.email.toLowerCase())
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error fetching invitations:", fetchError);
      return NextResponse.json({ 
        error: "Failed to fetch invitations",
        details: fetchError.message 
      }, { status: 500 });
    }

    if (!invitations || invitations.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No pending invitations found",
        accepted: false 
      });
    }

    const invitation = invitations[0];

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ 
        success: true, 
        message: "Invitation has expired",
        accepted: false 
      });
    }

    // Verify email matches (case-insensitive)
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      console.error("Email mismatch:", {
        invitationEmail: invitation.email,
        userEmail: user.email,
      });
      return NextResponse.json({ 
        error: "Email mismatch",
        accepted: false 
      }, { status: 403 });
    }

    // Accept the invitation using the SECURITY DEFINER function (bypasses RLS)
    const { data: acceptResult, error: functionError } = await supabase
      .rpc("accept_invitation_by_email", {
        invitee_email: user.email.toLowerCase(),
        invitee_user_id: user.id,
      });

    if (functionError) {
      console.error("Error accepting invitation via function:", functionError);
      
      // Fallback to direct update
      const { error: updateError } = await supabase
        .from("invitations")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
          accepted_by: user.id,
        })
        .eq("id", invitation.id)
        .eq("status", "pending");

      if (updateError) {
        console.error("Error accepting invitation (fallback):", updateError);
        return NextResponse.json({ 
          error: "Failed to accept invitation",
          details: updateError.message 
        }, { status: 500 });
      }
    } else if (acceptResult && acceptResult.length > 0 && !acceptResult[0].success) {
      return NextResponse.json({ 
        error: acceptResult[0].message || "Failed to accept invitation",
        accepted: false 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      accepted: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: "accepted",
      },
    });

  } catch (error) {
    console.error("Error auto-accepting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

