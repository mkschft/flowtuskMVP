# Scraping Test Guide

Comprehensive testing scenarios for website scraping reliability.

## Quick Start Testing

### Option 1: Browser UI Testing
1. Start dev server: `npm run dev`
2. Open http://localhost:3000/app
3. Paste URLs from test scenarios below
4. Watch console logs (Cmd+Option+I → Console tab)
5. Check timing and cache behavior

### Option 2: API Testing (Faster)
```bash
# Test analyze endpoint directly
curl -X POST http://localhost:3000/api/analyze-website \
  -H "Content-Type: application/json" \
  -d '{"url":"https://linear.app"}' \
  | jq '.source, .factsJson.facts | length'
```

### Option 3: Automated Test Script
I've created a test runner below you can save as `test-scraping.js`:

```javascript
// Save as test-scraping.js and run with: node test-scraping.js
const testUrls = [
  { name: 'Normal site', url: 'https://linear.app' },
  { name: 'Large site', url: 'https://aws.amazon.com' },
  { name: 'Simple site', url: 'https://example.com' },
  { name: 'Marketing site', url: 'https://stripe.com' },
  { name: 'Protected (might fail)', url: 'https://netflix.com' },
];

async function testScrape(name, url) {
  console.log(`\n🧪 Testing: ${name} (${url})`);
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      console.log(`   ❌ Failed (${response.status}) in ${duration}ms`);
      const error = await response.json();
      console.log(`   Error: ${error.error || 'Unknown'}`);
      return { name, url, success: false, duration, error: error.error };
    }
    
    const data = await response.json();
    const cached = data.cached ? ' (CACHED)' : '';
    console.log(`   ✅ Success in ${duration}ms${cached}`);
    console.log(`   Source: ${data.source}`);
    console.log(`   Content: ${data.content?.length || 0} chars`);
    console.log(`   Facts: ${data.factsJson?.facts?.length || 0}`);
    
    return { name, url, success: true, duration, source: data.source, cached: data.cached };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`   ❌ Network error in ${duration}ms: ${error.message}`);
    return { name, url, success: false, duration, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting scraping tests...\n');
  console.log('Make sure dev server is running: npm run dev\n');
  
  const results = [];
  
  // First pass
  console.log('═══ FIRST PASS (No cache) ═══');
  for (const test of testUrls) {
    const result = await testScrape(test.name, test.url);
    results.push({ ...result, pass: 1 });
    await new Promise(r => setTimeout(r, 1000)); // Wait 1s between tests
  }
  
  // Second pass (should use cache)
  console.log('\n\n═══ SECOND PASS (Testing cache) ═══');
  for (const test of testUrls) {
    const result = await testScrape(test.name, test.url);
    results.push({ ...result, pass: 2 });
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Summary
  console.log('\n\n═══ SUMMARY ═══');
  const pass1 = results.filter(r => r.pass === 1);
  const pass2 = results.filter(r => r.pass === 2);
  
  console.log('\nFirst Pass:');
  console.log(`  Success: ${pass1.filter(r => r.success).length}/${pass1.length}`);
  console.log(`  Avg time: ${Math.round(pass1.reduce((sum, r) => sum + r.duration, 0) / pass1.length)}ms`);
  
  console.log('\nSecond Pass (Cache):');
  console.log(`  Success: ${pass2.filter(r => r.success).length}/${pass2.length}`);
  console.log(`  Cached: ${pass2.filter(r => r.cached).length}/${pass2.filter(r => r.success).length}`);
  console.log(`  Avg time: ${Math.round(pass2.reduce((sum, r) => sum + r.duration, 0) / pass2.length)}ms`);
  
  const speedup = (
    pass1.reduce((sum, r) => sum + r.duration, 0) / 
    pass2.reduce((sum, r) => sum + r.duration, 0)
  ).toFixed(1);
  console.log(`\n🚀 Cache speedup: ${speedup}x faster`);
}

runTests().catch(console.error);
```

## Test Scenarios by URL Type

### 1. Normal B2B SaaS Sites (Expected: 3-8s)
These should work reliably with Jina:

```
✅ https://linear.app
✅ https://notion.so
✅ https://stripe.com
✅ https://vercel.com
✅ https://github.com
✅ https://slack.com
✅ https://airtable.com
```

**Expected behavior:**
- Complete in 3-8 seconds
- Source: `jina`
- 5-15 facts extracted
- Second scrape returns in <100ms (cached)

