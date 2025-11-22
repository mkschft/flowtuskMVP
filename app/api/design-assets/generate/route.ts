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

    console.log(`🎨 [Design Assets Generate] Generating ${tab} for flow ${flowId}`);

    // Fetch brand manifest (single source of truth)
    const { fetchBrandManifest, createBrandManifest } = await import('@/lib/brand-manifest');
    let manifest = await fetchBrandManifest(flowId, icpId);

    if (!manifest) {
      console.error('❌ [Design Assets Generate] Manifest not found');
      return NextResponse.json(
        { error: "Brand manifest not found. Please create ICPs first." },
        { status: 404 }
      );
    }

    // Extract ICP and value prop from manifest for generation
    const icp = {
      persona_name: manifest.strategy?.persona?.name || '',
      persona_role: manifest.strategy?.persona?.role || '',
      persona_company: manifest.strategy?.persona?.company || '',
      industry: manifest.strategy?.persona?.industry || '',
      location: manifest.strategy?.persona?.location || '',
      country: manifest.strategy?.persona?.country || '',
      pain_points: manifest.strategy?.persona?.painPoints || [],
      goals: manifest.strategy?.persona?.goals || [],
      title: `${manifest.strategy?.persona?.role || 'User'} at ${manifest.strategy?.persona?.company || 'Company'}`
    };

    const valueProp = manifest.strategy?.valueProp ? {
      headline: manifest.strategy.valueProp.headline,
      subheadline: manifest.strategy.valueProp.subheadline,
      problem: manifest.strategy.valueProp.problem,
      solution: manifest.strategy.valueProp.solution,
      outcome: manifest.strategy.valueProp.outcome,
      benefits: manifest.strategy.valueProp.benefits,
      targetAudience: manifest.strategy.valueProp.targetAudience
    } : null;

    // Generate based on tab
    const timestamp = new Date().toISOString();
    let brandGuideData, styleGuideData, landingPageData;

    try {
      if (tab === 'brand') {
        console.log('🎨 [Design Assets Generate] Generating brand guide...');
        brandGuideData = await generateBrandGuide(icp, valueProp);
      } else if (tab === 'style') {
        // Style guide requires brand guide
        if (!manifest.identity?.colors?.primary?.length) {
          return NextResponse.json(
            { error: "Brand guide must be generated first" },
            { status: 400 }
          );
        }
        console.log('🎨 [Design Assets Generate] Generating style guide...');
        // Reconstruct brand guide from manifest for generation
        const brandGuide = {
          colors: manifest.identity.colors,
          typography: [
            { category: 'heading', fontFamily: manifest.identity.typography?.heading?.family, weights: manifest.identity.typography?.heading?.weights },
            { category: 'body', fontFamily: manifest.identity.typography?.body?.family, weights: manifest.identity.typography?.body?.weights }
          ],
          toneOfVoice: manifest.identity.tone?.keywords,
          personalityTraits: manifest.identity.tone?.personality
        };
        styleGuideData = await generateStyleGuide(brandGuide);
      } else if (tab === 'landing') {
        // Landing page requires brand guide
        if (!manifest.identity?.colors?.primary?.length) {
          return NextResponse.json(
            { error: "Brand guide must be generated first" },
            { status: 400 }
          );
        }
        console.log('🎨 [Design Assets Generate] Generating landing page...');
        const brandGuide = {
          colors: manifest.identity.colors,
          typography: [
            { category: 'heading', fontFamily: manifest.identity.typography?.heading?.family },
            { category: 'body', fontFamily: manifest.identity.typography?.body?.family }
          ]
        };
        landingPageData = await generateLandingPage(icp, valueProp, brandGuide);
      }
    } catch (genError) {
      console.error(`❌ [Design Assets Generate] Generation error for ${tab}:`, genError);
      return NextResponse.json(
        { error: `Failed to generate ${tab}`, details: genError instanceof Error ? genError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Update Brand Manifest (single source of truth)
    try {
      const { updateBrandManifest } = await import('@/lib/brand-manifest');

      // Update manifest with generated assets
      const manifestUpdates: any = {};

      if (tab === 'brand' && brandGuideData) {
        manifestUpdates.identity = {
          colors: brandGuideData.colors || manifest.identity?.colors,
          typography: {
            heading: brandGuideData.typography?.find((t: any) => t.category === 'heading') ? {
              family: brandGuideData.typography.find((t: any) => t.category === 'heading').fontFamily,
              weights: ['700'],
              sizes: {}
            } : manifest.identity?.typography?.heading,
            body: brandGuideData.typography?.find((t: any) => t.category === 'body') ? {
              family: brandGuideData.typography.find((t: any) => t.category === 'body').fontFamily,
              weights: ['400'],
              sizes: {}
            } : manifest.identity?.typography?.body
          },
          logo: { variations: brandGuideData.logoVariations || [] },
          tone: {
            keywords: brandGuideData.toneOfVoice || [],
            personality: (brandGuideData.personalityTraits || []).map((t: any) => ({
              trait: t.label || t.trait || '',
              value: t.value || 50,
              leftLabel: t.leftLabel || '',
              rightLabel: t.rightLabel || ''
            }))
          }
        };
      }

      if (tab === 'style' && styleGuideData) {
        manifestUpdates.components = {
          buttons: {
            primary: { style: styleGuideData.buttons?.[0]?.style || 'solid', borderRadius: styleGuideData.borderRadius || '8px', shadow: 'none' },
            secondary: { style: styleGuideData.buttons?.[1]?.style || 'outline', borderRadius: styleGuideData.borderRadius || '8px', shadow: 'none' },
            outline: { style: 'ghost', borderRadius: styleGuideData.borderRadius || '8px', shadow: 'none' }
          },
          cards: {
            style: styleGuideData.cards?.[0]?.style || 'flat',
            borderRadius: styleGuideData.borderRadius || '12px',
            shadow: styleGuideData.shadows?.[0] || 'sm'
          },
          inputs: manifest.components?.inputs || { style: 'outlined', borderRadius: '8px', focusStyle: 'ring' },
          spacing: { scale: {} }
        };
      }

      if (tab === 'landing' && landingPageData) {
        manifestUpdates.previews = {
          landingPage: landingPageData
        };
      }

      // Save to manifest
      const updatedManifest = await updateBrandManifest(flowId, manifestUpdates, `generated_${tab}`);
      console.log(`✅ [Design Assets Generate] ${tab} saved to brand manifest`);

      // Return success with manifest data
      return NextResponse.json({ 
        success: true, 
        tab,
        manifest: updatedManifest 
      });

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

