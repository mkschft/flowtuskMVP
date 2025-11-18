# Auto-Save Title Conflict Fix

## Problem

After implementing `findOrCreateFlow`, a new error appeared:

```
❌ PATCH http://localhost:3000/api/flows/a7...
    409 (Conflict)

❌ [DB] Auto-save failed: Error 
    title already exists
    at FlowsClient.updateFlow
```

## Root Cause

The auto-save mechanism was trying to update the flow's `title` field, but the unique constraint on `title` caused conflicts when:

1. User analyzes `taxstar.app` → Creates flow with `title: "taxstar.app"`
2. User analyzes same website again → `findOrCreateFlow` finds existing flow
3. Local state calls `updateConversationTitle("taxstar.app")` ← Updates local UI
4. Auto-save fires → Tries to update DB with `title: "taxstar.app"`
5. **409 Conflict** → Another flow already has this title!

## Why This Happens

Even though `findOrCreateFlow` prevents creating duplicate flows, if you:
- Analyze `taxstar.app` in conversation A
- Switch to conversation B
- Analyze `taxstar.app` again in conversation B

You now have **two conversations pointing to the same flow**, but with potentially different local titles. When auto-save tries to sync the title back to the database, it conflicts with the unique constraint.

## Solution

**Remove `title` from auto-save updates** because:
1. Title is set **once** during flow creation
2. Title should not change after creation (it's the hostname)
3. Local conversation title can differ from DB flow title (it's just UI state)

### Code Change

`app/app/page.tsx` line 339:

**Before:**
```typescript
await flowsClient.debouncedUpdate(conversation.id, {
  title: conversation.title,  // ← Causes 409 conflicts!
  website_url: conversation.memory.websiteUrl,
  facts_json: conversation.memory.factsJson,
  // ...
});
```

**After:**
```typescript
await flowsClient.debouncedUpdate(conversation.id, {
  // Don't update title to avoid 409 conflicts with other flows
  // (title is set once during creation via findOrCreateFlow)
  website_url: conversation.memory.websiteUrl,
  facts_json: conversation.memory.factsJson,
  // ...
});
```

## Result

✅ Auto-save no longer tries to update `title`  
✅ No more 409 Conflict errors  
✅ Flow title remains stable (set at creation)  
✅ Local conversation title can still be different for UI purposes

## Alternative Considered

**Option 1: Make title non-unique** ❌
- Would allow duplicates
- Defeats the purpose of deduplication
- Not a good solution

**Option 2: Only update title if it changed** ⚠️
- Still causes conflicts if two conversations have same title
- Adds complexity
- Doesn't solve root issue

**Option 3: Don't update title (chosen)** ✅
- Simple and effective
- Title is just a label, doesn't need to change
- Prevents all title-related conflicts

## When Title Updates Do Matter

If you truly need to update a flow's title (e.g., user manually renames it), do it explicitly:

```typescript
// Explicit title update (not via auto-save)
await flowsClient.updateFlow(flowId, {
  title: newTitle // Only if user explicitly requests rename
});
```

But for auto-save, title should be excluded.

## Testing

1. Analyze `taxstar.app` → Should work ✅
2. Refresh page
3. Analyze `taxstar.app` again → Should find existing flow ✅
4. Wait for auto-save (2 seconds)
5. Check console → Should see "✅ [DB] Auto-saved" with **no errors** ✅

## Related Files
- `app/app/page.tsx` - Removed title from auto-save
- `lib/flows-client.ts` - Update logic
- `docs/FLOW_DEDUPLICATION.md` - Parent documentation
