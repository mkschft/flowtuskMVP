# App Page Migration Guide: localStorage → Supabase DB

## Current Status

✅ **Completed:**
- Database schema with flows table
- API routes for flow CRUD
- FlowsClient wrapper library
- Migration utilities
- Test infrastructure
- CI/CD pipeline

❌ **Remaining:**
- Update `app/app/page.tsx` to use DB instead of localStorage
- Add migration UI prompt
- Test complete end-to-end flow

## Overview

The `app/app/page.tsx` file (~3100 lines) currently uses localStorage for persistence. We need to replace this with Supabase DB calls while preserving ALL existing UI/UX.

## Critical Principles

1. **NEVER TOUCH** prompt templates or evidence chain logic
2. **PRESERVE** all existing UI interactions
3. **REPLACE** localStorage with DB calls
4. **ADD** auto-save with debouncing (2s)
5. **MAINTAIN** the same state structure

## Implementation Plan

### Step 1: Add Imports

Add to top of file:

```typescript
import { flowsClient, type Flow } from '@/lib/flows-client';
import { createClient } from '@/lib/supabase/client';
import { 
  migrateLocalStorageToDb, 
  needsMigration 
} from '@/lib/migrate-local-to-db';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingFlowsSkeleton } from '@/components/LoadingFlowsSkeleton';
```

### Step 2: Update Conversation Type

Replace the `Conversation` type with:

```typescript
type Conversation = Flow & {
  // Keep UI-specific fields that aren't in DB
  messages: ChatMessage[];
  generationState: GenerationState;
  userJourney: UserJourney;
  memory: ConversationMemory;
};
```

### Step 3: Replace localStorage Load (Line ~698)

**Current:**
```typescript
useEffect(() => {
  const savedConversations = localStorage.getItem('flowtusk_conversations');
  // ...
}, []);
```

**Replace with:**
```typescript
useEffect(() => {
  loadFlowsFromDB();
}, []);

async function loadFlowsFromDB() {
  try {
    setIsLoading(true);
    
    // Check if migration needed
    if (needsMigration()) {
      setShowMigrationPrompt(true);
      return;
    }
    
    // Load flows from DB
    const flows = await flowsClient.listFlows();
    
    // Convert Flow to Conversation format
    const conversations = flows.map(flowToConversation);
    
    setConversations(conversations);
    
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  } catch (error) {
    console.error('Failed to load flows:', error);
    // Fallback to localStorage if DB fails
    loadFromLocalStorage();
  } finally {
    setIsLoading(false);
  }
}

function flowToConversation(flow: Flow): Conversation {
  const generatedContent = flow.generated_content as any || {};
  
  return {
    ...flow,
    messages: generatedContent.messages || [],
    generationState: generatedContent.generationState || DEFAULT_STATE,
    userJourney: generatedContent.userJourney || DEFAULT_JOURNEY,
    memory: {
      id: flow.id,
      websiteUrl: flow.website_url || '',
      factsJson: flow.facts_json,
      selectedIcp: flow.selected_icp as any,
      generationHistory: generatedContent.generationHistory || [],
      userPreferences: generatedContent.userPreferences || {},
    },
  };
}
```

### Step 4: Replace localStorage Save (Line ~717)

**Current:**
```typescript
useEffect(() => {
  localStorage.setItem('flowtusk_conversations', JSON.stringify(conversations));
  // ...
}, [conversations, activeConversationId]);
```

**Replace with:**
```typescript
useEffect(() => {
  if (!activeConversationId) return;
  
  // Debounced auto-save to DB
  const conversation = conversations.find(c => c.id === activeConversationId);
  if (!conversation) return;
  
  debouncedSaveToDb(conversation);
}, [conversations, activeConversationId]);

async function debouncedSaveToDb(conversation: Conversation) {
  try {
    await flowsClient.debouncedUpdate(conversation.id, {
      title: conversation.title,
      website_url: conversation.memory.websiteUrl,
      facts_json: conversation.memory.factsJson,
      selected_icp: conversation.memory.selectedIcp,
      generated_content: {
        messages: conversation.messages,
        generationState: conversation.generationState,
        userJourney: conversation.userJourney,
        generationHistory: conversation.memory.generationHistory,
      },
      step: determineCurrentStep(conversation),
    });
    
    console.log('💾 Auto-saved to DB');
  } catch (error) {
    console.error('Auto-save failed:', error);
    // Could show toast notification here
  }
}

function determineCurrentStep(conversation: Conversation): string {
  const journey = conversation.userJourney;
  
  if (journey.exported) return 'exported';
  if (journey.valuePropGenerated) return 'value_prop';
  if (journey.icpSelected) return 'icp_selected';
  if (journey.websiteAnalyzed) return 'analyzed';
  
  return 'initial';
}
```

### Step 5: Update createNewConversation (Line ~781)

**Current:**
```typescript
const createNewConversation = () => {
  const newConv: Conversation = {
    id: nanoid(),
    // ...
  };
  setConversations(prev => [newConv, ...prev]);
};
```

