# Fresh Start Testing Guide

## ✅ Step 1: Commit the Transaction

If you haven't already, run this in Supabase SQL Editor:

```sql
COMMIT;
```

---

## 🧪 Step 2: Test Creating a New Flow

### 2.1 Open the App
1. Go to `http://localhost:3000/app`
2. Make sure dev server is running (`npm run dev`)

### 2.2 Create a New Flow
1. Click "New Conversation" or start a new flow
2. Enter a website URL (e.g., `https://stripe.com` or `https://linear.app`)
3. Click "Start" or "Analyze"

### 2.3 Verify Flow in Database
Run this query to check if the flow was created:

```sql
-- Check new flow
SELECT 
    id,
    title,
    website_url,
    step,
    created_at
FROM positioning_flows
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result**: You should see 1 row with your new flow.

---

## 🧪 Step 3: Test ICP Generation

### 3.1 Generate ICPs
1. In the app, wait for ICPs to generate (or click "Generate ICPs" if available)
2. Verify ICPs appear in the UI

### 3.2 Verify in Database
```sql
-- Check if manifest was created (ICPs are stored in manifest)
SELECT 
    id,
    flow_id,
    manifest->'strategy'->'persona' as persona,
    created_at
FROM brand_manifests
WHERE flow_id = (
    SELECT id FROM positioning_flows ORDER BY created_at DESC LIMIT 1
);
```

**Expected Result**: You should see 1 manifest with persona data.

---

## 🧪 Step 4: Test Brand Manifest Creation

### 4.1 Generate Brand
1. Continue in the app flow
2. Let it generate the brand guide (colors, typography, etc.)
3. Verify brand guide appears in UI

### 4.2 Verify Manifest Structure
```sql
-- Check full manifest structure
SELECT 
    id,
    flow_id,
    manifest->'identity'->'colors' as colors,
    manifest->'identity'->'typography' as typography,
    manifest->'metadata'->'generationHistory' as history,
    updated_at
FROM brand_manifests
WHERE flow_id = (
    SELECT id FROM positioning_flows ORDER BY created_at DESC LIMIT 1
);
```

**Expected Result**: Manifest should have:
- `colors` (primary, secondary, accent, neutral)
- `typography` (heading, body fonts)
- `generationHistory` array

---

## 🧪 Step 5: Test Real-Time Manifest Updates (THE MAIN FIX)

### 5.1 Open Copilot
1. From your flow, click "Launch Copilot" button
   - OR navigate to: `/copilot?icpId=<icp-id>&flowId=<flow-id>`
   - Get IDs from the database query above

### 5.2 Open Browser Console
1. Press `F12` (or `Cmd+Option+I` on Mac)
2. Go to "Console" tab
3. Keep it open to see logs

### 5.3 Send Test Message
In the chat panel, type:
```
Make the colors more vibrant
```

### 5.4 Watch for Real-Time Updates
**What to look for:**

1. **Console Logs** (should appear immediately):
   ```
   🔄 [Manifest Update] Starting real-time update
   📦 [Manifest Update] Setting manifest state...
   🔄 [Manifest Update] Converting manifest to designAssets...
   ✅ [Manifest Update] DesignAssets converted
   ✅ [Manifest Update] Real-time update complete!
   ```

2. **UI Updates** (should happen immediately):
   - Colors change in Brand Guide tab
   - No page refresh needed
   - Toast notification appears
   - Tab switches to "brand" automatically

3. **API Logs** (in console):
   ```
   🔧 [Copilot] Function call args: ...
   🔄 [Copilot] Applying manifest update...
   ✅ [Copilot] Manifest updated in DB
   📤 [Copilot] Manifest update signal sent to frontend
   ```

### 5.5 Verify Database Update
```sql
-- Check manifest was updated
SELECT 
    id,
    updated_at,
    manifest->'identity'->'colors'->'primary' as primary_colors,
    manifest->'metadata'->'generationHistory' as history
FROM brand_manifests
WHERE flow_id = (
    SELECT id FROM positioning_flows ORDER BY created_at DESC LIMIT 1
);
```

**Expected Result**: 
- `updated_at` should be recent (just now)
- `primary_colors` should show new colors
- `history` should have a new entry with action "styling"

---

## 🧪 Step 6: Test More Real-Time Updates

Try these commands in the copilot chat:

1. **Color Change:**
   ```
   Change the primary color to #0066FF
   ```
   - Should update immediately

2. **Typography:**
   ```
   Make the typography more modern
   ```
   - Should update fonts immediately

3. **Headline:**
   ```
   Update the headline to be more compelling
   ```
   - Should update value prop immediately

**After each command:**
- ✅ UI updates without refresh
- ✅ Toast notification appears
- ✅ Console shows complete update flow
- ✅ Database is updated

---

## ✅ Success Criteria Checklist

- [ ] Can create new flow
- [ ] Flow appears in database
- [ ] ICPs generate successfully
- [ ] Brand manifest is created
- [ ] Real-time updates work (UI updates without refresh)
- [ ] Console shows complete update flow logs
- [ ] Toast notifications appear
- [ ] Tab switching works automatically
- [ ] Database persists updates correctly
- [ ] No errors in console

---

## 🐛 Troubleshooting

### If real-time updates don't work:

1. **Check Console for Errors**
   - Look for red error messages
   - Check if `__MANIFEST_UPDATED__` signal is received

2. **Verify Fixes Are Applied**
   - Check `lib/utils/manifest-updates.ts` line 341 (should have `{ ...updatedDesignAssets }`)
   - Check `components/DesignStudioWorkspace.tsx` line 140 (should include `manifest` in deps)
   - Check `app/api/copilot/chat/route.ts` (should have empty updates validation)

3. **Check React DevTools**
   - Install React DevTools browser extension
   - Check if `designAssets` state is updating
   - Check if `currentProject` is recomputing

### If flows don't create:

1. **Check Supabase Connection**
   - Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Check browser console for connection errors

2. **Check RLS Policies**
   - Run: `SELECT * FROM pg_policies WHERE tablename = 'positioning_flows';`
   - Should allow inserts with `user_id IS NULL` (demo mode)

3. **Check API Routes**
   - Open Network tab in browser
   - Try creating flow, check `/api/flows` request
   - Look for error responses

---

## 📊 Quick Verification Queries

Run these anytime to check database state:

```sql
-- Count all data
SELECT 
    (SELECT COUNT(*) FROM positioning_flows) as flows,
    (SELECT COUNT(*) FROM brand_manifests) as manifests,
    (SELECT COUNT(*) FROM brand_manifest_history) as history;

-- Latest flow
SELECT id, title, website_url, created_at 
FROM positioning_flows 
ORDER BY created_at DESC 
LIMIT 1;

-- Latest manifest
SELECT id, flow_id, updated_at 
FROM brand_manifests 
ORDER BY updated_at DESC 
LIMIT 1;
```

---

**Last Updated**: After fresh start cleanup
**Status**: Ready for testing

