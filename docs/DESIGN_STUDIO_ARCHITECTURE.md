# Design Studio Architecture

## 📐 Current Architecture (Before Refactor)

```
DesignStudioWorkspace.tsx (1,265 lines)
├── State Management (15+ useState hooks)
│   ├── workspaceData
│   ├── designAssets
│   ├── manifest
│   ├── uiValueProp
│   ├── chatMessages
│   ├── generationSteps
│   ├── toasts
│   └── ... 8 more
│
├── Data Fetching
│   ├── loadWorkspaceData() - 85 lines
│   └── loadManifest() - 45 lines
│
├── Business Logic
│   ├── triggerBackgroundGeneration() - 135 lines
│   ├── generateStyleGuide() - 33 lines
│   ├── generateLandingPage() - 33 lines
│   └── parseAndApplyUpdates() - 395 lines ⚠️
│
├── Chat Handling
│   └── handleSendMessage() - 140 lines
│
├── History Management
│   ├── handleUndo() - 18 lines
│   └── handleRedo() - 18 lines
│
└── UI Rendering
    ├── Loading state
    ├── Error state
    └── Main layout (Chat + Canvas)
```

**Problems:**
- ❌ Everything in one file
- ❌ Hard to test
- ❌ Hard to reuse
- ❌ Hard to maintain
- ❌ 400+ lines of update parsing embedded

---

## 🏗️ Target Architecture (After Refactor)

```
lib/hooks/design-studio/
├── use-workspace-data.ts (~100 lines)
│   └── Data fetching & error handling
│
├── use-manifest.ts (~80 lines)
│   └── Manifest loading & polling
│
├── use-chat-streaming.ts (~150 lines)
│   └── Chat messages & streaming
│
├── use-manifest-updates.ts (~50 lines)
│   └── Wrapper for update parsing
│
├── use-generation-orchestration.ts (~200 lines)
│   └── Background generation logic
│
└── use-manifest-history.ts (~50 lines)
    └── Undo/redo functionality

lib/utils/
└── manifest-updates.ts (~400 lines)
    ├── parseManifestUpdate()
    ├── parseLegacyUpdates()
    ├── applyPersonaUpdates()
    ├── applyValuePropUpdates()
    ├── applyBrandUpdates()
    ├── applyStyleGuideUpdates()
    ├── applyLandingPageUpdates()
    └── parseAndApplyUpdates() (orchestrator)

lib/stores/
└── use-copilot-store.ts (enhanced)
    └── Global state (optional, gradual migration)

components/design-studio/
├── DesignStudioWorkspace.tsx (~200-300 lines) ✨
│   └── Orchestration only
│
├── DesignStudioHeader.tsx (~50 lines)
│   └── Back button, toolbar, chat toggle
│
└── DesignStudioLayout.tsx (~80 lines)
    └── Layout wrapper
```

---

## 🔄 Data Flow

### Before (Monolithic)
```
User Action
    ↓
DesignStudioWorkspace.handleSendMessage()
    ↓
API Call
    ↓
parseAndApplyUpdates() [400 lines inline]
    ↓
setState() [15+ state updates]
    ↓
Re-render entire component
```

### After (Modular)
```
User Action
    ↓
useChatStreaming.sendMessage()
    ↓
API Call
    ↓
useManifestUpdates.parseAndApplyUpdates()
    ↓
lib/utils/manifest-updates.ts [extracted logic]
    ↓
Callback to update state
    ↓
Hooks update → Component re-renders
```

---

## 🧩 Hook Dependencies

```
useWorkspaceData
    ↓
useManifest (depends on workspaceData)
    ↓
useGenerationOrchestration (depends on workspaceData, manifest)
    ↓
useChatStreaming (depends on workspaceData, uses useManifestUpdates)
    ↓
useManifestUpdates (uses manifest-updates.ts utility)
    ↓
useManifestHistory (depends on manifest)
```

---

## 📦 Component Composition

### DesignStudioWorkspace (After)
```typescript
export function DesignStudioWorkspace({ icpId, flowId }) {
  // Hooks (data & logic)
  const workspace = useWorkspaceData(icpId, flowId);
  const manifest = useManifest(flowId, !workspace.designAssets);
  const chat = useChatStreaming(flowId, icpId, workspace.data, handleUpdates);
  const generation = useGenerationOrchestration(...);
  const history = useManifestHistory(manifest.data);
  
  // Local UI state only
  const [activeTab, setActiveTab] = useState("value-prop");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Handlers (thin wrappers)
  const handleUpdates = useManifestUpdates(...);
  const handleExport = useExportHandler(activeTab);
  
  // Render
  return (
    <DesignStudioLayout
      header={<DesignStudioHeader />}
      chat={<ChatPanel {...chat} />}
      canvas={<CanvasArea activeTab={activeTab} />}
    />
  );
}
```

**Lines of code: ~200-300** (down from 1,265)

---

## 🎯 Separation of Concerns

| Concern | Location | Lines |
|---------|----------|-------|
| Data Fetching | `use-workspace-data.ts` | ~100 |
| Manifest Management | `use-manifest.ts` | ~80 |
| Chat Logic | `use-chat-streaming.ts` | ~150 |
| Update Parsing | `manifest-updates.ts` | ~400 |
| Generation Logic | `use-generation-orchestration.ts` | ~200 |
| History Management | `use-manifest-history.ts` | ~50 |
| UI Rendering | `DesignStudioWorkspace.tsx` | ~200-300 |
| **Total** | | **~1,080** |

**Note**: Slight increase in total lines due to:
- Better error handling
- TypeScript types
- JSDoc comments
- Separation overhead

**But**: Much more maintainable, testable, and reusable!

---

## 🔌 Integration Points

### With Existing Code
- ✅ Uses existing `ManifestHistory` class
- ✅ Uses existing `ChatPanel` component
- ✅ Uses existing `CanvasArea` component
- ✅ Uses existing `ToolBar` component
- ✅ Uses existing API endpoints
- ✅ Uses existing types

### New Additions
- 🆕 Custom hooks directory
- 🆕 Update parsing utility
- 🆕 Optional store enhancement
- 🆕 Sub-components (optional)

---

## 🚀 Migration Strategy

### Phase 1: Extract Utilities (No Breaking Changes)
- Move `parseAndApplyUpdates` to utility
- Component still works, just imports from utility

### Phase 2: Create Hooks (Parallel Implementation)
- Create hooks alongside existing code
- Component can use hooks or old code
- Test hooks independently

### Phase 3: Migrate Component (Gradual)
- Replace one hook at a time
- Test after each replacement
- Remove old code once verified

### Phase 4: Enhance Store (Optional)
- Move state to store gradually
- Hooks can work with or without store
- No breaking changes

---

## ✅ Benefits

1. **Testability**: Each hook can be tested independently
2. **Reusability**: Hooks can be used in other components
3. **Maintainability**: Changes isolated to specific files
4. **Readability**: Component is now easy to understand
5. **Performance**: Same or better (no regressions)
6. **Type Safety**: Better TypeScript inference with hooks

---

## 📊 Metrics

| Metric | Before | After | Improvement |
|-------|--------|-------|-------------|
| Component Size | 1,265 lines | ~250 lines | **80% reduction** |
| Largest Function | 395 lines | ~100 lines | **75% reduction** |
| Test Coverage | 0% | 80%+ | **New capability** |
| Reusability | 0% | 100% | **Hooks reusable** |
| Maintainability | Low | High | **Much better** |








