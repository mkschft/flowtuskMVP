# Modern AI Stack Research (2025)

## Research Objective

Identify the best modern tools and frameworks for building a production-grade AI brand building agent, with focus on:
1. Web scraping and content extraction
2. AI orchestration and tool calling
3. Design asset generation (logos, colors, typography, UI components)
4. Real-time updates and status tracking
5. Background job processing

## 1. Web Scraping & Content Extraction

### Current Implementation
- **Jina AI Reader** (primary)
- **Firecrawl** (fallback)
- Manual fact extraction with GPT-4o

### Recommended Tools

#### Option A: Browserbase (RECOMMENDED)
**Overview**: Browser automation platform with anti-bot detection

**Pros**:
- ✅ Handles JavaScript-heavy sites
- ✅ Bypasses Cloudflare, bot detection
- ✅ Stealth mode for scraping
- ✅ Screenshot capabilities
- ✅ Session persistence
- ✅ Playwright/Puppeteer compatible

**Cons**:
- ⚠️ More expensive than simple scraping
- ⚠️ Slower than static scrapers

**Pricing**:
- Free tier: 10 hours/month
- Pro: $49/month (100 hours)
- Scale: $299/month (1000 hours)

**Use Case**: Complex websites with heavy JavaScript, SPAs, protected content

**API Example**:
```typescript
import Browserbase from '@browserbase/sdk'

const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY })

async function scrapeWebsite(url: string) {
  const session = await bb.sessions.create()

  const page = await bb.connect(session.id)
  await page.goto(url)

  // Get clean HTML
  const html = await page.content()

  // Take screenshot
  const screenshot = await page.screenshot()

  // Extract text
  const text = await page.evaluate(() => document.body.innerText)

  await bb.sessions.end(session.id)

  return { html, text, screenshot }
}
```

#### Option B: Firecrawl (CURRENT FALLBACK)
**Overview**: API-first web scraping with AI-powered extraction

**Pros**:
- ✅ Simple API
- ✅ Handles JavaScript rendering
- ✅ Clean markdown output
- ✅ LLM-ready format
- ✅ Bulk crawling support

**Cons**:
- ⚠️ Credit-based pricing
- ⚠️ May struggle with heavy bot protection

**Pricing**:
- Free: 500 credits
- Starter: $20/month (3000 credits)
- Standard: $89/month (20,000 credits)

**API Example**:
```typescript
import FirecrawlApp from '@mendable/firecrawl-js'

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

const result = await app.scrapeUrl(url, {
  formats: ['markdown', 'html'],
  onlyMainContent: true,
  waitFor: 2000
})
```

#### Option C: Jina AI Reader (CURRENT PRIMARY)
**Overview**: Free web scraping API optimized for LLMs

**Pros**:
- ✅ Completely free
- ✅ Fast (1-2 seconds)
- ✅ Clean markdown output
- ✅ LLM-optimized extraction
- ✅ Simple REST API

**Cons**:
- ⚠️ Limited JavaScript support
- ⚠️ May miss dynamic content
- ⚠️ No rate limit guarantees

**API Example**:
```typescript
async function scrapeWithJina(url: string) {
  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      'Accept': 'application/json',
      'X-Return-Format': 'markdown'
    }
  })

  const data = await response.json()
  return data.content // Clean markdown
}
```

### Recommendation for Flowtusk

**Hybrid Approach** (best reliability + cost):

```typescript
async function smartScrape(url: string) {
  try {
    // Try Jina first (free, fast)
    const jinaResult = await scrapeWithJina(url)

    if (jinaResult.content.length > 500) {
      return jinaResult
    }
  } catch (error) {
    console.log('Jina failed, falling back...')
  }

  try {
    // Fall back to Firecrawl (paid, reliable)
    const firecrawlResult = await scrapeWithFirecrawl(url)
    return firecrawlResult
  } catch (error) {
    console.log('Firecrawl failed, using Browserbase...')
  }

  // Last resort: Browserbase (expensive but handles everything)
  return await scrapeWithBrowserbase(url)
}
```

