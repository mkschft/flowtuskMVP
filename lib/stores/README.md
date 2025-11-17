# Zustand Stores Documentation

## Overview

This directory contains all Zustand stores for state management in Flowtusk. The stores replace the previous monolithic component state and provide a clean, scalable architecture.

## Architecture

```
lib/stores/
├── index.ts              # Central export (use this to import)
├── types.ts              # All TypeScript types
├── use-flow-store.ts     # Flow/conversation management
├── use-chat-store.ts     # Chat messages & UI state
├── use-copilot-store.ts  # Design Studio state
└── README.md             # This file
```

## Usage

### Import Stores

```typescript
// ✅ Good - import from index
import { useFlowStore, useChatStore, useCopilotStore } from '@/lib/stores';

// ❌ Bad - don't import directly
import { useFlowStore } from '@/lib/stores/use-flow-store';
```

### Import Types

```typescript
import type { Conversation, ChatMessage, ICP } from '@/lib/stores';
```

### Import Managers

```typescript
import { generationManager, memoryManager } from '@/lib/stores';
```

## Store Reference

### 1. Flow Store (`useFlowStore`)

**Purpose:** Manages flows (conversations), active selection, and database sync

**Key Features:**
- Persists to localStorage automatically
- Syncs with Supabase when `dbSyncEnabled: true`
- CRUD operations for flows
- Active flow tracking

**Usage:**

```typescript
function MyComponent() {
  const { 
    flows,              // All flows
    activeFlow,         // Currently selected flow (computed)
    activeFlowId,       // ID of active flow
    addFlow,            // Add new flow
    updateFlow,         // Update existing flow
    deleteFlow,         // Delete flow
    setActiveFlowId,    // Change active flow
    loadFlowsFromDb,    // Load from Supabase
    saveFlowToDb,       // Save to Supabase
  } = useFlowStore();

  // Load flows on mount
  useEffect(() => {
    loadFlowsFromDb();
  }, []);

  // Add a new flow
  const handleCreate = () => {
    addFlow({
      id: nanoid(),
      title: 'New Flow',
      messages: [],
      createdAt: new Date(),
      // ... rest of required fields
    });
  };

  // Update active flow
  const handleUpdate = (updates: Partial<Conversation>) => {
    if (activeFlowId) {
      updateFlow(activeFlowId, updates);
    }
  };

  return <div>{/* ... */}</div>;
}
```

**Persistence:**
- Persisted to localStorage as `flowtusk-flows`
- Only `flows` and `activeFlowId` are persisted (not loading/error states)

---

### 2. Chat Store (`useChatStore`)

**Purpose:** Manages chat messages, input, and streaming state for `/app`

**Key Features:**
- Message CRUD operations
- Thinking steps management
- Input field state
- Streaming indicator
- Sidebar toggle

**Usage:**

```typescript
function ChatInterface() {
  const {
    messages,           // All messages
    addMessage,         // Add new message
    updateMessage,      // Update existing message
    inputValue,         // Input field value
    setInputValue,      // Update input
    isStreaming,        // Is AI responding?
    setStreaming,       // Set streaming state
    updateThinkingStep, // Update thinking progress
  } = useChatStore();

  const handleSend = () => {
    addMessage({
      id: nanoid(),
      role: 'user',
      content: inputValue,
    });
    setInputValue('');
    setStreaming(true);
    // ... call API
  };

  return <div>{/* ... */}</div>;
}
```

**Not Persisted:** Messages live in Flow Store. Chat Store is UI-only state.

---

### 3. Copilot Store (`useCopilotStore`)

**Purpose:** Manages Design Studio state for `/copilot`

**Key Features:**
- Tab management (value-prop, brand, style, landing)
- Workspace data (ICP + Value Prop + Design Assets)
- Copilot chat (separate from main chat)
- Loading states
- Regeneration tracking

**Usage:**

