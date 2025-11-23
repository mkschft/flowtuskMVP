# Check Manifest Status

## Quick Check: Does Your Manifest Exist?

Run this SQL in Supabase:

```sql
-- Check if manifests exist for your flows
SELECT 
    pf.title as flow_title,
    pf.website_url,
    bm.id as manifest_id,
    bm.flow_id,
    CASE 
        WHEN bm.manifest IS NULL THEN '❌ NO MANIFEST'
        WHEN bm.manifest->'strategy'->'icps' IS NULL THEN '⚠️ NO ICPs'
        WHEN jsonb_array_length(bm.manifest->'strategy'->'icps') = 0 THEN '⚠️ EMPTY ICPs'
        ELSE '✅ OK - ' || jsonb_array_length(bm.manifest->'strategy'->'icps') || ' ICPs'
    END as manifest_status,
    bm.manifest->'strategy'->'valueProp'->>'headline' as value_prop_headline,
    bm.updated_at
FROM positioning_flows pf
LEFT JOIN brand_manifests bm ON bm.flow_id = pf.id
WHERE pf.website_url IS NOT NULL
ORDER BY pf.created_at DESC
LIMIT 5;
```

## What Each Status Means

✅ **OK - 3 ICPs**: Manifest exists with ICPs → Ready for copilot!

⚠️ **NO ICPs**: Manifest exists but no ICPs → Need to generate ICPs

⚠️ **EMPTY ICPs**: Manifest exists but ICPs array is empty → Issue with ICP generation

❌ **NO MANIFEST**: No manifest created → Need to generate ICPs first

## Expected Flow

1. **After Scraping** → `website_analysis` saved ✅ (You have this!)
2. **After ICP Generation** → `brand_manifests` created with ICPs ✅ (Should have this)
3. **After Value Prop** → `manifest.strategy.valueProp` populated ✅ (Should have this)
4. **After Copilot/Design Studio** → `manifest.identity.colors`, `manifest.identity.typography`, etc. → Not yet

## Next Steps

If manifest exists with ICPs:
- ✅ You're ready to go to `/copilot` page
- There you can generate: Brand colors, Typography, Landing page
- Or use chat to make changes

If manifest doesn't exist:
- Need to generate ICPs first (should happen automatically after scraping)

