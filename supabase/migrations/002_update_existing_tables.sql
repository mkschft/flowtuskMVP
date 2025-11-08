-- Update landing_pages table to add user_id and RLS
-- Add user_id column if it doesn't exist
do $$ 
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'landing_pages' 
    and column_name = 'user_id'
  ) then
    alter table public.landing_pages add column user_id uuid references auth.users(id) on delete cascade;
  end if;
end $$;

-- Enable RLS on landing_pages
alter table public.landing_pages enable row level security;

-- RLS Policies for landing_pages
drop policy if exists "Users can view own landing pages" on public.landing_pages;
create policy "Users can view own landing pages"
  on public.landing_pages for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own landing pages" on public.landing_pages;
create policy "Users can insert own landing pages"
  on public.landing_pages for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own landing pages" on public.landing_pages;
create policy "Users can update own landing pages"
  on public.landing_pages for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own landing pages" on public.landing_pages;
create policy "Users can delete own landing pages"
  on public.landing_pages for delete
  using (auth.uid() = user_id);

-- Public can view landing pages by slug (for sharing)
drop policy if exists "Anyone can view landing pages by slug" on public.landing_pages;
create policy "Anyone can view landing pages by slug"
  on public.landing_pages for select
  using (true);

-- Update leads table to add user_id reference
do $$ 
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'leads' 
    and column_name = 'user_id'
  ) then
    alter table public.leads add column user_id uuid references auth.users(id) on delete cascade;
  end if;
end $$;

-- Enable RLS on leads
alter table public.leads enable row level security;

-- RLS Policies for leads
drop policy if exists "Users can view own leads" on public.leads;
create policy "Users can view own leads"
  on public.leads for select
  using (auth.uid() = user_id);

drop policy if exists "Anyone can insert leads" on public.leads;
create policy "Anyone can insert leads"
  on public.leads for insert
  with check (true);

-- Index for performance
create index if not exists landing_pages_user_id_idx on public.landing_pages(user_id);
create index if not exists leads_user_id_idx on public.leads(user_id);

