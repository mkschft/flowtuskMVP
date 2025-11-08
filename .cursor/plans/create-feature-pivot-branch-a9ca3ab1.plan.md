<!-- a9ca3ab1-cbd4-44e6-96ec-045c8d2661d6 0c31776a-2c2e-45d5-8b29-e04e0ff57a8d -->
# Infra Upgrade + DB Persistence Migration

## Critical Principle

**NEVER TOUCH**: `lib/prompt-templates.ts`, evidence chain logic, `sourceFactIds`, or any prompt engineering code

## Phase 1: Database Schema & Migration Scripts

### 1.1 Create Supabase Migration SQL

Create `supabase/migrations/001_flows_table.sql`:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create flows table
create table if not exists public.flows (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null default 'New Flow',
  website_url text,
  facts_json jsonb,
  selected_icp jsonb,
  generated_content jsonb,
  step text default 'initial',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.flows enable row level security;

-- Policies: Users can only access their own flows
create policy "Users can view own flows"
  on public.flows for select
  using (auth.uid() = user_id);

create policy "Users can insert own flows"
  on public.flows for insert
  with check (auth.uid() = user_id);

create policy "Users can update own flows"
  on public.flows for update
  using (auth.uid() = user_id);

create policy "Users can delete own flows"
  on public.flows for delete
  using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger flows_updated_at
  before update on public.flows
  for each row
  execute function update_updated_at();

-- Indexes for performance
create index flows_user_id_idx on public.flows(user_id);
create index flows_created_at_idx on public.flows(created_at desc);
```

### 1.2 Update Existing Tables (landing_pages, leads)

Ensure they also have user_id and RLS policies

## Phase 2: Environment & Configuration

### 2.1 Create `.env.example`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Optional: Firecrawl
FIRECRAWL_API_KEY=
FIRECRAWL_ENABLED=false
```

### 2.2 Update `middleware.ts`

Already exists at root - verify it uses `lib/supabase/middleware.ts` properly

## Phase 3: API Routes for Flow CRUD

### 3.1 Create `/app/api/flows/route.ts`

- GET: List all user flows (with pagination)
- POST: Create new flow

### 3.2 Create `/app/api/flows/[id]/route.ts`

- GET: Get single flow
- PATCH: Update flow (title, step, facts_json, selected_icp, generated_content)
- DELETE: Delete flow

### 3.3 Update Existing Routes

No changes needed - they already use the correct prompt templates

## Phase 4: Client-Side State Management Migration

### 4.1 Create `lib/flows-client.ts`

Wrapper for flow operations that:

- Replaces localStorage with Supabase calls
- Handles optimistic updates
- Manages loading/error states
- Keeps same interface as current MemoryManager

### 4.2 Update `app/app/page.tsx`

**Changes needed:**

- Replace localStorage with Supabase DB calls
- Add user auth check (redirect if not authenticated)
- Load flows from DB on mount
- Auto-save flow state on changes (debounced)
- Keep all existing UI/UX identical
- Keep GenerationManager class (it's for API call caching, not storage)
- Update MemoryManager to use DB instead of localStorage

**What stays the same:**

- All component structure
- All UI interactions
- All API calls to generate-* routes
- Message flow and chat UI
- Evidence tracking logic

### 4.3 Add Loading States & Error Boundaries

- Create `components/ErrorBoundary.tsx`
- Add loading skeletons for flow list
- Handle auth loading state

## Phase 5: Auth Integration

### 5.1 Update `app/layout.tsx`

Add auth provider/context if needed (may already be handled by middleware)

### 5.2 Create Dashboard/Flow List

- Move flow switching from sidebar to proper dashboard
- Add "New Flow" button that creates in DB
- Show flow metadata (created_at, updated_at, step)

### 5.3 Protect Routes

Verify middleware properly protects `/app` route

## Phase 6: Migration Helper (localStorage → DB)

### 6.1 Create `lib/migrate-local-to-db.ts`

One-time migration utility:

- Read conversations from localStorage
- Transform to flow format
- Bulk insert to Supabase
- Clear localStorage after success

### 6.2 Add Migration UI

Show migration prompt on first login if localStorage has data

## Phase 7: Documentation & Testing Prep

### 7.1 Update README.md

- Supabase setup instructions
- Migration SQL commands
- Environment variables
- Development workflow

### 7.2 Create `DEPLOYMENT.md`

- Vercel deployment steps
- Supabase project setup
- Environment variable checklist
- Post-deployment verification

## Testing Checklist (Phase 8)

Run through all these locally before deploy:

**Auth & Setup**

- [ ] Sign up new user
- [ ] Login existing user
- [ ] Protected routes redirect to login
- [ ] Logout clears session

**Flow Management**

- [ ] Create new flow → saves to DB
- [ ] List flows → loads from DB
- [ ] Switch flows → loads correct state
- [ ] Delete flow → removes from DB
- [ ] Auto-save works (change something, refresh, state persists)

**Core Workflow (Evidence Chain Critical)**

- [ ] Paste URL → analyze website → facts_json populated with evidence
- [ ] Generate ICPs → all have `evidence` field referencing fact IDs
- [ ] Select ICP → saves to flow
- [ ] Generate value props → all variations have `sourceFactIds`
- [ ] Generate emails → have `sourceFactIds`
- [ ] Check DB: facts_json, selected_icp, generated_content all saved

**UI/UX**

- [ ] All existing features work identically
- [ ] No console errors
- [ ] Page reloads don't lose state
- [ ] Multiple tabs sync properly (via DB)
- [ ] Export options work

**Performance**

- [ ] Initial load < 2s
- [ ] Flow switch < 500ms
- [ ] Auto-save debounced (not saving on every keystroke)

## Major Risks & Mitigations

**Risk 1: Breaking Prompt Templates**

- Mitigation: Never edit `lib/prompt-templates.ts` - treat as read-only

**Risk 2: Losing Evidence Chain**

- Mitigation: Verify every API response still has `evidence`/`sourceFactIds` before considering complete

**Risk 3: Auth Conflicts**

- Mitigation: Test with fresh account, use middleware exactly as Supabase starter does

**Risk 4: State Sync Issues**

- Mitigation: Always update DB as source of truth, React state follows DB

**Risk 5: Migration Data Loss**

- Mitigation: Keep localStorage data until user confirms migration success

## File Changes Summary

**New Files:**

- `supabase/migrations/001_flows_table.sql`
- `.env.example`
- `app/api/flows/route.ts`
- `app/api/flows/[id]/route.ts`
- `lib/flows-client.ts`
- `lib/migrate-local-to-db.ts`
- `components/ErrorBoundary.tsx`
- `DEPLOYMENT.md`

**Modified Files:**

- `app/app/page.tsx` (localStorage → DB calls, ~50 lines changed)
- `README.md` (updated instructions)
- `app/layout.tsx` (potentially add auth context)
- `middleware.ts` (verify routing)

**Never Touch:**

- `lib/prompt-templates.ts` ❌
- `lib/validators.ts` ❌
- `lib/few-shot-examples.ts` ❌
- Any API route's prompt construction ❌

## Deployment Sequence

1. Create Supabase project (if not exists)
2. Run migration SQL
3. Set environment variables
4. Deploy to Vercel
5. Test auth flow
6. Test one complete user journey
7. Verify evidence chain in DB
8. Monitor for 24h before announcing

### To-dos

- [ ] Create Supabase migration SQL for flows table with RLS policies
- [ ] Create .env.example and verify middleware.ts configuration
- [ ] Create API routes for flow CRUD operations (list, create, get, update, delete)
- [ ] Create lib/flows-client.ts wrapper for Supabase flow operations
- [ ] Update app/app/page.tsx to use DB instead of localStorage while preserving all UI/UX
- [ ] Add ErrorBoundary component and loading states
- [ ] Create migration utility to move localStorage data to DB
- [ ] Update README.md and create DEPLOYMENT.md
- [ ] Run complete testing checklist verifying evidence chain preservation