-- ============================================================================
-- Migration 3: Enhance positioning_flows with analytics and soft delete
-- ============================================================================
-- NOTE: This modifies positioning_flows (pivot branch)
-- V2 tables (flows, speech, models, icps) are UNTOUCHED

-- Add analytics metadata
ALTER TABLE public.positioning_flows 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{
  "prompt_regeneration_count": 0,
  "dropoff_step": null,
  "completion_time_ms": null,
  "prompt_version": "v1",
  "user_feedback": null,
  "is_demo": false
}'::jsonb;

-- Add soft delete support
ALTER TABLE public.positioning_flows 
ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Add completion tracking
ALTER TABLE public.positioning_flows 
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Create composite unique constraint for active flows
CREATE UNIQUE INDEX IF NOT EXISTS positioning_flows_user_title_active_idx 
  ON public.positioning_flows(user_id, title) 
  WHERE archived_at IS NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS positioning_flows_step_idx 
  ON public.positioning_flows(step) 
  WHERE archived_at IS NULL;
  
CREATE INDEX IF NOT EXISTS positioning_flows_archived_idx 
  ON public.positioning_flows(archived_at) 
  WHERE archived_at IS NOT NULL;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 3 Complete: positioning_flows enhanced with metadata, soft delete, and completion tracking';
END $$;

