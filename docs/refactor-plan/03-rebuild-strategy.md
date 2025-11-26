# Flowtusk V2 - Strategic Rebuild Plan

## Overview

This document outlines a **7-day strategic rebuild** of Flowtusk using modern AI infrastructure while preserving all UI/UX and business logic.

## Philosophy

**NOT a full rewrite**. This is a **technology swap**:
- ✅ Keep: UI components, design system, brand concept, database schema
- 🔄 Replace: State management, API layer, AI infrastructure, real-time communication

## Goals

1. **Simplify Architecture**: Reduce codebase by 60%
2. **Eliminate Technical Debt**: Remove all race conditions, prop drilling, API-to-API calls
3. **Enable Rapid Development**: Ship new features in hours, not days
4. **Maintain UX**: Zero user-facing changes (same look and feel)
5. **Ship in 7 Days**: Focused, executable timeline

## What to Keep (Copy As-Is)

### UI Components ✅
- All React components in `/components`
- Tailwind CSS styles
- Design system (buttons, cards, inputs, etc.)
- Canvas components (BrandGuideCanvas, StyleGuideCanvas, etc.)
- All `.tsx` files with presentational logic

**Files**:
```
/components/ui/**/*
/components/copilot/**/* (UI only)
/components/IntegratedValuePropPreview.tsx
/components/ValuePropBuilderWrapper.tsx
/components/ExportOptions.tsx
/components/LinkedInProfileDrawer.tsx
/app/landing/**/* (marketing site)
```

### Critical Business Logic ✅
- **Prompt templates** (`/lib/prompt-templates.ts`) - NEVER TOUCH
- **Evidence chain logic** - Core differentiator
- **Validation schemas** (`/lib/validators.ts`)
- **Type definitions** (`/lib/types/**/*`)
- **Few-shot examples** (`/lib/few-shot-examples.ts`)

### Database Schema ✅
- Supabase tables (already well-designed)
- RLS policies
- Migrations

**Note**: May add new tables, but keep existing structure

### Utils & Helpers ✅
- Color utilities
- Design system helpers
- Export utilities
- Most of `/lib/utils/`

## What to Rebuild (Clean Slate)

### 1. State Management 🔄
**Current**: Disconnected Zustand stores + useState prop drilling
**New**: Single unified Zustand store + Vercel AI SDK state

**Delete**:
- `/lib/stores/use-flow-store.ts` (unused)
- `/lib/stores/use-chat-store.ts` (unused)
- `/lib/stores/use-copilot-store.ts` (unused)

**Create**:
- `/lib/stores/app-store.ts` (unified, actually used)

### 2. API Routes 🔄
**Current**: Custom streaming, API-to-API calls, complex validation
**New**: Vercel AI SDK, direct database access, LangGraph workflows

**Rebuild**:
- `/app/api/chat/route.ts` - Use AI SDK `streamText()`
- `/app/api/copilot/route.ts` - Use AI SDK with tools
- `/app/api/analyze-website/route.ts` - Trigger.dev job
- `/app/api/generate-icps/route.ts` - LangGraph workflow
- `/app/api/generate-value-prop/route.ts` - LangGraph workflow
- `/app/api/brand-manifest/route.ts` - Simplified CRUD

**Delete**:
- All custom streaming logic
- API-to-API calls
- Migration logic from GET handlers

### 3. Custom Hooks 🔄
**Current**: 8 interdependent hooks with 15-parameter signatures
**New**: Simple hooks using store selectors + AI SDK

**Delete**:
- `/lib/hooks/design-studio/use-chat-streaming.ts`
- `/lib/hooks/design-studio/use-manifest-updates.ts`
- `/lib/hooks/design-studio/use-generation-orchestration.ts`
- `/lib/hooks/design-studio/use-workspace-data.ts` (partially)

**Create**:
- `/lib/hooks/use-brand-generation.ts` (simplified)
- `/lib/hooks/use-manifest.ts` (simple Zustand selector)

### 4. Real-Time Communication 🔄
**Current**: 30-second polling + custom SSE
**New**: Vercel AI SDK streaming (built-in)

**Delete**:
- All polling logic
- Custom WebSocket code (never implemented)

**Add**:
- AI SDK `useChat()` handles real-time
- Trigger.dev for progress updates

### 5. Data Access Layer 🔄
**Current**: Direct Supabase calls scattered everywhere
**New**: Centralized repository pattern

