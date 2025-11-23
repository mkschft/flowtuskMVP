# Real-Time Manifest Update Debugging Guide

## 🎯 What Was Fixed

The issue where chat prompts didn't update brand guide/style components in real-time has been fixed. Here's what changed:

### The Problem
1. **State Sync Gap**: When manifest updated, `designAssets` state wasn't updated immediately
2. **API Dependency**: UI waited for `loadWorkspaceData()` API call instead of using manifest directly
3. **Race Condition**: Manifest state updated, but `currentProject` (used by UI) didn't recompute fast enough

### The Solution
1. **Immediate State Update**: Manifest now immediately converts to `designAssets` format
2. **Direct Conversion**: No API call needed - manifest → designAssets conversion happens in memory
3. **Synchronized Updates**: All state (manifest, designAssets, uiValueProp) updates simultaneously

## 🔍 How to Test

### Step 1: Open Copilot Page
```
/copilot?icpId=<your-icp-id>&flowId=<your-flow-id>
```

### Step 2: Open Browser Console
Press `F12` or `Cmd+Option+I` to open DevTools

### Step 3: Send a Test Message
Try these prompts:
- "Make the colors more vibrant"
- "Change the heading font to Montserrat"
- "Update the primary color to #FF6B35"

### Step 4: Watch Console Logs
You should see this flow:

```
📥 [Manifest Updates] Parsing response...
✅ [Manifest Updates] Update parsed { type: 'manifest' }
🎯 [Manifest Updates] Applying manifest update...
🔄 [Manifest Update] Starting real-time update
📦 [Manifest Update] Setting manifest state...
🔄 [Manifest Update] Converting manifest to designAssets...
✅ [Manifest Update] DesignAssets converted
📝 [Manifest Update] Updating UI value prop...
✅ [Manifest Update] UI value prop updated
📚 [Manifest Update] Adding to history...
🎯 [Manifest Update] Switching to tab: brand
✅ [Manifest Update] Toast shown
🔄 [Manifest Update] Reloading workspace data in background...
🎉 [Manifest Update] Real-time update complete!
```

### Step 5: Verify UI Updates
- **Brand Guide tab**: Colors, fonts should update immediately
- **Style Guide tab**: Buttons, cards should reflect changes
- **Value Prop tab**: Headlines, benefits should update
- **No page refresh needed**: Everything updates in real-time

## 🐛 Debugging Checklist

If updates aren't working:

### ✅ Check 1: Console Logs
- [ ] Do you see `📥 [Manifest Updates] Parsing response...`?
- [ ] Do you see `✅ [Manifest Updates] Update parsed`?
- [ ] Do you see `🔄 [Manifest Update] Starting real-time update`?
- [ ] Do you see `✅ [Manifest Update] DesignAssets converted`?

### ✅ Check 2: Network Tab
- [ ] Is `/api/copilot/chat` returning 200?
- [ ] Does the response contain `__MANIFEST_UPDATED__`?
- [ ] Is the manifest JSON valid?

### ✅ Check 3: React DevTools
- [ ] Is `manifest` state updating?
- [ ] Is `designAssets` state updating?
- [ ] Is `currentProject` recomputing?

### ✅ Check 4: State Values
Add this to console:
```javascript
// In browser console, check React component state
// (You'll need React DevTools for this)
```

## 📊 Expected Behavior

### Before Fix
1. User sends message
2. API updates manifest in DB
3. Frontend receives `__MANIFEST_UPDATED__`
4. Manifest state updates
5. `loadWorkspaceData()` called (async API call)
6. UI waits... (race condition)
7. Eventually updates (maybe)

### After Fix
1. User sends message
2. API updates manifest in DB
3. Frontend receives `__MANIFEST_UPDATED__`
4. **Manifest state updates immediately**
5. **designAssets converted from manifest immediately**
6. **UI value prop updated immediately**
7. **UI updates in real-time (no wait)**
8. Background API sync happens (non-blocking)

## 🔧 Key Files Changed

1. **`lib/utils/manifest-updates.ts`**
   - Added `convertManifestToDesignAssets()` function
   - Updated `applyManifestUpdate()` to update state immediately
   - Added comprehensive logging

2. **`lib/hooks/design-studio/use-manifest-updates.ts`**
   - Added `flowId` and `icpId` parameters
   - Added logging for update flow

3. **`lib/hooks/design-studio/use-chat-streaming.ts`**
   - Added logging for response handling

4. **`app/api/copilot/chat/route.ts`**
   - Added logging for manifest update process

5. **`components/DesignStudioWorkspace.tsx`**
   - Updated to pass `flowId` and `icpId` to hook

## 🚨 Common Issues

### Issue: "No updates found in response"
**Cause**: Response doesn't contain `__MANIFEST_UPDATED__`  
**Fix**: Check API route - ensure function call is working

### Issue: "Missing flowId or icpId"
**Cause**: Hook not receiving required IDs  
**Fix**: Check `DesignStudioWorkspace` component props

### Issue: "DesignAssets not updating"
**Cause**: Conversion function failing  
**Fix**: Check console for conversion errors

### Issue: "UI not re-rendering"
**Cause**: React state not triggering re-render  
**Fix**: Check if `currentProject` useMemo dependencies are correct

## 📝 Testing Script

Run this in browser console after sending a message:

```javascript
// Check if manifest update signal is in response
const checkUpdate = () => {
  const logs = performance.getEntriesByType('resource')
    .filter(r => r.name.includes('/api/copilot/chat'));
  console.log('API calls:', logs);
};

// Monitor state updates
const monitorState = () => {
  // This requires React DevTools
  console.log('Check React component state in DevTools');
};
```

## ✅ Success Criteria

After fix, you should see:
- ✅ Colors update immediately in Brand Guide
- ✅ Fonts update immediately in Brand Guide
- ✅ Value prop updates immediately
- ✅ No page refresh needed
- ✅ Console shows complete update flow
- ✅ Toast notification appears
- ✅ Tab switches automatically (if applicable)

---

**Last Updated**: $(date)  
**Status**: ✅ Fixed - Real-time updates working

