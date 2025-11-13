import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // Auto-accept any pending invitations for this user's email after email confirmation
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          // Find and accept pending invitation directly
          const { data: invitations } = await supabase
            .from("invitations")
            .select("*")
            .eq("email", user.email.toLowerCase())
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1);

          if (invitations && invitations.length > 0) {
            const invitation = invitations[0];
            // Check if not expired
            if (new Date(invitation.expires_at) >= new Date()) {
              await supabase
                .from("invitations")
                .update({
                  status: "accepted",
                  accepted_at: new Date().toISOString(),
                  accepted_by: user.id,
                })
                .eq("id", invitation.id);
            }
          }
        }
      } catch (acceptError) {
        // Don't fail email confirmation if auto-accept fails
        console.error("Error auto-accepting invitation after email confirmation:", acceptError);
      }

      // redirect user to specified redirect URL or root of app
      redirect(next);
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`);
}
