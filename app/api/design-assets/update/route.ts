import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UpdateDesignAssetRequest } from "@/lib/types/design-assets";

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json() as UpdateDesignAssetRequest;
    const { designAssetId, updates } = body;

    if (!designAssetId || !updates) {
      return NextResponse.json(
        { error: "designAssetId and updates are required" },
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

    // Prepare update payload
    const updatePayload: Record<string, any> = {};
    
    if (updates.brandGuide) {
      // Fetch existing to merge
      const { data: existing } = await supabase
        .from('positioning_design_assets')
        .select('brand_guide')
        .eq('id', designAssetId)
        .single();
      
      updatePayload.brand_guide = {
        ...existing?.brand_guide || {},
        ...updates.brandGuide,
      };
    }
    
    if (updates.styleGuide) {
      const { data: existing } = await supabase
        .from('positioning_design_assets')
        .select('style_guide')
        .eq('id', designAssetId)
        .single();
      
      updatePayload.style_guide = {
        ...existing?.style_guide || {},
        ...updates.styleGuide,
      };
    }
    
    if (updates.landingPage) {
      const { data: existing } = await supabase
        .from('positioning_design_assets')
        .select('landing_page')
        .eq('id', designAssetId)
        .single();
      
      updatePayload.landing_page = {
        ...existing?.landing_page || {},
        ...updates.landingPage,
      };
    }

    // Update generation metadata
    const { data: metadataQuery } = await supabase
      .from('positioning_design_assets')
      .select('generation_metadata')
      .eq('id', designAssetId)
      .single();
    
    const currentMetadata = metadataQuery?.generation_metadata || {};
    updatePayload.generation_metadata = {
      ...currentMetadata,
      chat_updates_count: (currentMetadata.chat_updates_count || 0) + 1,
      last_updated_at: new Date().toISOString(),
    };

    // Update design assets (RLS will handle authorization)
    const { data: updatedAssets, error } = await supabase
      .from('positioning_design_assets')
      .update(updatePayload)
      .eq('id', designAssetId)
      .select()
      .single();

    if (error) {
      console.error('❌ [Design Assets Update API] Error updating:', error);
      return NextResponse.json(
        { error: "Failed to update design assets", details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [Design Assets Update API] Updated successfully');
    return NextResponse.json({ designAssets: updatedAssets });
  } catch (error) {
    console.error('❌ [Design Assets Update API] Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

