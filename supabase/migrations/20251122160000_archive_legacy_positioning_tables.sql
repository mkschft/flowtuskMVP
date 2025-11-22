-- Archive Legacy Positioning Tables
-- 
-- This migration renames legacy tables to _archive_* as a safety measure
-- DO NOT apply this migration until:
--   1. All existing data has been migrated to brand_manifests (run scripts/migrate-all-to-manifests.ts)
--   2. You've verified the new system works in production for at least 7 days
--   3. You have a recent database backup
--
-- The archived tables will be kept for 30 days before permanent deletion
-- Tables being archived:
--   - positioning_icps (persona data)
--   - positioning_value_props (value propositions)  
--   - positioning_design_assets (design assets: colors, typography, landing pages)
--
-- The new source of truth is:
--   - brand_manifests (unified data structure)

-- Step 1: Verify all flows with design assets have manifests
-- This query should return 0 rows before proceeding
DO $$
DECLARE
    missing_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT pda.parent_flow)
    INTO missing_count
    FROM positioning_design_assets pda
    WHERE pda.brand_guide IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM brand_manifests bm WHERE bm.flow_id = pda.parent_flow
    );
    
    IF missing_count > 0 THEN
        RAISE EXCEPTION 'Cannot archive: % flows have design assets but no brand manifest. Run migration script first.', missing_count;
    END IF;
    
    RAISE NOTICE '✅ All flows with design assets have brand manifests';
END $$;

-- Step 2: Drop RLS policies (they reference the tables)
DROP POLICY IF EXISTS "Users can view own ICPs" ON positioning_icps;
DROP POLICY IF EXISTS "Users can create own ICPs" ON positioning_icps;
DROP POLICY IF EXISTS "Users can update own ICPs" ON positioning_icps;
DROP POLICY IF EXISTS "Demo mode read for ICPs" ON positioning_icps;

DROP POLICY IF EXISTS "Users can view own value props" ON positioning_value_props;
DROP POLICY IF EXISTS "Users can create own value props" ON positioning_value_props;
DROP POLICY IF EXISTS "Users can update own value props" ON positioning_value_props;
DROP POLICY IF EXISTS "Demo mode read for value props" ON positioning_value_props;

DROP POLICY IF EXISTS "Users can view own design assets" ON positioning_design_assets;
DROP POLICY IF EXISTS "Users can create own design assets" ON positioning_design_assets;
DROP POLICY IF EXISTS "Users can update own design assets" ON positioning_design_assets;
DROP POLICY IF EXISTS "Demo mode read for design assets" ON positioning_design_assets;

-- Step 3: Rename tables to archive
ALTER TABLE IF EXISTS positioning_icps RENAME TO _archive_positioning_icps;
ALTER TABLE IF EXISTS positioning_value_props RENAME TO _archive_positioning_value_props;
ALTER TABLE IF EXISTS positioning_design_assets RENAME TO _archive_positioning_design_assets;

-- Step 4: Add comments for future reference
COMMENT ON TABLE _archive_positioning_icps IS 'ARCHIVED on 2025-11-22. Legacy ICP data. Safe to delete after 2025-12-22. Migrated to brand_manifests.';
COMMENT ON TABLE _archive_positioning_value_props IS 'ARCHIVED on 2025-11-22. Legacy value prop data. Safe to delete after 2025-12-22. Migrated to brand_manifests.';
COMMENT ON TABLE _archive_positioning_design_assets IS 'ARCHIVED on 2025-11-22. Legacy design assets. Safe to delete after 2025-12-22. Migrated to brand_manifests.';

-- Step 5: Log the archival
DO $$
BEGIN
    RAISE NOTICE '✅ Legacy tables archived successfully';
    RAISE NOTICE '   - _archive_positioning_icps';
    RAISE NOTICE '   - _archive_positioning_value_props';
    RAISE NOTICE '   - _archive_positioning_design_assets';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Keep these tables for 30 days as backup';
    RAISE NOTICE '⚠️  Safe to drop after: 2025-12-22';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 New source of truth: brand_manifests table';
END $$;
