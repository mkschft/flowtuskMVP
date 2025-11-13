import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { InvitationInsert } from "@/lib/types/database";
import { randomBytes } from "crypto";
import { sendInvitationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Note: We can't check if user exists without admin API
    // This check would require Supabase Admin API or a separate check
    // For now, we'll let the invitation be created and handle it during acceptance

    // Check if there's already a pending invitation for this email
    const { data: existingInvitation } = await supabase
      .from("invitations")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("status", "pending")
      .single();

    if (existingInvitation) {
      return NextResponse.json({ 
        error: "An invitation has already been sent to this email",
        invitation: existingInvitation 
      }, { status: 400 });
    }

    // Generate unique token
    const token = randomBytes(32).toString("hex");

    // Create invitation
    const invitation: InvitationInsert = {
      email: email.toLowerCase(),
      token,
      invited_by: user.id,
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    const { data: newInvitation, error: insertError } = await supabase
      .from("invitations")
      .insert(invitation)
      .select()
      .single();

    if (insertError) {
      console.error("Error creating invitation:", insertError);
      return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
    }

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/auth/accept-invite?token=${token}`;
    
    try {
      // Get inviter's name for personalization
      const { data: inviterData } = await supabase.auth.getUser();
      const inviterName = inviterData?.user?.user_metadata?.name || 
                         inviterData?.user?.user_metadata?.full_name || 
                         inviterData?.user?.email?.split("@")[0] || 
                         "a team member";

      await sendInvitationEmail({
        to: email.toLowerCase(),
        inviteUrl,
        inviterName,
      });
    } catch (emailError) {
      console.error("Error sending invitation email:", emailError);
      // Don't fail the request if email fails - invitation is still created
      // You might want to log this for retry later
      return NextResponse.json({
        success: true,
        invitation: newInvitation,
        warning: "Invitation created but email failed to send. Please check your email configuration.",
      });
    }

    return NextResponse.json({
      success: true,
      invitation: newInvitation,
    });

  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