**Create**:
- `/lib/data-access/manifest-repository.ts`
- `/lib/data-access/flows-repository.ts`
- `/lib/data-access/assets-repository.ts`

---

## Day-by-Day Implementation Plan

### Day 1: Foundation Setup

#### Morning (4 hours): Install & Configure Modern Stack

**Install dependencies**:
```bash
# Vercel AI SDK
npm install ai @ai-sdk/openai

# LangGraph
npm install @langchain/langgraph @langchain/core @langchain/openai

# Trigger.dev
npm install @trigger.dev/sdk @trigger.dev/react

# Additional utilities
npm install zod nanoid
```

**Create new Zustand store**:
```typescript
// /lib/stores/app-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // Flow management
  flows: Flow[]
  activeFlowId: string | null

  // Manifest state
  manifest: BrandManifest | null
  manifestLoading: boolean

  // Generation state
  generationStatus: 'idle' | 'analyzing' | 'generating-icps' | 'generating-manifest' | 'complete'
  generationProgress: number

  // UI state
  activeTab: 'value-prop' | 'brand' | 'style' | 'landing'
  sidebarOpen: boolean

  // Actions
  setActiveFlow: (id: string) => void
  updateManifest: (manifest: BrandManifest) => void
  setGenerationStatus: (status: AppState['generationStatus']) => void
  // ... more actions
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      flows: [],
      activeFlowId: null,
      manifest: null,
      manifestLoading: false,
      generationStatus: 'idle',
      generationProgress: 0,
      activeTab: 'value-prop',
      sidebarOpen: true,

      setActiveFlow: (id) => set({ activeFlowId: id }),
      updateManifest: (manifest) => set({ manifest }),
      setGenerationStatus: (status) => set({ generationStatus: status }),
      // ... implement actions
    }),
    {
      name: 'flowtusk-app-state',
      partialize: (state) => ({
        flows: state.flows,
        activeFlowId: state.activeFlowId
      })
    }
  )
)
```

#### Afternoon (4 hours): Create Data Access Layer

```typescript
// /lib/data-access/manifest-repository.ts
import { createClient } from '@/lib/supabase/server'
import type { BrandManifest } from '@/lib/types/brand-manifest'

export class ManifestRepository {
  private supabase: ReturnType<typeof createClient>

  constructor() {
    this.supabase = createClient()
  }

  async get(flowId: string): Promise<BrandManifest | null> {
    const { data, error } = await this.supabase
      .from('brand_manifests')
      .select('*')
      .eq('flow_id', flowId)
      .single()

    if (error) return null
    return data.manifest
  }

  async create(flowId: string, manifest: BrandManifest): Promise<BrandManifest> {
    const { data, error } = await this.supabase
      .from('brand_manifests')
      .insert({
        flow_id: flowId,
        manifest,
        brand_key: generateBrandKey()
      })
      .select()
      .single()

    if (error) throw error
    return data.manifest
  }

  async update(flowId: string, updates: Partial<BrandManifest>): Promise<BrandManifest> {
    const current = await this.get(flowId)
    if (!current) throw new Error('Manifest not found')

    const updated = deepMerge(current, updates)

    const { data, error } = await this.supabase
      .from('brand_manifests')
      .update({ manifest: updated })
      .eq('flow_id', flowId)
      .select()
      .single()

    if (error) throw error
    return data.manifest
  }

  async addToHistory(flowId: string, action: string, description: string): Promise<void> {
    const manifest = await this.get(flowId)

    await this.supabase
      .from('brand_manifest_history')
      .insert({
        flow_id: flowId,
        manifest,
        action,
        description
      })
  }
}

export const manifestRepository = new ManifestRepository()
```

**Similar repositories for**:
- `flows-repository.ts`
- `assets-repository.ts`

### Day 2: Core Chat Interface with AI SDK

#### Morning (4 hours): Rebuild Main Chat API

