-- ============================================================================
-- COMPLETE SUPABASE SETUP SCRIPT
-- ============================================================================
-- This script sets up all tables, auth, and RLS policies for FlowtuskMVP
-- Run this in your Supabase SQL Editor: Dashboard > SQL Editor > New Query
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MIGRATION 001: Core positioning_flows table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.positioning_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  step TEXT NOT NULL DEFAULT 'initial',
  website_url TEXT,
  website_analysis JSONB,
  selected_icp JSONB,
  brand_guide JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS positioning_flows_user_id_idx ON public.positioning_flows(user_id);
CREATE INDEX IF NOT EXISTS positioning_flows_created_at_idx ON public.positioning_flows(created_at DESC);

-- Enable RLS
ALTER TABLE public.positioning_flows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for positioning_flows
CREATE POLICY "Users can view their own positioning flows"
  ON public.positioning_flows FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own positioning flows"
  ON public.positioning_flows FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own positioning flows"
  ON public.positioning_flows FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own positioning flows"
  ON public.positioning_flows FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_positioning_flows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_positioning_flows_updated_at
  BEFORE UPDATE ON public.positioning_flows
  FOR EACH ROW
  EXECUTE FUNCTION update_positioning_flows_updated_at();

-- ============================================================================
-- MIGRATION 003: Enhance positioning_flows with metadata
-- ============================================================================

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'positioning_flows' AND column_name = 'metadata') THEN
    ALTER TABLE public.positioning_flows ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'positioning_flows' AND column_name = 'archived_at') THEN
    ALTER TABLE public.positioning_flows ADD COLUMN archived_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'positioning_flows' AND column_name = 'completed_at') THEN
    ALTER TABLE public.positioning_flows ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create additional indexes
CREATE INDEX IF NOT EXISTS positioning_flows_step_idx ON public.positioning_flows(step);
CREATE INDEX IF NOT EXISTS positioning_flows_archived_idx ON public.positioning_flows(archived_at) WHERE archived_at IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS positioning_flows_user_title_active_idx 
  ON public.positioning_flows(user_id, title) 
  WHERE archived_at IS NULL;

