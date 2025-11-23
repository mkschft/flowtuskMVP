# Simple Testing Guide - Data Flow

## Step 1: Make Sure Your Database is Ready

1. Open Supabase Dashboard → SQL Editor
2. Run this to check if `positioning_flows` table exists:
```sql
SELECT * FROM positioning_flows LIMIT 1;
```
3. If you get an error, run the fixed migration:
   - Copy the contents of `supabase/migrations/001_flows_table.sql`
   - Paste it in Supabase SQL Editor
   - Click "Run"

## Step 2: Start Your App

1. Open terminal in your project folder
2. Run: `npm run dev`
3. Wait for it to start (you'll see "Ready" message)
4. Open your browser to `http://localhost:3000`

## Step 3: Test the Complete Flow

### Test 1: Scrape a Website
1. In your app, enter a website URL (e.g., "stripe.com")
2. Click analyze/scrape
3. **What to check**: You should see facts/data extracted from the website
4. **If it works**: ✅ Facts are shown on screen

### Test 2: Create Flow (Automatic)
1. After scraping, a flow should be created automatically
2. **What to check**: Go to Supabase → Table Editor → `positioning_flows`
3. Look for a new row with:
   - `website_url` = the URL you entered
   - `website_analysis` = should have JSON data (facts, valueProps, etc.)
4. **If it works**: ✅ You see a new row with `website_analysis` populated

### Test 3: Generate ICPs
1. In your app, generate ICPs (Ideal Customer Profiles)
2. **What to check**: Go to Supabase → Table Editor → `brand_manifests`
3. Look for a new row with:
   - `flow_id` = matches the flow ID from step 2
   - `manifest` → `strategy` → `icps` = should have an array of ICPs
4. **If it works**: ✅ You see ICPs in the manifest JSON

### Test 4: Update via Copilot Chat
1. In your app, open the copilot/chat interface
2. Type: "Make the colors more vibrant" or "Change primary color to blue"
3. **What to check**: Go to Supabase → Table Editor → `brand_manifests`
4. Look at the same row from step 3:
   - `manifest` → `identity` → `colors` = should be updated
   - `manifest` → `metadata` → `generationHistory` = should have a new entry
5. **If it works**: ✅ Colors changed in the manifest

## Step 4: Quick Database Check (Optional)

Run this in Supabase SQL Editor to see all your data:

```sql
-- See all flows with their scraping data
SELECT 
    id,
    title,
    website_url,
    website_analysis->'facts'->0 as first_fact,
    step,
    created_at
FROM positioning_flows
ORDER BY created_at DESC
LIMIT 5;

-- See all manifests with their ICPs
SELECT 
    id,
    flow_id,
    manifest->'strategy'->'icps'->0->>'title' as first_icp_title,
    manifest->'identity'->'colors'->'primary' as primary_colors,
    updated_at
FROM brand_manifests
ORDER BY updated_at DESC
LIMIT 5;
```

## ✅ Success Checklist

- [ ] Website scraping works (facts extracted)
- [ ] Flow created in `positioning_flows` table
- [ ] `website_analysis` column has data
- [ ] ICPs generated and stored in `brand_manifests`
- [ ] Copilot chat updates manifest colors/identity
- [ ] `generationHistory` in manifest shows updates

## ❌ If Something Doesn't Work

1. **Check browser console** (F12 → Console tab) for errors
2. **Check terminal** where `npm run dev` is running for server errors
3. **Check Supabase logs**: Dashboard → Logs → API or Database
4. **Common issues**:
   - Missing environment variables → Check `.env.local`
   - Database connection error → Check Supabase URL/key
   - Table doesn't exist → Run migration 001

## That's It!

If all 4 tests pass, your data flow is working correctly! 🎉