**Replace with:**
```typescript
const createNewConversation = async () => {
  try {
    const flow = await flowsClient.createFlow({
      title: 'New Flow',
      step: 'initial',
    });
    
    const newConv = flowToConversation(flow);
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    
    console.log('✅ Created new flow in DB');
  } catch (error) {
    console.error('Failed to create flow:', error);
    // Show error to user
  }
};
```

### Step 6: Update deleteConversation (Line ~822)

**Replace with:**
```typescript
const deleteConversation = async (convId: string) => {
  try {
    await flowsClient.softDeleteFlow(convId);
    
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== convId);
      
      if (convId === activeConversationId) {
        if (filtered.length > 0) {
          setActiveConversationId(filtered[0].id);
        } else {
          createNewConversation();
        }
      }
      
      return filtered;
    });
    
    console.log('🗑️ Deleted flow from DB');
  } catch (error) {
    console.error('Failed to delete flow:', error);
  }
};
```

### Step 7: Add Migration UI Prompt

Add after the sidebar JSX:

```typescript
{showMigrationPrompt && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="max-w-md p-6 space-y-4">
      <h2 className="text-xl font-semibold">Migrate Your Data</h2>
      <p className="text-muted-foreground">
        We've upgraded to database storage! Your conversations are currently stored locally.
        Migrate them now to access from any device.
      </p>
      
      <div className="flex gap-2">
        <Button onClick={handleMigration}>
          Migrate Now
        </Button>
        <Button variant="outline" onClick={() => {
          setShowMigrationPrompt(false);
          loadFromLocalStorage();
        }}>
          Skip for Now
        </Button>
      </div>
    </Card>
  </div>
)}

async function handleMigration() {
  try {
    setIsMigrating(true);
    const report = await migrateLocalStorageToDb();
    
    if (report.success > 0) {
      // Show success message
      alert(`✅ Migrated ${report.success}/${report.total} flows successfully!`);
      
      // Reload from DB
      await loadFlowsFromDB();
    }
  } catch (error) {
    console.error('Migration failed:', error);
    alert('Migration failed. Your data is safe in localStorage.');
  } finally {
    setIsMigrating(false);
    setShowMigrationPrompt(false);
  }
}
```

### Step 8: Add Auth Check

At the top of ChatPageContent:

```typescript
const [user, setUser] = useState<any>(null);
const [authLoading, setAuthLoading] = useState(true);

useEffect(() => {
  checkAuth();
}, []);

async function checkAuth() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  setUser(user);
  setAuthLoading(false);
  
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED !== 'true') {
    window.location.href = '/auth/login';
  }
}

if (authLoading) {
  return <LoadingFlowsSkeleton />;
}
```

### Step 9: Update MemoryManager (Line ~307)

**Current:**
```typescript
class MemoryManager {
  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    // ...
  }
  
  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(memories));
  }
}
```

**Replace with:**
```typescript
class MemoryManager {
  // Keep this class but make it sync with DB
  // It now acts as an in-memory cache that syncs to DB
  
  private loadFromStorage(): void {
    // Load from active conversation's memory (already in state)
    // No longer reads from localStorage
  }
  
  private saveToStorage(): void {
    // No-op - DB auto-save handles this
    // Or trigger a manual save to DB if needed
  }
}
```

### Step 10: Wrap Everything in ErrorBoundary

```typescript
export default function ChatPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFlowsSkeleton />}>
        <ChatPageContent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Testing Checklist

After implementation:

- [ ] Create new flow → saves to DB
- [ ] Paste URL → analyze → persists facts_json
- [ ] Generate ICPs → saves with evidence
- [ ] Select ICP → updates DB
- [ ] Generate value props → saves with sourceFactIds
- [ ] Auto-save works (wait 2s after change, check DB)
- [ ] Page refresh → loads from DB
- [ ] Switch flows → correct state loaded
- [ ] Delete flow → soft deleted
- [ ] Migration prompt shows if localStorage has data
- [ ] Migration succeeds → data in DB
- [ ] Auth redirect works (if not demo mode)
- [ ] Evidence chain intact throughout

## Common Pitfalls

1. **Don't** remove localStorage completely yet - keep as fallback
2. **Don't** change the message flow or chat UI
3. **Don't** modify prompt templates or evidence logic
4. **Do** preserve all existing state structure
5. **Do** test each change incrementally
6. **Do** verify evidence chain after each step

## Rollback Plan

If something breaks:

1. Revert app/app/page.tsx changes
2. Keep all infra (API routes, migrations, etc.)
3. Test works with localStorage
4. Debug and retry

## Performance Considerations

- **Auto-save debounce**: 2s (don't save on every keystroke)
- **Initial load**: < 2s (fetch only active flows)
- **Flow switch**: < 500ms (use cached data if available)
- **Optimistic updates**: Update UI immediately, sync to DB in background

## Next Steps After This

1. Test thoroughly with real data
2. Deploy to staging
3. Run complete test checklist
4. Monitor for errors
5. Gather user feedback
6. Iterate

## Support

- See TESTING.md for test procedures
- See DEPLOYMENT.md for deployment steps
- Check evidence chain with: `npm run test:evidence`

