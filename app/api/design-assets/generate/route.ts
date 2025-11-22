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

    // Write to Brand Manifest (PRIMARY source of truth)
    try {
      const { fetchBrandManifest, createBrandManifest, updateBrandManifest } = await import('@/lib/brand-manifest');

      // We need flow data for the title
      const { data: flow } = await supabase.from('positioning_flows').select('title, id, user_id').eq('id', flowId).single();

      if (!flow) {
        console.error('❌ [Design Assets Generate] Flow not found');
        return NextResponse.json({ error: "Flow not found" }, { status: 404 });
      }

      // Fetch or create manifest
      let manifest = await fetchBrandManifest(flowId, icpId);

      if (!manifest) {
        console.log('✨ [Design Assets Generate] Creating new manifest');
        // Create initial manifest from ICP and value prop
        const initialManifest = {
          version: '1.0' as const,
          brandName: icp.persona_company || flow.title || 'Brand',
          brandKey: '', // Will be generated by createBrandManifest
          lastUpdated: timestamp,
          strategy: {
            persona: {
              name: icp.persona_name || '',
              role: icp.persona_role || '',
              company: icp.persona_company || '',
              industry: icp.industry || '',
              location: icp.location || '',
              country: icp.country || '',
              painPoints: icp.pain_points || [],
              goals: icp.goals || []
            },
            valueProp: valueProp ? {
              headline: valueProp.headline || valueProp.summary?.mainInsight || '',
              subheadline: valueProp.subheadline || valueProp.summary?.approachStrategy || '',
              problem: valueProp.problem || (Array.isArray(icp.pain_points) ? icp.pain_points.join(', ') : ''),
              solution: valueProp.solution || valueProp.summary?.approachStrategy || '',
              outcome: valueProp.outcome || valueProp.summary?.expectedImpact || '',
              benefits: valueProp.benefits || (Array.isArray(valueProp.variations) ? valueProp.variations.map((v: any) => v.text) : []),
              targetAudience: valueProp.targetAudience || icp.title || ''
            } : {
              headline: '', subheadline: '', problem: '', solution: '', outcome: '', benefits: [], targetAudience: ''
            }
          },
          identity: { colors: { primary: [], secondary: [], accent: [], neutral: [] }, typography: { heading: { family: 'Inter', weights: ['700'], sizes: {} }, body: { family: 'Inter', weights: ['400'], sizes: {} } }, logo: { variations: [] }, tone: { keywords: [], personality: [] } },
          components: { buttons: { primary: { style: 'solid', borderRadius: '8px', shadow: 'none' }, secondary: { style: 'outline', borderRadius: '8px', shadow: 'none' }, outline: { style: 'ghost', borderRadius: '8px', shadow: 'none' } }, cards: { style: 'flat', borderRadius: '12px', shadow: 'sm' }, inputs: { style: 'outlined', borderRadius: '8px', focusStyle: 'ring' }, spacing: { scale: {} } },
          previews: { landingPage: { hero: { headline: '', subheadline: '', cta: { primary: '', secondary: '' } }, features: [], socialProof: [], footer: { sections: [] } } },
          metadata: { generationHistory: [], regenerationCount: 0, sourceFlowId: flowId, sourceIcpId: icpId }
        };
        manifest = await createBrandManifest(flowId, icpId, initialManifest);
      }

      // Update manifest with generated assets
      const manifestUpdates: any = {};

      if (tab === 'brand' && updatePayload.brand_guide) {
        manifestUpdates.identity = {
          colors: updatePayload.brand_guide.colors || manifest.identity?.colors,
          typography: {
            heading: updatePayload.brand_guide.typography?.find((t: any) => t.category === 'heading') ? {
              family: updatePayload.brand_guide.typography.find((t: any) => t.category === 'heading').fontFamily,
              weights: ['700'],
              sizes: {}
            } : manifest.identity?.typography?.heading,
            body: updatePayload.brand_guide.typography?.find((t: any) => t.category === 'body') ? {
              family: updatePayload.brand_guide.typography.find((t: any) => t.category === 'body').fontFamily,
              weights: ['400'],
              sizes: {}
            } : manifest.identity?.typography?.body
          },
          logo: { variations: updatePayload.brand_guide.logoVariations || [] },
          tone: {
            keywords: updatePayload.brand_guide.toneOfVoice || [],
            personality: (updatePayload.brand_guide.personalityTraits || []).map((t: any) => ({
              trait: t.label || t.trait || '',
              value: t.value || 50,
              leftLabel: t.leftLabel || '',
              rightLabel: t.rightLabel || ''
            }))
          }
        };
      }

      if (tab === 'style' && updatePayload.style_guide) {
        manifestUpdates.components = {
          buttons: {
            primary: { style: updatePayload.style_guide.buttons?.[0]?.style || 'solid', borderRadius: updatePayload.style_guide.borderRadius || '8px', shadow: 'none' },
            secondary: { style: updatePayload.style_guide.buttons?.[1]?.style || 'outline', borderRadius: updatePayload.style_guide.borderRadius || '8px', shadow: 'none' },
            outline: { style: 'ghost', borderRadius: updatePayload.style_guide.borderRadius || '8px', shadow: 'none' }
          },
          cards: {
            style: updatePayload.style_guide.cards?.[0]?.style || 'flat',
            borderRadius: updatePayload.style_guide.borderRadius || '12px',
            shadow: updatePayload.style_guide.shadows?.[0] || 'sm'
          },
          inputs: manifest.components?.inputs || { style: 'outlined', borderRadius: '8px', focusStyle: 'ring' },
          spacing: { scale: {} }
        };
      }

      if (tab === 'landing' && updatePayload.landing_page) {
        manifestUpdates.previews = {
          landingPage: updatePayload.landing_page
        };
      }

      // Save to manifest
      const updatedManifest = await updateBrandManifest(flowId, manifestUpdates, `generated_${tab}`);
      console.log(`✅ [Design Assets Generate] ${tab} saved to brand manifest`);

      // Keep legacy table in sync for backward compatibility during migration
      const { data: updatedAssets, error: updateError } = await supabase
        .from('positioning_design_assets')
        .update(updatePayload)
        .eq('id', existingAssets.id)
        .select()
        .single();

      if (updateError) {
        console.warn('⚠️ [Design Assets Generate] Legacy table sync failed (non-critical):', updateError);
        // Don't fail the request - manifest is the source of truth now
      } else {
        console.log(`✅ [Design Assets Generate] Legacy table synced`);
      }

      // Return design assets in legacy format for compatibility
      return NextResponse.json({ designAssets: updatedAssets || existingAssets });

    } catch (manifestError) {
      console.error('❌ [Design Assets Generate] Manifest update failed:', manifestError);
      return NextResponse.json(
        { error: "Failed to save to brand manifest", details: manifestError instanceof Error ? manifestError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ [Design Assets Generate] Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

