# Zustand Stores - Testing Guide

## Quick Test (in Browser Console)

1. Start dev server: `npm run dev`
2. Open browser console on any page
3. Run these commands:

```javascript
// Import stores (if in component)
import { useFlowStore, useChatStore, useCopilotStore } from '@/lib/stores';

// Or access from window (add this temporarily to test)
window.testStores = () => {
  const { useFlowStore } = require('@/lib/stores');
  
  // Test Flow Store
  const flowStore = useFlowStore.getState();
  console.log('📦 Flow Store:', {
    flows: flowStore.flows,
    activeFlowId: flowStore.activeFlowId,
  });
  
  // Add a test flow
  flowStore.addFlow({
    id: 'test-123',
    title: 'Test Flow',
    messages: [],
    createdAt: new Date(),
    generationState: {
      currentStep: 'analysis',
      completedSteps: [],
      generatedContent: {},
      isGenerating: false,
    },
    userJourney: {
      websiteAnalyzed: false,
      icpSelected: false,
      valuePropGenerated: false,
      exported: false,
    },
    memory: {
      id: 'test-123',
      websiteUrl: 'https://example.com',
      selectedIcp: null,
      generationHistory: [],
      userPreferences: {
        preferredContentType: '',
        lastAction: '',
      },
    },
  });
  
  console.log('✅ Added test flow');
  console.log('📦 Updated Flow Store:', useFlowStore.getState().flows);
};
```

## Component Testing

### 1. Test Flow Store

```tsx
import { useFlowStore } from '@/lib/stores';

function FlowTest() {
  const { flows, activeFlowId, addFlow, setActiveFlowId } = useFlowStore();
  
  return (
    <div>
      <p>Flows: {flows.length}</p>
      <p>Active: {activeFlowId || 'None'}</p>
      <button onClick={() => {
        addFlow({
          id: `flow-${Date.now()}`,
          title: 'New Flow',
          // ... rest of required fields
        });
      }}>
        Add Flow
      </button>
    </div>
  );
}
```

### 2. Test Chat Store

```tsx
import { useChatStore } from '@/lib/stores';

function ChatTest() {
  const { messages, addMessage, inputValue, setInputValue } = useChatStore();
  
  return (
    <div>
      <p>Messages: {messages.length}</p>
      <input 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
      />
      <button onClick={() => {
        addMessage({
          id: `msg-${Date.now()}`,
          role: 'user',
          content: inputValue,
        });
        setInputValue('');
      }}>
        Send
      </button>
    </div>
  );
}
```

### 3. Test Copilot Store

```tsx
import { useCopilotStore } from '@/lib/stores';

function CopilotTest() {
  const { activeTab, setActiveTab, loadWorkspaceData } = useCopilotStore();
  
  return (
    <div>
      <p>Active Tab: {activeTab}</p>
      <button onClick={() => setActiveTab('brand')}>Brand</button>
      <button onClick={() => setActiveTab('style')}>Style</button>
      <button onClick={() => setActiveTab('landing')}>Landing</button>
    </div>
  );
}
```

## Manual Verification Checklist

### Flow Store
- [ ] Can add flows
- [ ] Can update flows
- [ ] Can delete flows
- [ ] Active flow changes correctly
- [ ] Persists to localStorage
- [ ] Loads from localStorage on refresh

### Chat Store
- [ ] Can add messages
- [ ] Can update messages
- [ ] Input value updates
- [ ] Streaming state works
- [ ] Thinking steps update

### Copilot Store
- [ ] Tab switching works
- [ ] Workspace data loads
- [ ] Design assets update
- [ ] Chat messages work
- [ ] Regeneration count increments

## localStorage Keys

Check browser DevTools → Application → Local Storage:

- `flowtusk-flows` - Flow store (persisted)
- `flowtusk_conversation_memories` - Memory manager (separate persistence)

## Common Issues

### Store not updating UI
- Make sure component is using the store hook
- Check React DevTools for re-renders

### Persistence not working
- Check browser console for errors
- Verify localStorage is enabled
- Check quotas (5-10MB limit)

### Type errors
- All types are exported from `@/lib/stores/types`
- Import types like: `import type { Conversation } from '@/lib/stores';`
