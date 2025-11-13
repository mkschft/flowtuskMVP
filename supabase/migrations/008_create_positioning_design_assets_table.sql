-- ============================================================================
-- Migration 8: Create positioning_design_assets for design system storage
-- ============================================================================
-- NOTE: This creates positioning_design_assets (pivot branch)
-- V2 tables are UNTOUCHED

-- Create positioning_design_assets table
CREATE TABLE IF NOT EXISTS public.positioning_design_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icp_id UUID NOT NULL REFERENCES positioning_icps(id) ON DELETE CASCADE,
  parent_flow UUID NOT NULL REFERENCES positioning_flows(id) ON DELETE CASCADE,
  
  -- Design asset content (nullable for lazy loading)
  brand_guide JSONB,
  -- Structure: { colors: { primary[], secondary[], accent[], neutral[] }, 
  --              typography: [], logoVariations: [], toneOfVoice: [], personalityTraits: [] }
  
  style_guide JSONB,
  -- Structure: { buttons: [], cards: [], formElements: [], spacing: [], borderRadius: [], shadows: [] }
  
  landing_page JSONB,
  -- Structure: { navigation: {}, hero: {}, features: [], socialProof: [], pricing: [], footer: {} }
  
  -- Generation state tracking
  generation_state JSONB DEFAULT '{"brand": false, "style": false, "landing": false}'::jsonb,
  -- Tracks which tabs have been generated
  
  -- Generation tracking
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  -- Structure: { models: {}, prompt_versions: {}, timestamps: {}, costs: {}, chat_updates_count: 0 }
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one design asset per ICP
CREATE UNIQUE INDEX IF NOT EXISTS positioning_design_assets_icp_id_unique 
  ON public.positioning_design_assets(icp_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS positioning_design_assets_parent_flow_idx 
  ON public.positioning_design_assets(parent_flow);
CREATE INDEX IF NOT EXISTS positioning_design_assets_created_at_idx 
  ON public.positioning_design_assets(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.positioning_design_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view design assets from their own flows
CREATE POLICY "Users can view design assets from their own positioning flows"
  ON public.positioning_design_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert design assets to their own flows
CREATE POLICY "Users can insert design assets to their own positioning flows"
  ON public.positioning_design_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update their own design assets
CREATE POLICY "Users can update their own design assets"
  ON public.positioning_design_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete their own design assets
CREATE POLICY "Users can delete their own design assets"
  ON public.positioning_design_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_positioning_design_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_positioning_design_assets_updated_at
  BEFORE UPDATE ON public.positioning_design_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_positioning_design_assets_updated_at();

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 8 Complete: positioning_design_assets table created with RLS policies';
END $$;