```typescript
// /app/api/chat/route.ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { manifestRepository } from '@/lib/data-access/manifest-repository'

export async function POST(request: Request) {
  const { messages, flowId } = await request.json()

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: `You are Flowtusk, an AI brand strategist. Help users discover their brand identity based on their website and business.`,
    tools: {
      analyzeWebsite: {
        description: 'Analyze a website to extract brand facts',
        parameters: z.object({
          url: z.string().url()
        }),
        execute: async ({ url }) => {
          // Trigger background job
          const job = await analyzeWebsiteJob.trigger({
            url,
            flowId
          })

          return {
            status: 'analyzing',
            jobId: job.id,
            message: 'Website analysis started. This will take about 30 seconds.'
          }
        }
      },

      generateICPs: {
        description: 'Generate ideal customer profiles based on brand facts',
        parameters: z.object({
          facts: z.object({
            brand: z.any(),
            valueProps: z.array(z.any()),
            audienceSignals: z.array(z.string())
          })
        }),
        execute: async ({ facts }) => {
          // Use LangGraph workflow
          const icps = await icpGenerationWorkflow.invoke({
            facts,
            flowId
          })

          return {
            success: true,
            icps
          }
        }
      }
    },
    maxSteps: 5,
    onFinish: async ({ usage, finishReason }) => {
      console.log('Chat completed:', { usage, finishReason })
      // Track costs, log to analytics
    }
  })

  return result.toDataStreamResponse()
}
```

#### Afternoon (4 hours): Update Client to Use AI SDK

```typescript
// /app/app/page.tsx (simplified)
'use client'

import { useChat } from 'ai/react'
import { useAppStore } from '@/lib/stores/app-store'

export default function AppPage() {
  const { activeFlowId, setGenerationStatus } = useAppStore()

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } = useChat({
    api: '/api/chat',
    body: { flowId: activeFlowId },
    onFinish: () => {
      setGenerationStatus('complete')
    }
  })

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <ChatMessages messages={messages} />

        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </main>
    </div>
  )
}
```

**Lines of code**:
- Old approach: 1000+ lines in App page
- New approach: ~200 lines

### Day 3: LangGraph Workflows

#### Morning (4 hours): Website Analysis Workflow

```typescript
// /lib/workflows/analyze-website.ts
import { StateGraph } from "@langchain/langgraph"

interface WebsiteAnalysisState {
  url: string
  flowId: string
  html?: string
  markdown?: string
  facts?: BrandFacts
  error?: string
}

const workflow = new StateGraph<WebsiteAnalysisState>({
  channels: {
    url: { value: null },
    flowId: { value: null },
    html: { value: null },
    markdown: { value: null },
    facts: { value: null },
    error: { value: null }
  }
})

// Step 1: Scrape website
workflow.addNode("scrape", async (state) => {
  try {
    // Try Jina first
    const content = await scrapeWithJina(state.url)
    return { markdown: content }
  } catch (error) {
    // Fallback to Firecrawl
    const content = await scrapeWithFirecrawl(state.url)
    return { markdown: content }
  }
})

// Step 2: Extract facts with GPT-4
workflow.addNode("extractFacts", async (state) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [{
      role: 'system',
      content: EXTRACT_FACTS_PROMPT // From prompt-templates.ts
    }, {
      role: 'user',
      content: state.markdown
    }]
  })

  const facts = JSON.parse(completion.choices[0].message.content!)
  return { facts }
})

// Step 3: Save to database
workflow.addNode("save", async (state) => {
  await flowsRepository.update(state.flowId, {
    facts_json: state.facts,
    step: 'facts_extracted'
  })

  return state
})

// Error handler
workflow.addNode("handleError", async (state) => {
  console.error('Workflow failed:', state.error)
  return state
})

// Define flow
workflow.addEdge("scrape", "extractFacts")
workflow.addEdge("extractFacts", "save")
workflow.setEntryPoint("scrape")

export const websiteAnalysisWorkflow = workflow.compile()
```

#### Afternoon (4 hours): ICP Generation Workflow

```typescript
// /lib/workflows/generate-icps.ts
import { StateGraph } from "@langchain/langgraph"

interface ICPGenerationState {
  facts: BrandFacts
  flowId: string
  icps?: ICP[]
  summary?: ICPSummary
}

const workflow = new StateGraph<ICPGenerationState>({
  channels: {
    facts: { value: null },
    flowId: { value: null },
    icps: { value: null },
    summary: { value: null }
  }
})

workflow.addNode("generateICPs", async (state) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [{
      role: 'system',
      content: GENERATE_ICPS_PROMPT // From prompt-templates.ts
    }, {
      role: 'user',
      content: JSON.stringify(state.facts)
    }]
  })

  const result = JSON.parse(completion.choices[0].message.content!)

  // Validate with Zod
  const validated = ICPResponseSchema.parse(result)

  return {
    icps: validated.icps,
    summary: validated.summary
  }
})

workflow.addNode("save", async (state) => {
  await flowsRepository.update(state.flowId, {
    generated_content: {
      icps: state.icps,
      summary: state.summary
    },
    step: 'icps_generated'
  })

  return state
})

workflow.addEdge("generateICPs", "save")
workflow.setEntryPoint("generateICPs")

export const icpGenerationWorkflow = workflow.compile()
```

