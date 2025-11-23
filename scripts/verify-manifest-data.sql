-- Check if brand manifest data is actually saving to database
-- Run this in Supabase SQL Editor after generation completes

SELECT 
  id,
  brand_key,
  flow_id,
  icp_id,
  version,
  created_at,
  updated_at,
  
  -- Brand name
  manifest->>'brandName' as brand_name,
  
  -- Check if identity data exists
  manifest->'identity'->'colors'->'primary' as primary_colors,
  manifest->'identity'->'colors'->'accent' as accent_colors,
  manifest->'identity'->'colors'->'neutral' as neutral_colors,
  
  -- Check tone data
  manifest->'identity'->'tone'->'keywords' as tone_keywords,
  jsonb_array_length(COALESCE(manifest->'identity'->'tone'->'keywords', '[]'::jsonb)) as tone_keywords_count,
  
  -- Check personality data
  manifest->'identity'->'tone'->'personality' as personality_traits,
  jsonb_array_length(COALESCE(manifest->'identity'->'tone'->'personality', '[]'::jsonb)) as personality_count,
  
  -- Check logo data
  manifest->'identity'->'logo'->'variations' as logo_variations,
  jsonb_array_length(COALESCE(manifest->'identity'->'logo'->'variations', '[]'::jsonb)) as logo_count,
  
  -- Check typography
  manifest->'identity'->'typography'->'heading'->>'family' as heading_font,
  manifest->'identity'->'typography'->'body'->>'family' as body_font

FROM brand_manifests
WHERE flow_id = '3da2157f-9abf-474d-8c03-45891ea70de5'  -- Replace with your flowId
ORDER BY created_at DESC
LIMIT 1;

-- To see the FULL manifest JSON (pretty printed):
-- SELECT jsonb_pretty(manifest) FROM brand_manifests WHERE flow_id = 'YOUR-FLOW-ID' ORDER BY created_at DESC LIMIT 1;
