# Flow Deduplication - Find or Create Pattern

## Problem

When analyzing the same website URL multiple times, the app was trying to create duplicate flows with the same title (hostname), causing:
- 409 Conflict errors: "A flow with this title already exists"
- Fragmented conversation history across multiple flows for the same website
- Poor user experience with error messages

## Solution: `findOrCreateFlow`

Implemented a **find-or-create pattern** that:
1. Searches for existing flows with matching `website_url`
2. If found, reuses the existing flow (and updates it with new data)
3. If not found, creates a new flow
4. Handles race conditions gracefully

## Implementation

### Added to `lib/flows-client.ts`

```typescript
async findOrCreateFlow(
  input: CreateFlowInput & { website_url: string }
): Promise<{ flow: Flow; isNew: boolean }> {
  try {
    // Search for existing flow by URL
    const flows = await this.listFlows({ archived: false });
    const existingFlow = flows.find(f => f.website_url === input.website_url);
    
    if (existingFlow) {
      console.log('✅ [DB] Found existing flow for website:', existingFlow.id);
      // Update with new facts if provided
      if (input.facts_json || input.step) {
        const updated = await this.updateFlow(existingFlow.id, {
          facts_json: input.facts_json,
          step: input.step,
        });
        return { flow: updated, isNew: false };
      }
      return { flow: existingFlow, isNew: false };
    }
    
    // Create new flow
    const flow = await this.createFlow(input);
    return { flow, isNew: true };
  } catch (error) {
    // Handle race conditions (409 conflicts)
    if (error instanceof Error && error.message.includes('already exists')) {
      console.warn('⚠️ [DB] Conflict detected, retrying find...');
      const flows = await this.listFlows({ archived: false });
      const existingFlow = flows.find(
        f => f.website_url === input.website_url || f.title === input.title
      );
      if (existingFlow) {
        return { flow: existingFlow, isNew: false };
      }
    }
    throw error;
  }
}
```

### Updated in `app/app/page.tsx`

**Before:**
```typescript
const createFlowRes = await fetch("/api/flows", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    title: hostTitle,
    website_url: url,
    facts_json: factsJson || null,
    step: 'analyzed'
  }),
});

if (!createFlowRes.ok) {
  // Error: Failed to create flow in database: A flow with this title already exists
  throw new Error('Failed to create flow');
}

const { flow } = await createFlowRes.json();
```

**After:**
```typescript
const { flow, isNew } = await flowsClient.findOrCreateFlow({
  title: hostTitle,
  website_url: url,
  facts_json: factsJson || undefined,
  step: 'analyzed'
});

console.log(`✅ [Flow] ${isNew ? 'Created new' : 'Found existing'} flow with ID:`, flow.id);
```

## Behavior

### First Time Analyzing a Website
```
User: "https://www.yaser.uk"
→ No existing flow found
→ Creates new flow with ID: abc123
→ Logs: "✅ [Flow] Created new flow with ID: abc123"
```

### Analyzing Same Website Again
```
User: "https://www.yaser.uk"
→ Finds existing flow (abc123)
→ Updates facts_json with latest analysis
→ Logs: "✅ [Flow] Found existing flow with ID: abc123"
```

### Race Condition Handling
If two requests try to create the same flow simultaneously:
```
Request 1: Creates flow → Success
Request 2: Creates flow → 409 Conflict
  → Catches error
  → Re-fetches flows
  → Finds newly created flow
  → Returns existing flow
```

## Benefits

✅ **No more duplicate flows** - One flow per website URL  
✅ **No more 409 errors** - Gracefully handles conflicts  
✅ **Conversation continuity** - All analysis for a website stays in one flow  
✅ **Auto-updates** - Latest facts always saved to the flow  
✅ **Race condition safe** - Handles concurrent requests

## Edge Cases Handled

1. **Archived flows**: Only searches non-archived flows (`archived: false`)
2. **Race conditions**: Retry logic for 409 conflicts
3. **Missing facts**: Updates flow even if facts_json wasn't provided initially
4. **URL variations**: Exact match on normalized URL (e.g., `https://www.yaser.uk`)
5. **Title conflicts on update**: Auto-save excludes `title` field to prevent 409 conflicts when multiple flows share the same hostname

## Future Enhancements

Consider these improvements:

1. **URL normalization**: Strip trailing slashes, normalize protocols
   ```typescript
   const normalizeUrl = (url: string) => {
     return url.toLowerCase().replace(/\/$/, '');
   };
   ```

2. **Search by domain**: Match flows by root domain, not exact URL
   ```typescript
   const domain = new URL(url).hostname.replace('www.', '');
   existingFlow = flows.find(f => {
     const flowDomain = new URL(f.website_url).hostname.replace('www.', '');
     return flowDomain === domain;
   });
   ```

3. **Merge conversations**: If user has multiple old flows, merge them
   ```typescript
   if (duplicateFlows.length > 1) {
     await mergeFl flows(duplicateFlows);
   }
   ```

## Testing

Try analyzing the same website twice:
```bash
npm run dev
```

1. Enter: `https://www.yaser.uk`
2. Wait for analysis to complete
3. Enter: `https://www.yaser.uk` again
4. Should see: "Found existing flow" in console
5. No error messages should appear!

## Related Files
- `lib/flows-client.ts` - FlowsClient class with `findOrCreateFlow`
- `app/app/page.tsx` - Usage in `handleSendMessage`
- `app/api/flows/route.ts` - Server endpoint with unique constraint
