# GPT Generation Audit

## Overview
This document audits what GPT is prompted to generate vs. what the UI expects, highlighting gaps and providing debugging instructions.

---

## Brand Guide Generation

### GPT Prompt (`generateBrandGuide()`)
Located: `app/api/brand-manifest/generate/route.ts:135-202`

**Prompted to return:**
```json
{
  "colors": {
    "primary": [{ "name": "...", "hex": "...", "usage": "..." }],
    "secondary": [{ "name": "...", "hex": "..." }],
    "accent": [{ "name": "...", "hex": "..." }],
    "neutral": [{ "name": "...", "hex": "..." }]
  },
  "typography": {
    "heading": {
      "family": "Inter",
      "weights": ["600", "700"],
      "sizes": { "h1": "48px", "h2": "36px", "h3": "24px" }
    },
    "body": {
      "family": "Inter",
      "weights": ["400", "500"],
      "sizes": { "large": "18px", "regular": "16px", "small": "14px" }
    }
  },
  "tone": {
    "keywords": ["Professional", "Innovative", "Trustworthy"],
    "personality": [
      { "trait": "Formal vs Casual", "value": 60, "leftLabel": "Formal", "rightLabel": "Casual" }
    ]
  },
  "logo": {
    "variations": [
      { "name": "Primary", "description": "..." },
      { "name": "Monochrome", "description": "..." }
    ]
  }
}
```

### UI Expectations (`BrandGuide` type)
Located: `lib/design-studio-mock-data.ts:34-45`

```typescript
{
  colors: {
    primary: ColorScheme[];    // { name, hex, rgb, usage }
    secondary: ColorScheme[];
    accent: ColorScheme[];
    neutral: ColorScheme[];
  };
  typography: Typography[];    // { category, fontFamily, sizes, weights }
  logoVariations: { name, description }[];
  toneOfVoice: string[];      // Array of keywords
  personalityTraits: {         // ⚠️ SHAPE MISMATCH
    id: string;                // ❌ Missing in GPT response
    label: string;             // ❌ GPT returns "trait" not "label"
    value: number;             // ✅ Match
    leftLabel: string;         // ✅ Match
    rightLabel: string;        // ✅ Match
  }[];
}
```

### Issues Found

#### 🔴 CRITICAL: Personality Traits Shape Mismatch
- **GPT returns:** `{ trait: "...", value: 60, leftLabel: "...", rightLabel: "..." }`
- **UI expects:** `{ id: "...", label: "...", value: 60, leftLabel: "...", rightLabel: "..." }`
- **Impact:** Canvas expects `.label` and `.id` properties that don't exist
- **Fix needed:** Transform in workspace API

#### 🟡 MINOR: Color RGB Field
- **GPT returns:** Colors without `rgb` field
- **UI expects:** `rgb` field (but Canvas only uses `hex`, so not critical)
- **Impact:** Low - unused in Canvas rendering
- **Fix needed:** None (optional enhancement)

#### ✅ Matches Correctly
- Colors arrays (primary, secondary, accent, neutral)
- Typography structure
- Logo variations
- Tone keywords

---

## Style Guide Generation

### GPT Prompt (`generateStyleGuide()`)
Located: `app/api/brand-manifest/generate/route.ts:204-246`

**Prompted to return:**
```json
{
  "buttons": {
    "primary": { "style": "solid", "borderRadius": "8px", "shadow": "md" },
    "secondary": { "style": "outline", "borderRadius": "8px", "shadow": "none" },
    "outline": { "style": "ghost", "borderRadius": "8px", "shadow": "none" }
  },
  "cards": {
    "style": "elevated",
    "borderRadius": "12px",
    "shadow": "lg"
  },
  "inputs": {
    "style": "outlined",
    "borderRadius": "8px",
    "focusStyle": "ring"
  },
  "spacing": {
    "scale": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px" }
  }
}
```

