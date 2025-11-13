-- ============================================================================
-- Migration 5: Create positioning_models and link to positioning_speech
-- ============================================================================
-- NOTE: This creates positioning_models (pivot branch)
-- V2 table "models" is UNTOUCHED

-- Create positioning_models table
CREATE TABLE IF NOT EXISTS public.positioning_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast code lookups
CREATE INDEX IF NOT EXISTS positioning_models_code_idx 
  ON public.positioning_models(code);

-- Enable Row Level Security (models are global, readable by all)
ALTER TABLE public.positioning_models ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view models (they're shared across all users)
CREATE POLICY "Anyone can view positioning models"
  ON public.positioning_models FOR SELECT
  USING (true);

-- Allow nullable author in positioning_speech (for AI messages)
ALTER TABLE public.positioning_speech 
  ALTER COLUMN author DROP NOT NULL;

-- Link positioning_speech to positioning_models
ALTER TABLE public.positioning_speech 
  ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES positioning_models(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS positioning_speech_model_id_idx 
  ON public.positioning_speech(model_id);

-- Seed default models
INSERT INTO public.positioning_models (name, code, description) VALUES
  ('GPT-4o', 'gpt-4o', 'OpenAI GPT-4o - Best reasoning'),
  ('GPT-4o-mini', 'gpt-4o-mini', 'OpenAI GPT-4o-mini - Fast and cost-effective')
ON CONFLICT (code) DO NOTHING;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 5 Complete: positioning_models table created and linked to positioning_speech';
END $$;