-- ============================================================================
-- MIGRATION 004: positioning_speech table for chat messages
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.positioning_speech (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_flow UUID NOT NULL REFERENCES positioning_flows(id) ON DELETE CASCADE,
  model_id UUID,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS positioning_speech_parent_flow_idx ON public.positioning_speech(parent_flow);
CREATE INDEX IF NOT EXISTS positioning_speech_author_idx ON public.positioning_speech(author);
CREATE INDEX IF NOT EXISTS positioning_speech_created_at_idx ON public.positioning_speech(created_at DESC);

-- Enable RLS
ALTER TABLE public.positioning_speech ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view speech from their own flows"
  ON public.positioning_speech FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_speech.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert speech to their own flows"
  ON public.positioning_speech FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_speech.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_positioning_speech_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_positioning_speech_updated_at
  BEFORE UPDATE ON public.positioning_speech
  FOR EACH ROW
  EXECUTE FUNCTION update_positioning_speech_updated_at();

-- ============================================================================
-- MIGRATION 005: positioning_models table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.positioning_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS positioning_models_code_idx ON public.positioning_models(code);

-- Enable RLS
ALTER TABLE public.positioning_models ENABLE ROW LEVEL SECURITY;

-- RLS Policy (global read access)
CREATE POLICY "Anyone can view positioning models"
  ON public.positioning_models FOR SELECT
  USING (true);

-- Seed default models
INSERT INTO public.positioning_models (name, code, description)
VALUES 
  ('GPT-4o', 'gpt-4o', 'OpenAI GPT-4o - Most capable model'),
  ('GPT-4o-mini', 'gpt-4o-mini', 'OpenAI GPT-4o-mini - Faster and more cost-effective')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- MIGRATION 006: positioning_icps table
-- ============================================================================

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

-- Indexes
CREATE INDEX IF NOT EXISTS positioning_icps_parent_flow_idx ON public.positioning_icps(parent_flow);
CREATE INDEX IF NOT EXISTS positioning_icps_website_url_idx ON public.positioning_icps(website_url);
CREATE INDEX IF NOT EXISTS positioning_icps_created_at_idx ON public.positioning_icps(created_at DESC);

-- Enable RLS
ALTER TABLE public.positioning_icps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view ICPs from their own positioning flows"
  ON public.positioning_icps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_icps.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert ICPs to their own positioning flows"
  ON public.positioning_icps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_icps.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

-- Auto-update trigger
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

-- ============================================================================
-- MIGRATION 007: positioning_value_props table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.positioning_value_props (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icp_id UUID NOT NULL REFERENCES positioning_icps(id) ON DELETE CASCADE,
  parent_flow UUID NOT NULL REFERENCES positioning_flows(id) ON DELETE CASCADE,
  
  -- Value proposition content
  summary JSONB DEFAULT '{}'::jsonb,
  variables JSONB DEFAULT '[]'::jsonb,
  variations JSONB DEFAULT '[]'::jsonb,
  
  -- Generation tracking
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one value prop per ICP
CREATE UNIQUE INDEX IF NOT EXISTS positioning_value_props_icp_id_unique 
  ON public.positioning_value_props(icp_id);

-- Indexes
CREATE INDEX IF NOT EXISTS positioning_value_props_parent_flow_idx 
  ON public.positioning_value_props(parent_flow);
CREATE INDEX IF NOT EXISTS positioning_value_props_created_at_idx 
  ON public.positioning_value_props(created_at DESC);

-- Enable RLS
ALTER TABLE public.positioning_value_props ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view value props from their own positioning flows"
  ON public.positioning_value_props FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert value props to their own positioning flows"
  ON public.positioning_value_props FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

CREATE POLICY "Users can update their own value props"
  ON public.positioning_value_props FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

CREATE POLICY "Users can delete their own value props"
  ON public.positioning_value_props FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

-- Auto-update trigger
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

-- ============================================================================
-- MIGRATION 008: positioning_design_assets table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.positioning_design_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icp_id UUID NOT NULL REFERENCES positioning_icps(id) ON DELETE CASCADE,
  parent_flow UUID NOT NULL REFERENCES positioning_flows(id) ON DELETE CASCADE,
  
  -- Design asset content (nullable for lazy loading)
  brand_guide JSONB,
  style_guide JSONB,
  landing_page JSONB,
  
  -- Generation state tracking
  generation_state JSONB DEFAULT '{"brand": false, "style": false, "landing": false}'::jsonb,
  
  -- Generation tracking
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one design asset per ICP
CREATE UNIQUE INDEX IF NOT EXISTS positioning_design_assets_icp_id_unique 
  ON public.positioning_design_assets(icp_id);

-- Indexes
CREATE INDEX IF NOT EXISTS positioning_design_assets_parent_flow_idx 
  ON public.positioning_design_assets(parent_flow);
CREATE INDEX IF NOT EXISTS positioning_design_assets_created_at_idx 
  ON public.positioning_design_assets(created_at DESC);

-- Enable RLS
ALTER TABLE public.positioning_design_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view design assets from their own positioning flows"
  ON public.positioning_design_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert design assets to their own positioning flows"
  ON public.positioning_design_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

CREATE POLICY "Users can update their own design assets"
  ON public.positioning_design_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

CREATE POLICY "Users can delete their own design assets"
  ON public.positioning_design_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND (positioning_flows.user_id = auth.uid() OR positioning_flows.user_id IS NULL)
    )
  );

-- Auto-update trigger
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

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

DO $$ 
BEGIN 
  RAISE NOTICE '✅ All migrations completed successfully!';
  RAISE NOTICE '📊 Tables created:';
  RAISE NOTICE '  - positioning_flows';
  RAISE NOTICE '  - positioning_speech';
  RAISE NOTICE '  - positioning_models';
  RAISE NOTICE '  - positioning_icps';
  RAISE NOTICE '  - positioning_value_props';
  RAISE NOTICE '  - positioning_design_assets';
  RAISE NOTICE '🔒 RLS enabled on all tables';
  RAISE NOTICE '🤖 2 AI models seeded (GPT-4o, GPT-4o-mini)';
END $$;

-- Verify tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'positioning_%'
ORDER BY table_name;