**Cost per 100 scrapes**:
- Jina only: $0 (if works)
- Jina + Firecrawl fallback: ~$2
- Full hybrid: ~$5 (with Browserbase for toughest sites)

---

## 2. AI Orchestration & Conversational UI

### Current Implementation
- Custom OpenAI streaming
- Manual function call parsing
- Custom state management
- Manual error handling

### Recommended: Vercel AI SDK (CRITICAL)

**Why It Solves 80% of Current Problems**:

#### A. Streaming Made Simple

**Current** (200+ lines):
```typescript
const stream = await openai.chat.completions.create({...})
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content
  if (content) {
    // Parse content
    // Handle function calls
    // Update state
    // Handle errors
  }
}
```

**With AI SDK** (5 lines):
```typescript
import { useChat } from 'ai/react'

const { messages, input, handleSubmit, isLoading } = useChat({
  api: '/api/chat'
})
```

#### B. Server-Side Streaming

**Current** (300+ lines):
```typescript
export async function POST(request: Request) {
  const stream = await openai.chat.completions.create({
    stream: true,
    // ...
  })

  const readableStream = new ReadableStream({
    async start(controller) {
      // Custom chunk handling
      // Custom function call parsing
      // Custom error recovery
    }
  })

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
```

**With AI SDK** (50 lines):
```typescript
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(request: Request) {
  const { messages } = await request.json()

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      updateManifest: {
        description: 'Update brand manifest',
        parameters: z.object({
          updates: z.record(z.any())
        }),
        execute: async ({ updates }) => {
          await updateBrandManifest(flowId, updates)
          return { success: true }
        }
      }
    },
    onFinish: ({ usage }) => {
      // Track costs automatically
      console.log('Tokens used:', usage.totalTokens)
    }
  })

  return result.toDataStreamResponse()
}
```

#### C. Tool Calling (Function Calling)

**Current** (custom parsing, validation, error handling):
```typescript
// 100+ lines of manual tool call handling
if (chunk.choices[0]?.delta?.tool_calls) {
  // Parse arguments
  // Validate with Zod
  // Execute function
  // Handle errors
  // Send result back to model
}
```

**With AI SDK** (type-safe, automatic):
```typescript
tools: {
  generateLogo: {
    description: 'Generate a brand logo',
    parameters: z.object({
      style: z.enum(['wordmark', 'icon', 'combination']),
      colors: z.array(z.string())
    }),
    execute: async ({ style, colors }) => {
      const logo = await generateLogo({ style, colors })
      return logo
    }
  }
}
```

#### D. Built-in State Management

**No more custom hooks**:
```typescript
const {
  messages,        // Chat history
  input,           // Input value
  handleSubmit,    // Send message
  handleInputChange, // Update input
  isLoading,       // Loading state
  error,           // Error state
  reload,          // Retry last message
  stop,            // Stop generation
  data             // Tool call results
} = useChat()
```

### Features Included in Vercel AI SDK

1. **Streaming**: `useChat`, `useCompletion`, `useAssistant`
2. **Tool Calling**: Type-safe function definitions
3. **Error Handling**: Automatic retry, error boundaries
4. **State Management**: Conversation state managed
5. **Cost Tracking**: Token usage in `onFinish`
6. **Multiple Providers**: OpenAI, Anthropic, Google, local models
7. **React Server Components**: Built-in support
8. **Streaming Objects**: `streamObject()` for structured data

**Installation**:
```bash
npm install ai @ai-sdk/openai
```

**Cost**: FREE (open source)

---

## 3. Multi-Step Workflows & Agent Orchestration

### Current Implementation
- Manual step orchestration with flags
- Polling for status
- No retry logic
- Manual state management

### Option A: LangGraph (RECOMMENDED)

**Overview**: Framework for building stateful, multi-agent workflows

