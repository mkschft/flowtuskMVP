import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { landingPageId, name, email, company } = await req.json();

    if (!landingPageId || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        success: true,
        message: "Mock lead submission (Supabase not configured)",
      });
    }

    if (!supabaseAdmin) {
      throw new Error("Supabase not configured");
    }

    // Insert lead
    const { error: leadError } = await supabaseAdmin.from("leads").insert({
      landing_page_id: landingPageId,
      name,
      email,
      company,
    });

    if (leadError) throw leadError;

    // Update landing page stats
    const { data: page } = await supabaseAdmin
      .from("landing_pages")
      .select("views, leads")
      .eq("id", landingPageId)
      .single();

    if (page) {
      const newLeads = page.leads + 1;
      const conversionRate = page.views > 0 ? (newLeads / page.views) * 100 : 0;

      await supabaseAdmin
        .from("landing_pages")
        .update({
          leads: newLeads,
          conversion_rate: conversionRate,
        })
        .eq("id", landingPageId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting lead:", error);
    return NextResponse.json(
      { error: "Failed to submit lead" },
      { status: 500 }
    );
  }
}
