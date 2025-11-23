-- Debug: Check what's actually in the brand manifest
-- Safe version that handles missing/null fields

SELECT 
  id,
  flow_id,
  brand_key,
  version,
  
  -- Pretty print the whole identity section to see structure
  jsonb_pretty(manifest->'identity'->'colors') as colors,
  jsonb_pretty(manifest->'identity'->'tone') as tone,
  jsonb_pretty(manifest->'identity'->'logo') as logo,
  
  -- Pretty print components section
  jsonb_pretty(manifest->'components') as components,
  
  updated_at
FROM brand_manifests
WHERE flow_id = '2835ae62-799b-42bd-baf0-af784c26a925'
ORDER BY updated_at DESC
LIMIT 1;
