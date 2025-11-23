# Quick Data Sync Verification

## Run This SQL in Supabase SQL Editor

```sql
-- Check if website_analysis is populated for your flows
SELECT 
    id,
    title,
    website_url,
    CASE 
        WHEN website_analysis IS NULL THEN '❌ MISSING'
        WHEN website_analysis->'facts' IS NULL THEN '⚠️ EMPTY'
        ELSE '✅ OK'
    END as scraping_status,
    jsonb_array_length(website_analysis->'facts') as facts_count,
    website_analysis->'brand'->>'name' as brand_name,
    step,
    created_at
FROM positioning_flows
ORDER BY created_at DESC
LIMIT 10;
```

## Expected Results

✅ **Good**: You should see:
- `scraping_status` = `✅ OK`
- `facts_count` = 10-11 (or similar number)
- `brand_name` = "Tax Star" or "Hasan Shahriar"
- `website_analysis` column has JSON data

❌ **Problem**: If you see:
- `scraping_status` = `❌ MISSING` → Data not being saved
- `scraping_status` = `⚠️ EMPTY` → Data structure issue

## Check Brand Manifests Too

```sql
-- Check if manifests are created and linked
SELECT 
    bm.id as manifest_id,
    bm.flow_id,
    pf.title as flow_title,
    pf.website_url,
    jsonb_array_length(bm.manifest->'strategy'->'icps') as icps_count,
    bm.manifest->'strategy'->'icps'->0->>'title' as first_icp_title,
    bm.updated_at
FROM brand_manifests bm
LEFT JOIN positioning_flows pf ON pf.id = bm.flow_id
ORDER BY bm.updated_at DESC
LIMIT 5;
```

## Expected Results

✅ **Good**: You should see:
- `icps_count` = 3 (or number of ICPs generated)
- `first_icp_title` = "UAE Accounting Practice Owners" (or similar)
- `flow_id` matches a flow in `positioning_flows`

## What Your Logs Show

From your terminal logs, I can see:
- ✅ Facts extracted: 11 facts for Tax Star
- ✅ Flow created: ID `278c91ae-096d-4fc5-b540-585f766b16b6`
- ✅ ICPs saved to brand_manifests
- ✅ Manifest updated when ICP selected

**Everything looks good in the logs!** Just verify the database has the data.

