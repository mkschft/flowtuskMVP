# Message Persistence Fix

## Problem
Conversation messages were not being saved to the database, causing conversation history to be lost when users logged back in.

## Root Cause
1. The `positioning_flows` table was missing a `generated_content` column
2. The API route was skipping saving `generated_content` with a comment: `// generated_content column not present on positioning_flows; skip persisting to avoid DB errors`
3. Messages are stored in `generated_content.messages` but were never persisted

## Solution Implemented

### ✅ Code Changes (Already Applied)

1. **Migration Created**: `supabase/migrations/014_add_generated_content_column.sql`
   - Adds `generated_content jsonb` column to `positioning_flows`
   - Adds GIN index for efficient JSONB queries
   - Sets default value to `{}`

2. **API Route Updated**: `app/api/flows/[id]/route.ts`
   - Now saves `generated_content` when updating flows (line 85)

3. **API Route Updated**: `app/api/flows/route.ts`
   - Now saves `generated_content` when creating new flows (line 92)

### ⚠️ Manual Step Required

**You need to run the migration in your Supabase database:**

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/014_add_generated_content_column.sql`
3. Paste and run it in the SQL Editor
4. Verify the column was added:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'positioning_flows' 
   AND column_name = 'generated_content';
   ```

## What This Fixes

- ✅ Messages persist across sessions
- ✅ Conversation history loads on login
- ✅ All conversation state (messages, generation state, user journey) is saved
- ✅ Existing flows will have empty `generated_content` (new conversations will work immediately)

## Testing

After running the migration:

1. Create a new conversation and send some messages
2. Log out and log back in
3. Select the conversation from the sidebar
4. Verify messages are displayed

## Notes

- Existing flows will have `generated_content = {}` (empty)
- New conversations will start saving messages immediately
- The GIN index helps with queries that filter by `generated_content` fields

