

# Flowtusk Testing Guide

Comprehensive testing guide for evidence chain preservation, edge cases, and production readiness.

## Quick Test Commands

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run evidence chain validation
npm run test:evidence

# Type checking
npm run typecheck

# Lint
npm run lint
```

## Critical: Evidence Chain Testing

**The evidence chain is your competitive moat. Never skip these tests.**

### Manual Evidence Chain Verification

1. **Test Facts Extraction**

```bash
# Start dev server
npm run dev

# In browser:
# 1. Paste URL: https://stripe.com
# 2. Wait for analysis
# 3. Open DevTools → Network → find analyze-website response
# 4. Verify response has:
```

```json
{
  "factsJson": {
    "facts": [
      {
        "id": "fact-1",
        "text": "...",
        "page": "...",
        "evidence": "exact snippet"  // ✅ MUST be present
      }
    ],
    "valueProps": [
      {
        "id": "v1",
        "text": "...",
        "evidence": ["fact-1", "fact-2"]  // ✅ MUST reference fact IDs
      }
    ]
  }
}
```

2. **Test ICP Generation**

```javascript
// In browser console after ICPs generated:
const icps = JSON.parse(sessionStorage.getItem('latest_icps'));
console.log('Evidence check:', icps.map(icp => ({
  title: icp.title,
  hasEvidence: Array.isArray(icp.evidence) && icp.evidence.length > 0
})));
// All should show hasEvidence: true ✅
```

3. **Test Value Props**

```javascript
// After value props generated:
const valueProps = JSON.parse(sessionStorage.getItem('latest_value_props'));
console.log('SourceFacts check:', valueProps.variations.map(v => ({
  style: v.style,
  hasSourceFacts: Array.isArray(v.sourceFactIds) && v.sourceFactIds.length > 0
})));
// All should show hasSourceFacts: true ✅
```

4. **Test Database Persistence**

```sql
-- Run in Supabase SQL Editor after flow completion
SELECT 
  id,
  title,
  
  -- Check facts_json has evidence
  jsonb_array_length(facts_json->'facts') as fact_count,
  (
    SELECT count(*)
    FROM jsonb_array_elements(facts_json->'facts') as fact
    WHERE fact->>'evidence' IS NOT NULL
  ) as facts_with_evidence,
  
  -- Check selected_icp has evidence
  jsonb_array_length(selected_icp->'evidence') as icp_evidence_count,
  
  -- Check value props have sourceFactIds
  (
    SELECT count(*)
    FROM jsonb_array_elements(generated_content->'valueProp'->'variations') as variation
    WHERE jsonb_array_length(variation->'sourceFactIds') > 0
  ) as variations_with_source_facts

FROM flows
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;
```

Expected: All counts > 0 ✅

### Automated Evidence Chain Tests

Create `tests/evidence-chain.test.ts`:

```typescript
import { describe, test, expect } from 'vitest';

describe('Evidence Chain Integrity', () => {
  test('Facts JSON has evidence field for each fact', async () => {
    const response = await fetch('/api/analyze-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://stripe.com' })
    });
    
    const data = await response.json();
    expect(data.factsJson.facts).toBeDefined();
    
    data.factsJson.facts.forEach((fact: any) => {
      expect(fact.evidence).toBeDefined();
      expect(typeof fact.evidence).toBe('string');
      expect(fact.evidence.length).toBeGreaterThan(0);
    });
  });

  test('ICP generation includes evidence array', async () => {
    // Mock or use actual API call
    const icps = await generateICPs(mockFactsJson);
    
    icps.forEach((icp: any) => {
      expect(Array.isArray(icp.evidence)).toBe(true);
      expect(icp.evidence.length).toBeGreaterThan(0);
    });
  });

  test('Value prop variations have sourceFactIds', async () => {
    const valueProps = await generateValueProps(mockFactsJson, mockICP);
    
    valueProps.variations.forEach((variation: any) => {
      expect(Array.isArray(variation.sourceFactIds)).toBe(true);
      expect(variation.sourceFactIds.length).toBeGreaterThan(0);
    });
  });
});
```

## Edge Case Testing

### 1. Malformed URLs

```bash
# Test in browser:
Inputs to test:
- "not-a-url"
- "htp://broken.com"
- "javascript:alert(1)"
- "file:///etc/passwd"
- ""
- "   "

