-- Quick SQL query to inspect brand manifest
-- Run this in Supabase SQL Editor

SELECT 
  id,
  brand_key,
  version,
  created_at,
  updated_at,
  manifest->>'brandName' as brand_name,
  manifest->'strategy'->'persona'->>'name' as persona_name,
  manifest->'strategy'->'valueProp'->>'headline' as value_prop_headline,
  manifest->'identity'->'typography'->'heading'->>'family' as heading_font,
  manifest->'identity'->'typography'->'body'->>'family' as body_font,
  manifest->'identity'->'tone'->>'keywords' as tone_keywords,
  jsonb_array_length(manifest->'identity'->'tone'->'personality') as personality_count,
  jsonb_pretty(manifest) as full_manifest
FROM brand_manifests
WHERE flow_id = 'ccf7125a-9117-45b6-a07c-546f3203659b'
ORDER BY created_at DESC
LIMIT 1;