### Day 4: Trigger.dev Background Jobs

#### Morning (4 hours): Set Up Trigger.dev

```bash
npx @trigger.dev/cli@latest init
```

```typescript
// trigger/analyze-website.ts
import { eventTrigger } from "@trigger.dev/sdk"
import { client } from "@/trigger"
import { websiteAnalysisWorkflow } from "@/lib/workflows/analyze-website"

export const analyzeWebsiteJob = client.defineJob({
  id: "analyze-website",
  name: "Analyze Website for Brand Facts",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "website.analyze"
  }),
  run: async (payload, io, ctx) => {
    const { url, flowId } = payload

    // Update status
    await io.sendEvent("progress", {
      step: "started",
      progress: 0,
      flowId
    })

    // Run LangGraph workflow with progress updates
    const result = await io.runTask("analyze", async () => {
      return await websiteAnalysisWorkflow.invoke({
        url,
        flowId
      })
    })

    await io.sendEvent("progress", {
      step: "scraping",
      progress: 33,
      flowId
    })

    // Workflow handles scraping + extraction
    // Send final update
    await io.sendEvent("complete", {
      step: "complete",
      progress: 100,
      flowId,
      facts: result.facts
    })

    return result
  }
})
```

#### Afternoon (4 hours): Integrate with Client

```typescript
// Client receives real-time progress
import { useTrigger } from '@trigger.dev/react'

function WebsiteAnalysisProgress({ flowId }: { flowId: string }) {
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState('')

  const { subscribe } = useTrigger()

  useEffect(() => {
    const unsubscribe = subscribe('progress', (event) => {
      if (event.flowId === flowId) {
        setProgress(event.progress)
        setStep(event.step)
      }
    })

    const unsubscribeComplete = subscribe('complete', (event) => {
      if (event.flowId === flowId) {
        setProgress(100)
        // Refresh manifest
      }
    })

    return () => {
      unsubscribe()
      unsubscribeComplete()
    }
  }, [flowId])

  return (
    <div>
      <Progress value={progress} />
      <p>{step}</p>
    </div>
  )
}
```

### Day 5: Rebuild Copilot Chat

#### Morning (4 hours): Copilot API with Tools

```typescript
// /app/api/copilot/route.ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { manifestRepository } from '@/lib/data-access/manifest-repository'

export async function POST(request: Request) {
  const { messages, flowId, icpId } = await request.json()

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: COPILOT_SYSTEM_PROMPT, // From prompt-templates.ts
    tools: {
      updateManifest: {
        description: 'Update the brand manifest with new values',
        parameters: z.object({
          updates: z.record(z.any()),
          updateType: z.enum(['market_shift', 'messaging', 'styling', 'refinement'])
        }),
        execute: async ({ updates, updateType }) => {
          // Update manifest
          const updated = await manifestRepository.update(flowId, updates)

          // Add to history
          await manifestRepository.addToHistory(
            flowId,
            updateType,
            `Updated via copilot chat`
          )

          return {
            success: true,
            manifest: updated
          }
        }
      },

      generateLogo: {
        description: 'Generate a brand logo',
        parameters: z.object({
          style: z.enum(['wordmark', 'icon', 'combination']),
          prompt: z.string()
        }),
        execute: async ({ style, prompt }) => {
          const logo = await generateLogoWithDALLE(prompt, style)

          // Save to Supabase Storage
          const path = await saveLogoToStorage(flowId, logo)

          // Update manifest
          await manifestRepository.update(flowId, {
            'identity.logo.variations': [
              {
                name: style,
                imageUrl: path,
                description: prompt
              }
            ]
          })

          return {
            success: true,
            logoUrl: path
          }
        }
      }
    },
    maxSteps: 15, // Allow multi-turn conversations
    onFinish: async ({ usage }) => {
      console.log('Copilot chat finished:', usage)
    }
  })

  return result.toDataStreamResponse()
}
```