**Watch for:**
- Console logs showing "Jina success"
- Facts JSON with business info
- Cache hit on repeat

---

### 2. Large Enterprise Sites (Expected: 8-15s or timeout)
Complex sites with lots of content:

```
⚠️ https://aws.amazon.com
⚠️ https://microsoft.com
⚠️ https://salesforce.com
⚠️ https://oracle.com
```

**Expected behavior:**
- May timeout at 15s Jina limit
- Falls back to direct fetch if Jina times out
- Content truncated to 12KB
- Still extracts useful facts

**Watch for:**
- "Jina failed" → "Direct fetch fallback"
- Truncation message in console
- Still returns usable data

---

### 3. Protected/Anti-Bot Sites (Expected: May fail)
Sites that actively block scrapers:

```
❌ https://netflix.com
❌ https://amazon.com (product pages)
❌ https://facebook.com
❌ https://instagram.com
```

**Expected behavior:**
- Jina may return 403/429
- Direct fetch will also likely fail
- Returns user-friendly error message

**Watch for:**
- Clean error handling (no crashes)
- Actionable error message to user
- Retry button available

---

### 4. Simple Static Sites (Expected: 2-5s)
Lightweight sites with minimal content:

```
✅ https://example.com
✅ https://info.cern.ch
✅ Most personal blogs
```

**Expected behavior:**
- Very fast (2-5 seconds)
- Minimal facts (3-5)
- Efficient processing

---

### 5. Single-Page Apps / React Sites (Expected: 5-10s)
Heavy JavaScript sites:

```
⚠️ https://app.clickup.com
⚠️ https://app.asana.com
⚠️ Most /app/* routes
```

**Expected behavior:**
- Jina handles these well (renders JS)
- May take longer (8-10s)
- Good structured content

---

### 6. Non-English Sites (Expected: 3-8s)
International sites to test language handling:

```
✅ https://www.baidu.com (Chinese)
✅ https://www.yandex.ru (Russian)
✅ https://www.naver.com (Korean)
```

**Expected behavior:**
- Jina extracts correctly
- GPT-4o understands non-English content
- Facts generated in English

---

## What to Watch in Console Logs

### Success Pattern
```
🔍 [Analyze] Starting analysis for: https://linear.app
📦 [Cache] Miss for: https://linear.app
📡 [Scraper] Using Jina AI Reader...
✅ [Scraper] Jina success: 8234 chars
⚡ [Analyze] Content size: 8234 chars
🧠 [Analyze] Extracting Facts JSON with GPT-4o...
⚡ [Analyze] Facts extraction completed in 3421ms
✅ [Analyze] Facts JSON extracted: { facts: 12, ... }
💾 [Cache] Stored: https://linear.app (size: 8234 chars)
✅ [Analyze] Analysis complete with Facts JSON
```

### Cached Response Pattern (2nd scrape)
```
🔍 [Analyze] Starting analysis for: https://linear.app
✅ [Cache] Hit for: https://linear.app (age: 0h)
⚡ [Analyze] Using cached scrape result
```

### Timeout/Fallback Pattern
```
📡 [Scraper] Using Jina AI Reader...
❌ [Scraper] Jina failed: timeout
📡 [Scraper] Attempting direct fetch fallback...
✅ [Scraper] Direct fetch success: 12000 chars
🧠 [Analyze] Extracting Facts JSON with GPT-4o...
```

### Complete Failure Pattern
```
❌ [Scraper] Jina failed: 403 Forbidden
❌ [Scraper] Direct fetch failed: ECONNRESET
❌ [Scraper] All scraping methods failed
```

---

## Performance Benchmarks

### First Scrape (No Cache)
| URL Type | Target Time | Acceptable | Too Slow |
|----------|-------------|------------|----------|
| Normal B2B | 3-5s | 5-8s | >10s |
| Large Enterprise | 8-12s | 12-15s | >20s |
| Simple Static | 2-3s | 3-5s | >8s |
| SPA/React | 5-8s | 8-12s | >15s |

### Cached Scrape
- **Target**: <100ms
- **Acceptable**: <500ms
- **Too Slow**: >1s (investigate cache miss)

---

## Debugging Failed Scrapes

### 1. Test Jina Directly
```bash
# Test if Jina can access the site
curl "https://r.jina.ai/YOUR_URL?max-length=12000" \
  -H "Accept: text/markdown" \
  --max-time 15
```

