# Design Studio Refactoring Plan

## 🎯 Goal
Break down the monolithic `DesignStudioWorkspace.tsx` (1,265 lines) into modular, maintainable pieces.

## 📊 Current State Analysis

### Component Breakdown
- **DesignStudioWorkspace.tsx**: 1,265 lines
  - 15+ state variables
  - Data fetching (workspace, manifest)
  - Background generation orchestration
  - Chat message handling & streaming
  - Manifest update parsing (400+ lines)
  - Undo/redo history
  - Export functionality
  - UI rendering

### Existing Infrastructure
- ✅ Zustand stores exist (`lib/stores/use-copilot-store.ts`) but **not being used**
- ✅ Managers directory exists (`lib/managers/`)
- ✅ Types are centralized (`lib/stores/types.ts`)
- ❌ No custom hooks directory
- ❌ Update parsing logic is embedded in component

---

## 🏗️ Refactoring Strategy

### Phase 1: Extract Custom Hooks (Foundation)
**Goal**: Move state management and business logic into reusable hooks

#### 1.1 Create Hooks Directory Structure
```
lib/hooks/
├── design-studio/
│   ├── use-workspace-data.ts      # Data fetching (workspace + manifest)
│   ├── use-manifest.ts            # Manifest loading & polling
│   ├── use-chat-streaming.ts     # Chat messages & streaming
│   ├── use-manifest-updates.ts   # Parse & apply AI updates
│   ├── use-generation-orchestration.ts  # Background generation
│   ├── use-manifest-history.ts   # Undo/redo functionality
│   └── index.ts                  # Central exports
```

#### 1.2 Hook Specifications

**`use-workspace-data.ts`**
```typescript
export function useWorkspaceData(icpId: string, flowId: string) {
  // Returns: { workspaceData, designAssets, loading, error, reload }
  // Handles: /api/workspace fetching, error handling, initial value prop setup
}
```

**`use-manifest.ts`**
```typescript
export function useManifest(flowId: string, skipIfNoAssets?: boolean) {
  // Returns: { manifest, loading, error, reload }
  // Handles: /api/brand-manifest fetching, 30s polling, UI value prop sync
}
```

**`use-chat-streaming.ts`**
```typescript
export function useChatStreaming(
  flowId: string,
  icpId: string,
  workspaceData: CopilotWorkspaceData | null,
  onUpdate: (updates: ManifestUpdates) => void
) {
  // Returns: { messages, isStreaming, sendMessage, clearMessages }
  // Handles: Message state, streaming, API calls, update callbacks
}
```

**`use-manifest-updates.ts`**
```typescript
export function useManifestUpdates(
  workspaceData: CopilotWorkspaceData | null,
  designAssets: PositioningDesignAssets | null,
  onWorkspaceUpdate: (updates: Partial<WorkspaceData>) => void,
  onDesignAssetsUpdate: (updates: Partial<DesignAssets>) => void,
  onValuePropUpdate: (updates: Partial<UiValueProp>) => void
) {
  // Returns: { parseAndApplyUpdates }
  // Handles: All the 400+ lines of update parsing logic
  // Extracted to: lib/utils/manifest-updates.ts
}
```

**`use-generation-orchestration.ts`**
```typescript
export function useGenerationOrchestration(
  icpId: string,
  flowId: string,
  workspaceData: CopilotWorkspaceData | null,
  designAssets: PositioningDesignAssets | null,
  manifest: BrandManifest | null
) {
  // Returns: { 
  //   generationSteps, 
  //   isGeneratingBrand, 
  //   isGeneratingStyle, 
  //   isGeneratingLanding,
  //   triggerGeneration 
  // }
  // Handles: Sequential generation (brand → style → landing)
}
```

**`use-manifest-history.ts`**
```typescript
export function useManifestHistory(manifest: BrandManifest | null) {
  // Returns: { canUndo, canRedo, undo, redo, addToHistory }
  // Handles: ManifestHistory wrapper, keyboard shortcuts
}
```

---

### Phase 2: Extract Update Parsing Logic
**Goal**: Move 400+ lines of update parsing into a dedicated utility

#### 2.1 Create Update Parser Utility
```
lib/utils/
└── manifest-updates.ts
```