#### Afternoon (4 hours): Update Design Studio UI

```typescript
// /components/DesignStudioWorkspace.tsx (simplified)
'use client'

import { useChat } from 'ai/react'
import { useAppStore } from '@/lib/stores/app-store'

export function DesignStudioWorkspace({ flowId, icpId }: Props) {
  const { manifest, updateManifest, activeTab, setActiveTab } = useAppStore()

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } = useChat({
    api: '/api/copilot',
    body: { flowId, icpId },
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === 'updateManifest') {
        // Update local state immediately (optimistic)
        updateManifest(toolCall.result.manifest)
      }
    }
  })

  return (
    <div className="flex h-screen">
      <CanvasArea
        manifest={manifest}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ChatPanel
        messages={messages}
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
```

**Lines of code reduced**:
- Old: 329 lines + 8 custom hooks (1000+ lines total)
- New: ~150 lines total

### Day 6: Integration & Migration

#### Morning (4 hours): Update All Components

**Update components to use new store**:
```typescript
// Before
const [manifest, setManifest] = useState<BrandManifest | null>(null)

// After
const manifest = useAppStore(state => state.manifest)
```

**Remove prop drilling**:
```typescript
// Before
<Component
  manifest={manifest}
  setManifest={setManifest}
  workspaceData={workspaceData}
  setWorkspaceData={setWorkspaceData}
  // ... 10+ more props
/>

// After
<Component /> // Component uses useAppStore internally
```

#### Afternoon (4 hours): Database Migration (if needed)

```sql
-- Add any new columns for Trigger.dev job tracking
ALTER TABLE flows
ADD COLUMN analysis_job_id TEXT,
ADD COLUMN analysis_status TEXT DEFAULT 'pending';

-- Indexes for performance
CREATE INDEX idx_flows_analysis_status ON flows(analysis_status);
CREATE INDEX idx_brand_manifests_updated_at ON brand_manifests(updated_at);
```

### Day 7: Testing & Deployment

#### Morning (4 hours): End-to-End Testing

**Test scenarios**:
1. ✅ New user pastes URL → Website analyzed → ICPs generated
2. ✅ User selects ICP → Manifest created → Real-time updates work
3. ✅ Copilot chat updates manifest → Changes reflected immediately
4. ✅ Logo generation → Saved to storage → Displayed in UI
5. ✅ Export functionality still works
6. ✅ Error handling → Graceful degradation

**Load testing**:
- Test with 10 concurrent users
- Verify Trigger.dev handles background jobs
- Check AI SDK streaming performance

#### Afternoon (4 hours): Deploy

```bash
# Push to GitHub
git add .
git commit -m "feat: rebuild with modern AI stack (Vercel AI SDK + LangGraph + Trigger.dev)"
git push origin main

# Deploy to Vercel
vercel --prod

# Configure Trigger.dev
trigger.dev deploy
```

**Environment variables**:
```env
# Existing
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_KEY=

# New
TRIGGER_API_KEY=
TRIGGER_API_URL=
FIRECRAWL_API_KEY=
IDEOGRAM_API_KEY= (if using)
```

---

## Code Deletion Summary

### Files to Delete (Safe to Remove)

**Unused Zustand stores**:
- `/lib/stores/use-flow-store.ts`
- `/lib/stores/use-chat-store.ts`
- `/lib/stores/use-copilot-store.ts`

**Complex custom hooks**:
- `/lib/hooks/design-studio/use-chat-streaming.ts` (1000+ lines)
- `/lib/hooks/design-studio/use-manifest-updates.ts` (500+ lines)
- `/lib/hooks/design-studio/use-generation-orchestration.ts` (300+ lines)

**Custom streaming**:
- Polling logic in `use-manifest.ts`
- Custom SSE parsing

**Total lines deleted**: ~3000+

---

## New Files to Create

**Infrastructure**:
- `/lib/stores/app-store.ts` (~200 lines)
- `/lib/data-access/manifest-repository.ts` (~150 lines)
- `/lib/data-access/flows-repository.ts` (~150 lines)

**Workflows**:
- `/lib/workflows/analyze-website.ts` (~100 lines)
- `/lib/workflows/generate-icps.ts` (~80 lines)
- `/lib/workflows/generate-value-prop.ts` (~80 lines)

**Background Jobs**:
- `/trigger/analyze-website.ts` (~50 lines)
- `/trigger/generate-assets.ts` (~50 lines)

