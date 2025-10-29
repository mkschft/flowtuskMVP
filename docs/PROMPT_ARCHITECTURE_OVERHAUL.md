# Prompt Architecture Overhaul - Complete Implementation Guide

**Date:** October 29, 2025
**Status:** Planning Phase
**Goal:** Transform generic outputs into specific, evidence-based content through structured prompt engineering

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [OpenAI's Recommendations](#openais-recommendations)
4. [Implementation Plan](#implementation-plan)
5. [File Structure](#file-structure)
6. [Success Metrics](#success-metrics)
7. [Timeline](#timeline)

---

## Executive Summary

### Current Problems
- ❌ **Generic outputs**: "Use social media..." instead of specific, actionable advice
- ❌ **No evidence tracking**: Claims aren't tied to website facts
- ❌ **Context loss**: Website content disappears after ICP generation
- ❌ **Single-layer prompts**: Just "do X" without structure or grounding
- ❌ **No few-shot examples**: Model has no reference for quality
- ❌ **Inefficient model usage**: Same model for all tasks (expensive + slow)

### Solution Overview
Transform the prompt architecture with:
- **3-layer message stack**: System (role) → Developer (contract) → User (data)
- **Facts JSON**: Extract once, reuse everywhere with evidence tracking
- **Model routing**: GPT-4o for extraction, GPT-4o-mini for generation
- **Few-shot examples**: Show the model what quality looks like
- **Progressive disclosure**: Micro-choices before generation

### Expected Outcomes
- ✅ Specific, grounded outputs citing actual website facts
- ✅ 60% cost reduction (GPT-4o only for fact extraction)
- ✅ Evidence tracking (every claim → fact IDs)
- ✅ Consistent, high-quality outputs
- ✅ Better UX with progressive disclosure

---

## Current State Analysis

### Prompt Chain Flow (Current)

```
Website Analysis (Jina/Firecrawl)
         ↓
    ICP Generation (gpt-4o-mini, temp 0.8)
         ↓
    Value Prop Generation (gpt-4o-mini, temp 0.8)
         ↓
    Content Generation (Email/LinkedIn)
```

### Critical Issues Found

#### 1. No Few-Shot Examples
**Every prompt** relies purely on instructions with NO examples. This causes inconsistent outputs.

**Current prompt structure:**
```
System: "You are a B2B marketing expert."
User: "Generate 3 ICPs. Return JSON."
```

**Missing:**
```
Example ICP:
{
  "title": "Mid-Market HR Directors",
  "pains": ["Manual paperwork", "Compliance risks"],
  "evidence": ["fact-2", "fact-5"]
}
```

#### 2. Context Loss
- **Website content** (10k-15k chars) extracted → Used for ICP generation → **LOST**
- **Value Prop data** passed to Email/LinkedIn but **NOT explicitly referenced** in prompts
- **Generated metrics** (painPointsWithMetrics, opportunityMultiplier) calculated but **NEVER used again**

#### 3. Unused Data
- **Brand colors** generated in ICP step but never used
- **Business metrics** calculated but not cascaded
- **Persona details** inconsistently referenced across routes

#### 4. Single-Layer Prompts
Current prompts are just instructions, no structure:

```typescript
// Current approach
const prompt = `You are an expert. Generate X in JSON format.`;
```

**Should be:**
```typescript
const prompt = {
  system: "You are X. Output valid JSON. Be specific.",
  developer: "Task: Generate Y. Rules: honor schema, quantify, cite facts.",
  user: "Website facts: {...}\nICP: {...}\nSchema: {...}"
};
```

---

## OpenAI's Recommendations

### Problem Diagnosis
> "Your logs show 'generic marketing tips,' which means the prompts at some stages are too shallow and not grounded in the site/ICP."

### Core Solution: 3-Layer Prompt Architecture

#### Layer 1: System (Role/Guardrails/Voice)
```
"You are a B2B marketing strategist. Output **valid JSON** that adheres to the
provided schema. Be specific, quantify benefits, avoid clichés. If required
info is missing, return empty strings/arrays—do NOT invent."
```

#### Layer 2: Developer (Task Contract & Rules)
```
"Task: Given website facts + ICP, generate [artifact].
Rules:
- Honor schema
- Keep body ≤ N words
- Include CTA
- No hyperlinks unless provided
- Keep claims verifiable
- Cite which input fact you used (as `sourceFactIds`)"
```

#### Layer 3: User (Grounding Context)
```
"Website summary: …
Extracted facts: [{id, text, page, evidence}]
Selected ICP: …
Output schema: …
Now generate …"
```

### Temperature Guidelines
- **Fact extraction**: 0.2–0.4 (low, factual)
- **Copy generation**: 0.6–0.8 (moderate, creative)

---

## OpenAI's Stage-by-Stage Templates

### Stage A: Website Analysis → Facts JSON

**Goal:** Turn site into *facts* you can reuse
**Model:** GPT-4o (best reasoning)
**Temperature:** 0.2-0.4

```
INPUT_WEBSITE_HTML_OR_MD: {{content_truncated}}
TASK: Extract verifiable FACTS & page structure.

RETURN JSON:
{
  "brand": {
    "name": "",
    "tones": ["concise","serious"],
    "primaryCTA": ""
  },
  "structure": {
    "nav": ["", ...],
    "keyPages": [{"path":"","title":""}],
    "footer": ["",""]
  },
  "audienceSignals": ["", ...],
  "valueProps": [
    {"id":"v1","text":"","evidence":["fact-3","fact-7"]}
  ],
  "pains": ["", ...],
  "proof": ["certifications","logos","metrics"],
  "facts": [
    {"id":"fact-1","text":"", "page":"/pricing", "evidence":"exact snippet"}
  ]
}

CONSTRAINTS:
- Use ONLY content in INPUT_WEBSITE_HTML_OR_MD
- Keep `facts` atomic and cite `page`
- No marketing advice here
```

### Stage B: ICP Generation (3 Options)

**Model:** GPT-4o-mini
**Temperature:** 0.7

```
WEBSITE_FACTS: {{facts_json}}
RETURN JSON: {
  "icps":[
    {
      "id":"icp-1",
      "title":"",
      "description":"",
      "pains":[""],
      "goals":[""],
      "demographics":"",
      "role":"",
      "country":"",
      "objections":[""],
      "proofToShow":[""],
      "successMetrics":[""],
      "evidence": ["fact-2", "fact-5"]
    }
  ],
  "summary":{
    "businessDescription":"",
    "targetMarket":""
  }
}

RULES:
- Use only WEBSITE_FACTS
- When uncertain, leave fields "" or []
- Each pain/goal must map to at least one website fact via evidence
```

### Stage C: Value Proposition

**Model:** GPT-4o-mini
**Temperature:** 0.7

```
WEBSITE_FACTS: {{facts_json}}
ICP: {{icp_json}}

SCHEMA: {
  "summary":{
    "mainInsight":"",
    "painPointsAddressed":[""],
    "expectedImpact":""
  },
  "variables":[
    {"key":"role","label":"Target Role","selectedValue":""},
    ...
  ],
  "variations":[
    {
      "id":"benefit-first",
      "text":"",
      "useCase":"hero",
      "sourceFactIds":["fact-3","fact-7"]
    },
    {
      "id":"pain-first",
      "text":"",
      "useCase":"email",
      "sourceFactIds":["fact-2"]
    }
  ]
}

RULES:
- Keep each `text` 1–2 sentences
- Quantify if a fact supports it
- Attach evidence ids (sourceFactIds)
- No generic advice
- Map to ICP.pains/goals and WEBSITE_FACTS.valueProps
```

### Stage D: Email Generation

**Model:** GPT-4o-mini
**Temperature:** 0.7

```
CONTEXT: {valueProp, ICP, WEBSITE_FACTS}
STYLE: "Greetings" | "Book a call"
TONE: {{user_selected_tone}}
CTA_TYPE: {{user_selected_cta}}

SCHEMA: {
  "subject":"",
  "body":"",
  "tone":"",
  "callToAction":"",
  "sourceFactIds":["fact-2","fact-5"]
}

RULES:
- 120–180 words max
- 1 CTA
- Include a concrete next step
- Cite which facts inform claims
```

### Stage E: LinkedIn Generation

**Model:** GPT-4o-mini
**Temperature:** 0.7

```
CONTEXT: {valueProp, ICP, WEBSITE_FACTS}
TYPE: "post" | "profile_bio" | "inmail"

SCHEMA: {
  "type":"",
  "content":"",
  "suggestedHashtags":[""],
  "callToAction":"",
  "sourceFactIds":[""]
}

RULES:
- Post: hook 1 line + 3 bullets + 1 CTA + 2–4 hashtags
- Profile bio: 2–3 sentences + 3 capability bullets + 1 CTA
- InMail: 60–120 words, one ask, one CTA
- No emojis unless TYPE=post
```

---

## Implementation Plan

### PHASE 1: Centralize Prompts & Add 3-Layer Architecture
**Timeline:** Week 1
**Priority:** HIGH

#### Tasks
1. Create `lib/prompt-templates.ts` with template builders:
   - `buildAnalyzePrompt()` - Facts extraction
   - `buildICPPrompt(facts)` - ICP generation
   - `buildValuePropPrompt(facts, icp)` - Value prop
   - `buildEmailPrompt(type, facts, icp, valueProp, userChoices)` - Email
   - `buildLinkedInPrompt(type, facts, icp, valueProp)` - LinkedIn

2. Each template returns:
   ```typescript
   interface PromptTemplate {
     system: string;      // Role, guardrails, voice
     developer: string;   // Task contract, rules, schema
     user: string;        // Grounding context, actual data
     schema: object;      // JSON schema for validation
   }
   ```

3. Update all 6 API routes to use templates

#### Files to Create
- `lib/prompt-templates.ts`

#### Files to Modify
- `app/api/analyze-website/route.ts`
- `app/api/generate-icps/route.ts`
- `app/api/generate-value-prop/route.ts`
- `app/api/generate-one-time-email/route.ts`
- `app/api/generate-email-sequence/route.ts`
- `app/api/generate-linkedin-outreach/route.ts`

---

### PHASE 2: Implement Facts JSON Extraction
**Timeline:** Week 2
**Priority:** HIGH

#### Tasks
1. **Upgrade `/api/analyze-website/route.ts`**:
   - Use **GPT-4o** (better reasoning) for this stage only
   - Implement Facts JSON schema from OpenAI template
   - Temperature: **0.2-0.4** (factual extraction)
   - Cache Facts JSON in conversation state

2. **Update downstream routes**:
   - Pass `factsJson` to ICP, Value Prop, Email, LinkedIn routes
   - Remove redundant website content passing

#### New Schema
```typescript
interface FactsJSON {
  brand: {
    name: string;
    tones: string[];
    primaryCTA: string;
  };
  structure: {
    nav: string[];
    keyPages: Array<{path: string; title: string}>;
    footer: string[];
  };
  audienceSignals: string[];
  valueProps: Array<{
    id: string;
    text: string;
    evidence: string[];
  }>;
  pains: string[];
  proof: string[];
  facts: Array<{
    id: string;
    text: string;
    page: string;
    evidence: string;
  }>;
}
```

#### Files to Modify
- `app/api/analyze-website/route.ts` (major rewrite)
- All downstream routes (add factsJson parameter)
- `app/app/page.tsx` (state management for factsJson)

---

### PHASE 3: Add Evidence Tracking & Validation
**Timeline:** Week 2-3
**Priority:** HIGH

#### Tasks
1. **Add `sourceFactIds` to all schemas**:
   ```typescript
   // Value Prop variation
   {
     id: "benefit-first",
     text: "40% faster onboarding...",
     sourceFactIds: ["fact-3", "fact-7"],
     useCase: "hero"
   }

   // Email
   {
     subject: "...",
     body: "...",
     sourceFactIds: ["fact-2", "fact-5"]
   }
   ```

2. **Update validators** in `lib/validators.ts`:
   - Add `sourceFactIds: z.array(z.string()).optional()`
   - Make it recommended in prompts

3. **Add auto-repair logic**:
   ```typescript
   // In lib/api-handler.ts
   export async function callWithAutoRepair<T>(
     promptFn: () => PromptTemplate,
     validateFn: (data: unknown) => ValidationResult<T>,
     modelConfig: ModelConfig
   ): Promise<T> {
     let result = await callOpenAI(promptFn(), modelConfig);

     if (!validateFn(result).ok) {
       // One retry with explicit instruction
       const repairPrompt = {
         ...promptFn(),
         user: promptFn().user + "\n\nIMPORTANT: Return strictly valid JSON matching the schema. Do not include commentary."
       };
       result = await callOpenAI(repairPrompt, modelConfig);
     }

     return result;
   }
   ```

#### Files to Modify
- `lib/validators.ts` (add sourceFactIds to all schemas)
- `lib/api-handler.ts` (add callWithAutoRepair function)
- All generation routes (use callWithAutoRepair)

---

### PHASE 4: Model Routing & Performance
**Timeline:** Week 3
**Priority:** MEDIUM

#### Tasks
1. **Create model configuration** in `lib/models.ts`:
   ```typescript
   export const MODELS = {
     ANALYZE: 'gpt-4o',           // Best for fact extraction
     GENERATE: 'gpt-4o-mini',      // Cheap for everything else
   };

   export const TEMPERATURES = {
     EXTRACT: 0.3,                 // Low for facts
     GENERATE: 0.7,                // Moderate for copy
   };

   export const TIMEOUTS = {
     ANALYZE: 45000,               // 45s for complex extraction
     GENERATE: 30000,              // 30s for generation
     SEQUENCE: 40000,              // 40s for email sequences
   };
   ```

2. **Update routes**:
   - `/api/analyze-website` → GPT-4o (0.3 temp, 45s timeout)
   - All other routes → GPT-4o-mini (0.7 temp, 30s timeout)

3. **Add caching**:
   - Cache Facts JSON in conversation state
   - Add cache invalidation only if URL changes
   - Display cache indicator in UI

#### Cost Savings Calculation
**Before:**
- All stages use GPT-4o-mini: ~$0.02 per full flow

**After:**
- Stage A (Facts): GPT-4o @ $0.005
- Stages B-E: GPT-4o-mini @ $0.015
- **Total: ~$0.02** BUT Facts JSON cached = **60% savings on subsequent runs**

#### Files to Create
- `lib/models.ts`

#### Files to Modify
- All API routes (use model routing)
- `app/app/page.tsx` (add caching logic)

---

### PHASE 5: UX Improvements & Micro-Choices
**Timeline:** Week 4
**Priority:** MEDIUM

#### Tasks
1. **Create micro-choice components**:
   - `ToneChoice.tsx` - Formal | Conversational | Friendly
   - `CTAChoice.tsx` - Book a call | Get a demo | Learn more
   - `LengthChoice.tsx` - Short (120w) | Medium (180w) | Long (250w)

2. **Update conversation flow** in `page.tsx`:
   ```
   Value Prop Generated
   ↓
   "Where would you like to use this?"
   [ Email ] [ LinkedIn ]
   ↓ (if Email)
   "What tone?"
   [ Formal ] [ Conversational ] [ Friendly ]
   ↓
   "What's your primary goal?"
   [ Book a call ] [ Get a demo ] [ Learn more ]
   ↓
   "Email length?"
   [ Short (120w) ] [ Medium (180w) ] [ Long (250w) ]
   ↓
   "Email type?"
   [ Single ] [ Sequence 5 ] [ Sequence 7 ] [ Sequence 10 ]
   ↓
   Generate with full context
   ```

3. **Compact card rendering**:
   - Replace heavy editors with compact cards
   - Add "Why this?" expandable showing evidence:
     ```
     📌 This copy is based on:
     • fact-3: "40% faster onboarding" (from /features page)
     • fact-7: "Integrated compliance checks" (from /about page)
     ```
   - Add "Regenerate variants" button
   - Add "Copy" and "Export" actions

#### New Components
```typescript
// components/ToneChoice.tsx
interface ToneChoiceProps {
  onSelect: (tone: 'formal' | 'conversational' | 'friendly') => void;
}

// components/CTAChoice.tsx
interface CTAChoiceProps {
  onSelect: (cta: 'book-call' | 'get-demo' | 'learn-more') => void;
}

// components/LengthChoice.tsx
interface LengthChoiceProps {
  onSelect: (length: 'short' | 'medium' | 'long') => void;
}

// components/EvidenceCard.tsx
interface EvidenceCardProps {
  content: string;
  sourceFactIds: string[];
  facts: FactsJSON['facts'];
  onCopy: () => void;
  onRegenerate: () => void;
}
```

#### Files to Create
- `components/ToneChoice.tsx`
- `components/CTAChoice.tsx`
- `components/LengthChoice.tsx`
- `components/EvidenceCard.tsx`

#### Files to Modify
- `app/app/page.tsx` (add micro-choice flow)
- Email/LinkedIn generation routes (accept user choices)

---

### PHASE 6: Few-Shot Examples & Polish
**Timeline:** Week 4-5
**Priority:** LOW

#### Tasks
1. **Create example library** in `lib/few-shot-examples.ts`:
   ```typescript
   export const FEW_SHOT_ICP = {
     input: "Website about tax software for accountants...",
     output: {
       title: "Mid-Market Accounting Firm Owners",
       pains: ["Manual tax calculations", "Compliance risks", "Time constraints"],
       goals: ["Automate workflows", "Reduce errors", "Scale client base"],
       evidence: ["fact-2", "fact-5", "fact-8"]
     }
   };

   export const FEW_SHOT_VALUE_PROP = {
     input: {icp: {...}, facts: {...}},
     output: {
       variations: [{
         id: "benefit-first",
         text: "Cut tax preparation time by 40% with AI-powered automation and built-in compliance checks.",
         sourceFactIds: ["fact-3", "fact-7"],
         useCase: "hero"
       }]
     }
   };
   ```

2. **Add to prompt templates**:
   ```typescript
   // In buildICPPrompt()
   developer: `
   Task: Generate 3 ICPs from website facts.

   Example:
   ${JSON.stringify(FEW_SHOT_ICP.output, null, 2)}

   Rules: ...
   `
   ```

3. **Quality checks**:
   - Add output validation scoring
   - Track which facts are used most
   - Monitor evidence citation rates

#### Files to Create
- `lib/few-shot-examples.ts`

#### Files to Modify
- `lib/prompt-templates.ts` (include few-shot examples)

---

## File Structure (After Implementation)

```
app/
├── api/
│   ├── analyze-website/
│   │   └── route.ts              # UPDATED: Facts JSON extraction (GPT-4o)
│   ├── generate-icps/
│   │   └── route.ts              # UPDATED: Use facts + templates
│   ├── generate-value-prop/
│   │   └── route.ts              # UPDATED: Use facts + templates
│   ├── generate-one-time-email/
│   │   └── route.ts              # UPDATED: Use facts + templates + user choices
│   ├── generate-email-sequence/
│   │   └── route.ts              # UPDATED: Use facts + templates
│   └── generate-linkedin-outreach/
│       └── route.ts              # UPDATED: Use facts + templates
│
├── app/
│   └── page.tsx                  # UPDATED: Micro-choice flow, Facts caching
│
└── components/
    ├── ToneChoice.tsx            # NEW: Tone selection chips
    ├── CTAChoice.tsx             # NEW: CTA selection chips
    ├── LengthChoice.tsx          # NEW: Length selection chips
    ├── EvidenceCard.tsx          # NEW: Compact card with evidence
    └── (existing components)     # UPDATED as needed

lib/
├── prompt-templates.ts           # NEW: All prompt builders (3-layer)
├── models.ts                     # NEW: Model routing config
├── few-shot-examples.ts          # NEW: Example library
├── validators.ts                 # UPDATED: Add sourceFactIds
├── api-handler.ts                # UPDATED: Add callWithAutoRepair
└── error-mapper.ts               # Existing

docs/
└── PROMPT_ARCHITECTURE_OVERHAUL.md # THIS FILE
```

---

## Success Metrics

### Before Implementation
| Metric | Current State |
|--------|--------------|
| Output Quality | ❌ Generic "Use social media" tips |
| Evidence | ❌ No fact tracking |
| Consistency | ❌ Varies widely between runs |
| Context Usage | ❌ Website content lost after ICP |
| Cost per Flow | ~$0.02 (all GPT-4o-mini) |
| User Experience | ❌ Heavy editors, no explanation |

### After Implementation
| Metric | Target State |
|--------|-------------|
| Output Quality | ✅ Specific, actionable, grounded in facts |
| Evidence | ✅ Every claim → fact IDs |
| Consistency | ✅ Structured, repeatable outputs |
| Context Usage | ✅ Facts JSON reused across all stages |
| Cost per Flow | ~$0.008 (60% savings with caching) |
| User Experience | ✅ Progressive disclosure, compact cards, evidence shown |

### KPIs to Track
1. **Evidence Citation Rate**: % of outputs with sourceFactIds
2. **Fact Reuse Rate**: Average # of facts cited per output
3. **User Satisfaction**: Qualitative feedback on specificity
4. **Generation Time**: End-to-end flow duration
5. **Cost per Flow**: Total OpenAI API cost
6. **Cache Hit Rate**: % of flows using cached Facts JSON

---

## Timeline

### Week 1: Foundation
- [ ] Create `lib/prompt-templates.ts` with 3-layer architecture
- [ ] Update one route (Value Prop) as proof of concept
- [ ] Test output quality improvement

### Week 2: Core Infrastructure
- [ ] Implement Facts JSON extraction (GPT-4o)
- [ ] Update all routes to use facts
- [ ] Add evidence tracking to schemas

### Week 3: Performance
- [ ] Add model routing (GPT-4o for extract, GPT-4o-mini for generate)
- [ ] Implement caching for Facts JSON
- [ ] Add auto-repair logic

### Week 4: User Experience
- [ ] Create micro-choice components
- [ ] Update conversation flow
- [ ] Add compact cards with evidence

### Week 5: Polish
- [ ] Add few-shot examples
- [ ] Quality checks and monitoring
- [ ] Documentation and testing

---

## Quick Wins (Can Implement Tonight)

### 1. Create Prompt Templates File
**Time:** 30 minutes
**Impact:** HIGH

Create `lib/prompt-templates.ts` with basic structure:
```typescript
export function buildValuePropPrompt(facts: FactsJSON, icp: ICP) {
  return {
    system: "You are a conversion copywriter. Output valid JSON.",
    developer: "Task: Generate value props. Rules: cite facts, quantify, be specific.",
    user: `Facts: ${JSON.stringify(facts)}\nICP: ${JSON.stringify(icp)}`
  };
}
```

### 2. Update Value Prop Route
**Time:** 20 minutes
**Impact:** HIGH

Modify `/api/generate-value-prop/route.ts` to use template:
```typescript
import { buildValuePropPrompt } from '@/lib/prompt-templates';

const { system, developer, user } = buildValuePropPrompt(facts, icp);
const result = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: system },
    { role: "developer", content: developer },
    { role: "user", content: user }
  ]
});
```

### 3. Test Output Quality
**Time:** 10 minutes
**Impact:** HIGH

Run a test flow and compare before/after outputs. You should see more specific, grounded content immediately.

---

## Implementation Notes

### Model Costs (GPT Pricing)
- **GPT-4o**: $0.0025/1K input tokens, $0.010/1K output tokens
- **GPT-4o-mini**: $0.00015/1K input tokens, $0.0006/1K output tokens

### Typical Token Counts
- Facts extraction: ~5K input, ~2K output
- ICP generation: ~3K input, ~1K output
- Value prop: ~2K input, ~1K output
- Email: ~1.5K input, ~0.5K output

### Cost Comparison (Full Flow)
**Before (all GPT-4o-mini):**
- Analyze: $0.003
- ICP: $0.002
- Value Prop: $0.002
- Email: $0.001
- **Total: ~$0.008**

**After (optimized):**
- Analyze (GPT-4o, once): $0.025
- ICP (cached facts): $0.002
- Value Prop (cached facts): $0.002
- Email (cached facts): $0.001
- **First run: ~$0.030**
- **Subsequent runs (cached): ~$0.005** (83% savings!)

---

## Appendix: Current Prompt Examples

### Current ICP Generation Prompt (99 lines)
Located in: `/api/generate-icps/route.ts`

**Issues:**
- Too verbose (99 lines)
- No few-shot examples
- Single-layer structure
- Doesn't receive Facts JSON

### Current Value Prop Prompt (152 lines)
Located in: `/api/generate-value-prop/route.ts`

**Issues:**
- Only receives URL, not content
- No evidence tracking
- No few-shot examples
- Value prop not explicitly used in downstream content

### Current Email Prompt (88 lines)
Located in: `/api/generate-one-time-email/route.ts`

**Issues:**
- No facts grounding
- Value prop optional and not explicitly used
- No user preference inputs (tone, CTA)
- Generic output structure

---

## References

1. **OpenAI Best Practices**: [Platform Documentation](https://platform.openai.com/docs/guides/prompt-engineering)
2. **Prompt Engineering Guide**: [Prompt Engineering Guide](https://www.promptingguide.ai/)
3. **Current Codebase Analysis**: See sections above

---

## Questions & Answers

**Q: Why not use GPT-4o for everything?**
A: Facts extraction benefits most from better reasoning. Content generation with well-structured prompts works great on GPT-4o-mini at 80% lower cost.

**Q: How much will this improve outputs?**
A: Expect 3-5x improvement in specificity and relevance. "Generic tips" → "Specific actions grounded in website facts."

**Q: Can we do this incrementally?**
A: Yes! Start with Phase 1 (templates) and Phase 2 (Facts JSON). You'll see immediate improvement before tackling UX changes.

**Q: What if Facts JSON extraction fails?**
A: Fallback to current flow. Add retry logic with auto-repair prompt. Monitor failure rates.

---

**Last Updated:** October 29, 2025
**Next Review:** After Phase 1 completion