```typescript
function CopilotPage() {
  const {
    activeTab,          // Current tab
    setActiveTab,       // Switch tabs
    workspaceData,      // ICP + Value Prop + Design Assets
    loadWorkspaceData,  // Load data for ICP
    loading,            // Loading state
    error,              // Error state
    chatMessages,       // Copilot chat messages
    addChatMessage,     // Add chat message
  } = useCopilotStore();

  // Load data on mount
  useEffect(() => {
    if (icpId && flowId) {
      loadWorkspaceData(icpId, flowId);
    }
  }, [icpId, flowId]);

  return <div>{/* ... */}</div>;
}
```

**Not Persisted:** Copilot state is loaded fresh from API on each visit.

---

## Managers (Singletons)

### Generation Manager

**Purpose:** Caches AI generations, prevents duplicates, tracks progress

```typescript
import { generationManager } from '@/lib/stores';

// Cache a generation
const icps = await generationManager.generate(
  'icps',
  { websiteUrl: 'example.com' },
  async () => {
    // Actual generation logic
    return await generateICPs(websiteUrl);
  }
);

// Check if generating
if (generationManager.isGenerating('icps', { websiteUrl: 'example.com' })) {
  console.log('Already generating...');
}

// Check if completed
if (generationManager.isCompleted('icps', { websiteUrl: 'example.com' })) {
  console.log('Already done!');
}

// Clear cache
generationManager.clearCache();
```

### Memory Manager

**Purpose:** Tracks user actions, manages prerequisites, stores context

```typescript
import { memoryManager } from '@/lib/stores';

// Add action to history
memoryManager.addGenerationRecord(
  conversationId,
  'select-icp',
  { icpId: 'icp-123' }
);

// Check if action is allowed
const canGenerate = memoryManager.canPerformAction(
  conversationId,
  'value-prop' // Requires 'select-icp' first
);

// Get completed actions
const completed = memoryManager.getCompletedActions(conversationId);
// ['select-icp', 'value-prop', ...]
```

---

## Migration from Monolithic Component

### Before (in `app/app/page.tsx`):

```typescript
const [conversations, setConversations] = useState<Conversation[]>([]);
const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

// Scattered throughout 3,596 lines...
```

### After (with Zustand):

```typescript
import { useFlowStore } from '@/lib/stores';

const { flows, activeFlowId, addFlow, updateFlow } = useFlowStore();

// Clean, reusable, testable
```

### Benefits:

1. **Separation of Concerns** - State logic separate from UI
2. **Reusability** - Use same store in multiple components
3. **Testability** - Test stores independently
4. **Performance** - Only re-render components that use changed state
5. **DevTools** - Zustand DevTools for debugging
6. **Persistence** - Built-in localStorage sync
7. **TypeScript** - Full type safety

---

## Best Practices

### 1. Use Selectors for Performance

```typescript
// ❌ Bad - re-renders on ANY store change
const store = useFlowStore();

// ✅ Good - only re-renders when flows change
const flows = useFlowStore(state => state.flows);
const addFlow = useFlowStore(state => state.addFlow);
```

### 2. Keep UI State Separate

```typescript
// ✅ Good - UI-only state in Chat Store
const { isSidebarOpen, setSidebarOpen } = useChatStore();

// ❌ Bad - don't put UI state in Flow Store
```

### 3. Use Managers for Complex Logic

```typescript
// ✅ Good - use generationManager for caching
const icps = await generationManager.generate(/* ... */);

// ❌ Bad - don't reimplement caching in every component
```

### 4. Update Active Flow, Not All Flows

```typescript
// ✅ Good - update specific flow
updateFlow(activeFlowId, { title: 'New Title' });

// ❌ Bad - don't manually map over all flows
setFlows(flows.map(f => f.id === id ? { ...f, ...updates } : f));
```

---

## Next Steps

See `TEST.md` for testing instructions and examples.

## Questions?

Check the inline comments in each store file for more details.
