# Design Studio Refactor - Quick Start Guide

## 🎯 Quick Overview

**Before**: 1,265-line monolithic component  
**After**: Modular hooks + utilities + clean component (~200-300 lines)

## 📁 New File Structure

```
lib/
├── hooks/
│   └── design-studio/
│       ├── use-workspace-data.ts
│       ├── use-manifest.ts
│       ├── use-chat-streaming.ts
│       ├── use-manifest-updates.ts
│       ├── use-generation-orchestration.ts
│       ├── use-manifest-history.ts
│       └── index.ts
├── utils/
│   └── manifest-updates.ts  (400+ lines extracted here)
└── stores/
    └── use-copilot-store.ts  (enhanced)

components/
└── design-studio/
    ├── DesignStudioHeader.tsx
    ├── DesignStudioLayout.tsx
    └── DesignStudioErrorBoundary.tsx
```

## 🔄 Migration Path

### Step 1: Extract Update Parsing (Easiest, No Dependencies)
**File**: `lib/utils/manifest-updates.ts`

Copy the `parseAndApplyUpdates` function (lines 757-1151) and break it into:
- `parseManifestUpdate()` - Handle `__MANIFEST_UPDATED__`
- `parseLegacyUpdates()` - Handle `__FUNCTION_CALL__` and legacy JSON
- `applyPersonaUpdates()` - Persona update logic
- `applyValuePropUpdates()` - Value prop update logic
- `applyBrandUpdates()` - Brand update logic
- `applyStyleGuideUpdates()` - Style guide update logic
- `applyLandingPageUpdates()` - Landing page update logic
- `parseAndApplyUpdates()` - Main orchestrator

**Test**: Create a test file to verify parsing logic works

### Step 2: Create Hooks (Build Foundation)
**Files**: `lib/hooks/design-studio/*.ts`

Start with the simplest hooks first:

1. **`use-manifest-history.ts`** (Simplest)
   - Wrap existing `ManifestHistory` class
   - Add keyboard shortcuts
   - ~50 lines

2. **`use-workspace-data.ts`**
   - Extract `loadWorkspaceData` function (lines 89-173)
   - Add error handling
   - Return `{ workspaceData, designAssets, loading, error, reload }`
   - ~100 lines

3. **`use-manifest.ts`**
   - Extract `loadManifest` function (lines 174-220)
   - Add polling logic (lines 231-234)
   - Return `{ manifest, loading, error, reload }`
   - ~80 lines

4. **`use-generation-orchestration.ts`**
   - Extract `triggerBackgroundGeneration` (lines 319-452)
   - Extract `generateStyleGuide` (lines 454-486)
   - Extract `generateLandingPage` (lines 488-520)
   - Return `{ generationSteps, isGenerating*, triggerGeneration }`
   - ~200 lines

5. **`use-chat-streaming.ts`**
   - Extract `handleSendMessage` (lines 615-755)
   - Use `parseAndApplyUpdates` from utils
   - Return `{ messages, isStreaming, sendMessage }`
   - ~150 lines

6. **`use-manifest-updates.ts`**
   - Wrap `parseAndApplyUpdates` from utils
   - Provide callbacks for state updates
   - Return `{ parseAndApplyUpdates }`
   - ~50 lines

### Step 3: Update Component (Use Hooks)
**File**: `components/DesignStudioWorkspace.tsx`

Replace local state with hooks:

```typescript
// BEFORE (lines 44-86)
const [workspaceData, setWorkspaceData] = useState<...>(null);
const [designAssets, setDesignAssets] = useState<...>(null);
const [manifest, setManifest] = useState<...>(null);
// ... 12 more state variables

// AFTER
const workspace = useWorkspaceData(icpId, flowId);
const manifest = useManifest(flowId, !workspace.designAssets);
const chat = useChatStreaming(flowId, icpId, workspace.data, handleUpdates);
const generation = useGenerationOrchestration(icpId, flowId, workspace.data, workspace.designAssets, manifest.data);
const history = useManifestHistory(manifest.data);
```

### Step 4: Enhance Store (Optional, Gradual)
**File**: `lib/stores/use-copilot-store.ts`

Add missing state gradually:
- Start with read-only state (manifest, uiValueProp)
- Move write operations later
- Keep hooks working with or without store

## 🧪 Testing Each Phase

### Phase 1: Update Parsing
```typescript
// lib/utils/__tests__/manifest-updates.test.ts
describe('parseManifestUpdate', () => {
  it('should parse __MANIFEST_UPDATED__ format', () => {
    const response = '__MANIFEST_UPDATED__{"identity": {...}}';
    const result = parseManifestUpdate(response);
    expect(result).toBeTruthy();
  });
});
```

### Phase 2: Hooks
```typescript
// lib/hooks/design-studio/__tests__/use-workspace-data.test.ts
describe('useWorkspaceData', () => {
  it('should load workspace data', async () => {
    const { result } = renderHook(() => useWorkspaceData('icp-1', 'flow-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.workspaceData).toBeTruthy();
  });
});
```

### Phase 3: Component
- Manual testing: Load design studio, test all features
- Verify no regressions
- Check console for errors

## 📝 Code Examples

### Hook Example: `use-workspace-data.ts`
```typescript
export function useWorkspaceData(icpId: string, flowId: string) {
  const [workspaceData, setWorkspaceData] = useState<CopilotWorkspaceData | null>(null);
  const [designAssets, setDesignAssets] = useState<PositioningDesignAssets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspace?icpId=${icpId}&flowId=${flowId}`);
      if (!res.ok) throw new Error("Failed to load workspace data");
      const { icp, valueProp, designAssets: assets } = await res.json();
      if (!icp) throw new Error("Persona not found");
      
      setWorkspaceData({ persona: icp, valueProp: valueProp || null, designAssets: assets || null });
      setDesignAssets(assets || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [icpId, flowId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    workspaceData,
    designAssets,
    loading,
    error,
    reload: load,
  };
}
```

### Utility Example: `manifest-updates.ts`
```typescript
export function applyPersonaUpdates(
  workspaceData: CopilotWorkspaceData,
  updates: { persona?: PersonaUpdates }
): CopilotWorkspaceData {
  if (!updates.persona) return workspaceData;

  const personaUpdates: any = {};
  if (updates.persona.name) personaUpdates.persona_name = updates.persona.name;
  if (updates.persona.company) personaUpdates.persona_company = updates.persona.company;
  if (updates.persona.location) personaUpdates.location = updates.persona.location;
  if (updates.persona.country) personaUpdates.country = updates.persona.country;

  return {
    ...workspaceData,
    persona: {
      ...workspaceData.persona,
      ...personaUpdates,
    },
  };
}
```

## ⚠️ Common Pitfalls

1. **Don't break existing functionality** - Test after each extraction
2. **Don't over-abstract** - Keep hooks focused on one concern
3. **Don't forget error handling** - Each hook should handle its own errors
4. **Don't skip TypeScript** - Add proper types for all functions
5. **Don't rush** - Do one hook at a time, test, then move on

## ✅ Success Criteria

- [ ] Component is < 300 lines
- [ ] All hooks are < 200 lines
- [ ] All utilities are < 100 lines
- [ ] All tests pass
- [ ] No functionality regressions
- [ ] TypeScript strict mode passes
- [ ] No console errors

## 🚀 Next Steps

1. Read the full plan: `DESIGN_STUDIO_REFACTOR_PLAN.md`
2. Start with Phase 1 (Update Parsing) - easiest, no dependencies
3. Then Phase 2 (Hooks) - build one at a time
4. Finally Phase 3 (Component) - wire everything together






