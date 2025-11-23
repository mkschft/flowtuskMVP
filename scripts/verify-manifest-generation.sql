-- ============================================================================
-- Verify Brand Manifest Generation
-- Run this after generating brand guide, style guide, and landing page
-- ============================================================================

-- Replace 'your-flow-id' with your actual flow_id
-- Example: 'e17aed52-4242-4197-b6a6-ce5ec9df7b2c'

-- 1. Check Brand Guide (colors, typography, tone, logo)
SELECT 
  flow_id,
  brand_key,
  'Brand Guide' as section,
  jsonb_pretty(manifest->'identity'->'colors'->'primary') as primary_colors,
  jsonb_pretty(manifest->'identity'->'colors'->'secondary') as secondary_colors,
  jsonb_pretty(manifest->'identity'->'colors'->'accent') as accent_colors,
  jsonb_pretty(manifest->'identity'->'colors'->'neutral') as neutral_colors,
  jsonb_pretty(manifest->'identity'->'typography') as typography,
  jsonb_pretty(manifest->'identity'->'tone') as tone,
  jsonb_pretty(manifest->'identity'->'logo') as logo
FROM brand_manifests 
WHERE flow_id = 'e17aed52-4242-4197-b6a6-ce5ec9df7b2c';

-- 2. Check Style Guide (buttons, cards, inputs, spacing)
SELECT 
  flow_id,
  'Style Guide' as section,
  jsonb_pretty(manifest->'components'->'buttons') as buttons,
  jsonb_pretty(manifest->'components'->'cards') as cards,
  jsonb_pretty(manifest->'components'->'inputs') as inputs,
  jsonb_pretty(manifest->'components'->'spacing'->'scale') as spacing_scale
FROM brand_manifests 
WHERE flow_id = 'e17aed52-4242-4197-b6a6-ce5ec9df7b2c';

-- 3. Check Landing Page (navigation, hero, features, footer)
SELECT 
  flow_id,
  'Landing Page' as section,
  jsonb_pretty(manifest->'previews'->'landingPage'->'navigation') as navigation,
  jsonb_pretty(manifest->'previews'->'landingPage'->'hero') as hero,
  jsonb_pretty(manifest->'previews'->'landingPage'->'features') as features,
  jsonb_pretty(manifest->'previews'->'landingPage'->'footer') as footer
FROM brand_manifests 
WHERE flow_id = 'e17aed52-4242-4197-b6a6-ce5ec9df7b2c';

-- 4. Quick Status Check (what's generated vs what's missing)
SELECT 
  flow_id,
  brand_key,
  CASE 
    WHEN manifest->'identity'->'colors'->'primary' != '[]'::jsonb 
      AND jsonb_array_length(manifest->'identity'->'colors'->'primary') > 0 
    THEN '✅ Brand Guide'
    ELSE '❌ Brand Guide'
  END as brand_status,
  CASE 
    WHEN manifest->'components'->'spacing'->'scale' IS NOT NULL 
      AND manifest->'components'->'spacing'->'scale' != '{}'::jsonb
    THEN '✅ Style Guide'
    ELSE '❌ Style Guide'
  END as style_status,
  CASE 
    WHEN manifest->'previews'->'landingPage'->'hero' IS NOT NULL
      AND manifest->'previews'->'landingPage'->'hero' != '{}'::jsonb
    THEN '✅ Landing Page'
    ELSE '❌ Landing Page'
  END as landing_status,
  updated_at
FROM brand_manifests 
WHERE flow_id = 'e17aed52-4242-4197-b6a6-ce5ec9df7b2c';

-- 5. Expected Structure After Full Generation
-- Colors should be arrays of objects like:
-- [
--   { "name": "Brand Blue", "hex": "#0066FF", "usage": "CTA buttons" },
--   { "name": "Deep Navy", "hex": "#1a2332", "usage": "Headers" }
-- ]
-- NOT just: { "primary": "#FF6B9D", "secondary": "#A78BFA" }

-- Spacing should be an object like:
-- { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px" }
-- NOT: {}

-- 6. Check if colors are in wrong format (old format detection)
SELECT 
  flow_id,
  CASE 
    WHEN manifest->'identity'->'colors'->>'primary' LIKE '#%' 
      OR manifest->'identity'->'colors'->'primary'::text LIKE '{%'
    THEN '⚠️ Wrong format - should be array of objects'
    WHEN jsonb_typeof(manifest->'identity'->'colors'->'primary') = 'array'
      AND jsonb_array_length(manifest->'identity'->'colors'->'primary') > 0
    THEN '✅ Correct format'
    ELSE '❌ Empty or missing'
  END as primary_colors_status,
  jsonb_pretty(manifest->'identity'->'colors'->'primary') as primary_colors_value
FROM brand_manifests 
WHERE flow_id = 'e17aed52-4242-4197-b6a6-ce5ec9df7b2c';