Expected behavior:
- Shows error message
- Doesn't crash
- Logs error gracefully
```

### 2. 404 / Unreachable URLs

```bash
Test URLs:
- "https://thissitedoesnotexist12345.com"
- "https://httpstat.us/404"
- "https://httpstat.us/500"

Expected:
- "Unable to access website" message
- Suggests checking URL
- Doesn't hang forever (30s timeout)
```

### 3. Timeout Simulation

```javascript
// In lib/api-handler.ts, temporarily set timeout to 1ms
// Then test with any URL
// Expected: Shows timeout error, suggests retry
```

### 4. Missing/Corrupt Evidence

```typescript
// Mock API response with missing evidence
const corruptFactsJson = {
  facts: [
    { id: "fact-1", text: "...", evidence: null },  // ❌ Missing
    { id: "fact-2", text: "..." },  // ❌ Missing field
  ]
};

// Test that validation catches this
const validation = validateFactsJSON(corruptFactsJson);
expect(validation.ok).toBe(false);
expect(validation.errors).toContain('Missing evidence field');
```

## Integration Testing

### Flow CRUD Operations

```typescript
describe('Flow API', () => {
  test('Create flow persists evidence fields', async () => {
    const flow = await flowsClient.createFlow({
      title: 'Test Flow',
      facts_json: mockFactsJsonWithEvidence,
    });
    
    expect(flow.facts_json.facts[0].evidence).toBeDefined();
  });

  test('Update flow preserves sourceFactIds', async () => {
    const updated = await flowsClient.updateFlow(flowId, {
      generated_content: { valueProps: mockValuePropsWithSourceFactIds }
    });
    
    expect(updated.generated_content.valueProps.variations[0].sourceFactIds).toBeDefined();
  });

  test('Soft delete does not lose data', async () => {
    await flowsClient.softDeleteFlow(flowId);
    const archived = await flowsClient.listFlows({ archived: true });
    
    expect(archived.find(f => f.id === flowId)).toBeDefined();
  });

  test('Duplicate title returns 409', async () => {
    await flowsClient.createFlow({ title: 'Duplicate' });
    
    await expect(
      flowsClient.createFlow({ title: 'Duplicate' })
    ).rejects.toThrow('already exists');
  });
});
```

## Performance Testing

### Load Testing

```bash
# Install Artillery
npm install -g artillery

# Create artillery.yml:
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
      
scenarios:
  - name: 'Create and analyze flow'
    flow:
      - post:
          url: '/api/flows'
          json:
            title: 'Test Flow'
      - post:
          url: '/api/analyze-website'
          json:
            url: 'https://stripe.com'

# Run test
artillery run artillery.yml
```

Expected:
- P95 latency < 3s for analyze-website
- P95 latency < 500ms for flow CRUD
- No errors under 5 req/s load

### Database Performance

```sql
-- Check slow queries in Supabase
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100  -- > 100ms
ORDER BY mean_time DESC
LIMIT 10;
```

## UI/UX Testing Checklist

### Auth Flow
- [ ] Sign up with valid email
- [ ] Receive confirmation email
- [ ] Click confirmation link → redirects to login
- [ ] Log in → redirects to /app
- [ ] Protected routes redirect to /auth/login when not authenticated
- [ ] Logout clears session

### Flow Management
- [ ] Create new flow → appears in sidebar
- [ ] Switch flows → loads correct state
- [ ] Rename flow → updates immediately
- [ ] Delete flow → moves to archived
- [ ] Restore flow → returns to active list
- [ ] Duplicate title → shows error, suggests alternative

### Core Workflow
- [ ] Paste URL → shows loading state
- [ ] Analysis completes → facts_json populated
- [ ] Generate ICPs → 3 profiles displayed
- [ ] Select ICP → saves to DB
- [ ] Generate value props → variations shown
- [ ] Generate email → preview displayed
- [ ] Export → downloads file
- [ ] Refresh page → all state persists

### Error Handling
- [ ] Invalid URL → shows error, doesn't crash
- [ ] API timeout → shows retry button
- [ ] Network offline → shows offline message
- [ ] DB error → caught by error boundary
- [ ] Console has no errors (except expected warnings)

### Performance
- [ ] Initial load < 2s
- [ ] Flow switch < 500ms
- [ ] Auto-save debounced (not every keystroke)
- [ ] Loading skeletons show during fetch
- [ ] No layout shift (CLS)

## Multi-User Testing

### Concurrent Access

```bash
# Open 2 browser windows (different sessions)
# User A: Create flow "Test"
# User B: Create flow "Test"
# Both should succeed (different user_id)

