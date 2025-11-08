# Testing Guide

Comprehensive testing guide for Flowtusk MVP.

## Testing Philosophy

1. **Evidence Chain is Sacred** - Never break `sourceFactIds` or `evidence` fields
2. **User Experience First** - All existing features must work identically
3. **DB as Source of Truth** - State must persist across sessions
4. **Fail Gracefully** - Errors should not crash the app

## Pre-Deployment Testing Checklist

Run through ALL of these before deploying:

### Auth & Setup

- [ ] **Sign up new user**
  - Test email validation
  - Verify confirmation email arrives
  - Check user record in Supabase auth.users

- [ ] **Login existing user**
  - Test password validation
  - Verify session persists on refresh
  - Check session cookies are set

- [ ] **Protected routes redirect to login**
  - Visit `/app` while logged out
  - Should redirect to `/auth/login`

- [ ] **Logout clears session**
  - Click logout
  - Verify redirect to home
  - Confirm cannot access `/app`

- [ ] **Demo mode works** (if enabled)
  - Set `NEXT_PUBLIC_DEMO_MODE_ENABLED=true`
  - Visit `/app` without auth
  - Should work without login

- [ ] **Guest → signup migration**
  - Create flows as guest
  - Sign up
  - Verify flows are migrated to user account

### Flow Management

- [ ] **Create new flow → saves to DB**
  ```sql
  -- Verify in Supabase
  SELECT id, title, user_id, created_at
  FROM public.flows
  ORDER BY created_at DESC
  LIMIT 1;
  ```

- [ ] **List flows → loads from DB**
  - Refresh page
  - All flows appear in sidebar
  - Correct order (newest first)

- [ ] **Switch flows → loads correct state**
  - Create 2+ flows
  - Switch between them
  - Verify correct content loads

- [ ] **Soft delete flow → moves to archived**
  - Delete a flow
  - Check `archived_at` is set in DB
  - Flow disappears from active list

- [ ] **Restore flow → returns to active**
  - View archived flows
  - Restore one
  - Appears in active list

- [ ] **Duplicate title → handled gracefully**
  - Try creating flow with existing title
  - Should show user-friendly error
  - Suggest alternative title

- [ ] **Auto-save works**
  - Make changes to a flow
  - Wait 2 seconds
  - Refresh page
  - Changes are persisted

### Core Workflow (Evidence Chain Critical)

- [ ] **Paste URL → analyze website → facts_json populated**
  - Test with: https://stripe.com
  - Wait for analysis to complete
  - Check facts_json in DB:
  ```sql
  SELECT 
    id, 
    title,
    facts_json->'facts' as facts_array,
    jsonb_array_length(facts_json->'facts') as facts_count
  FROM public.flows
  WHERE website_url = 'https://stripe.com'
  ORDER BY created_at DESC
  LIMIT 1;
  ```
  - Verify facts have `id` and `evidence` fields

- [ ] **Generate ICPs → all have evidence field**
  - Generate ICPs for analyzed website
  - Check response in DevTools → Network
  - Verify each ICP has `evidence: ["fact-1", "fact-2"]`
  - Check DB:
  ```sql
  SELECT 
    id,
    title,
    selected_icp->'evidence' as icp_evidence
  FROM public.flows
  WHERE selected_icp IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;
  ```

- [ ] **Select ICP → saves to flow**
  - Click on an ICP card
  - Verify `selected_icp` is saved in DB
  - Evidence field is preserved

- [ ] **Generate value props → all have sourceFactIds**
  - Generate value propositions
  - Check API response
  - Each variation must have `sourceFactIds: ["fact-x", "fact-y"]`
  - Check DB:
  ```sql
  SELECT 
    id,
    generated_content->'valueProp'->'variations'->0->'sourceFactIds' as source_facts
  FROM public.flows
  WHERE generated_content IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;
  ```

- [ ] **Generate emails → have sourceFactIds**
  - Generate email (one-time or sequence)
  - Verify response has `sourceFactIds`
  - Evidence chain is intact

- [ ] **Run evidence validation test suite → all pass**
  ```bash
  npm run test:evidence
  ```

### Edge Cases

- [ ] **Malformed URL → shows error**
  - Try: "not-a-url"
  - Should show friendly error
  - App doesn't crash

- [ ] **404 URL → shows error**
  - Try: "https://thisurldoesnotexist123456.com"
  - Should show "Unable to access" message
  - Gracefully handled

- [ ] **Timeout simulation → shows retry**
  - Disconnect internet briefly
  - Try analyzing a website
  - Should show timeout error
  - Offer retry option

- [ ] **Missing evidence field → logs warning**
  - Check browser console
  - Should log warning, not crash

- [ ] **Corrupt facts JSON → validation catches it**
  - Validators should reject invalid schema
  - Check lib/validators.ts is working

### UI/UX

- [ ] **All existing features work identically**
  - Compare with main branch
  - No UI regressions

- [ ] **No console errors**
  - Open DevTools → Console
  - Should be clean (warnings OK)

- [ ] **Page reloads don't lose state**
  - Make changes
  - Refresh page
  - All changes persisted

- [ ] **Multiple tabs sync properly**
  - Open app in 2 tabs
  - Make change in tab 1
  - Refresh tab 2
  - Changes appear (via DB)

- [ ] **Export options work**
  - Export as PDF
  - Export to Google Slides
  - Export to LinkedIn
  - All formats work

