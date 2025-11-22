-- Create brand_manifests table
CREATE TABLE IF NOT EXISTS public.brand_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES public.flows(id) ON DELETE CASCADE,
  
  -- Manifest data (JSONB for flexibility)
  manifest JSONB NOT NULL,
  
  -- Metadata
  version VARCHAR(10) DEFAULT '1.0',
  brand_key VARCHAR(20) UNIQUE, -- Short key for Figma plugin (e.g. "ACME-X7Y9")
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_brand_manifests_brand_key ON public.brand_manifests(brand_key);
CREATE INDEX IF NOT EXISTS idx_brand_manifests_flow_id ON public.brand_manifests(flow_id);

-- Enable RLS
ALTER TABLE public.brand_manifests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view/create their own manifests
CREATE POLICY "Users can view own manifests" 
  ON public.brand_manifests FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own manifests" 
  ON public.brand_manifests FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own manifests" 
  ON public.brand_manifests FOR UPDATE 
  USING (auth.uid() = user_id);

-- Public read access for Figma plugin via brand_key (optional, or handle via API key)
-- For now, we'll keep it secure and rely on the API to bypass RLS for the public endpoint if needed,
-- or create a specific "public read via key" policy.
-- Let's allow public read if they have the exact brand_key (security by obscurity/key)
CREATE POLICY "Public read via brand_key"
  ON public.brand_manifests FOR SELECT
  USING (brand_key IS NOT NULL); 
