-- ============================================================================
-- Migration 7: Create positioning_value_props for normalized value prop storage
-- ============================================================================
-- NOTE: This creates positioning_value_props (pivot branch)
-- V2 tables are UNTOUCHED

-- Create positioning_value_props table
CREATE TABLE IF NOT EXISTS public.positioning_value_props (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icp_id UUID NOT NULL REFERENCES positioning_icps(id) ON DELETE CASCADE,
  parent_flow UUID NOT NULL REFERENCES positioning_flows(id) ON DELETE CASCADE,
  
  -- Value proposition content
  summary JSONB DEFAULT '{}'::jsonb,
  -- Structure: { mainInsight, painPointsAddressed[], approachStrategy, expectedImpact }
  
  variables JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{ key, label, type, options[], selectedValue, placeholder }]
  
  variations JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{ id, style, text, useCase, emoji, sourceFactIds[] }]
  
  -- Generation tracking
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  -- Structure: { model, prompt_version, timestamp, regeneration_count, cost_estimate }
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one value prop per ICP
CREATE UNIQUE INDEX IF NOT EXISTS positioning_value_props_icp_id_unique 
  ON public.positioning_value_props(icp_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS positioning_value_props_parent_flow_idx 
  ON public.positioning_value_props(parent_flow);
CREATE INDEX IF NOT EXISTS positioning_value_props_created_at_idx 
  ON public.positioning_value_props(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.positioning_value_props ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view value props from their own flows
CREATE POLICY "Users can view value props from their own positioning flows"
  ON public.positioning_value_props FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert value props to their own flows
CREATE POLICY "Users can insert value props to their own positioning flows"
  ON public.positioning_value_props FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update their own value props
CREATE POLICY "Users can update their own value props"
  ON public.positioning_value_props FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete their own value props
CREATE POLICY "Users can delete their own value props"
  ON public.positioning_value_props FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_positioning_value_props_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_positioning_value_props_updated_at
  BEFORE UPDATE ON public.positioning_value_props
  FOR EACH ROW
  EXECUTE FUNCTION update_positioning_value_props_updated_at();

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 7 Complete: positioning_value_props table created with RLS policies';
END $$;

