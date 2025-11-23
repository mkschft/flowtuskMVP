-- ============================================================================
-- LIST ALL ROWS IN positioning_flows TABLE
-- ============================================================================
-- Run this in Supabase SQL Editor to see all flows
-- ============================================================================

SELECT 
    id,
    user_id,
    title,
    website_url,
    step,
    CASE 
        WHEN website_analysis IS NULL THEN '❌ No data'
        WHEN website_analysis->'facts' IS NULL THEN '⚠️ Empty'
        ELSE '✅ ' || jsonb_array_length(website_analysis->'facts') || ' facts'
    END as analysis_status,
    website_analysis->'brand'->>'name' as brand_name,
    created_at,
    updated_at,
    archived_at,
    completed_at
FROM positioning_flows
ORDER BY created_at DESC;

-- Summary counts
SELECT 
    COUNT(*) as total_flows,
    COUNT(CASE WHEN website_url IS NOT NULL THEN 1 END) as flows_with_url,
    COUNT(CASE WHEN website_analysis IS NOT NULL THEN 1 END) as flows_with_analysis,
    COUNT(CASE WHEN website_url IS NULL AND website_analysis IS NOT NULL THEN 1 END) as broken_flows,
    COUNT(CASE WHEN archived_at IS NOT NULL THEN 1 END) as archived_flows
FROM positioning_flows;