**Why It's Better**:
- ✅ Visual workflow definition
- ✅ Automatic state management
- ✅ Built-in retries and error handling
- ✅ Branching logic
- ✅ Streaming support
- ✅ Human-in-the-loop

**Example**: Flowtusk Generation Pipeline
```typescript
import { StateGraph } from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"

// Define state
interface BrandGenerationState {
  websiteUrl: string
  scrapedContent?: string
  facts?: BrandFacts
  icps?: ICP[]
  selectedIcp?: ICP
  manifest?: BrandManifest
  error?: string
}

// Create workflow
const workflow = new StateGraph<BrandGenerationState>({
  channels: {
    websiteUrl: { value: null },
    scrapedContent: { value: null },
    facts: { value: null },
    icps: { value: null },
    selectedIcp: { value: null },
    manifest: { value: null },
    error: { value: null }
  }
})

// Define nodes (steps)
workflow.addNode("scrape", async (state) => {
  const content = await scrapeWebsite(state.websiteUrl)
  return { scrapedContent: content }
})

workflow.addNode("extractFacts", async (state) => {
  const facts = await extractFactsWithGPT(state.scrapedContent)
  return { facts }
})

workflow.addNode("generateICPs", async (state) => {
  const icps = await generateICPs(state.facts)
  return { icps }
})

workflow.addNode("createManifest", async (state) => {
  const manifest = await createBrandManifest(state.selectedIcp, state.facts)
  return { manifest }
})

// Define edges (flow)
workflow.addEdge("scrape", "extractFacts")
workflow.addEdge("extractFacts", "generateICPs")
workflow.addConditionalEdges(
  "generateICPs",
  (state) => state.selectedIcp ? "createManifest" : "waitForSelection"
)

// Set entry point
workflow.setEntryPoint("scrape")

// Compile
const app = workflow.compile()

// Run workflow
const result = await app.invoke({
  websiteUrl: "https://example.com"
})

// Or stream progress
for await (const step of app.stream({ websiteUrl: "https://example.com" })) {
  console.log("Step complete:", step)
  // Send real-time updates to client
}
```

**Features**:
- Automatic state persistence
- Retry failed nodes
- Parallel execution where possible
- Conditional branching
- Streaming progress updates
- Checkpointing (resume from failure)

**Pricing**: FREE (open source)

### Option B: OpenAI Assistants API

**Overview**: OpenAI-hosted agents with built-in tools

**Pros**:
- ✅ Managed by OpenAI
- ✅ Built-in file handling
- ✅ Code interpreter
- ✅ Function calling
- ✅ Conversation memory

**Cons**:
- ⚠️ Vendor lock-in
- ⚠️ Less control over orchestration
- ⚠️ Higher cost (storage + compute)

**Example**:
```typescript
const assistant = await openai.beta.assistants.create({
  model: "gpt-4o",
  name: "Flowtusk Brand Agent",
  instructions: "Help users build their brand identity",
  tools: [
    { type: "function", function: analyzeWebsiteFunction },
    { type: "function", function: generateICPsFunction },
    { type: "function", function: createManifestFunction }
  ]
})

const thread = await openai.beta.threads.create()

const run = await openai.beta.threads.runs.createAndStream(
  thread.id,
  { assistant_id: assistant.id }
)

for await (const event of run) {
  // Handle streaming events
}
```

**Pricing**:
- Usage: Standard GPT-4 pricing
- Storage: $0.20/GB/month for files

### Option C: Vercel AI SDK Tools (Simple Projects)

**For simpler workflows**, Vercel AI SDK's built-in tools may be enough:

```typescript
const result = streamText({
  model: openai('gpt-4o'),
  tools: {
    scrapeWebsite: {...},
    generateICPs: {...},
    createManifest: {...}
  },
  maxSteps: 10 // Multi-step execution
})
```

