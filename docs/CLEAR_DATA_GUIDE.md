# Clear All Data from Supabase

## Quick Guide

To delete all data and start fresh for testing:

### Option 1: Run SQL Script (Recommended)

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the contents of `scripts/clear-all-data.sql`
4. Paste into SQL Editor
5. Click **Run**
6. Verify all tables show `0` rows

### Option 2: Manual Deletion

Run these commands one by one in Supabase SQL Editor:

```sql
-- Delete in this order (respects foreign keys)
DELETE FROM brand_manifest_history;
DELETE FROM brand_manifests;
DELETE FROM positioning_design_assets;
DELETE FROM positioning_value_props;
DELETE FROM positioning_icps;
DELETE FROM positioning_flows;
```

### Verify Everything is Cleared

```sql
-- Check all tables are empty
SELECT 
    'brand_manifest_history' as table_name,
    COUNT(*) as rows
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
SELECT 'positioning_flows', COUNT(*) FROM positioning_flows;
```

All should show `0` rows.

## ⚠️ Important Notes

- **This deletes ALL data** - cannot be undone
- **Schema is preserved** - tables and columns remain
- **RLS policies remain** - security settings unchanged
- **Migrations remain** - database structure intact

## After Clearing

1. Test the complete flow:
   - Scrape a website
   - Generate ICPs
   - Create manifest
   - Use copilot

2. Verify data integrity:
   - All flows have `website_url`
   - All manifests linked to flows
   - No orphaned data

## Alternative: Delete Specific Flow

If you only want to delete one flow:

```sql
-- Replace 'flow-id-here' with actual flow ID
DELETE FROM brand_manifest_history WHERE flow_id = 'flow-id-here';
DELETE FROM brand_manifests WHERE flow_id = 'flow-id-here';
DELETE FROM positioning_design_assets WHERE parent_flow = 'flow-id-here';
DELETE FROM positioning_value_props WHERE parent_flow = 'flow-id-here';
DELETE FROM positioning_icps WHERE parent_flow = 'flow-id-here';
DELETE FROM positioning_flows WHERE id = 'flow-id-here';
```