**Structure:**
```typescript
// lib/utils/manifest-updates.ts

export interface ManifestUpdateResult {
  type: 'manifest' | 'persona' | 'value-prop' | 'brand' | 'style' | 'landing';
  changes: string[];
  updates: any;
}

export function parseManifestUpdate(response: string): ManifestUpdateResult | null {
  // Extract __MANIFEST_UPDATED__ parsing
}

export function parseLegacyUpdates(response: string): ManifestUpdateResult | null {
  // Extract __FUNCTION_CALL__ and legacy JSON parsing
}

export function applyPersonaUpdates(
  workspaceData: CopilotWorkspaceData,
  updates: PersonaUpdates
): CopilotWorkspaceData {
  // Extract persona update logic
}

export function applyValuePropUpdates(
  uiValueProp: UiValueProp,
  updates: ValuePropUpdates
): UiValueProp {
  // Extract value prop update logic
}

export function applyBrandUpdates(
  designAssets: PositioningDesignAssets,
  updates: BrandUpdates
): PositioningDesignAssets {
  // Extract brand update logic
}

export function applyStyleGuideUpdates(
  designAssets: PositioningDesignAssets,
  updates: StyleGuideUpdates
): PositioningDesignAssets {
  // Extract style guide update logic
}

export function applyLandingPageUpdates(
  designAssets: PositioningDesignAssets,
  updates: LandingPageUpdates
): PositioningDesignAssets {
  // Extract landing page update logic
}

export function parseAndApplyUpdates(
  response: string,
  workspaceData: CopilotWorkspaceData | null,
  designAssets: PositioningDesignAssets | null,
  uiValueProp: UiValueProp | null,
  callbacks: {
    onWorkspaceUpdate: (data: CopilotWorkspaceData) => void;
    onDesignAssetsUpdate: (assets: PositioningDesignAssets) => void;
    onValuePropUpdate: (vp: UiValueProp) => void;
    onChatMessage: (message: ChatMessage) => void;
    onGenerationSteps: (steps: GenerationStep[]) => void;
    onToast: (message: string, type: ToastType) => void;
    onTabChange: (tab: TabType) => void;
  }
): ManifestUpdateResult | null {
  // Main orchestrator - calls all the above functions
}
```

---

### Phase 3: Enhance Zustand Store
**Goal**: Move component state to Zustand store (already exists but unused)

#### 3.1 Extend `use-copilot-store.ts`
Add missing state:
- `manifest: BrandManifest | null`
- `uiValueProp: UiValueProp | null`
- `generationSteps: GenerationStep[]`
- `toasts: ToastProps[]`
- `isGeneratingBrand/Style/Landing: boolean`
- `canUndo/canRedo: boolean`

Add actions:
- Manifest management
- UI value prop management
- Generation state management
- Toast management

#### 3.2 Migration Strategy
- Keep component state initially
- Gradually move to store
- Update hooks to use store
- Remove local state once migrated

---

### Phase 4: Extract Sub-Components
**Goal**: Break down UI rendering into smaller components

#### 4.1 Create Component Structure
```
components/design-studio/
├── DesignStudioHeader.tsx         # Back button, toolbar, chat toggle
├── DesignStudioLayout.tsx        # Main layout wrapper
└── DesignStudioErrorBoundary.tsx # Error state
```

**DesignStudioHeader.tsx**
- Back button
- Chat toggle button
- ToolBar integration
- Export/share handlers

**DesignStudioLayout.tsx**
- Chat panel + Canvas area layout
- Responsive handling
- Animation transitions

---

### Phase 5: Refactored Component Structure
**Goal**: Final clean component (~200-300 lines)

#### 5.1 New DesignStudioWorkspace.tsx
```typescript
export function DesignStudioWorkspace({ icpId, flowId }: Props) {
  // Hooks
  const workspace = useWorkspaceData(icpId, flowId);
  const manifest = useManifest(flowId, !workspace.designAssets);
  const chat = useChatStreaming(flowId, icpId, workspace.data, handleUpdates);
  const generation = useGenerationOrchestration(icpId, flowId, workspace.data, workspace.designAssets, manifest.data);
  const history = useManifestHistory(manifest.data);
  
  // Local UI state only
  const [activeTab, setActiveTab] = useState<TabType>("value-prop");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Handlers
  const handleUpdates = useManifestUpdates(/* ... */);
  const handleExport = useExportHandler(activeTab);
  
  // Render
  if (workspace.loading) return <LoadingState />;
  if (workspace.error) return <ErrorState error={workspace.error} />;
  
  return (
    <DesignStudioLayout
      header={<DesignStudioHeader {...headerProps} />}
      chat={<ChatPanel {...chatProps} />}
      canvas={<CanvasArea {...canvasProps} />}
    />
  );
}
```

