-- ============================================================================
-- Migration 4: Create positioning_speech for chat message persistence
-- ============================================================================
-- NOTE: This creates positioning_speech (pivot branch)
-- V2 table "speech" is UNTOUCHED

-- Create positioning_speech table
CREATE TABLE IF NOT EXISTS public.positioning_speech (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_flow UUID NOT NULL REFERENCES positioning_flows(id) ON DELETE CASCADE,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS positioning_speech_parent_flow_idx 
  ON public.positioning_speech(parent_flow);
CREATE INDEX IF NOT EXISTS positioning_speech_author_idx 
  ON public.positioning_speech(author);
CREATE INDEX IF NOT EXISTS positioning_speech_created_at_idx 
  ON public.positioning_speech(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.positioning_speech ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view speech from their own flows
CREATE POLICY "Users can view speech from their own positioning flows"
  ON public.positioning_speech FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_speech.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert speech to their own flows
CREATE POLICY "Users can insert speech to their own positioning flows"
  ON public.positioning_speech FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_speech.parent_flow
      AND positioning_flows.user_id = auth.uid()
    )
  );

-- Auto-update trigger for updated_at
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

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 4 Complete: positioning_speech table created with RLS policies';
END $$;

