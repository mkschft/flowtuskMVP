# Prompt-First Architecture Testing Guide

**Version**: Phase 1 MVP
**Date**: 2025-11-27
**Status**: Ready for Testing

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Test Environment Setup](#test-environment-setup)
4. [Component Testing](#component-testing)
5. [API Endpoint Testing](#api-endpoint-testing)
6. [Quality Validation](#quality-validation)
7. [Edge Cases & Error Handling](#edge-cases--error-handling)
8. [Performance Testing](#performance-testing)
9. [Test Data Examples](#test-data-examples)
10. [Success Criteria](#success-criteria)

---

## Overview

This guide provides detailed instructions for testing the **Prompt-First Architecture** implementation. The goal is to validate that:

1. ✅ API generates high-quality facts from startup ideas
2. ✅ Components render correctly with proper validation
3. ✅ Generated facts match website-analysis schema
4. ✅ Facts are specific and actionable (not generic)
5. ✅ Downstream systems (ICP generation) work unchanged

---

## Prerequisites

### Required Tools
- Node.js and npm installed
- PostgreSQL/Supabase running
- OpenAI API key configured in `.env`
- Development server running (`npm run dev`)

### Files to Review
- `/app/api/analyze-idea/route.ts` - API endpoint
- `/components/IdeaInputForm.tsx` - Input form component
- `/components/FactsReviewStep.tsx` - Review component
- `/lib/prompt-templates.ts` - Prompt logic (buildAnalyzeFromIdeaPrompt)

### Environment Variables
```bash
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_DEMO_MODE_ENABLED=true  # Optional for testing
```

---

## Test Environment Setup

### Step 1: Start Development Server

```bash
cd /Users/rhiday/Developer/Flowtusk/flowtuskMVP
npm run dev
```

Server should start at: `http://localhost:3000`

### Step 2: Verify API Endpoint Exists

```bash
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "test",
    "targetMarket": "test"
  }'
```

**Expected**: Should return error about idea being too short (< 50 chars)

### Step 3: Check Database Migration

```bash
# If using Supabase locally
npx supabase migration up

# Or check if columns exist
psql -d your_database -c "\d positioning_flows"
```

**Expected**: Should see `input_type` and `idea_metadata` columns

---

## Component Testing

### Test 1: IdeaInputForm Validation

**Location**: `/components/IdeaInputForm.tsx`

#### Test 1.1: Character Count Validation

**Test Case**: Idea description length validation

**Steps**:
1. Create a test file: `/app/test-idea-form/page.tsx`

```typescript
"use client";

import { IdeaInputForm } from "@/components/IdeaInputForm";

export default function TestPage() {
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Test: IdeaInputForm</h1>
      <IdeaInputForm
        onSubmit={(data) => {
          console.log("Form submitted:", data);
          alert(JSON.stringify(data, null, 2));
        }}
        onNeedHelp={() => {
          alert("Help requested");
        }}
      />
    </div>
  );
}
```

2. Navigate to: `http://localhost:3000/test-idea-form`

3. **Test Cases**:
   - [ ] Type < 50 characters → Submit button disabled, yellow border
   - [ ] Type 50-500 characters → Submit button enabled, green border
   - [ ] Type > 500 characters → Submit button disabled, red border
   - [ ] Character counter updates in real-time
   - [ ] "Need Help?" button triggers onNeedHelp

**Expected Results**:
- ✅ Visual feedback changes based on character count
- ✅ Submit button state updates correctly
- ✅ Form only submits when valid

#### Test 1.2: Required Fields

**Test Case**: Form submission with missing fields

**Steps**:
1. Fill idea (50+ chars)
2. Leave target market empty
3. Try to submit

**Expected**: Submit button should be disabled

**Steps**:
1. Fill idea (50+ chars)
2. Fill target market
3. Try to submit

**Expected**: Form submits, alert shows data

#### Test 1.3: Optional Fields

**Test Case**: Optional fields expand/collapse

**Steps**:
1. Click "Optional: Add more details for better results"
2. Verify fields appear:
   - Problem Statement
   - Solution Hypothesis
   - Brand Vibe (dropdown)
3. Fill optional fields
4. Submit form

**Expected**:
- ✅ Optional fields toggle correctly
- ✅ Data includes optional fields when provided
- ✅ Form works without optional fields

---

### Test 2: FactsReviewStep Component

**Location**: `/components/FactsReviewStep.tsx`

#### Test 2.1: Display Generated Facts

**Test Case**: Component renders facts correctly

**Steps**:
1. Create test file: `/app/test-facts-review/page.tsx`

```typescript
"use client";

import { FactsReviewStep } from "@/components/FactsReviewStep";
import { type FactsJSON } from "@/lib/prompt-templates";

const mockFactsJson: FactsJSON = {
  brand: {
    name: "Test Brand",
    tones: ["professional", "innovative"],
    primaryCTA: "Get Started"
  },
  structure: {
    nav: ["Product", "Pricing"],
    keyPages: [{ path: "Core Value Prop", title: "Main Offering" }],
    footer: ["Contact", "About"]
  },
  targetMarket: {
    primaryRegion: "UK",
    industryFocus: "B2B SaaS",
    signals: ["User specified: UK market"]
  },
  audienceSignals: ["SMB owners"],
  valueProps: [
    { id: "v1", text: "Automate workflows", evidence: ["fact-1"] }
  ],
  pains: ["Manual processes"],
  proof: ["40% time savings"],
  facts: [
    {
      id: "fact-1",
      text: "Automates VAT calculations for UK SMBs saving 40% time",
      page: "Idea Description",
      evidence: "From user input: 'tax software for UK SMBs'"
    },
    {
      id: "fact-2",
      text: "Targets businesses with 10-50 employees",
      page: "Market Definition",
      evidence: "From user input: '10-50 employees'"
    }
  ]
};

export default function TestPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Test: FactsReviewStep</h1>
      <FactsReviewStep
        factsJson={mockFactsJson}
        onApprove={(edited) => {
          console.log("Approved:", edited);
          alert("Facts approved!");
        }}
        onEdit={() => {
          alert("Edit requested");
        }}
      />
    </div>
  );
}
```

2. Navigate to: `http://localhost:3000/test-facts-review`

3. **Verify**:
   - [ ] Brand summary displays correctly (name, region, tones)
   - [ ] All facts are listed with badges (Fact 1, Fact 2, etc.)
   - [ ] Source labels show ("user-prompt" or page name)
   - [ ] Evidence snippets display
   - [ ] Disclaimer box appears (yellow background)

#### Test 2.2: Edit Facts

**Test Case**: Inline fact editing

**Steps**:
1. Click "Edit" button on Fact 1
2. Modify the text in textarea
3. Click "Done"
4. Click "Approve & Continue"

**Expected**:
- ✅ Textarea appears when editing
- ✅ Changes persist when toggling edit mode
- ✅ Button text changes to "Save Changes & Continue" when edited
- ✅ onApprove receives edited facts

#### Test 2.3: No Changes Flow

**Test Case**: Approve without editing

**Steps**:
1. Don't edit any facts
2. Click "Approve & Continue to ICPs"

**Expected**:
- ✅ Button text is "Approve & Continue to ICPs" (not "Save Changes")
- ✅ onApprove receives original facts

---

## API Endpoint Testing

### Test 3: /api/analyze-idea Endpoint

**Location**: `/app/api/analyze-idea/route.ts`

#### Test 3.1: Valid Input (Minimal)

**Test Case**: Successful facts generation with minimal input

**cURL Command**:
```bash
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "AI-powered tax software for UK mid-market accounting firms that automates MTD VAT compliance and reduces filing time by 40%",
    "targetMarket": "UK accounting firms, 10-50 employees, handling 100+ SMB clients"
  }' | jq .
```

**Expected Response**:
```json
{
  "factsJson": {
    "brand": {
      "name": "...",
      "tones": ["professional", "..."],
      "primaryCTA": "..."
    },
    "targetMarket": {
      "primaryRegion": "UK",
      "industryFocus": "...",
      "signals": ["User specified: UK market", "..."]
    },
    "facts": [
      {
        "id": "fact-1",
        "text": "Specific fact with metrics...",
        "page": "Idea Description",
        "evidence": "From user input: '...'",
        "source": "user-prompt"
      }
      // ... more facts (10-15 total)
    ],
    "valueProps": [...],
    "pains": [...],
    "proof": [...]
  },
  "source": "idea-analysis",
  "metadata": {
    "idea": "AI-powered tax software for UK mid-market accounting firms...",
    "targetMarket": "UK accounting firms, 10-50 employees, handling 100+ SMB clients",
    "hasProblemStatement": false,
    "hasSolutionHypothesis": false,
    "brandVibe": null,
    "generatedAt": "2025-11-27T..."
  }
}
```

**Validation Checklist**:
- [ ] Response status: 200
- [ ] `factsJson` object present
- [ ] `facts` array has 10-15 items
- [ ] Each fact has `source: "user-prompt"`
- [ ] `targetMarket.primaryRegion` matches input (UK)
- [ ] Facts are specific (not generic like "helps businesses")
- [ ] Evidence fields quote user input
- [ ] Response time < 30 seconds

#### Test 3.2: Valid Input (Full)

**Test Case**: With all optional fields

**cURL Command**:
```bash
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "AI-powered tax software for UK mid-market accounting firms that automates MTD VAT compliance and reduces filing time by 40%",
    "targetMarket": "UK accounting firms, 10-50 employees, handling 100+ SMB clients",
    "problemStatement": "Manual tax calculations are time-consuming and error-prone, leading to compliance risks",
    "solutionHypothesis": "AI automation can reduce tax prep time by 40% while ensuring 100% compliance",
    "brandVibe": "professional"
  }' | jq .
```

**Validation Checklist**:
- [ ] `metadata.hasProblemStatement: true`
- [ ] `metadata.hasSolutionHypothesis: true`
- [ ] `metadata.brandVibe: "professional"`
- [ ] `brand.tones` includes "professional"
- [ ] Facts reference problem/solution in evidence

#### Test 3.3: Input Validation Errors

**Test Case 3.3a**: Missing required fields

```bash
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "test software"
  }'
```

**Expected**:
```json
{
  "error": "Missing required fields",
  "details": "Both 'idea' and 'targetMarket' are required."
}
```
**Status**: 400

---

**Test Case 3.3b**: Idea too short

```bash
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Short idea",
    "targetMarket": "UK businesses"
  }'
```

**Expected**:
```json
{
  "error": "Idea description too short",
  "details": "Please provide at least 50 characters describing your startup idea."
}
```
**Status**: 400

---

**Test Case 3.3c**: Idea too long

```bash
# Generate 600 character string
LONG_IDEA=$(python3 -c "print('A' * 600)")

curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d "{
    \"idea\": \"$LONG_IDEA\",
    \"targetMarket\": \"UK businesses\"
  }"
```

**Expected**:
```json
{
  "error": "Idea description too long",
  "details": "Please keep your idea description under 500 characters."
}
```
**Status**: 400

---

## Quality Validation

### Test 4: Fact Quality Assessment

**Purpose**: Ensure generated facts are specific, actionable, and not generic

#### Test 4.1: Specificity Check

**Test Data**: 5 diverse startup ideas

Run the API test for each and validate fact quality:

```bash
# Test Idea 1: FinTech
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "AI-powered invoice financing platform for UK SMEs that provides funding within 24 hours based on real-time cash flow analysis, targeting businesses with £500K-£5M revenue",
    "targetMarket": "UK SMEs, £500K-£5M annual revenue, B2B services sector"
  }' | jq '.factsJson.facts' > test_results/fintech_facts.json

# Test Idea 2: EdTech
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Adaptive learning platform for UK secondary schools that uses AI to personalize GCSE exam prep, reducing teacher workload by 30% while improving student outcomes by 25%",
    "targetMarket": "UK state secondary schools, 500-1500 students, preparing for GCSEs"
  }' | jq '.factsJson.facts' > test_results/edtech_facts.json

# Test Idea 3: SaaS
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Project management tool for remote-first software teams that auto-generates sprint plans from Slack conversations, reducing planning meetings by 60% for teams of 20-50 engineers",
    "targetMarket": "Remote-first tech companies, 20-50 engineers, using Agile/Scrum"
  }' | jq '.factsJson.facts' > test_results/saas_facts.json

# Test Idea 4: Healthcare
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "HIPAA-compliant telemedicine platform for US mental health practitioners that handles scheduling, billing, and video sessions, serving practices with 5-20 therapists",
    "targetMarket": "US mental health practices, 5-20 practitioners, private pay + insurance"
  }' | jq '.factsJson.facts' > test_results/healthcare_facts.json

# Test Idea 5: E-commerce
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "AI-powered inventory management for Shopify stores that predicts demand and auto-orders stock, reducing stockouts by 80% for stores doing $100K-$2M annually",
    "targetMarket": "Shopify store owners, $100K-$2M annual revenue, physical products"
  }' | jq '.factsJson.facts' > test_results/ecommerce_facts.json
```

#### Quality Scoring Matrix

For each set of facts, score them:

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| **Specificity** | | Are facts concrete with metrics/numbers? |
| **Actionability** | | Can facts guide marketing decisions? |
| **Geographic Accuracy** | | Does targetMarket match input? |
| **Evidence Quality** | | Do evidence fields quote input properly? |
| **Avoid Generic** | | No "helps businesses" or vague claims? |
| **Quantity** | | 10-15 facts generated? |
| **Value Prop Clarity** | | Are value props specific and measurable? |

**Scoring Guide**:
- **5**: Excellent - Facts are highly specific with metrics, clearly actionable
- **4**: Good - Facts are specific, mostly actionable
- **3**: Adequate - Some specificity, could be more actionable
- **2**: Poor - Generic facts like "improves efficiency"
- **1**: Fail - No useful information

**Pass Criteria**: Average score ≥ 4.0 across all categories

#### Test 4.2: Schema Validation

**Purpose**: Ensure facts_json matches website analysis schema

**Steps**:
1. Generate facts from idea (use Test 4.1 results)
2. Compare structure with website-generated facts

```bash
# Get website facts for comparison
cat blueprints/taxstar_app_facts.json > test_results/website_facts_sample.json

# Get idea facts
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d @test_data/test_idea.json | jq '.factsJson' > test_results/idea_facts_sample.json

# Compare structures
diff <(jq -S 'keys' test_results/website_facts_sample.json) \
     <(jq -S 'keys' test_results/idea_facts_sample.json)
```

**Expected**: No differences (same top-level keys)

**Validation Checklist**:
- [ ] Both have: `brand`, `structure`, `targetMarket`, `audienceSignals`
- [ ] Both have: `valueProps`, `pains`, `proof`, `facts`
- [ ] `facts[]` items have same fields: `id`, `text`, `page`, `evidence`
- [ ] `facts[]` in idea flow have additional `source: "user-prompt"`

---

## Edge Cases & Error Handling

### Test 5: Edge Cases

#### Test 5.1: Vague Input

**Test Case**: Very generic startup idea

```bash
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "A software platform that helps businesses work better and be more productive using modern technology and cloud services",
    "targetMarket": "Small and medium businesses that want to improve"
  }'
```

**Expected Behavior**:
- ✅ API still generates facts (doesn't fail)
- ⚠️ Facts should be evaluated for quality (likely lower score)
- ✅ Response includes warning about vague input (future enhancement)

**Manual Review**:
- Are facts overly generic?
- Is this where clarification chat would help? (Phase 2 feature)

#### Test 5.2: Non-English Input

**Test Case**: Idea in different language

```bash
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Logiciel de comptabilité alimenté par IA pour les PME françaises qui automatise la TVA et réduit le temps de dépôt de 40%",
    "targetMarket": "PME françaises, 10-50 employés"
  }'
```

**Expected**:
- GPT-4o should handle this (multilingual)
- Facts should be in same language as input
- `targetMarket.primaryRegion` should detect "France"

#### Test 5.3: Extreme Niche Market

**Test Case**: Very specific/technical market

```bash
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Kubernetes cost optimization tool for FinOps teams that analyzes cluster utilization patterns and recommends right-sizing strategies, reducing cloud spend by 35% for companies spending $50K+/month on K8s",
    "targetMarket": "FinOps teams at cloud-native companies, $50K+/month K8s spend, 100+ microservices"
  }'
```

**Expected**:
- ✅ Generates technical, niche-specific facts
- ✅ Preserves technical terminology (Kubernetes, FinOps, microservices)
- ✅ targetMarket captures complexity

#### Test 5.4: Missing Optional OpenAI Fields

**Test Case**: What if GPT-4o doesn't return all fields?

**Manual Test**:
1. Temporarily modify prompt to omit optional fields
2. Run API call
3. Check validation

**Expected**:
- ✅ Validation passes (optional fields are optional)
- ✅ No crashes
- ⚠️ May need defaults for missing fields

---

## Performance Testing

### Test 6: Performance Benchmarks

#### Test 6.1: Response Time

**Test Case**: Measure end-to-end latency

```bash
# Run 5 times and calculate average
for i in {1..5}; do
  echo "Run $i:"
  time curl -X POST http://localhost:3000/api/analyze-idea \
    -H "Content-Type: application/json" \
    -d '{
      "idea": "AI-powered tax software for UK mid-market accounting firms that automates MTD VAT compliance and reduces filing time by 40%",
      "targetMarket": "UK accounting firms, 10-50 employees, handling 100+ SMB clients"
    }' -o /dev/null -s
  echo ""
done
```

**Target**:
- ✅ p50 (median): < 20 seconds
- ✅ p95: < 30 seconds
- ❌ > 45 seconds: Timeout (needs investigation)

#### Test 6.2: Token Usage

**Test Case**: Check OpenAI token consumption

**Steps**:
1. Enable OpenAI usage tracking in dashboard
2. Run 10 API calls
3. Check tokens used per request

**Expected**:
- Prompt tokens: ~2000-3000 (includes few-shot examples)
- Completion tokens: ~1000-1500 (facts_json output)
- Total: ~3000-4500 tokens per request
- Cost: ~$0.02-$0.03 per request (GPT-4o pricing)

#### Test 6.3: Concurrent Requests

**Test Case**: Multiple simultaneous requests

```bash
# Run 3 requests concurrently
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/analyze-idea \
    -H "Content-Type: application/json" \
    -d @test_data/test_idea_$i.json &
done
wait
```

**Expected**:
- ✅ All requests complete successfully
- ✅ No rate limit errors (OpenAI tier-dependent)
- ✅ No server crashes

---

## Test Data Examples

### Example 1: B2B SaaS

**File**: `test_data/b2b_saas.json`
```json
{
  "idea": "AI-powered sprint planning tool for remote FinTech teams (20-50 engineers) that auto-generates user stories from product requirement documents and reduces sprint planning meetings by 60%",
  "targetMarket": "Remote-first FinTech companies, 20-50 engineers, using Agile/Scrum methodology",
  "problemStatement": "Sprint planning meetings take 4-8 hours every two weeks, consuming 5-10% of engineering time",
  "solutionHypothesis": "AI can extract requirements from PRDs and generate 80% of user stories automatically, requiring only human review",
  "brandVibe": "innovative"
}
```

### Example 2: EdTech

**File**: `test_data/edtech.json`
```json
{
  "idea": "Adaptive GCSE exam prep platform for UK secondary schools that personalizes practice questions based on student performance, improving pass rates by 25% while reducing teacher workload by 30%",
  "targetMarket": "UK state secondary schools, 500-1500 students, Year 10-11 students preparing for GCSEs",
  "problemStatement": "Teachers spend 10+ hours per week creating personalized practice materials, and students struggle with one-size-fits-all resources",
  "solutionHypothesis": "AI-driven adaptive learning can automatically adjust difficulty and topic focus based on individual student performance",
  "brandVibe": "professional"
}
```

### Example 3: Healthcare

**File**: `test_data/healthcare.json`
```json
{
  "idea": "HIPAA-compliant telemedicine platform for US mental health practices (5-20 therapists) that handles scheduling, billing, insurance claims, and encrypted video sessions, reducing administrative time by 40%",
  "targetMarket": "US mental health private practices, 5-20 licensed therapists, accepting insurance + private pay",
  "problemStatement": "Mental health practices spend 15-20 hours per week on administrative tasks (scheduling, billing, insurance claims), reducing billable therapy hours",
  "solutionHypothesis": "Integrated practice management + telehealth platform can automate scheduling, billing, and claims submission",
  "brandVibe": "professional"
}
```

### Example 4: FinTech

**File**: `test_data/fintech.json`
```json
{
  "idea": "AI-powered invoice financing platform for UK SMEs (£500K-£5M revenue) that provides funding within 24 hours based on real-time cash flow analysis, with approval rates 50% higher than traditional factors",
  "targetMarket": "UK SMEs, £500K-£5M annual revenue, B2B services sector, net-30 to net-90 payment terms",
  "problemStatement": "SMEs wait 60-90 days for invoice payment, creating cash flow gaps that prevent growth and force expensive overdrafts",
  "solutionHypothesis": "Real-time cash flow analysis using Open Banking data can enable faster, more accurate credit decisions",
  "brandVibe": "professional"
}
```

### Example 5: E-commerce

**File**: `test_data/ecommerce.json`
```json
{
  "idea": "AI-powered inventory management for Shopify stores ($100K-$2M revenue) that predicts demand using sales history + market trends, auto-orders stock, and reduces stockouts by 80% while cutting excess inventory by 40%",
  "targetMarket": "Shopify store owners, $100K-$2M annual revenue, 50-500 SKUs, physical products",
  "problemStatement": "Store owners spend 10+ hours per week manually tracking inventory and placing orders, leading to frequent stockouts (losing 20% of potential sales) or excess inventory (tying up 30% of capital)",
  "solutionHypothesis": "Machine learning models can predict demand more accurately than manual forecasting, optimizing stock levels automatically",
  "brandVibe": "innovative"
}
```

---

## Success Criteria

### Phase 1 MVP Acceptance

The implementation passes if:

#### ✅ API Functionality
- [ ] All valid inputs generate facts without errors
- [ ] Validation rejects invalid inputs with clear error messages
- [ ] Response time p95 < 30 seconds
- [ ] Schema matches website-analysis structure
- [ ] Source metadata correctly added (`facts[].source = "user-prompt"`)

#### ✅ Fact Quality
- [ ] Average quality score ≥ 4.0/5.0 across test cases
- [ ] Facts include metrics/numbers (not generic)
- [ ] 10-15 facts generated per request
- [ ] Evidence fields properly quote user input
- [ ] Geographic extraction works (UK → primaryRegion: "UK")

#### ✅ Component Functionality
- [ ] IdeaInputForm validates correctly (50-500 chars)
- [ ] Required fields enforced (idea + targetMarket)
- [ ] Optional fields work when provided
- [ ] FactsReviewStep renders facts
- [ ] Inline editing works
- [ ] Approve & Continue callback fires

#### ✅ Integration Readiness
- [ ] Database migration runs successfully
- [ ] TypeScript compilation passes
- [ ] No console errors in browser
- [ ] Components can be imported and used

### Known Limitations (Acceptable for MVP)

- ⚠️ No competitor analysis (deferred to Phase 3)
- ⚠️ No clarification chat (deferred to Phase 2)
- ⚠️ Integration helpers commented out (type alignment needed)
- ⚠️ No quality scoring built-in (manual review for now)
- ⚠️ No UI tabs integrated (components standalone)

---

## Reporting Issues

### Issue Template

When reporting bugs, use this format:

```markdown
## Bug Report

**Test Case**: [Test number and name]
**Component**: [API / IdeaInputForm / FactsReviewStep]
**Severity**: [High / Medium / Low]

**Steps to Reproduce**:
1. ...
2. ...
3. ...

**Expected Behavior**:
...

**Actual Behavior**:
...

**Screenshots/Logs**:
...

**Environment**:
- Node version:
- Browser:
- OS:
```

### Where to Report

Create issues at: `/docs/test_results/issues.md`

---

## Next Steps After Testing

Once testing is complete and passing:

1. **Document Results**: Fill out test results in `test_results/summary.md`
2. **Fix Issues**: Address any failing tests
3. **UI Integration**: Connect tabs to main app page
4. **End-to-End Test**: Full flow (idea → facts → review → ICP → brand manifest)
5. **User Testing**: Get feedback from 5 users with real startup ideas

---

## Appendix

### Quick Test Script

Save this as `test_prompt_first.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Prompt-First Architecture"
echo "===================================="
echo ""

# Test 1: Validation (should fail)
echo "Test 1: Input validation..."
curl -s -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{"idea":"short","targetMarket":"test"}' | jq -r '.error'
echo ""

# Test 2: Valid request
echo "Test 2: Valid API call..."
curl -s -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea":"AI-powered tax software for UK mid-market accounting firms that automates MTD VAT compliance and reduces filing time by 40%",
    "targetMarket":"UK accounting firms, 10-50 employees"
  }' | jq -r '.factsJson.facts | length'
echo " facts generated"
echo ""

# Test 3: Schema validation
echo "Test 3: Schema validation..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea":"AI-powered tax software for UK mid-market accounting firms that automates MTD VAT compliance",
    "targetMarket":"UK accounting firms, 10-50 employees"
  }')

echo "Has brand: $(echo $RESPONSE | jq 'has("factsJson") and (.factsJson | has("brand"))')"
echo "Has facts: $(echo $RESPONSE | jq 'has("factsJson") and (.factsJson | has("facts"))')"
echo "Has targetMarket: $(echo $RESPONSE | jq 'has("factsJson") and (.factsJson | has("targetMarket"))')"
echo ""

echo "✅ Tests complete!"
```

Run with: `chmod +x test_prompt_first.sh && ./test_prompt_first.sh`

---

**End of Testing Guide**
