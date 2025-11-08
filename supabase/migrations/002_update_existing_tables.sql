-- Update landing_pages table to add user_id and RLS
alter table public.landing_pages add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Enable RLS on landing_pages
alter table public.landing_pages enable row level security;

-- Policies for landing_pages
create policy "Users can view own landing pages"
  on public.landing_pages for select
  using (auth.uid() = user_id);

create policy "Users can insert own landing pages"
  on public.landing_pages for insert
  with check (auth.uid() = user_id);

create policy "Users can update own landing pages"
  on public.landing_pages for update
  using (auth.uid() = user_id);

create policy "Users can delete own landing pages"
  on public.landing_pages for delete
  using (auth.uid() = user_id);

-- Public access for published pages (via slug)
create policy "Anyone can view published pages by slug"
  on public.landing_pages for select
  using (slug is not null);

-- Update leads table to add user_id reference
alter table public.leads add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Enable RLS on leads
alter table public.leads enable row level security;

-- Policies for leads
create policy "Users can view leads for their landing pages"
  on public.leads for select
  using (
    exists (
      select 1 from public.landing_pages 
      where landing_pages.id = leads.landing_page_id 
      and landing_pages.user_id = auth.uid()
    )
  );

-- Index for performance
create index if not exists landing_pages_user_id_idx on public.landing_pages(user_id);
create index if not exists leads_landing_page_id_idx on public.leads(landing_page_id);
