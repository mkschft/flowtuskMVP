# Brand Manifest Update Flow

## Overview

**Current System:** `brand_manifests` table is the **single source of truth** for all design data.

**Legacy System:** `positioning_design_assets` table exists but is **read-only** (used for migration/backward compatibility only).

## Table Structure

### `brand_manifests` (NEW - Active)
- **Column:** `manifest` (JSONB) - Stores everything
- **Structure:**
  ```json
  {
    "version": "1.0",
    "brandName": "Company Name",
    "brandKey": "E17AED52",
    "strategy": {
      "persona": { ... },
      "valueProp": { ... }
    },
    "identity": {
      "colors": { "primary": [], "secondary": [], "accent": [], "neutral": [] },
      "typography": { ... },
      "logo": { "variations": [] },
      "tone": { "keywords": [], "personality": [] }
    },
    "components": {
      "buttons": { ... },
      "cards": { ... },
      "inputs": { ... },
      "spacing": { ... }
    },
    "previews": {
      "landingPage": { ... }
    },
    "metadata": { ... }
  }
  ```

### `positioning_design_assets` (LEGACY - Read-Only)
- **Columns:** `brand_guide` (JSONB), `style_guide` (JSONB), `landing_page` (JSONB)
- **Status:** Not updated anymore, only used for:
  - Migration from old data
  - Backward compatibility in workspace API

## Update Flow

### 1. Initial Manifest Creation
**When:** ICPs are generated and saved to `brand_manifests`

**What's Created:**
- Basic structure with empty arrays/objects
- Strategy data (persona + valueProp) populated
- Identity/Components/Previews are empty structures

**Location:** `app/app/page.tsx` - When ICPs are saved

### 2. Brand Guide Generation
**When:** User opens Design Studio or triggers brand generation

**API:** `POST /api/brand-manifest/generate` with `section: 'brand'`

**What Gets Updated:**
- `manifest.identity.colors` (primary, secondary, accent, neutral)
- `manifest.identity.typography` (heading, body)
- `manifest.identity.tone` (keywords, personality)
- `manifest.identity.logo` (variations)

**Database Update:**
```typescript
// lib/brand-manifest.ts - updateBrandManifest()
await supabase
  .from('brand_manifests')
  .update({ manifest: updatedManifest })
  .eq('flow_id', flowId)
```

### 3. Style Guide Generation
**When:** After brand guide is generated (sequential)

**API:** `POST /api/brand-manifest/generate` with `section: 'style'`

**What Gets Updated:**
- `manifest.components.buttons` (primary, secondary, outline)
- `manifest.components.cards` (style, borderRadius, shadow)
- `manifest.components.inputs` (style, borderRadius, focusStyle)
- `manifest.components.spacing` (scale: { xs, sm, md, lg, xl })

**Database Update:** Same as brand guide - updates `manifest` JSONB column

### 4. Landing Page Generation
**When:** After style guide is generated (sequential)

**API:** `POST /api/brand-manifest/generate` with `section: 'landing'`

**What Gets Updated:**
- `manifest.previews.landingPage.navigation`
- `manifest.previews.landingPage.hero`
- `manifest.previews.landingPage.features`
- `manifest.previews.landingPage.socialProof`
- `manifest.previews.landingPage.footer`

**Database Update:** Same as above

## Verification Checklist

### ✅ Initial Manifest (After ICP Generation)
```sql
SELECT 
  id,
  flow_id,
  brand_key,
  jsonb_pretty(manifest->'strategy') as strategy,
  jsonb_pretty(manifest->'identity'->'colors') as colors
FROM brand_manifests 
WHERE flow_id = 'your-flow-id';
```

**Expected:**
- `strategy.persona` ✅ (populated)
- `strategy.valueProp` ✅ (populated)
- `identity.colors.primary` ✅ (empty array `[]`)
- `identity.colors.accent` ✅ (empty array `[]`)

### ✅ After Brand Guide Generation
```sql
SELECT 
  jsonb_pretty(manifest->'identity'->'colors'->'primary') as primary_colors,
  jsonb_pretty(manifest->'identity'->'colors'->'neutral') as neutral_colors,
  jsonb_pretty(manifest->'identity'->'typography') as typography,
  jsonb_pretty(manifest->'identity'->'tone') as tone
FROM brand_manifests 
WHERE flow_id = 'your-flow-id';
```

**Expected:**
- `identity.colors.primary` ✅ (array with color objects)
- `identity.colors.neutral` ✅ (at least 2 colors: white, gray, black)
- `identity.colors.accent` ✅ (at least 1 accent color)
- `identity.typography.heading` ✅ (family, weights, sizes)
- `identity.tone.keywords` ✅ (array of strings)
- `identity.tone.personality` ✅ (array of trait objects)

### ✅ After Style Guide Generation
```sql
SELECT 
  jsonb_pretty(manifest->'components'->'buttons') as buttons,
  jsonb_pretty(manifest->'components'->'spacing'->'scale') as spacing_scale,
  jsonb_pretty(manifest->'components'->'cards') as cards
FROM brand_manifests 
WHERE flow_id = 'your-flow-id';
```

**Expected:**
- `components.buttons.primary` ✅ (style, borderRadius, shadow)
- `components.spacing.scale` ✅ (xs, sm, md, lg, xl values)
- `components.cards` ✅ (style, borderRadius, shadow)

### ✅ After Landing Page Generation
```sql
SELECT 
  jsonb_pretty(manifest->'previews'->'landingPage'->'hero') as hero,
  jsonb_pretty(manifest->'previews'->'landingPage'->'features') as features
FROM brand_manifests 
WHERE flow_id = 'your-flow-id';
```

**Expected:**
- `previews.landingPage.hero` ✅ (headline, subheadline, cta)
- `previews.landingPage.features` ✅ (array of feature objects)
- `previews.landingPage.navigation` ✅ (logo, links)

## Common Issues

### Issue 1: Manifest Looks Empty Initially
**Expected Behavior:** ✅ This is normal!
- Manifest starts with structure but empty arrays
- Brand/style/landing data is added incrementally
- Check `manifest.strategy` - should have persona/valueProp data

### Issue 2: positioning_design_assets Not Updating
**Expected Behavior:** ✅ This is correct!
- `positioning_design_assets` is legacy, not updated anymore
- All updates go to `brand_manifests.manifest` JSONB column
- Workspace API converts manifest → design assets format for UI

### Issue 3: Brand Guide Not Appearing After Generation
**Check:**
1. Console logs: `✅ [Generate] brand generated successfully`
2. Database: `manifest->'identity'->'colors'` should have data
3. API response: `/api/brand-manifest/generate` should return updated manifest

## Debug Queries

**Check manifest update history:**
```sql
SELECT 
  flow_id,
  brand_key,
  manifest->'metadata'->'generationHistory' as history,
  updated_at
FROM brand_manifests 
WHERE flow_id = 'your-flow-id';
```

**Check what sections are generated:**
```sql
SELECT 
  CASE 
    WHEN manifest->'identity'->'colors'->'primary' != '[]'::jsonb THEN 'brand ✅'
    ELSE 'brand ❌'
  END as brand_status,
  CASE 
    WHEN manifest->'components'->'spacing'->'scale' IS NOT NULL THEN 'style ✅'
    ELSE 'style ❌'
  END as style_status,
  CASE 
    WHEN manifest->'previews'->'landingPage'->'hero' IS NOT NULL THEN 'landing ✅'
    ELSE 'landing ❌'
  END as landing_status
FROM brand_manifests 
WHERE flow_id = 'your-flow-id';
```

