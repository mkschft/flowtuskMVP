# Supabase Migrations

This directory contains SQL migration files for the Supabase database.

## Migration Files

1. **001_create_flows_table.sql** - Creates the `flows` table for chat flows
2. **002_create_speech_table.sql** - Creates the `speech` table for messages within flows

## How to Apply Migrations

### Option 1: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each migration file in order
4. Execute each migration

### Option 3: Using Supabase Studio

1. Go to your Supabase project
2. Navigate to Database > Migrations
3. Create a new migration and paste the SQL content

## Table Structure

### flows
- `id` (UUID, Primary Key)
- `title` (TEXT, Required)
- `author` (UUID, Foreign Key to auth.users)
- `created_at` (TIMESTAMPTZ, Auto-set)
- `updated_at` (TIMESTAMPTZ, Auto-updated)

### speech
- `id` (UUID, Primary Key)
- `content` (TEXT, Required)
- `author` (UUID, Foreign Key to auth.users)
- `parent_flow` (UUID, Foreign Key to flows)
- `context` (JSONB, Optional, defaults to empty object)
- `created_at` (TIMESTAMPTZ, Auto-set)
- `updated_at` (TIMESTAMPTZ, Auto-updated)

## Row Level Security (RLS)

Both tables have RLS enabled with policies that ensure:
- Users can only access their own flows and speech
- All operations (SELECT, INSERT, UPDATE, DELETE) are restricted to the flow owner

