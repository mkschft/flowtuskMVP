-- ============================================================================
-- DELETE ALL ROWS FROM SUPABASE TABLES
-- ============================================================================
-- ⚠️ WARNING: This will delete ALL data. Cannot be undone!
-- Run this in Supabase SQL Editor to start fresh
-- ============================================================================

-- Delete in order (respects foreign key constraints)
DELETE FROM brand_manifest_history;
DELETE FROM brand_manifests;
DELETE FROM positioning_design_assets;
DELETE FROM positioning_value_props;
DELETE FROM positioning_icps;
DELETE FROM positioning_flows;

-- Verify all tables are empty
SELECT 
    'brand_manifest_history' as table_name,
    COUNT(*) as remaining_rows
FROM brand_manifest_history
UNION ALL
SELECT 'brand_manifests', COUNT(*) FROM brand_manifests
UNION ALL
SELECT 'positioning_design_assets', COUNT(*) FROM positioning_design_assets
UNION ALL
SELECT 'positioning_value_props', COUNT(*) FROM positioning_value_props
UNION ALL
SELECT 'positioning_icps', COUNT(*) FROM positioning_icps
UNION ALL
SELECT 'positioning_flows', COUNT(*) FROM positioning_flows
ORDER BY table_name;

-- Success message
SELECT '🎉 All data deleted! Ready for fresh start.' as message;

