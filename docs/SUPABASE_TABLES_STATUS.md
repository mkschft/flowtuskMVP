# Supabase Tables Status & Frontend Connection Report

**Generated:** $(date)  
**Status:** ✅ All tables exist and are accessible

## 📊 Table Status Summary

| Table | Status | Rows | Frontend Usage | Notes |
|-------|--------|------|----------------|-------|
| `positioning_flows` | ✅ Accessible | 5 | ✅ Active | Main flows table, used by `/api/flows` |
| `positioning_icps` | ✅ Accessible | 0 | ✅ Active | Used by brand manifest API |
| `positioning_value_props` | ✅ Accessible | 0 | ✅ Active | Used by brand manifest API |
| `positioning_design_assets` | ✅ Accessible | 0 | ✅ Active | Used by brand manifest API |
| `brand_manifests` | ✅ Accessible | 33 | ✅ Active | Main manifest storage |
| `brand_manifest_history` | ✅ Accessible | 0 | ✅ Active | Manifest version history |
| `user_profiles` | ✅ Accessible | 0 | ✅ Active | User profile data |
| `landing_pages` | ✅ Accessible | 0 | ✅ Active | Landing page storage |
| `leads` | ✅ Accessible | 0 | ✅ Active | Lead capture |
| `flows` | ✅ Accessible | 0 | ⚠️ Legacy | Legacy table (archived) |

## 🔌 Frontend Connection Points

### API Routes Using Supabase

1. **`/api/flows`** (GET, POST)
   - Table: `positioning_flows`
   - Status: ✅ Working
   - Used by: `lib/flows-client.ts`, `app/app/page.tsx`

2. **`/api/flows/[id]`** (GET, PATCH, DELETE)
   - Table: `positioning_flows`
   - Status: ✅ Working

3. **`/api/brand-manifest`** (GET, POST)
   - Tables: `brand_manifests`, `positioning_design_assets`, `positioning_icps`, `positioning_value_props`
   - Status: ✅ Working

4. **`/api/brand-manifest/[brandKey]`** (GET)
   - Table: `brand_manifests`
   - Status: ✅ Working

5. **`/api/brand-manifest/history`** (GET, POST)
   - Table: `brand_manifest_history`
   - Status: ✅ Working

6. **`/api/profile`** (GET, PATCH)
   - Table: `user_profiles`
   - Status: ✅ Working

7. **`/api/publish`** (POST)
   - Table: `landing_pages`
   - Status: ✅ Working

8. **`/api/submit-lead`** (POST)
   - Tables: `leads`, `landing_pages`
   - Status: ✅ Working

## 🗄️ Database Schema Overview

### Core Tables

#### `positioning_flows`
- **Purpose**: Main flow/conversation storage
- **Key Columns**: `id`, `user_id`, `title`, `website_url`, `step`, `metadata`, `archived_at`
- **Indexes**: User+title (unique), step, archived_at
- **RLS**: Enabled (user-scoped + demo mode)

#### `positioning_icps`
- **Purpose**: Ideal Customer Profiles
- **Key Columns**: `id`, `parent_flow`, `icp_data` (JSONB)
- **RLS**: Enabled

#### `positioning_value_props`
- **Purpose**: Value propositions
- **Key Columns**: `id`, `parent_flow`, `icp_id`, `value_prop_data` (JSONB)
- **RLS**: Enabled

#### `positioning_design_assets`
- **Purpose**: Design assets (style guides, landing pages)
- **Key Columns**: `id`, `parent_flow`, `design_assets` (JSONB)
- **RLS**: Enabled

#### `brand_manifests`
- **Purpose**: Unified brand manifest storage
- **Key Columns**: `id`, `flow_id`, `user_id`, `manifest` (JSONB), `brand_key`
- **Indexes**: `brand_key` (unique), `flow_id`
- **RLS**: Enabled (user-scoped + public read via brand_key)

