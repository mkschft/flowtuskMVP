import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { websiteUrl, icp, landingPage } = await req.json();

    if (!websiteUrl || !icp || !landingPage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Return mock response if Supabase not configured
      const mockSlug = `${nanoid(8)}`;
      return NextResponse.json({
        success: true,
        slug: mockSlug,
        url: `/p/${mockSlug}`,
        message: "Mock publish (Supabase not configured)",
      });
    }

    const slug = nanoid(8);

    if (!supabaseAdmin) {
      throw new Error("Supabase not configured");
    }

    const { data, error } = await supabaseAdmin
      .from("landing_pages")
      .insert({
        slug,
        website_url: websiteUrl,
        icp_title: icp.title,
        icp_data: icp,
        landing_page_data: landingPage,
        views: 0,
        leads: 0,
        conversion_rate: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      slug,
      url: `/p/${slug}`,
      data,
    });
  } catch (error) {
    console.error("Error publishing page:", error);
    return NextResponse.json(
      { error: "Failed to publish page" },
      { status: 500 }
    );
  }
}
