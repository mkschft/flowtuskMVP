# Database Data Flow - Complete Guide

## 📊 Overview: Where Scraping Data Goes

**TL;DR**: Scraping data is stored in `positioning_flows.website_analysis` (JSONB column), then flows into `brand_manifests` as the unified source of truth.

---

## 🔄 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Website Scraping                                        │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ User enters URL (e.g., "stripe.com")
                    ▼
        ┌───────────────────────────┐
        │ /api/analyze-website      │
        │ - Scrapes website          │
        │ - Extracts facts with GPT  │
        │ - Returns factsJson        │
        └───────────────────────────┘
                    │
                    │ Returns: { factsJson, content, metadata }
                    ▼
        ┌───────────────────────────┐
        │ Frontend (React State)    │
        │ - Stores in conversation   │
        │ - Temporary (not in DB)    │
        └───────────────────────────┘
                    │
                    │ User creates/updates flow
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Flow Creation                                           │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ POST /api/flows
                    │ { facts_json: factsJson, ... }
                    ▼
        ┌──────────────────────────────────────┐
        │ positioning_flows                     │
        │ ────────────────────────────────────  │
        │ id: uuid                              │
        │ user_id: uuid                         │
        │ title: "stripe.com"                   │
        │ website_url: "https://stripe.com"     │
        │ website_analysis: {                   │ ← SCRAPING DATA HERE
        │   facts: [...],                       │
        │   valueProps: [...],                  │
        │   pains: [...],                       │
        │   brand: {...}                        │
        │ }                                     │
        │ step: "analyzed"                      │
        │ metadata: {...}                       │
        │ created_at: timestamp                 │
        └──────────────────────────────────────┘
                    │
                    │ User generates ICPs
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: ICP Generation                                          │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ POST /api/generate-icps
                    │ Uses website_analysis from flow
                    ▼
        ┌──────────────────────────────────────┐
        │ brand_manifests (created/updated)    │
        │ ────────────────────────────────────  │
        │ id: uuid                              │
        │ flow_id: uuid (→ positioning_flows)  │
        │ user_id: uuid                         │
        │ manifest: {                           │ ← UNIFIED DATA HERE
        │   version: "1.0",                     │
        │   brandName: "stripe",                │
        │   strategy: {                         │
        │     icps: [...],                      │ ← ICPs stored here
        │     persona: {...},                  │
        │     valueProp: {...}                  │
        │   },                                  │
        │   identity: {                         │
        │     colors: {...},                    │
        │     typography: {...}                 │
        │   },                                  │
        │   components: {...},                 │
        │   previews: {...},                    │
        │   metadata: {                         │
        │     generationHistory: [...],         │
        │     regenerationCount: 0             │
        │   }                                   │
        │ }                                     │
        │ brand_key: "STRIPE-X"                 │
        │ version: "1.0"                        │
        │ created_at: timestamp                 │
        │ updated_at: timestamp                  │
        └──────────────────────────────────────┘
                    │
                    │ User updates via copilot chat
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Real-Time Updates                                       │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ POST /api/copilot/chat
                    │ "Make colors more vibrant"
                    ▼
        ┌──────────────────────────────────────┐
        │ brand_manifests (updated)            │
        │ manifest.identity.colors: updated    │
        │ manifest.metadata.generationHistory:│
        │   [{ action: "styling", ... }]      │
        └──────────────────────────────────────┘
                    │
                    │ (Optional) History tracking
                    ▼
        ┌──────────────────────────────────────┐
        │ brand_manifest_history               │
        │ ────────────────────────────────────  │
        │ id: uuid                              │
        │ flow_id: uuid (→ positioning_flows)  │
        │ manifest: {...}                      │ ← Full snapshot
        │ action: "styling"                     │
        │ description: "Made colors vibrant"    │
        │ created_at: timestamp                 │
        └──────────────────────────────────────┘
```

---

## 📋 Table-by-Table Breakdown

### 1. `positioning_flows` - Flow/Conversation Storage

**Purpose**: Main flow/conversation data, including initial scraping results

**Key Columns**:
- `id` (uuid) - Primary key
- `user_id` (uuid) - Owner
- `title` (text) - Flow title (usually website hostname)
- `website_url` (text) - Original URL
- **`website_analysis` (JSONB)** ← **SCRAPING DATA STORED HERE**
  ```json
  {
    "facts": [
      { "fact": "...", "source": "...", "sourceFactId": "..." }
    ],
    "valueProps": [...],
    "pains": [...],
    "brand": { "name": "...", "industry": "..." }
  }
  ```
- `step` (text) - Current step: "initial", "analyzed", "icp_selected", etc.
- `metadata` (JSONB) - Analytics, feature flags, etc.
- `created_at`, `updated_at` (timestamptz)

**When Data Enters**:
- User enters URL → `/api/analyze-website` returns `factsJson`
- Frontend calls `/api/flows` POST with `facts_json`
- Mapped to `website_analysis` column

**Example Query**:
```sql
SELECT 
    id,
    title,
    website_url,
    website_analysis->'facts' as facts,
    website_analysis->'brand'->>'name' as brand_name