**API Routes** (simplified):
- `/app/api/chat/route.ts` (~100 lines vs. 300)
- `/app/api/copilot/route.ts` (~150 lines vs. 400)

**Total new lines**: ~1100
**Net reduction**: ~2000 lines (40% less code)

---

## Migration Checklist

### Pre-Migration
- [ ] Backup database
- [ ] Export all environment variables
- [ ] Document current user flows
- [ ] Create rollback plan

### During Migration
- [ ] Install new dependencies
- [ ] Create new store structure
- [ ] Build data access layer
- [ ] Create LangGraph workflows
- [ ] Set up Trigger.dev
- [ ] Rebuild API routes
- [ ] Update components
- [ ] Test each feature

### Post-Migration
- [ ] Run full test suite
- [ ] Load testing
- [ ] Monitor error rates
- [ ] Track performance metrics
- [ ] User acceptance testing

### Rollback Plan
If issues arise:
1. Revert to previous Git commit
2. Redeploy old version
3. Database schema is backward compatible
4. No data loss risk

---

## Success Metrics

### Code Quality
- ✅ 40% reduction in lines of code
- ✅ Zero prop drilling (all state in store)
- ✅ Zero API-to-API calls
- ✅ Zero race conditions

### Performance
- ✅ Real-time updates <1s (vs. 30s)
- ✅ Background jobs don't block UI
- ✅ Faster development velocity

### Developer Experience
- ✅ New feature in hours (vs. days)
- ✅ Clear separation of concerns
- ✅ Easy to debug
- ✅ Type-safe throughout

### User Experience
- ✅ No visual changes (same UI/UX)
- ✅ Faster feedback loops
- ✅ More reliable
- ✅ Better error messages

---

## Risk Mitigation

### High Risk: Evidence Chain Preservation
**Risk**: Lose sourceFactIds tracking
**Mitigation**:
- Keep all prompt templates unchanged
- Test evidence chain after each workflow
- Validate with existing test data

### Medium Risk: Database Migration
**Risk**: Incompatible schema changes
**Mitigation**:
- All migrations are additive (no deletions)
- Test on copy of production data
- Rollback scripts ready

### Low Risk: Third-Party APIs
**Risk**: Trigger.dev, Vercel AI SDK issues
**Mitigation**:
- Free tiers have generous limits
- Fallback to direct OpenAI calls if needed
- Monitor API health

---

## Post-Rebuild: Simplified Flow Example

**Before** (complex):
```
User pastes URL
  ↓
App calls /api/analyze-website
  ↓
API starts polling for results
  ↓
Custom SSE stream sends chunks
  ↓
Custom parsing extracts function calls
  ↓
Manual validation (5 layers)
  ↓
API calls /api/brand-manifest internally
  ↓
Client polls for manifest updates (30s)
  ↓
8 custom hooks update state
  ↓
UI re-renders (maybe)
```

**After** (simple):
```
User pastes URL
  ↓
useChat sends message
  ↓
AI SDK calls analyzeWebsite tool
  ↓
Trigger.dev runs workflow in background
  ↓
Real-time progress updates (<1s)
  ↓
Workflow saves to database
  ↓
Supabase Realtime notifies client
  ↓
Store updates automatically
  ↓
UI re-renders immediately
```

---

## Next Steps After Rebuild

### Week 2: Optimization
- [ ] Add Cloudinary for asset optimization
- [ ] Implement caching with Vercel KV
- [ ] Add Langfuse monitoring
- [ ] Optimize prompts for cost

### Week 3: New Features
- [ ] Multi-user collaboration (Supabase Realtime)
- [ ] A/B testing for generated assets
- [ ] Export to Figma
- [ ] Brand kit templates

### Week 4: Polish
- [ ] Onboarding flow
- [ ] User analytics
- [ ] Cost tracking dashboard
- [ ] Documentation

---

## Conclusion

This strategic rebuild transforms Flowtusk from a complex, fragile codebase into a modern, maintainable AI agent platform. By leveraging Vercel AI SDK, LangGraph, and Trigger.dev, we eliminate 80% of custom infrastructure code and enable rapid feature development.

**Time investment**: 7 focused days
**Long-term gain**: Infinite - sustainable, scalable architecture

**Next**: See `04-simplified-mvp-vision.md` for product simplification strategy.
