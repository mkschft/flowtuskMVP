-- Diagnostic Script: Check Flow Data for f2c85e5e-821b-48cc-b253-19e588190f22
-- Run this in Supabase SQL Editor

-- ========================================
-- 1. Check if flow exists
-- ========================================
SELECT 
    'positioning_flows' as table_name,
    id,
    title,
    user_id,
    created_at,
    website_url,
    metadata
FROM positioning_flows 
WHERE id = 'f2c85e5e-821b-48cc-b253-19e588190f22';

-- ========================================
-- 2. Check for brand manifest
-- ========================================
SELECT 
    'brand_manifests' as table_name,
    id,
    flow_id,
    brand_key,
    created_at,
    updated_at,
    (manifest->>'brandName') as brand_name,
    (manifest->'strategy'->'persona'->>'company') as company,
    (manifest->'metadata'->>'regenerationCount')::int as regen_count,
    jsonb_array_length(manifest->'metadata'->'generationHistory') as history_count
FROM brand_manifests 
WHERE flow_id = 'f2c85e5e-821b-48cc-b253-19e588190f22';

-- ========================================
-- 3. Check for ICPs
-- ========================================
SELECT 
    'positioning_icps' as table_name,
    id,
    parent_flow,
    title,
    persona_name,
    persona_company,
    created_at
FROM positioning_icps 
WHERE parent_flow = 'f2c85e5e-821b-48cc-b253-19e588190f22'
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 4. Check for value props
-- ========================================
SELECT 
    'positioning_value_props' as table_name,
    id,
    parent_flow,
    headline,
    subheadline,
    created_at
FROM positioning_value_props 
WHERE parent_flow = 'f2c85e5e-821b-48cc-b253-19e588190f22'
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 5. Check for design assets (legacy)
-- ========================================
SELECT 
    'positioning_design_assets' as table_name,
    id,
    parent_flow,
    generation_state,
    created_at,
    brand_guide IS NOT NULL as has_brand_guide,
    style_guide IS NOT NULL as has_style_guide,
    landing_page IS NOT NULL as has_landing_page
FROM positioning_design_assets 
WHERE parent_flow = 'f2c85e5e-821b-48cc-b253-19e588190f22'
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 6. Full manifest JSON (if exists)
-- ========================================
SELECT 
    jsonb_pretty(manifest) as full_manifest
FROM brand_manifests 
WHERE flow_id = 'f2c85e5e-821b-48cc-b253-19e588190f22'
LIMIT 1;