**Pros**:
- ✅ Simpler than LangGraph
- ✅ Built into AI SDK
- ✅ Good for linear workflows

**Cons**:
- ⚠️ Less control than LangGraph
- ⚠️ No visual workflow
- ⚠️ Limited branching logic

### Recommendation for Flowtusk

**Use LangGraph** because:
1. Complex multi-step workflow (scrape → facts → ICPs → manifest → assets)
2. Need conditional branching (user selects ICP)
3. Need retry logic (scraping can fail)
4. Want streaming progress updates
5. Open source (no vendor lock-in)

---

## 4. Background Jobs & Long-Running Tasks

### Current Problem
- Website analysis takes 30 seconds
- User waits or polling required
- No retry if fails
- Progress tracking is manual

### Option A: Trigger.dev (RECOMMENDED)

**Overview**: Background job platform with built-in retries, logging, and real-time updates

**Why It's Perfect for Flowtusk**:
- ✅ Automatic retries with exponential backoff
- ✅ Real-time progress updates to client
- ✅ Job queue management
- ✅ Cron scheduling
- ✅ Visual dashboard
- ✅ Vercel integration
- ✅ Built-in logging

**Example**:
```typescript
// trigger/analyze-website.ts
import { eventTrigger } from "@trigger.dev/sdk"
import { client } from "@/trigger"

export const analyzeWebsite = client.defineJob({
  id: "analyze-website",
  name: "Analyze Website",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "website.analyze"
  }),
  run: async (payload, io, ctx) => {
    // Step 1: Scrape
    const content = await io.runTask("scrape", async () => {
      return await scrapeWebsite(payload.url)
    })

    // Send progress update
    await io.sendEvent("progress", {
      step: "scraping",
      progress: 25
    })

    // Step 2: Extract facts
    const facts = await io.runTask("extract-facts", async () => {
      return await extractFacts(content)
    })

    await io.sendEvent("progress", {
      step: "extracting-facts",
      progress: 50
    })

    // Step 3: Generate ICPs
    const icps = await io.runTask("generate-icps", async () => {
      return await generateICPs(facts)
    })

    await io.sendEvent("progress", {
      step: "generating-icps",
      progress: 75
    })

    // Step 4: Save to database
    await io.runTask("save", async () => {
      await supabase.from('flows').update({
        facts_json: facts,
        generated_content: { icps }
      }).eq('id', payload.flowId)
    })

    // Complete
    await io.sendEvent("complete", {
      progress: 100,
      flowId: payload.flowId
    })

    return { success: true, icps }
  }
})
```

**Trigger from API**:
```typescript
// app/api/analyze-website/route.ts
import { analyzeWebsite } from "@/trigger/analyze-website"

export async function POST(request: Request) {
  const { url, flowId } = await request.json()

  // Trigger background job
  const event = await analyzeWebsite.trigger({
    url,
    flowId
  })

  // Return immediately
  return Response.json({
    jobId: event.id,
    status: "processing"
  })
}
```

**Client receives real-time updates**:
```typescript
// Client-side
const { subscribe } = useTrigger()

useEffect(() => {
  const unsubscribe = subscribe('progress', (event) => {
    setProgress(event.progress)
    setStep(event.step)
  })

  return unsubscribe
}, [])
```

**Pricing**:
- Free: 100,000 task executions/month
- Pro: $20/month (1M executions)
- Scale: Custom

**Features**:
- Automatic retries (configurable)
- Task timeout handling
- Concurrency limits
- Rate limiting
- Scheduled jobs (cron)
- Webhooks
- Real-time dashboard

### Option B: Inngest

**Similar to Trigger.dev**, slightly different API:

```typescript
export const analyzeWebsite = inngest.createFunction(
  { id: "analyze-website" },
  { event: "website/analyze" },
  async ({ event, step }) => {
    const content = await step.run("scrape", async () => {
      return await scrapeWebsite(event.data.url)
    })

    // Automatic retries, progress tracking
  }
)
```

