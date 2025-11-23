-- ============================================================================
-- CLEAR ALL DATA FROM SUPABASE TABLES
-- ============================================================================
-- This script deletes all data from all tables while keeping the schema intact
-- Run this in Supabase SQL Editor to get a fresh start for testing
-- ============================================================================

-- Disable foreign key checks temporarily (PostgreSQL doesn't have this, but we'll delete in order)
-- Delete in reverse order of dependencies (child tables first, then parent tables)

-- 1. Delete brand_manifest_history (references positioning_flows)
DELETE FROM brand_manifest_history;
SELECT '✅ Cleared brand_manifest_history' as status;

-- 2. Delete brand_manifests (references positioning_flows)
DELETE FROM brand_manifests;
SELECT '✅ Cleared brand_manifests' as status;

-- 3. Delete positioning_design_assets (references positioning_flows)
DELETE FROM positioning_design_assets;
SELECT '✅ Cleared positioning_design_assets' as status;

-- 4. Delete positioning_value_props (references positioning_flows)
DELETE FROM positioning_value_props;
SELECT '✅ Cleared positioning_value_props' as status;

-- 5. Delete positioning_icps (references positioning_flows)
DELETE FROM positioning_icps;
SELECT '✅ Cleared positioning_icps' as status;

-- 6. Delete positioning_flows (main table)
DELETE FROM positioning_flows;
SELECT '✅ Cleared positioning_flows' as status;

-- 7. Delete any other related tables (if they exist)
-- Uncomment if you have these tables:
-- DELETE FROM positioning_speech;
-- DELETE FROM positioning_models;
-- DELETE FROM analytics;
-- DELETE FROM landing_pages;
-- DELETE FROM leads;

-- Verify all tables are empty
SELECT 
    'brand_manifest_history' as table_name,
    COUNT(*) as remaining_rows
FROM brand_manifest_history
UNION ALL
SELECT 
    'brand_manifests',
    COUNT(*)
FROM brand_manifests
UNION ALL
SELECT 
    'positioning_design_assets',
    COUNT(*)
FROM positioning_design_assets
UNION ALL
SELECT 
    'positioning_value_props',
    COUNT(*)
FROM positioning_value_props
UNION ALL
SELECT 
    'positioning_icps',
    COUNT(*)
FROM positioning_icps
UNION ALL
SELECT 
    'positioning_flows',
    COUNT(*)
FROM positioning_flows
ORDER BY table_name;

-- Success message
SELECT '🎉 All data cleared! Ready for fresh testing.' as message;

