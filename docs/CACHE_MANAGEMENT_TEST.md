# Cache Management Testing Guide

## Quick Test Steps

### 1. Test Automatic Cache Initialization

**What to test:** Cache auto-clears on page load if outdated/stale

**Steps:**
1. Open browser DevTools (F12) → Console
2. Check current cache version:
   ```javascript
   localStorage.getItem('flowtusk_cache_version')
   ```
3. Manually set an old version to trigger auto-clear:
   ```javascript
   localStorage.setItem('flowtusk_cache_version', 'v1');
   localStorage.setItem('flowtusk_cache_cleared_at', (Date.now() - 8 * 24 * 60 * 60 * 1000).toString()); // 8 days ago
   ```
4. Refresh the page (F5)
5. Check console logs - should see: `🧹 [CacheManager] Cache is outdated or stale, clearing...`
6. Verify cache was cleared:
   ```javascript
   localStorage.getItem('flowtusk_cache_version') // Should be 'v2'
   localStorage.getItem('flowtusk-flows') // Should be null or empty
   ```

### 2. Test Manual Cache Clearing

**What to test:** Manual cache clearing via API and client functions

**Steps:**
1. Populate some cache data:
   - Create a conversation/flow in the app
   - Check localStorage has data:
     ```javascript
     localStorage.getItem('flowtusk-flows')
     ```

2. Clear server-side cache (browser console):
   ```javascript
   fetch('/api/admin/clear-cache', { method: 'POST' })
     .then(r => r.json())
     .then(console.log);
   ```
   Should see: `✅ [CacheManager] Server caches cleared`