---

## 📋 Implementation Checklist

### Phase 1: Hooks (Priority: HIGH)
- [ ] Create `lib/hooks/design-studio/` directory
- [ ] Extract `use-workspace-data.ts`
- [ ] Extract `use-manifest.ts`
- [ ] Extract `use-chat-streaming.ts`
- [ ] Extract `use-generation-orchestration.ts`
- [ ] Extract `use-manifest-history.ts`
- [ ] Create `lib/hooks/design-studio/index.ts`

### Phase 2: Update Parsing (Priority: HIGH)
- [ ] Create `lib/utils/manifest-updates.ts`
- [ ] Extract `parseManifestUpdate()`
- [ ] Extract `parseLegacyUpdates()`
- [ ] Extract `applyPersonaUpdates()`
- [ ] Extract `applyValuePropUpdates()`
- [ ] Extract `applyBrandUpdates()`
- [ ] Extract `applyStyleGuideUpdates()`
- [ ] Extract `applyLandingPageUpdates()`
- [ ] Extract `parseAndApplyUpdates()` orchestrator
- [ ] Create `use-manifest-updates.ts` hook wrapper

### Phase 3: Store Enhancement (Priority: MEDIUM)
- [ ] Extend `use-copilot-store.ts` with missing state
- [ ] Add manifest management actions
- [ ] Add UI value prop management
- [ ] Add generation state management
- [ ] Add toast management
- [ ] Update hooks to optionally use store

### Phase 4: Sub-Components (Priority: LOW)
- [ ] Create `DesignStudioHeader.tsx`
- [ ] Create `DesignStudioLayout.tsx`
- [ ] Create `DesignStudioErrorBoundary.tsx`

### Phase 5: Component Refactor (Priority: HIGH)
- [ ] Replace local state with hooks
- [ ] Remove embedded logic
- [ ] Simplify component to orchestration only
- [ ] Test all functionality
- [ ] Remove old code

---

## 🧪 Testing Strategy

### Unit Tests
- Test each hook independently
- Test update parsing functions
- Test generation orchestration logic

### Integration Tests
- Test hook composition
- Test store integration
- Test component rendering

### Manual Testing Checklist
- [ ] Workspace data loads correctly
- [ ] Manifest polling works
- [ ] Chat streaming works
- [ ] AI updates apply correctly
- [ ] Generation orchestration works
- [ ] Undo/redo works
- [ ] Export works
- [ ] Error states display correctly

---

## 📈 Success Metrics

### Code Quality
- ✅ Component size: < 300 lines (from 1,265)
- ✅ Hook size: < 200 lines each
- ✅ Utility functions: < 100 lines each
- ✅ Test coverage: > 80%

### Maintainability
- ✅ Single responsibility per file
- ✅ Easy to test in isolation
- ✅ Clear separation of concerns
- ✅ Reusable hooks

### Performance
- ✅ No performance regressions
- ✅ Same or better bundle size
- ✅ Same or better runtime performance

---

## 🚀 Implementation Order

1. **Week 1**: Phase 1 (Hooks) + Phase 2 (Update Parsing)
2. **Week 2**: Phase 3 (Store) + Phase 5 (Component Refactor)
3. **Week 3**: Phase 4 (Sub-Components) + Testing + Polish

---

## 📝 Notes

- Keep existing functionality 100% intact during refactor
- Use feature flags if needed for gradual rollout
- Document all hooks with JSDoc
- Add TypeScript strict mode checks
- Consider adding Storybook stories for hooks

---

## 🔗 Related Files

- `components/DesignStudioWorkspace.tsx` - Main component to refactor
- `lib/stores/use-copilot-store.ts` - Existing store (needs enhancement)
- `lib/manifest-history.ts` - Existing history management
- `lib/types/brand-manifest.ts` - Type definitions
- `lib/types/design-assets.ts` - Type definitions






