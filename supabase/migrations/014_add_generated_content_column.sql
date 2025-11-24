-- ============================================================================
-- Migration 14: Add generated_content column to positioning_flows
-- ============================================================================
-- This column stores conversation messages, generation state, and user journey data
-- Required for persisting conversation history across sessions

-- Add generated_content column to store messages and conversation state
ALTER TABLE public.positioning_flows 
ADD COLUMN IF NOT EXISTS generated_content jsonb DEFAULT '{}'::jsonb;

-- Add GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS positioning_flows_generated_content_idx 
ON public.positioning_flows USING gin (generated_content);

-- Add comment for documentation
COMMENT ON COLUMN public.positioning_flows.generated_content IS 
'Stores conversation messages, generation state, user journey, and other conversation data. Structure: { messages: [], generationState: {}, userJourney: {}, generationHistory: [], userPreferences: {} }';

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 14 Complete: generated_content column added to positioning_flows';
END $$;

