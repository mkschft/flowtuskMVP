import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchBrandManifest } from "@/lib/brand-manifest";

// Normalization helpers to ensure Canvas components receive correct data types
function normalizeColorArray(colors: any): { name: string; hex: string; usage?: string }[] {
  if (!colors) return [];
  if (Array.isArray(colors)) return colors;
  if (typeof colors === 'string') {
    // Handle string hex codes from old data
    return [{ name: 'Color', hex: colors }];
  }
  if (typeof colors === 'object' && colors.hex) {
    // Handle single object from old data
    return [colors];
  }
  return [];
}

function normalizeStringArrayField(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
}

function normalizeArrayField(value: any): any[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [];
}

function normalizeSpacing(spacing: any): { name: string; value: string }[] {
  if (!spacing) return [];
  if (Array.isArray(spacing)) return spacing;
  // Convert object like { sm: "8px", md: "16px" } to array
  if (typeof spacing === 'object') {
    return Object.entries(spacing).map(([key, value]) => ({
      name: key,
      value: String(value)
    }));
  }
  return [];
}

function normalizeBorderRadius(borderRadius: any): { name: string; value: string }[] {
  if (!borderRadius) return [];
  if (Array.isArray(borderRadius)) return borderRadius;
  if (typeof borderRadius === 'string') {
    // Create a simple scale from a single value
    const baseValue = parseInt(borderRadius) || 8;
    return [
      { name: 'sm', value: `${Math.floor(baseValue * 0.5)}px` },
      { name: 'md', value: `${baseValue}px` },
      { name: 'lg', value: `${Math.floor(baseValue * 1.5)}px` },
      { name: 'xl', value: `${baseValue * 2}px` }
    ];
  }
  return [];
}

function normalizeButtons(buttons: any): { variant: string; description: string }[] {
  if (!buttons) return [];
  if (Array.isArray(buttons)) return buttons;
  
  // Convert object like { primary: {...}, secondary: {...} } to array
  const result = [];
  if (buttons.primary) {
    result.push({
      variant: 'Primary',
      description: buttons.primary.description || 'Main call-to-action button'
    });
  }
  if (buttons.secondary) {
    result.push({
      variant: 'Secondary',
      description: buttons.secondary.description || 'Secondary action button'
    });
  }
  if (buttons.outline) {
    result.push({
      variant: 'Outline',
      description: buttons.outline.description || 'Subtle action button'
    });
  }
  return result;
}

function normalizePersonalityTraits(traits: any): { id: string; label: string; value: number; leftLabel: string; rightLabel: string }[] {
  if (!traits) return [];
  if (!Array.isArray(traits)) return [];
  
  return traits.map((trait, idx) => ({
    id: `trait-${idx}`,
    label: trait.trait || trait.label || 'Personality',
    value: trait.value || 50,
    leftLabel: trait.leftLabel || '',
    rightLabel: trait.rightLabel || ''
  }));
}

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
      
      // 🔍 DEBUG: Log what data exists in manifest
      console.log('🔍 [DEBUG] Manifest Data Check:');
      console.log('  - identity.colors.primary:', Array.isArray(manifest.identity?.colors?.primary) ? manifest.identity.colors.primary.length + ' items' : 'not an array');
      console.log('  - identity.colors.accent:', Array.isArray(manifest.identity?.colors?.accent) ? manifest.identity.colors.accent.length + ' items' : 'not an array');
      console.log('  - identity.tone.keywords:', Array.isArray(manifest.identity?.tone?.keywords) ? manifest.identity.tone.keywords.length + ' items' : 'not an array');
      console.log('  - identity.tone.personality:', Array.isArray(manifest.identity?.tone?.personality) ? manifest.identity.tone.personality.length + ' items' : 'not an array');
      console.log('  - identity.logo.variations:', Array.isArray(manifest.identity?.logo?.variations) ? manifest.identity.logo.variations.length + ' items' : 'not an array');
      console.log('  - components.spacing.scale:', manifest.components?.spacing?.scale ? 'exists' : 'missing');
      console.log('  - components.cards.borderRadius:', manifest.components?.cards?.borderRadius || 'missing');
      
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
          colors: {
            primary: normalizeColorArray(manifest.identity?.colors?.primary),
            secondary: normalizeColorArray(manifest.identity?.colors?.secondary),
            accent: normalizeColorArray(manifest.identity?.colors?.accent),
            neutral: normalizeColorArray(manifest.identity?.colors?.neutral)
          },
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
          toneOfVoice: normalizeStringArrayField(manifest.identity?.tone?.keywords),
          personalityTraits: normalizePersonalityTraits(manifest.identity?.tone?.personality),
          logoVariations: (() => {
            const variations = normalizeArrayField(manifest.identity?.logo?.variations);
            // 🔍 DEBUG: Log logo variations being sent to frontend
            console.log('🔍 [Workspace API] Logo variations being sent:', variations.length);
            variations.forEach((v: any, idx: number) => {
              console.log(`  - Variation ${idx + 1} (${v.name}):`);
              console.log(`    - imageUrl: ${v.imageUrl ? '✅ ' + v.imageUrl.substring(0, 50) + '...' : '❌ Missing'}`);
            });
            return variations;
          })()
        },
        style_guide: {
          buttons: normalizeButtons(manifest.components?.buttons),
          cards: [manifest.components?.cards],
          spacing: normalizeSpacing(manifest.components?.spacing?.scale),
          borderRadius: normalizeBorderRadius(manifest.components?.cards?.borderRadius)
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

    // No manifest found - this flow needs to be regenerated
    console.error('❌ [Workspace API] Manifest not found for flow:', flowId);
    return NextResponse.json(
      { error: "Workspace data not found. Please regenerate this flow's content." },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('❌ [Workspace API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}
