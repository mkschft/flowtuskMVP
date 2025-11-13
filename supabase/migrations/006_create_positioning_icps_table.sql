-- ============================================================================
-- Migration 6: Create positioning_icps for ICP persistence
-- ============================================================================
-- NOTE: This creates positioning_icps (pivot branch)
-- V2 table "icps" is UNTOUCHED

-- Create positioning_icps table
CREATE TABLE IF NOT EXISTS public.positioning_icps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_flow UUID NOT NULL REFERENCES positioning_flows(id) ON DELETE CASCADE,
  website_url TEXT,
  
  -- Persona information
  persona_name TEXT NOT NULL,
  persona_role TEXT NOT NULL,
  persona_company TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  
  -- ICP data
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  
  -- Metrics
  fit_score INTEGER DEFAULT 90,
  profiles_found INTEGER DEFAULT 12,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS positioning_icps_parent_flow_idx 
  ON public.positioning_icps(parent_flow);
CREATE INDEX IF NOT EXISTS positioning_icps_website_url_idx 
  ON public.positioning_icps(website_url);
CREATE INDEX IF NOT EXISTS positioning_icps_created_at_idx 
  ON public.positioning_icps(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.positioning_icps ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view ICPs from their own flows
CREATE POLICY "Users can view ICPs from their own positioning flows"
  ON public.positioning_icps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_icps.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert ICPs to their own flows
CREATE POLICY "Users can insert ICPs to their own positioning flows"
  ON public.positioning_icps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_icps.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_positioning_icps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_positioning_icps_updated_at
  BEFORE UPDATE ON public.positioning_icps
  FOR EACH ROW
  EXECUTE FUNCTION update_positioning_icps_updated_at();

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 6 Complete: positioning_icps table created with RLS policies';
END $$;

