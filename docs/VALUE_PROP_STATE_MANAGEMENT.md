# Value Prop State Management

## Problem

Previously, the Design Studio had a confusing data flow:
1. Database stored value props in a complex nested structure (`variations`, `summary` fields)
2. `DesignStudioWorkspace` transformed this into a flat `currentProject.valueProp` object
3. Chat updates modified `workspaceData` (the database structure)
4. But `currentProject` was **not reactive** to these changes
5. Result: UI didn't update when users sent chat prompts

## Solution

Implemented a **single source of truth pattern** with three key improvements:

### 1. UI State Layer (`uiValueProp`)

Created a flattened, UI-friendly state that holds the "live" value prop data:

```typescript
type UiValueProp = {
  headline: string;
  subheadline: string;
  problem: string;
  solution: string;
  outcome: string;
  benefits: string[];
  targetAudience: string;
};
```

### 2. Reactive Computation with `useMemo`

`currentProject` now recomputes whenever `uiValueProp` changes:

```typescript
const currentProject = useMemo(() => {
  if (!workspaceData || !uiValueProp) return null;
  return {
    // ...
    valueProp: {
      ...uiValueProp,
      ctaSuggestions: ["Get Started", "Learn More", "Try Free"],
    },
  };
}, [workspaceData, uiValueProp, designAssets, chatMessages]);
```

### 3. Debounced Persistence

UI changes auto-save to the database after 2 seconds of inactivity (prevents API spam):

```typescript
useEffect(() => {
  if (!uiValueProp || !workspaceData) return;
  
  const timeout = setTimeout(async () => {
    // Auto-save to /api/value-props/update
  }, 2000);
  
  return () => clearTimeout(timeout);
}, [uiValueProp]);
```

## Data Flow

```
┌─────────────────┐
│  User Prompt    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Chat API parses │
│ returns updates │
└────────┬────────┘
         │
         v
┌─────────────────┐      Instant!
│ setUiValueProp  │────────────────┐
└────────┬────────┘                │
         │                         v
         │              ┌──────────────────┐
         │              │  UI Re-renders   │
         │              │ (ValuePropCanvas)│
         │              └──────────────────┘
         v
  [2s debounce]
         │
         v
┌─────────────────┐
│  Auto-save to   │
│    Database     │
└─────────────────┘
```

## Benefits

✅ **Instant UI updates** – No confusing mapping logic  
✅ **Simple update logic** – Just spread new values into `uiValueProp`  
✅ **Auto-persistence** – No manual save calls needed  
✅ **Single source of truth** – `uiValueProp` drives the UI  
✅ **Works with existing DB** – No schema changes required

## Next Steps

### TODO: Implement persistence endpoint

The debounced save is currently commented out. To enable it:

1. Create `/api/value-props/update/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();
  const { icpId, flowId, headline, problem, solution, outcome, benefits, targetAudience } = body;

  // Update positioning_value_props table
  // Map flat structure back to database schema
  const { error } = await supabase
    .from('positioning_value_props')
    .update({
      variations: benefits.map((b: string, i: number) => ({ id: `var-${i}`, text: b })),
      summary: {
        mainInsight: problem,
        approachStrategy: solution,
        expectedImpact: outcome,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('positioning_icp_id', icpId)
    .eq('positioning_flow_id', flowId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

2. Uncomment the `fetch` call in `DesignStudioWorkspace.tsx` (line 118-122)

## Testing

1. Start the dev server: `npm run dev`
2. Open Design Studio
3. Send a chat prompt like: "update the value prop to be for construction managers in Nepal"
4. Watch the right-side UI update **instantly**
5. Check console logs for auto-save messages after 2 seconds

## Troubleshooting

**Q: UI still not updating?**  
A: Check that the chat API returns proper `updates` object with fields like `problem`, `solution`, etc.

**Q: Auto-save not working?**  
A: Make sure to uncomment the persistence code and implement the `/api/value-props/update` endpoint.

**Q: Initial load shows wrong data?**  
A: Check the `useEffect` that initializes `uiValueProp` from `workspaceData` (line 84).
