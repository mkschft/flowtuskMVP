# Supabase Setup Guide

This guide will help you set up your Supabase backend for FlowtuskMVP.

## Prerequisites

- Supabase account at [supabase.com](https://supabase.com)
- Project created in Supabase dashboard
- `.env.local` file with Supabase credentials

## Step 1: Configure Authentication

### Enable Email Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize "Confirm signup", "Magic Link", "Reset Password" templates

### Optional: Configure OAuth Providers

If you want to enable Google/GitHub login:

1. Go to **Authentication** → **Providers**
2. Enable **Google** or **GitHub**
3. Add OAuth credentials from your provider
4. Add redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: 
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Set **Redirect URLs**:
   - `http://localhost:3000/**`
   - `https://yourdomain.com/**`

## Step 2: Run Database Migrations

### Option A: Use the Complete Setup Script (Recommended)

1. Open your Supabase Dashboard
2. Go to **SQL Editor** (in left sidebar)
3. Click **New Query**
4. Open the file `setup-supabase.sql` from your project root
5. Copy the entire contents
6. Paste into the SQL editor
7. Click **Run**
8. Wait for completion (should see success messages)

### Option B: Run Individual Migrations

If you prefer to run migrations one by one:

```bash
# In Supabase SQL Editor, run these in order:
1. supabase/migrations/001_flows_table.sql
2. supabase/migrations/002_update_existing_tables.sql  
3. supabase/migrations/003_enhance_positioning_flows_table.sql
4. supabase/migrations/004_create_positioning_speech_table.sql
5. supabase/migrations/005_create_positioning_models_table.sql
6. supabase/migrations/006_create_positioning_icps_table.sql
7. supabase/migrations/007_create_positioning_value_props_table.sql
8. supabase/migrations/008_create_positioning_design_assets_table.sql
```

## Step 3: Verify Database Setup

Run this query in the SQL Editor to verify all tables were created:

```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'positioning_%'
ORDER BY table_name;
```

You should see **6 tables**:
- ✅ positioning_design_assets
- ✅ positioning_flows
- ✅ positioning_icps
- ✅ positioning_models
- ✅ positioning_speech
- ✅ positioning_value_props

## Step 4: Verify RLS Policies

Check that Row Level Security is enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'positioning_%' 
  AND schemaname = 'public'
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

## Step 5: Configure Environment Variables

Update your `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Get these from: Supabase Dashboard > Settings > API
```

To find your credentials:
1. Go to **Settings** → **API**
2. Copy **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 6: Test the Setup

### Create a Test User

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter an email and password
4. Click **Create User**

### Test Database Access

Run this in SQL Editor:

```sql
-- Test creating a flow (replace UUID with your user ID)
INSERT INTO positioning_flows (user_id, title, step)
VALUES ('YOUR_USER_UUID', 'Test Flow', 'initial')
RETURNING *;

-- Verify it was created
SELECT * FROM positioning_flows ORDER BY created_at DESC LIMIT 1;
```

## Step 7: Enable Demo Mode (Optional)

If you want to allow unauthenticated users to try the app:

1. In `.env.local`, add:
   ```
   NEXT_PUBLIC_DEMO_MODE_ENABLED=true
   ```

2. Verify RLS policies allow `user_id IS NULL` (already configured in migrations)

## Database Schema Overview

### Core Tables

1. **positioning_flows**
   - Main flow/conversation tracking
   - Stores user's progress through the app
   - Soft delete support via `archived_at`

2. **positioning_speech**
   - Chat message history
   - Links to flows and AI models

3. **positioning_models**
   - AI model metadata (GPT-4o, etc.)
   - Pre-seeded with default models

4. **positioning_icps**
   - Ideal Customer Profiles
   - Generated from website analysis

5. **positioning_value_props**
   - Value propositions for each ICP
   - Multiple variations and formats

6. **positioning_design_assets**
   - Brand guide, style guide, landing page designs
   - Lazy-loaded for performance

### Relationships

```
positioning_flows (parent)
  ├── positioning_speech (chat messages)
  ├── positioning_icps (personas)
  │   ├── positioning_value_props (value props)
  │   └── positioning_design_assets (designs)
  └── (direct children)
```

## Troubleshooting

### Error: "Could not find table"

**Solution**: Make sure you ran all migrations in order. Re-run `setup-supabase.sql`.

### Error: "RLS policy violation"

**Solution**: 
1. Check that user is authenticated OR demo mode is enabled
2. Verify RLS policies were created (see Step 4)

### Error: "invalid input syntax for type uuid"

**Solution**: You may be using old ICP IDs (like `icp-0`). Delete old data and regenerate ICPs after migrations are applied.

### Connection Issues

**Solution**:
1. Verify `.env.local` has correct Supabase URL and key
2. Check that Supabase project is active (not paused)
3. Restart your dev server: `npm run dev`

## Next Steps

After setup is complete:

1. ✅ Restart your dev server
2. ✅ Test the app at `http://localhost:3000`
3. ✅ Try analyzing a website
4. ✅ Generate ICPs and value props
5. ✅ Launch the Design Studio (copilot)

## Support

If you encounter issues:

1. Check Supabase logs: **Dashboard → Logs → Postgres Logs**
2. Check your app logs: Browser console + terminal output
3. Verify all migrations ran successfully
4. Check that your Supabase project isn't paused

---

**Created**: November 14, 2024  
**Version**: 1.0  
**Status**: Complete ✅