**Pricing**:
- Free: 50,000 steps/month
- Pro: $20/month (250K steps)

### Option C: Vercel Cron + Database Queue

**DIY approach** using Vercel cron + database:

**Pros**:
- ✅ No additional service
- ✅ Full control

**Cons**:
- ⚠️ Manual retry logic
- ⚠️ No built-in progress tracking
- ⚠️ More code to maintain

**Not recommended** when Trigger.dev exists.

### Recommendation for Flowtusk

**Use Trigger.dev** because:
1. Website analysis (30s) is perfect for background jobs
2. Need automatic retries (scraping can fail)
3. Want real-time progress updates
4. Free tier is generous
5. Vercel integration is seamless
6. Dashboard for debugging

---

## 5. Design Asset Generation

### A. Logo Generation

#### Option 1: DALL-E 3 (OpenAI)
**Best for**: Abstract logos, icons

**Pros**:
- ✅ High quality
- ✅ Good variety
- ✅ Official API

**Cons**:
- ⚠️ Poor text rendering
- ⚠️ PNG only (no SVG)

**Pricing**: $0.080 per image (1024x1024 HD)

**API**:
```typescript
const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: "minimalist tech startup logo, blue and white, geometric",
  size: "1024x1024",
  quality: "hd"
})
```

#### Option 2: Ideogram AI
**Best for**: Text-heavy logos, wordmarks

**Pros**:
- ✅ EXCELLENT text rendering
- ✅ Best-in-class typography
- ✅ Magic Prompt feature

**Cons**:
- ⚠️ Newer service (less proven)
- ⚠️ API in beta

**Pricing**: ~$0.08 per image (estimated)

**Recommendation**: Use Ideogram for wordmarks, DALL-E for icons

#### Option 3: GPT-4 SVG Generation
**Best for**: Simple text logos

**Current implementation** - Keep this as efficient fallback

### B. UI Component Generation

**Approach**: GPT-4 Turbo with v0-style prompts

```typescript
const systemPrompt = `You are an expert React developer. Generate
production-ready components using TypeScript, Tailwind CSS, and shadcn/ui.`

const component = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Create a ${componentType} using these brand colors: ${colors}` }
  ]
})
```

**Cost**: ~$0.02-0.05 per component

### C. Color Palettes

**Option 1: GPT-4 (Recommended)**
```typescript
const palette = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  response_format: { type: "json_object" },
  messages: [{
    role: "user",
    content: `Generate a cohesive color palette for a ${industry} brand
    with ${values} values. Return JSON with primary, secondary, accent,
    neutral colors and rationale.`
  }]
})
```

**Option 2: Huemint API**
ML-based aesthetic palettes:
```typescript
const palette = await fetch('https://api.huemint.com/color', {
  method: 'POST',
  body: JSON.stringify({
    mode: 'transformer',
    num_colors: 5
  })
})
```

**Recommendation**: Hybrid - GPT-4 for brand strategy, Huemint for variety

### D. Typography

**Continue using**:
- Google Fonts API (free, comprehensive)
- GPT-4 for intelligent pairing

```typescript
const pairing = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  response_format: { type: "json_object" },
  messages: [{
    role: "user",
    content: `Suggest 3 Google Font pairings for a ${brandStyle} brand.`
  }]
})
```

---

## 6. Asset Storage & Delivery

### Option A: Supabase Storage (Current - Keep)
**For**: Master asset storage

**Pros**:
- ✅ Already integrated
- ✅ Built-in CDN
- ✅ RLS for access control
- ✅ Automatic transformations

**Pricing**: 1GB free, $0.021/GB/month

### Option B: Cloudinary (Add for optimization)
**For**: Asset delivery and transformations

**Pros**:
- ✅ On-the-fly transformations
- ✅ Format optimization (WebP, AVIF)
- ✅ Responsive images
- ✅ Better CDN

**Pricing**: 25GB free, then $89/month

**Recommendation**:
- Store in Supabase (master copy)
- Mirror to Cloudinary for delivery

---

## 7. Real-Time Updates

### Current: 30-Second Polling
❌ Poor UX
❌ Wastes bandwidth
❌ Race conditions

### Option A: Vercel AI SDK Streaming (RECOMMENDED)
**Built into AI SDK**:
```typescript
// Client automatically gets real-time updates
const { messages, data } = useChat()