### UI Expectations (`StyleGuide` type)
Located: `lib/design-studio-mock-data.ts:47-54`

```typescript
{
  buttons: { variant: string; description: string }[];  // ⚠️ SHAPE MISMATCH
  cards: { variant: string; description: string }[];    // ⚠️ NOT IN PROMPT
  formElements: { element: string; description: string }[]; // ⚠️ NOT IN PROMPT
  spacing: { name: string; value: string }[];           // ⚠️ NEEDS TRANSFORM
  borderRadius: { name: string; value: string }[];      // ⚠️ NEEDS TRANSFORM
  shadows: { name: string; value: string }[];           // ⚠️ NOT IN PROMPT
}
```

### Issues Found

#### 🔴 CRITICAL: Buttons Shape Mismatch
- **GPT returns:** `{ primary: { style, borderRadius, shadow }, secondary: {...}, outline: {...} }`
- **UI expects:** `[{ variant: "Primary", description: "..." }]`
- **Impact:** Canvas expects array with `variant` and `description`
- **Fix applied:** ✅ `normalizeButtons()` in workspace API transforms this

#### 🔴 CRITICAL: Spacing Needs Transform
- **GPT returns:** `{ scale: { xs: "4px", sm: "8px", ... } }`
- **UI expects:** `[{ name: "xs", value: "4px" }, { name: "sm", value: "8px" }, ...]`
- **Impact:** Canvas expects array format for `.map()`
- **Fix applied:** ✅ `normalizeSpacing()` in workspace API transforms this

#### 🔴 CRITICAL: Border Radius Incomplete
- **GPT returns:** String in `cards.borderRadius` (e.g., "12px")
- **UI expects:** `[{ name: "sm", value: "6px" }, { name: "md", value: "12px" }, ...]`
- **Impact:** Canvas expects array of radius variations
- **Fix applied:** ✅ `normalizeBorderRadius()` creates scale from single value

#### 🟡 MISSING: formElements, shadows
- **GPT doesn't generate:** `formElements` or `shadows`
- **UI expects:** These arrays
- **Impact:** Medium - Canvas shows empty state, but doesn't crash
- **Fix needed:** Either add to GPT prompt or provide defaults

#### 🟡 MISSING: cards array
- **GPT generates:** Single card object `{ style, borderRadius, shadow }`
- **UI expects:** Array of card variants `[{ variant, description }]`
- **Impact:** Low - Canvas just shows empty state
- **Fix needed:** Either add to GPT prompt or provide defaults

---

## Debugging Instructions

### 1. View Raw GPT Responses

Add logging to `app/api/brand-manifest/generate/route.ts`:

**After line 192 (in `generateBrandGuide`):**
```typescript
const content = JSON.parse(response.choices[0].message.content || "{}");

// 🔍 DEBUG: Log raw GPT response
console.log('🔍 [DEBUG] GPT Brand Guide Response:', JSON.stringify(content, null, 2));

return {
  "identity": {
```

**After line 236 (in `generateStyleGuide`):**
```typescript
const content = JSON.parse(response.choices[0].message.content || "{}");

// 🔍 DEBUG: Log raw GPT response
console.log('🔍 [DEBUG] GPT Style Guide Response:', JSON.stringify(content, null, 2));

return {
  "components": {
```

### 2. View Stored Manifest Data

Add logging to `app/api/workspace/route.ts`:

**After line 92 (after fetching manifest):**
```typescript
const manifest = await fetchBrandManifest(flowId, icpId);

if (manifest) {
  // 🔍 DEBUG: Log manifest sections
  console.log('🔍 [DEBUG] Manifest Identity:', JSON.stringify(manifest.identity, null, 2));
  console.log('🔍 [DEBUG] Manifest Components:', JSON.stringify(manifest.components, null, 2));
  
  console.log('✅ [Workspace API] Using brand manifest as source');
```

### 3. Check Browser Console