FROM positioning_flows
WHERE id = 'your-flow-id';
```

---

### 2. `brand_manifests` - Unified Brand Data (Source of Truth)

**Purpose**: Single source of truth for all brand data (strategy, identity, components)

**Key Columns**:
- `id` (uuid) - Primary key
- `flow_id` (uuid) - References `positioning_flows.id`
- `user_id` (uuid) - Owner
- **`manifest` (JSONB)** ← **ALL BRAND DATA HERE**
  ```json
  {
    "version": "1.0",
    "brandName": "stripe",
    "brandKey": "STRIPE-X",
    "strategy": {
      "icps": [...],
      "persona": {...},
      "valueProp": {...}
    },
    "identity": {
      "colors": {...},
      "typography": {...},
      "logo": {...},
      "tone": {...}
    },
    "components": {
      "buttons": {...},
      "cards": {...},
      "spacing": {...}
    },
    "previews": {
      "landingPage": {...}
    },
    "metadata": {
      "generationHistory": [
        { "action": "styling", "timestamp": "...", "description": "..." }
      ],
      "regenerationCount": 5
    }
  }
  ```
- `brand_key` (varchar) - Short key for Figma plugin
- `version` (varchar) - Manifest version
- `created_at`, `updated_at` (timestamptz)

**When Data Enters**:
1. **Initial Creation**: When ICPs are generated → `/api/brand-manifest` POST
2. **Updates**: Via copilot chat → `/api/copilot/chat` → `updateBrandManifest()`
3. **Generation**: Via `/api/brand-manifest/generate` (brand/style/landing)

**Data Flow**:
- Scraping data from `positioning_flows.website_analysis` is used to generate ICPs
- ICPs are stored in `manifest.strategy.icps`
- All subsequent updates go directly to `manifest` JSONB

**Example Query**:
```sql
SELECT 
    id,
    flow_id,
    manifest->'strategy'->'icps' as icps,
    manifest->'identity'->'colors' as colors,
    manifest->'metadata'->'generationHistory' as history
FROM brand_manifests
WHERE flow_id = 'your-flow-id';
```

---

### 3. `brand_manifest_history` - Version History

**Purpose**: Track changes to manifests over time (optional, for undo/redo)

**Key Columns**:
- `id` (uuid) - Primary key
- `flow_id` (uuid) - References `positioning_flows.id` (not manifest_id)
- `manifest` (JSONB) - Full snapshot of manifest at this version
- `action` (text) - Type of change: "styling", "market_shift", "messaging", etc.
- `description` (text) - Human-readable description of the change
- `created_at` (timestamptz)

**When Data Enters**:
- When manifest is updated via copilot chat (via `/api/brand-manifest/history` POST)
- Used for undo/redo functionality
- Note: History tracking is optional and must be explicitly called

**Example Query**:
```sql
SELECT 
    id,
    action,
    description,
    manifest->'identity'->'colors' as colors_at_version,
    manifest->'version' as version,
    created_at
FROM brand_manifest_history
WHERE flow_id = 'your-flow-id'
ORDER BY created_at DESC;
```

---

### 4. `analytics` - Analytics Tracking

**Purpose**: Track user behavior, dropoffs, completion times

**Key Columns**:
- `id` (uuid)
- `user_id` (uuid)
- `event_type` (text)
- `event_data` (JSONB)
- `created_at` (timestamptz)

**Usage**: Optional analytics tracking

---

## 🔍 Where to Find Scraping Data

### Option 1: In `positioning_flows` (Original Storage)
```sql
-- Get scraping data for a flow
SELECT 
    id,
    title,
    website_url,
    website_analysis->'facts' as facts,
    website_analysis->'valueProps' as value_props,
    website_analysis->'pains' as pains,
    website_analysis->'brand' as brand_info
FROM positioning_flows
WHERE id = 'your-flow-id';
```

### Option 2: In `brand_manifests` (Processed/Transformed)
```sql
-- Get processed data from manifest
SELECT 
    id,
    flow_id,
    manifest->'strategy'->'icps' as icps,
    manifest->'strategy'->'valueProp' as value_prop,
    manifest->'metadata'->'generationHistory' as history
FROM brand_manifests
WHERE flow_id = 'your-flow-id';
```

---

## 📝 Data Transformation Flow

1. **Raw Scraping** → `positioning_flows.website_analysis`
   - Raw facts, value props, pains extracted from website

2. **ICP Generation** → `brand_manifests.manifest.strategy.icps`
   - Uses scraping data to generate ICPs
   - ICPs stored in manifest

3. **Brand Generation** → `brand_manifests.manifest.identity`
   - Colors, typography, tone generated from strategy

4. **Real-Time Updates** → `brand_manifests.manifest` (any field)
   - Copilot chat updates manifest directly
   - History tracked in `brand_manifest_history`

---

## 🎯 Key Takeaways

1. **Scraping data** is stored in `positioning_flows.website_analysis` (JSONB)
2. **Processed data** flows into `brand_manifests.manifest` (JSONB)
3. **`brand_manifests`** is the source of truth for all brand data
4. **`positioning_flows`** keeps the original scraping data for reference
5. **Real-time updates** go directly to `brand_manifests`, not `positioning_flows`

---

## 🔧 Common Queries

### Get all scraping data for a flow
```sql
SELECT website_analysis 
FROM positioning_flows 
WHERE id = 'flow-id';
```

### Get full brand manifest
```sql
SELECT manifest 
FROM brand_manifests 
WHERE flow_id = 'flow-id';
```

### Get latest manifest update
```sql
SELECT 
    manifest->'metadata'->'generationHistory'->-1 as last_update,
    updated_at
FROM brand_manifests
WHERE flow_id = 'flow-id';
```

### Get all flows with their manifests
```sql
SELECT 
    f.id as flow_id,
    f.title,
    f.website_url,
    f.website_analysis->'brand'->>'name' as scraped_brand_name,
    bm.manifest->>'brandName' as manifest_brand_name,
    bm.updated_at as manifest_updated
FROM positioning_flows f
LEFT JOIN brand_manifests bm ON bm.flow_id = f.id
ORDER BY f.created_at DESC;
```

---

**Last Updated**: After fresh start cleanup
**Status**: Current architecture

