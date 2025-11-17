-- ============================================================================
-- Migration 9: Fix positioning_icps RLS policies for demo mode support
-- ============================================================================
-- The existing RLS policies only check auth.uid() = user_id, which blocks
-- demo mode flows (where user_id IS NULL). This migration adds OR user_id IS NULL
-- to all policies to match the pattern used in positioning_flows and positioning_speech.

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view ICPs from their own positioning flows" ON public.positioning_icps;
DROP POLICY IF EXISTS "Users can insert ICPs to their own positioning flows" ON public.positioning_icps;

-- Recreate with demo mode support
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

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 9 Complete: positioning_icps RLS policies now support demo mode';
END $$;