**If this fails:**
- Site is blocking Jina
- Site requires authentication
- Site is down
- Jina service issue

### 2. Test Direct Fetch
```bash
# Test if direct fetch works
curl "YOUR_URL" \
  -H "User-Agent: Mozilla/5.0 (compatible; FlowtuskBot/1.0)" \
  --max-time 15
```

**If this fails:**
- Site blocks all bots
- Requires JavaScript rendering
- Network/DNS issue

### 3. Check OpenAI Extraction
If scraping works but facts are poor:
- Check `blueprints/` directory for saved content
- Review extracted facts JSON
- May need to adjust prompt (lib/prompt-templates.ts)

### 4. Clear Cache
```javascript
// Add to a test route or run in dev console
import { clearScrapeCache } from '@/lib/scrape-cache';
clearScrapeCache();
```

---

## Testing Checklist

Before deploying scraping changes:

- [ ] Test 5+ different B2B SaaS sites (should all work)
- [ ] Test 1-2 large enterprise sites (graceful degradation)
- [ ] Test same URL twice (verify caching)
- [ ] Test with invalid URL (proper error handling)
- [ ] Test with protected site (clean error message)
- [ ] Check console logs for errors/warnings
- [ ] Verify `blueprints/` files are being saved (dev only)
- [ ] Run `npm run typecheck` (no TypeScript errors)
- [ ] Monitor memory usage (cache shouldn't grow unbounded)

---

## Cache Management

### View Cache Stats
```typescript
import { getCacheStats } from '@/lib/scrape-cache';
console.log(getCacheStats());
// { entries: 42, totalSizeBytes: 498234, avgAgeHours: 12 }
```

### Clear Cache Manually
```typescript
import { clearScrapeCache } from '@/lib/scrape-cache';
clearScrapeCache(); // Clears all cached scrapes
```

### Cache Behavior
- **TTL**: 7 days (604,800,000 ms)
- **Max entries**: 1000 (auto-evicts oldest)
- **Persistence**: In-memory (cleared on server restart)
- **Invalidation**: Automatic after 7 days

---

## Production Monitoring

### Key Metrics to Track

1. **Cache Hit Rate**
   - Target: 50-70% after first week
   - Formula: `hits / (hits + misses)`

2. **Average Scrape Time**
   - Target: <5s for 95th percentile
   - Track by URL pattern (e.g., *.com, *.io)

3. **Failure Rate**
   - Target: <10% overall
   - Separate by error type (timeout vs. blocked)

4. **API Cost**
   - Jina: Free (no limit)
   - OpenAI: ~$0.01-0.03 per analysis
   - Track: calls per day, cost per flow

### Alerting Thresholds
- **Critical**: >30% failure rate for 5+ minutes
- **Warning**: Average scrape time >15s
- **Info**: Cache hit rate <40% after 7 days

---

## Common Issues & Fixes

### Issue: "Request timed out after 15000ms"
**Cause**: Site is slow or Jina is overloaded  
**Fix**: This is expected for slow sites; fallback will trigger

### Issue: "All scraping methods failed"
**Cause**: Site blocks all automated access  
**Fix**: Expected for protected sites; show user-friendly error

### Issue: Cache not working (same URL always scrapes)
**Cause**: URL normalization issue or cache cleared  
**Debug**:
```javascript
// Check if URLs are being normalized correctly
import { getCacheStats } from '@/lib/scrape-cache';
console.log(getCacheStats()); // Should show entries > 0
```

### Issue: Memory keeps growing
**Cause**: Cache size exceeds 1000 entries  
**Fix**: Auto-eviction should handle this; check logs for eviction messages

### Issue: Stale cached data
**Cause**: Site updated within 7 days  
**Fix**: User can retry with `?refresh=true` (you'd need to add this param)

---

## Next Steps

### Optional Improvements
1. **Add cache refresh parameter**: `?refresh=true` to bypass cache
2. **Persistent cache**: Migrate to Redis or Vercel KV for production
3. **Cache warming**: Pre-scrape popular sites on deploy
4. **Progressive response**: Stream initial content before facts extraction
5. **User feedback**: "Is this data up to date?" button to trigger refresh

### Performance Tuning
- If timeouts increase: Raise `JINA_TIMEOUT` to 20s
- If cache hit rate is low: Increase `CACHE_TTL_MS` to 14 days
- If memory usage is high: Lower `MAX_CACHE_ENTRIES` to 500