// data contains tool call results in real-time
```

**No WebSocket needed** - SSE handles it

### Option B: Supabase Realtime
**For database changes**:
```typescript
const channel = supabase
  .channel('brand-manifest-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'brand_manifests',
    filter: `flow_id=eq.${flowId}`
  }, (payload) => {
    setManifest(payload.new)
  })
  .subscribe()
```

**Recommendation**: Use both
- AI SDK streaming for chat/generation
- Supabase Realtime for multi-user collaboration (future)

---

## 8. Monitoring & Observability

### Option A: Langfuse (RECOMMENDED)
**For**: AI agent monitoring

**Features**:
- Trace all LLM calls
- Cost tracking
- Prompt versioning
- User feedback collection
- Performance analytics

**Pricing**: Free tier available

### Option B: LangSmith
Similar to Langfuse, LangChain ecosystem

---

## Final Stack Recommendation

### Core Stack
1. **Framework**: Next.js 15 + React 19 + TypeScript ✅ (Keep)
2. **AI SDK**: Vercel AI SDK 🆕 (Add)
3. **Workflow Engine**: LangGraph 🆕 (Add)
4. **Background Jobs**: Trigger.dev 🆕 (Add)
5. **Database**: Supabase ✅ (Keep)
6. **Deployment**: Vercel ✅ (Keep)

### Scraping
1. **Primary**: Jina AI (free, fast)
2. **Fallback**: Firecrawl (reliable)
3. **Heavy sites**: Browserbase (powerful)

### Asset Generation
1. **Logos**: Ideogram AI (text) + DALL-E 3 (icons)
2. **UI Components**: GPT-4 Turbo
3. **Colors**: GPT-4 + Huemint
4. **Typography**: Google Fonts + GPT-4 pairing

### Asset Delivery
1. **Storage**: Supabase Storage
2. **CDN**: Cloudinary (add later)

### Real-Time
1. **Chat streaming**: Vercel AI SDK
2. **Database updates**: Supabase Realtime

### Monitoring
1. **AI tracking**: Langfuse
2. **Application**: Vercel Analytics

---

## Cost Analysis

### Monthly Costs (1000 brands)

**AI & Generation**:
- OpenAI (GPT-4o, DALL-E): ~$300
- Ideogram: ~$50
- Total AI: ~$350

**Infrastructure**:
- Vercel: $20 (Pro plan)
- Supabase: Free tier sufficient
- Trigger.dev: Free tier sufficient
- Cloudinary: Free tier sufficient
- Total Infrastructure: ~$20

**Scraping**:
- Jina: Free
- Firecrawl: ~$50
- Browserbase: ~$50
- Total Scraping: ~$100

**Grand Total**: ~$470/month for 1000 brands
**Per Brand**: ~$0.47

### Cost Optimization
- Use Jina primarily (free)
- Cache common patterns
- Batch operations with Trigger.dev
- Optimize prompts for token efficiency

---

## Implementation Priority

### Week 1: Core Migration
1. Install Vercel AI SDK
2. Replace chat streaming
3. Implement basic tools

### Week 2: Workflows
1. Add LangGraph
2. Build generation pipeline
3. Test end-to-end

### Week 3: Background Jobs
1. Set up Trigger.dev
2. Move long tasks to background
3. Implement progress tracking

### Week 4: Polish
1. Add monitoring (Langfuse)
2. Optimize costs
3. Performance testing

---

## Next Document
See `03-rebuild-strategy.md` for detailed implementation plan.