- [ ] **Loading states show properly**
  - Should see skeletons during loading
  - Not blank screens

- [ ] **Error boundaries catch failures**
  - Should show friendly error page
  - Not white screen of death

### Performance

- [ ] **Initial load < 2s**
  - Use Lighthouse or WebPageTest
  - Time to Interactive < 2s

- [ ] **Flow switch < 500ms**
  - Switch between flows
  - Should feel instant

- [ ] **Auto-save debounced**
  - Type rapidly
  - Should not save on every keystroke
  - Debounced to 2s

- [ ] **Flow list pagination works for 50+ flows**
  - Create many flows
  - List loads efficiently
  - No performance degradation

### Migration

- [ ] **localStorage backup downloads**
  - Click migrate button
  - Backup JSON file downloads
  - Can open and view it

- [ ] **Migration runs without errors**
  - Click "Migrate to DB"
  - Should complete successfully
  - Check console for errors

- [ ] **Diff report shows all successes**
  - After migration completes
  - Report shows: X/X successful
  - Lists any failures

- [ ] **Evidence chain intact after migration**
  - Check migrated flows in DB
  - Verify evidence fields present
  - Run validation query:
  ```sql
  SELECT 
    COUNT(*) as total_flows,
    COUNT(CASE WHEN facts_json IS NOT NULL THEN 1 END) as flows_with_facts,
    COUNT(CASE WHEN selected_icp->'evidence' IS NOT NULL THEN 1 END) as flows_with_evidence
  FROM public.flows
  WHERE user_id IS NOT NULL;
  ```

- [ ] **localStorage clears only after confirmation**
  - Should prompt user
  - Requires explicit confirmation

### Analytics (Bonus)

- [ ] **Metadata tracks regeneration count**
  - Generate value props twice
  - Check `metadata.prompt_regeneration_count`
  - Should be > 0

- [ ] **Dropoff analytics view populated**
  ```sql
  SELECT * FROM flow_dropoff_analytics;
  ```
  - Should return data
  - Shows step distribution

- [ ] **Completion time tracked**
  - Complete a flow
  - Check `completed_at` is set
  - Calculate time from `created_at`

## Automated Testing

### Unit Tests

```bash
npm run test
```

Tests lib functions in isolation.

### Integration Tests

```bash
npm run test:integration
```

Tests API routes with actual HTTP calls.

### Evidence Chain Tests

```bash
npm run test:evidence
```

**CRITICAL**: These tests must pass before any deployment.

Tests:
- Facts JSON structure
- Evidence field presence
- sourceFactIds in all outputs
- DB persistence of evidence

### End-to-End Tests

```bash
npm run test:e2e
```

Simulates full user journeys with Playwright.

## Manual Testing Scenarios

### Scenario 1: New User Onboarding

1. Sign up as new user
2. Confirm email
3. Login
4. Create first flow
5. Analyze website (e.g., Stripe)
6. Generate ICPs
7. Select ICP
8. Generate value props
9. Generate email
10. Export

**Success criteria:** All steps complete, evidence chain intact, data in DB.

### Scenario 2: Power User with Many Flows

1. Login as existing user
2. Create 20 flows
3. Switch between them rapidly
4. Archive 5 flows
5. Restore 2 flows
6. Search/filter flows

**Success criteria:** No performance issues, all operations work.

### Scenario 3: Error Recovery

1. Start flow
2. Disconnect internet mid-analysis
3. Reconnect
4. Retry
5. Continue flow

**Success criteria:** Graceful error handling, can recover and continue.

### Scenario 4: Guest to User Migration

1. Use app as guest (demo mode)
2. Create 3 flows
3. Sign up
4. Verify all 3 flows migrated
5. Check evidence intact

**Success criteria:** Zero data loss, evidence preserved.

## Database Integrity Checks

### Check Evidence Chain

```sql
-- Find flows WITHOUT evidence (these are problems!)
SELECT 
  id,
  title,
  step,
  facts_json IS NULL as missing_facts,
  selected_icp->'evidence' IS NULL as missing_icp_evidence
FROM public.flows
WHERE user_id IS NOT NULL
AND (
  facts_json IS NULL 
  OR (selected_icp IS NOT NULL AND selected_icp->'evidence' IS NULL)
)
ORDER BY created_at DESC;
```

Expected: 0 rows (or only flows in 'initial' step)

### Check RLS Policies

```sql
-- As a test user, try to access another user's flow
-- This should return 0 rows
SELECT * FROM public.flows
WHERE user_id != auth.uid();
```

Expected: 0 rows (RLS is working)

### Check Orphaned Records

```sql
-- Find flows with no user
SELECT COUNT(*) as orphaned_flows
FROM public.flows
WHERE user_id IS NULL
AND metadata->>'is_demo' != 'true';
```

Expected: 0 (unless demo mode is enabled)

## Regression Testing

Before each major release, run ALL checklists above.

Focus areas:
1. Evidence chain (use automated tests)
2. Auth flow
3. DB persistence
4. UI/UX parity with main branch

## Reporting Issues

When reporting a bug, include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser console logs**
5. **Supabase SQL query results** (if DB-related)
6. **Evidence chain check** (if generation-related)

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/test.yml`) runs:

1. Linting
2. Type checking
3. Unit tests
4. **Evidence validation tests** (CRITICAL - must pass)

All checks must pass before merging to main.