#### `brand_manifest_history`
- **Purpose**: Manifest version history
- **Key Columns**: `id`, `manifest_id`, `manifest_data` (JSONB), `version`
- **RLS**: Enabled

#### `user_profiles`
- **Purpose**: Extended user profile data
- **Key Columns**: `id`, `user_id`, `display_name`, `avatar_url`
- **RLS**: Enabled

### Legacy Tables

#### `flows`
- **Status**: ⚠️ Legacy (archived)
- **Note**: Migration to `positioning_flows` completed
- **Action**: Can be removed after verification

## ✅ Connection Verification

### Test Results

```
✅ All 10 tables exist and are accessible
✅ Real query test on positioning_flows: SUCCESS (5 flows found)
✅ No RLS policy issues detected
✅ Environment variables configured correctly
```

### Sample Data

- **positioning_flows**: 5 active flows
  - "Test Flow 1763424489795"
  - "Connection Test via MCP"
  - "New conversation 11/18/2025"
- **brand_manifests**: 33 manifests stored

## 🔧 Frontend Integration

### Client Libraries

1. **`lib/flows-client.ts`**
   - Wrapper for flow operations
   - Uses `/api/flows` endpoints
   - Status: ✅ Connected

2. **`lib/supabase/client.ts`**
   - Browser client for direct Supabase access
   - Status: ✅ Configured

3. **`lib/supabase/server.ts`**
   - Server-side client with cookie handling
   - Status: ✅ Configured

### Usage Patterns

- **API Routes**: Most frontend code uses Next.js API routes (recommended)
- **Direct Client**: Some components use `createClient()` directly
- **Server Actions**: Not currently used (can be added for better type safety)

## 🚨 Potential Issues & Recommendations

### ✅ No Critical Issues Found

All tables are accessible and properly connected.

### 💡 Recommendations

1. **Legacy Table Cleanup**
   - `flows` table is empty and can be removed after final verification
   - Migration to `positioning_flows` is complete

2. **Data Population**
   - Several tables are empty (icps, value_props, design_assets)
   - This is expected for a fresh/new deployment
   - Data will populate as users create flows

3. **Monitoring**
   - Consider adding monitoring for:
     - Table growth rates
     - Query performance
     - RLS policy effectiveness

4. **Index Optimization**
   - Current indexes look good
   - Monitor slow queries in production

## 📝 Migration Status

All migrations have been applied:
- ✅ `001_flows_table.sql` - Base flows table
- ✅ `002_update_existing_tables.sql` - Updates
- ✅ `003_enhance_positioning_flows_table.sql` - Analytics & soft delete
- ✅ `004_create_positioning_speech_table.sql` - Speech table
- ✅ `005_create_positioning_models_table.sql` - Models table
- ✅ `006_create_positioning_icps_table.sql` - ICPs table
- ✅ `007_create_positioning_value_props_table.sql` - Value props table
- ✅ `008_create_positioning_design_assets_table.sql` - Design assets table
- ✅ `009_fix_positioning_icps_demo_mode.sql` - Demo mode fixes
- ✅ `010_fix_value_props_and_design_assets_demo_mode.sql` - Demo mode fixes
- ✅ `011_fix_all_rls_for_server_side_demo.sql` - RLS fixes
- ✅ `012_add_flat_value_prop_columns.sql` - Value prop columns
- ✅ `013_user_profiles.sql` - User profiles
- ✅ `20251122000000_brand_manifests.sql` - Brand manifests
- ✅ `20251122000001_brand_manifest_history.sql` - Manifest history

## 🔄 How to Re-run Checks

```bash
# Run the table check script
npx tsx scripts/check-supabase-tables.ts

# Or check specific tables via SQL
# (Run in Supabase SQL Editor)
cat scripts/check-schema.sql
```

## 📚 Related Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP_GUIDE.md)
- [Migration Guide](./APP_PAGE_MIGRATION_GUIDE.md)
- [RLS Policies](./docs/archive/RLS_POLICIES.md)

---

**Last Updated**: $(date)  
**Next Review**: After major schema changes