3. Clear client-side cache manually (can't import modules in browser console):
   ```javascript
   // Clear localStorage
   localStorage.removeItem('flowtusk-flows');
   localStorage.removeItem('flowtusk_conversations');
   localStorage.removeItem('flowtusk_active_conversation');
   localStorage.removeItem('last_icps_response');
   localStorage.setItem('flowtusk_cache_version', 'v2');
   localStorage.setItem('flowtusk_cache_cleared_at', Date.now().toString());
   console.log('✅ Client cache cleared manually');
   ```

4. Clear everything (server + client):
   ```javascript
   // Clear server cache
   await fetch('/api/admin/clear-cache', { method: 'POST' }).then(r => r.json());
   
   // Clear client cache
   localStorage.removeItem('flowtusk-flows');
   localStorage.removeItem('flowtusk_conversations');
   localStorage.removeItem('flowtusk_active_conversation');
   localStorage.removeItem('last_icps_response');
   localStorage.setItem('flowtusk_cache_version', 'v2');
   localStorage.setItem('flowtusk_cache_cleared_at', Date.now().toString());
   ```

### 3. Test Cache Versioning

**What to test:** Cache clears when version changes

**Steps:**
1. Set cache to current version:
   ```javascript
   localStorage.setItem('flowtusk_cache_version', 'v2');
   localStorage.setItem('flowtusk_cache_cleared_at', Date.now().toString());
   ```

2. Simulate version change by checking the code:
   - Open `lib/utils/cache-manager.ts`
   - Note the `CURRENT_CACHE_VERSION` (should be `'v2'`)
   - Temporarily change it to `'v3'` in your mind (don't actually change it)

3. Or test by setting old version:
   ```javascript
   localStorage.setItem('flowtusk_cache_version', 'v1');
   ```

4. Refresh page - should auto-clear and set to `'v2'`

### 4. Test Cache Staleness Detection

**What to test:** Cache clears if older than 7 days

**Steps:**
1. Set cache to 8 days ago (stale):
   ```javascript
   localStorage.setItem('flowtusk_cache_cleared_at', (Date.now() - 8 * 24 * 60 * 60 * 1000).toString());
   localStorage.setItem('flowtusk_cache_version', 'v2');
   ```

2. Refresh page
3. Should see in console: `🧹 [CacheManager] Cache is outdated or stale, clearing...`
4. Check timestamp was updated:
   ```javascript
   localStorage.getItem('flowtusk_cache_cleared_at') // Should be recent timestamp
   ```

### 5. Test Cache Invalidation on Flow Delete

**What to test:** Cache clears when flow is deleted

**Steps:**
1. Create a conversation/flow in the app
2. Open DevTools → Console
3. Delete the flow from the UI
4. Check console logs - should see cache invalidation
5. Verify chat messages were cleared:
   ```javascript
   // Check Zustand store (if accessible)
   // Chat messages should be empty after deletion
   ```

### 6. Test Cache Stats Endpoint

**What to test:** GET endpoint returns cache statistics

**Steps:**
1. In browser console:
   ```javascript
   fetch('/api/admin/clear-cache')
     .then(r => r.json())
     .then(console.log);
   ```

2. Should return:
   ```json
   {
     "scrapeCache": { "entries": 0, "totalSizeBytes": 0, "avgAgeHours": 0 },
     "generationCache": { "cached": 0, "pending": 0, "completed": 0 },
     "cacheVersion": "v2",
     "timestamp": "2024-..."
   }
   ```

### 7. Test Fresh Cache (No Clear)

**What to test:** Cache doesn't clear if fresh and up-to-date

**Steps:**
1. Set fresh cache:
   ```javascript
   localStorage.setItem('flowtusk_cache_version', 'v2');
   localStorage.setItem('flowtusk_cache_cleared_at', Date.now().toString());
   ```

2. Refresh page
3. Should see in console: `✅ [CacheManager] Cache is fresh`
4. Cache should NOT be cleared

## Expected Console Logs

### On Page Load (Fresh Cache):
```
✅ [CacheManager] Cache is fresh
```

### On Page Load (Stale/Outdated):
```
🧹 [CacheManager] Cache is outdated or stale, clearing...
✅ [CacheManager] All client caches cleared
```

### On Flow Delete:
```
🔄 [CacheManager] Invalidating cache for flow abc12345
```

### On Manual Clear:
```
✅ [CacheManager] All client caches cleared
✅ [CacheManager] Server caches cleared: { success: true, data: {...} }
```

## Troubleshooting

**Cache not clearing?**
- Check browser console for errors
- Verify `lib/utils/cache-manager.ts` is imported correctly
- Check localStorage isn't disabled

**Version not updating?**
- Verify `CURRENT_CACHE_VERSION` in `cache-manager.ts`
- Check localStorage isn't being cleared by browser settings

**Auto-clear not running?**
- Check `initializeCache()` is called in `app/app/page.tsx`
- Verify it's in the `checkAuthAndLoadFlows()` function
- Check console for initialization errors

## Quick Test Script

Run this in browser console for a full test:

```javascript
(async () => {
  console.log('🧪 Starting cache management tests...');
  
  // Test 1: Check current state
  console.log('1️⃣ Current cache version:', localStorage.getItem('flowtusk_cache_version'));
  const clearedAt = localStorage.getItem('flowtusk_cache_cleared_at');
  if (clearedAt) {
    const age = Math.round((Date.now() - parseInt(clearedAt)) / (1000 * 60 * 60 * 24));
    console.log('1️⃣ Cache age:', age, 'days');
  }
  
  // Test 2: Check cache stats
  const stats = await fetch('/api/admin/clear-cache').then(r => r.json());
  console.log('2️⃣ Server cache stats:', stats);
  
  // Test 3: Test staleness check (manual)
  const version = localStorage.getItem('flowtusk_cache_version');
  const isOutdated = version !== 'v2';
  const clearedAtTime = parseInt(localStorage.getItem('flowtusk_cache_cleared_at') || '0');
  const isStale = clearedAtTime === 0 || (Date.now() - clearedAtTime) > (7 * 24 * 60 * 60 * 1000);
  console.log('3️⃣ Is cache outdated?', isOutdated);
  console.log('3️⃣ Is cache stale?', isStale);
  
  // Test 4: Manual clear
  console.log('4️⃣ Clearing server cache...');
  await fetch('/api/admin/clear-cache', { method: 'POST' }).then(r => r.json());
  
  console.log('4️⃣ Clearing client cache...');
  localStorage.removeItem('flowtusk-flows');
  localStorage.removeItem('flowtusk_conversations');
  localStorage.removeItem('flowtusk_active_conversation');
  localStorage.removeItem('last_icps_response');
  localStorage.setItem('flowtusk_cache_version', 'v2');
  localStorage.setItem('flowtusk_cache_cleared_at', Date.now().toString());
  
  console.log('✅ Tests complete!');
})();
```