# User A: Try to access User B's flow by ID
# Should get 403 Forbidden (RLS working)
```

### Multi-Tab Sync

```bash
# Open 2 tabs, same user
# Tab 1: Edit flow title
# Tab 2: Refresh
# Should see updated title (DB is source of truth)
```

## Migration Testing

### localStorage → DB Migration

```bash
# Prerequisites: Have data in localStorage
# 1. Log in
# 2. See migration prompt
# 3. Click "Download Backup"
# 4. Verify flowtusk-backup-*.json downloads
# 5. Click "Migrate Now"
# 6. Wait for completion
# 7. Review diff report:
#    - Total: X
#    - Success: X
#    - Failed: 0
#    - Evidence integrity: 100%
# 8. Verify all flows appear in UI
# 9. localStorage cleared after confirmation
```

## Regression Testing

After any code changes, run this checklist:

- [ ] Evidence chain tests pass
- [ ] Integration tests pass
- [ ] All edge case tests pass
- [ ] Performance hasn't degraded
- [ ] No new console errors
- [ ] Linter passes
- [ ] TypeScript compiles with no errors

## CI/CD Integration

Your `.github/workflows/test.yml` should:

```yaml
- name: Evidence Chain Tests
  run: npm run test:evidence
  # This MUST pass before merging

- name: Integration Tests
  run: npm run test:integration

- name: Lint & Type Check
  run: |
    npm run lint
    npm run typecheck
```

## Manual QA Checklist (Before Release)

- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test with slow 3G network
- [ ] Test with ad blocker enabled
- [ ] Test with JavaScript disabled (should show fallback)
- [ ] Test with screen reader (basic accessibility)
- [ ] Cross-browser auth flow
- [ ] Verify no CORS errors
- [ ] Check all environment variables set
- [ ] Verify RLS policies active
- [ ] Test with real OpenAI API key
- [ ] Monitor costs (OpenAI usage)

## Debugging Tips

### Evidence Chain Missing

```bash
# 1. Check API response
curl -X POST http://localhost:3000/api/analyze-website \
  -H "Content-Type: application/json" \
  -d '{"url":"https://stripe.com"}' | jq '.factsJson.facts[0].evidence'

# Should return: "some text snippet"

# 2. Check prompt templates unchanged
git diff main lib/prompt-templates.ts
# Should be empty

# 3. Validate schema
node -e "const v = require('./lib/validators'); console.log(v.validateFactsJSON(require('./test-facts.json')))"
```

### DB Not Persisting

```bash
# Check RLS
# In Supabase SQL Editor:
SELECT * FROM flows WHERE id = 'your-flow-id';
# If returns nothing, RLS may be blocking

# Disable RLS temporarily:
ALTER TABLE flows DISABLE ROW LEVEL SECURITY;
# Try query again
# Re-enable after testing:
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
```

## Continuous Monitoring

Post-deployment:

```bash
# Monitor Vercel logs
vercel logs --follow

# Monitor Supabase logs
# Dashboard → Logs → API / Postgres

# Check error rate
# Should be < 1% 
```

## Success Metrics

Before considering testing complete:

- ✅ 100% evidence chain integrity
- ✅ 0 failed edge case tests
- ✅ < 2s initial load time
- ✅ < 1% error rate
- ✅ All integration tests pass
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ RLS policies verified
- ✅ Migration tested successfully
