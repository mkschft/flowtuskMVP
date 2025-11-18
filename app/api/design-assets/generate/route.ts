import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GenerateDesignAssetRequest } from "@/lib/types/design-assets";
import {
  generateBrandGuide,
  generateStyleGuide,
  generateLandingPage,
} from "@/lib/generation/design-assets";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json() as GenerateDesignAssetRequest;
    const { icpId, flowId, tab } = body;

    if (!icpId || !flowId || !tab) {
      return NextResponse.json(
        { error: "icpId, flowId, and tab are required" },
        { status: 400 }
      );
    }

    if (!['brand', 'style', 'landing'].includes(tab)) {
      return NextResponse.json(
        { error: "tab must be 'brand', 'style', or 'landing'" },
        { status: 400 }
      );
    }

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Demo mode support
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    if (!user && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`🎨 [Design Assets Generate] Generating ${tab} for ICP ${icpId}`);

    // Fetch ICP data
    const { data: icp, error: icpError } = await supabase
      .from('positioning_icps')
      .select('*')
      .eq('id', icpId)
      .eq('parent_flow', flowId)
      .single();

    if (icpError || !icp) {
      console.error('❌ [Design Assets Generate] ICP not found:', icpError);
      return NextResponse.json(
        { error: "ICP not found" },
        { status: 404 }
      );
    }

    // Fetch value prop (optional but helpful)
    const { data: valueProp } = await supabase
      .from('positioning_value_props')
      .select('*')
      .eq('icp_id', icpId)
      .eq('parent_flow', flowId)
      .single();

    // Check if design assets row exists, create if not
    let { data: existingAssets } = await supabase
      .from('positioning_design_assets')
      .select('*')
      .eq('icp_id', icpId)
      .single();

    if (!existingAssets) {
      const { data: newAssets, error: insertError } = await supabase
        .from('positioning_design_assets')
        .insert({
          icp_id: icpId,
          parent_flow: flowId,
          generation_state: { brand: false, style: false, landing: false },
          generation_metadata: {},
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ [Design Assets Generate] Failed to create row:', insertError);
        return NextResponse.json(
          { error: "Failed to create design assets row" },
          { status: 500 }
        );
      }
      existingAssets = newAssets;
    }

    // Generate based on tab
    let updatePayload: Record<string, any> = {};
    const timestamp = new Date().toISOString();

    try {
      if (tab === 'brand') {
        console.log('🎨 [Design Assets Generate] Generating brand guide...');
        const brandGuide = await generateBrandGuide(icp, valueProp);
        updatePayload.brand_guide = brandGuide;
        updatePayload.generation_state = {
          ...existingAssets.generation_state,
          brand: true,
        };
        updatePayload.generation_metadata = {
          ...existingAssets.generation_metadata,
          models: { ...existingAssets.generation_metadata?.models, brand: 'gpt-4o' },
          timestamps: { ...existingAssets.generation_metadata?.timestamps, brand: timestamp },
        };
      } else if (tab === 'style') {
        // Style guide requires brand guide
        if (!existingAssets.brand_guide) {
          return NextResponse.json(
            { error: "Brand guide must be generated first" },
            { status: 400 }
          );
        }
        console.log('🎨 [Design Assets Generate] Generating style guide...');
        const styleGuide = await generateStyleGuide(existingAssets.brand_guide);
        updatePayload.style_guide = styleGuide;
        updatePayload.generation_state = {
          ...existingAssets.generation_state,
          style: true,
        };
        updatePayload.generation_metadata = {
          ...existingAssets.generation_metadata,
          models: { ...existingAssets.generation_metadata?.models, style: 'gpt-4o' },
          timestamps: { ...existingAssets.generation_metadata?.timestamps, style: timestamp },
        };
      } else if (tab === 'landing') {
        // Landing page requires brand guide
        if (!existingAssets.brand_guide) {
          return NextResponse.json(
            { error: "Brand guide must be generated first" },
            { status: 400 }
          );
        }
        console.log('🎨 [Design Assets Generate] Generating landing page...');
        const landingPage = await generateLandingPage(icp, valueProp, existingAssets.brand_guide);
        updatePayload.landing_page = landingPage;
        updatePayload.generation_state = {
          ...existingAssets.generation_state,
          landing: true,
        };
        updatePayload.generation_metadata = {
          ...existingAssets.generation_metadata,
          models: { ...existingAssets.generation_metadata?.models, landing: 'gpt-4o' },
          timestamps: { ...existingAssets.generation_metadata?.timestamps, landing: timestamp },
        };
      }
    } catch (genError) {
      console.error(`❌ [Design Assets Generate] Generation error for ${tab}:`, genError);
      return NextResponse.json(
        { error: `Failed to generate ${tab}`, details: genError instanceof Error ? genError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Update the design assets
    const { data: updatedAssets, error: updateError } = await supabase
      .from('positioning_design_assets')
      .update(updatePayload)
      .eq('id', existingAssets.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [Design Assets Generate] Update error:', updateError);
      return NextResponse.json(
        { error: "Failed to save generated assets" },
        { status: 500 }
      );
    }

    console.log(`✅ [Design Assets Generate] ${tab} generated successfully`);
    return NextResponse.json({ designAssets: updatedAssets });
  } catch (error) {
    console.error('❌ [Design Assets Generate] Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