Open DevTools Console and look for:
- `[Generate]` logs - shows generation progress
- `[Workspace API]` logs - shows data transformation
- `[DEBUG]` logs - shows raw data (if you add the debug logs above)

### 4. Query Database Directly

Use Supabase SQL Editor:

```sql
-- Get latest manifest for your flow
SELECT 
  id,
  brand_key,
  jsonb_pretty(manifest->'identity'->'colors') as colors,
  jsonb_pretty(manifest->'identity'->'tone') as tone,
  jsonb_pretty(manifest->'identity'->'logo') as logo,
  jsonb_pretty(manifest->'components'->'spacing') as spacing,
  jsonb_pretty(manifest->'components'->'cards') as cards
FROM brand_manifests
WHERE flow_id = 'YOUR_FLOW_ID_HERE'
ORDER BY updated_at DESC
LIMIT 1;
```

Replace `YOUR_FLOW_ID_HERE` with your actual flow ID from the URL.

### 5. Test Generation in Isolation

Create a test script `scripts/test-generation.ts`:

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testBrandGeneration() {
  const prompt = `You are a brand designer. Generate a comprehensive brand guide for:

Company: Test Corp
Persona: John Smith - CEO at Tech Startup
Value Prop: Revolutionary AI solution

Generate a brand guide with:
1. Color palette (primary, secondary, accent, neutral colors)
2. Typography (heading and body fonts with sizes)
3. Tone of voice (3-5 keywords and personality traits)
4. Logo variations (2-3 types)

Return ONLY valid JSON in this format:
{
  "colors": {
    "primary": [{ "name": "Brand Blue", "hex": "#0066FF", "usage": "CTA buttons, links" }],
    "secondary": [{ "name": "Deep Navy", "hex": "#1a2332" }],
    "accent": [{ "name": "Bright Cyan", "hex": "#00D9FF" }],
    "neutral": [{ "name": "White", "hex": "#FFFFFF" }, { "name": "Light Gray", "hex": "#F5F5F5" }]
  },
  "typography": {
    "heading": {
      "family": "Inter",
      "weights": ["600", "700"],
      "sizes": { "h1": "48px", "h2": "36px", "h3": "24px" }
    },
    "body": {
      "family": "Inter",
      "weights": ["400", "500"],
      "sizes": { "large": "18px", "regular": "16px", "small": "14px" }
    }
  },
  "tone": {
    "keywords": ["Professional", "Innovative", "Trustworthy"],
    "personality": [
      { "trait": "Formal vs Casual", "value": 60, "leftLabel": "Formal", "rightLabel": "Casual" }
    ]
  },
  "logo": {
    "variations": [
      { "name": "Primary", "description": "Full color logo for light backgrounds" },
      { "name": "Monochrome", "description": "Single color version" }
    ]
  }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = JSON.parse(response.choices[0].message.content || "{}");
  console.log(JSON.stringify(content, null, 2));
}

testBrandGeneration();
```

Run: `npx tsx scripts/test-generation.ts`

---

## Summary of Fixes Needed

### ✅ Already Fixed
1. Colors normalization (arrays)
2. Spacing transformation (object → array)
3. BorderRadius generation (string → array scale)
4. Buttons transformation (object → array)

### ❌ Still Needed
1. **Personality Traits:** Add `normalizePersonalityTraits()` to transform `trait` → `label` and add `id`
2. **Missing Fields:** Consider adding `formElements`, `shadows`, card variants to GPT prompts OR provide sensible defaults

### 🔍 Need to Debug
1. Check if GPT is returning empty arrays for accent colors, tone keywords, logo variations
2. Verify data exists in manifest but isn't being displayed
3. Check browser console for transformation errors

---

## Next Steps

1. Add debug logging (section 1 & 2 above)
2. Regenerate brand/style guide
3. Check terminal logs for `[DEBUG]` output
4. Identify which fields are empty in GPT response vs. missing from UI
5. Implement fixes based on findings
