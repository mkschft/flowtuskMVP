# Supabase Database Migrations - Applied ✅

## Migration Summary

**Date:** November 13, 2025  
**Branch:** feature/pivot-refactor  
**Status:** ✅ All migrations successfully applied

---

## 🎯 Tables Modified (Pivot Branch)

### 1. `positioning_flows` - ENHANCED ✏️
**Changes:**
- ✅ Added `metadata` column (JSONB) - Analytics tracking
  - `prompt_regeneration_count`
  - `dropoff_step`
  - `completion_time_ms`
  - `prompt_version`
  - `user_feedback`
  - `is_demo`
- ✅ Added `archived_at` column (TIMESTAMPTZ) - Soft delete support
- ✅ Added `completed_at` column (TIMESTAMPTZ) - Completion tracking
- ✅ Created indexes:
  - `positioning_flows_user_title_active_idx` (unique, for active flows)
  - `positioning_flows_step_idx` (performance)
  - `positioning_flows_archived_idx` (performance)

**Migration File:** `003_enhance_positioning_flows_table.sql`

---

### 2. `positioning_speech` - CREATED 🆕
**Purpose:** Chat message persistence

**Schema:**
```sql
id              UUID PRIMARY KEY
content         TEXT NOT NULL
author          UUID (nullable, for AI messages)
parent_flow     UUID → positioning_flows(id)
model_id        UUID → positioning_models(id)
context         JSONB
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

**Features:**
- ✅ RLS enabled with policies for user-owned flows
- ✅ Auto-update trigger for `updated_at`
- ✅ Foreign key to `positioning_flows`
- ✅ Indexes on parent_flow, author, created_at

**Migration File:** `004_create_positioning_speech_table.sql`

---

### 3. `positioning_models` - CREATED 🆕
**Purpose:** AI model tracking

**Schema:**
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
code            TEXT NOT NULL UNIQUE
description     TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

**Features:**
- ✅ RLS enabled (global read access)
- ✅ Seeded with default models:
  - GPT-4o (`gpt-4o`)
  - GPT-4o-mini (`gpt-4o-mini`)
- ✅ Index on `code` for fast lookups

**Migration File:** `005_create_positioning_models_table.sql`

---

### 4. `positioning_icps` - CREATED 🆕
**Purpose:** ICP (Ideal Customer Profile) persistence

**Schema:**
```sql
id              UUID PRIMARY KEY
parent_flow     UUID → positioning_flows(id)
website_url     TEXT
persona_name    TEXT NOT NULL
persona_role    TEXT NOT NULL
persona_company TEXT NOT NULL
location        TEXT NOT NULL
country         TEXT NOT NULL
title           TEXT NOT NULL
description     TEXT NOT NULL
pain_points     JSONB (array)
goals           JSONB (array)
fit_score       INTEGER (default 90)
profiles_found  INTEGER (default 12)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

**Features:**
- ✅ RLS enabled with policies for user-owned flows
- ✅ Auto-update trigger for `updated_at`
- ✅ Foreign key to `positioning_flows`
- ✅ Indexes on parent_flow, website_url, created_at

**Migration File:** `006_create_positioning_icps_table.sql`

---

## ❌ Tables UNTOUCHED (V2 Branch)

These tables remain **completely unchanged** for V2 compatibility:

- ❌ `flows` - V2 flows table (NOT modified)
- ❌ `speech` - V2 chat messages (NOT modified)
- ❌ `models` - V2 AI models (NOT modified)
- ❌ `icps` - V2 ICPs (NOT modified)
- ❌ `invitations` - V2 invitations (NOT modified)
- ❌ `sites` - V2 sites (NOT modified)

**Also untouched:**
- `positioning_flow_api_usage`
- `positioning_flow_completion_analytics`
- `positioning_flow_dropoff_analytics`
- `positioning_flow_iteration_analytics`

---

## 📊 Database Schema Summary

### Pivot Branch Tables (Active):
```
positioning_flows              ← Enhanced with metadata, soft delete
  └── positioning_speech       ← Chat messages
  └── positioning_icps         ← ICP profiles
  └── positioning_models       ← AI models (linked via speech)
```

### V2 Branch Tables (Untouched):
```
flows                          ← Original V2 table
  └── speech                   ← Original V2 chat
  └── icps                     ← Original V2 ICPs
  └── models                   ← Original V2 models
invitations                    ← Original V2
sites                          ← Original V2
```

---

## 🔒 Row Level Security (RLS)

All new tables have RLS enabled:

### `positioning_flows`
- Users can only access their own flows
- Demo mode support via `user_id IS NULL`

### `positioning_speech`
- Users can view/insert speech only for their own flows
- Enforced via EXISTS check on `positioning_flows`

### `positioning_models`
- Global read access (models are shared)
- Policy: `USING (true)`

### `positioning_icps`
- Users can view/insert ICPs only for their own flows
- Enforced via EXISTS check on `positioning_flows`

---

## ✅ Verification

Run this query to verify all migrations:

```sql
-- Check positioning_flows enhancements
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'positioning_flows' 
  AND column_name IN ('metadata', 'archived_at', 'completed_at');

-- Check new tables
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'positioning_%'
ORDER BY table_name;

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'positioning_%' 
  AND schemaname = 'public'
ORDER BY tablename;

-- Check models seeded
SELECT name, code FROM positioning_models;
```

**Expected Results:**
- ✅ 3 new columns in `positioning_flows`
- ✅ 4 tables with `positioning_*` prefix
- ✅ All tables have RLS enabled (`rowsecurity = true`)
- ✅ 2 models seeded (GPT-4o, GPT-4o-mini)

---

## 🚀 Next Steps

### Code Updates Needed:
1. Update `lib/flows-client.ts` to use `positioning_flows`
2. Update `lib/speech-client.ts` to use `positioning_speech`
3. Update any API routes that reference these tables

### Future Enhancements (Post-Demo):
- [ ] Add analytics views for `positioning_flows`
- [ ] Implement chat message persistence in UI
- [ ] Add ICP save/load functionality
- [ ] Create analytics dashboard

---

## 📝 Notes

- **Branch Isolation:** Pivot branch (`positioning_*`) and V2 branch (`flows`, etc.) are completely isolated
- **No Conflicts:** Tables can coexist without issues
- **Safe Rollback:** V2 tables untouched, can revert pivot branch without affecting V2
- **Demo Ready:** All migrations applied successfully, database is production-ready

---

**Migration Date:** November 13, 2025  
**Applied By:** Automated migration script  
**Branch:** feature/pivot-refactor  
**Status:** ✅ Complete

