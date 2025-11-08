-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create flows table with enhanced schema
create table if not exists public.flows (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null default 'New Flow',
  website_url text,
  facts_json jsonb,
  selected_icp jsonb,
  generated_content jsonb,
  step text default 'initial',
  
  -- Analytics & Business Intelligence
  metadata jsonb default '{
    "prompt_regeneration_count": 0,
    "dropoff_step": null,
    "completion_time_ms": null,
    "prompt_version": "v1",
    "user_feedback": null
  }'::jsonb,
  
  -- Soft delete support
  archived_at timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- Enable RLS
alter table public.flows enable row level security;

-- Composite unique constraint for cleaner title management
create unique index flows_user_title_active_idx 
  on public.flows(user_id, title) 
  where archived_at is null;

-- Policies: Users can only access their own flows (excluding archived unless specified)
create policy "Users can view own active flows"
  on public.flows for select
  using (auth.uid() = user_id and archived_at is null);

create policy "Users can view own archived flows"
  on public.flows for select
  using (auth.uid() = user_id);

create policy "Users can insert own flows"
  on public.flows for insert
  with check (auth.uid() = user_id);

create policy "Users can update own flows"
  on public.flows for update
  using (auth.uid() = user_id);

create policy "Users can soft-delete own flows"
  on public.flows for update
  using (auth.uid() = user_id);

-- Demo/guest mode support
create policy "Guest can view demo flows"
  on public.flows for select
  using (user_id is null and metadata->>'is_demo' = 'true');

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
create index flows_step_idx on public.flows(step) where archived_at is null;
create index flows_archived_idx on public.flows(archived_at) where archived_at is not null;

-- View for dropoff analytics
create or replace view flow_dropoff_analytics as
select 
  step,
  count(*) as flow_count,
  avg(extract(epoch from (updated_at - created_at))) as avg_time_in_step_seconds
from public.flows
where completed_at is null and archived_at is null
group by step
order by flow_count desc;
