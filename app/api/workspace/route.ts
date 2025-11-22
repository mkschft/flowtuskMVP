import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchBrandManifest } from "@/lib/brand-manifest";

// GET /api/workspace?icpId=...&flowId=...
// Returns a consolidated workspace payload from brand_manifests
// Legacy format for backward compatibility
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const icpId = searchParams.get("icpId");
    const flowId = searchParams.get("flowId");

    if (!icpId || !flowId) {
      return NextResponse.json({ error: "icpId and flowId are required" }, { status: 400 });
    }

    // Auth or demo mode
    const { data: { user } } = await supabase.auth.getUser();
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    if (!user && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to fetch from brand_manifests first (new system)
    const manifest = await fetchBrandManifest(flowId, icpId);

    if (manifest) {
      console.log('✅ [Workspace API] Using brand manifest as source');
      
      // Map manifest to legacy format for backward compatibility
      const icp = {
        id: icpId,
        parent_flow: flowId,
        persona_name: manifest.strategy?.persona?.name || '',
        persona_role: manifest.strategy?.persona?.role || '',
        persona_company: manifest.strategy?.persona?.company || '',
        title: manifest.strategy?.persona?.industry || '',
        industry: manifest.strategy?.persona?.industry || '',
        location: manifest.strategy?.persona?.location || '',
        country: manifest.strategy?.persona?.country || '',
        pain_points: manifest.strategy?.persona?.painPoints || [],
        goals: manifest.strategy?.persona?.goals || [],
        description: `${manifest.strategy?.persona?.role || 'User'} at ${manifest.strategy?.persona?.company || 'Company'}`
      };

      const valueProp = {
        id: manifest.metadata?.sourceIcpId || icpId,
        icp_id: icpId,
        parent_flow: flowId,
        headline: manifest.strategy?.valueProp?.headline || '',
        subheadline: manifest.strategy?.valueProp?.subheadline || '',
        problem: manifest.strategy?.valueProp?.problem || '',
        solution: manifest.strategy?.valueProp?.solution || '',
        outcome: manifest.strategy?.valueProp?.outcome || '',
        benefits: manifest.strategy?.valueProp?.benefits || [],
        targetAudience: manifest.strategy?.valueProp?.targetAudience || '',
        target_audience: manifest.strategy?.valueProp?.targetAudience || '',
        variations: (manifest.strategy?.valueProp?.benefits || []).map((b, i) => ({
          id: `benefit-${i}`,
          text: b
        })),
        summary: {
          mainInsight: manifest.strategy?.valueProp?.headline || '',
          approachStrategy: manifest.strategy?.valueProp?.solution || '',
          expectedImpact: manifest.strategy?.valueProp?.outcome || '',
          painPointsAddressed: [manifest.strategy?.valueProp?.problem || '']
        }
      };

      const designAssets = {
        id: 'from-manifest',
        icp_id: icpId,
        parent_flow: flowId,
        brand_guide: {
          colors: manifest.identity?.colors || { primary: [], secondary: [], accent: [], neutral: [] },
          typography: [
            {
              category: 'heading',
              fontFamily: manifest.identity?.typography?.heading?.family || 'Inter',
              weights: manifest.identity?.typography?.heading?.weights || ['700'],
              sizes: manifest.identity?.typography?.heading?.sizes || {}
            },
            {
              category: 'body',
              fontFamily: manifest.identity?.typography?.body?.family || 'Inter',
              weights: manifest.identity?.typography?.body?.weights || ['400'],
              sizes: manifest.identity?.typography?.body?.sizes || {}
            }
          ],
          toneOfVoice: manifest.identity?.tone?.keywords || [],
          personalityTraits: manifest.identity?.tone?.personality || [],
          logoVariations: manifest.identity?.logo?.variations || []
        },
        style_guide: {
          buttons: [
            { type: 'primary', ...manifest.components?.buttons?.primary },
            { type: 'secondary', ...manifest.components?.buttons?.secondary },
            { type: 'outline', ...manifest.components?.buttons?.outline }
          ],
          cards: [manifest.components?.cards],
          borderRadius: manifest.components?.cards?.borderRadius || '12px'
        },
        landing_page: {
          navigation: {
            logo: manifest.brandName || '',
            links: []
          },
          hero: manifest.previews?.landingPage?.hero || { headline: '', subheadline: '', cta: { primary: '', secondary: '' } },
          features: manifest.previews?.landingPage?.features || [],
          socialProof: manifest.previews?.landingPage?.socialProof || [],
          footer: manifest.previews?.landingPage?.footer || { sections: [] }
        },
        generation_state: {
          brand: true,
          style: true,
          landing: true
        },
        generation_metadata: manifest.metadata || {}
      };

      return NextResponse.json({ icp, valueProp, designAssets });
    }

    // Fallback to legacy tables if manifest doesn't exist yet
    console.log('⚠️ [Workspace API] Manifest not found, falling back to legacy tables');
    
    // Fetch ICP
    const { data: icp, error: icpErr } = await supabase
      .from('positioning_icps')
      .select('*')
      .eq('id', icpId)
      .eq('parent_flow', flowId)
      .single();

    if (icpErr) {
      return NextResponse.json({ error: "ICP not found", details: icpErr.message }, { status: 404 });
    }

    // Fetch Value Prop (single per ICP by constraint)
    const { data: valueProp } = await supabase
      .from('positioning_value_props')
      .select('*')
      .eq('icp_id', icpId)
      .eq('parent_flow', flowId)
      .maybeSingle();

    // Fetch Design Assets (single per ICP by constraint)
    const { data: designAssets } = await supabase
      .from('positioning_design_assets')
      .select('*')
      .eq('icp_id', icpId)
      .eq('parent_flow', flowId)
      .maybeSingle();

    return NextResponse.json({ icp, valueProp, designAssets });
  } catch (error: any) {
    console.error('❌ [Workspace API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}
