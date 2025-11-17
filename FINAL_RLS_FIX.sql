-- ============================================================================
-- COMPLETE RLS FIX FOR DEMO MODE
-- Run this in Supabase SQL Editor to fix ALL tables
-- ============================================================================

-- 1. Fix positioning_flows (allow inserts without auth in demo mode)
DROP POLICY IF EXISTS "Users can only access their own flows" ON public.positioning_flows;
DROP POLICY IF EXISTS "Users can insert their own flows" ON public.positioning_flows;
DROP POLICY IF EXISTS "Users can update their own flows" ON public.positioning_flows;
DROP POLICY IF EXISTS "Users can delete their own flows" ON public.positioning_flows;

CREATE POLICY "Users can view their own flows or demo flows"
  ON public.positioning_flows FOR SELECT
  USING (
    user_id IS NULL  -- Demo flows
    OR user_id = auth.uid()  -- User's own flows
  );

CREATE POLICY "Anyone can insert flows (demo mode)"
  ON public.positioning_flows FOR INSERT
  WITH CHECK (true);  -- Allow all inserts (demo mode)

CREATE POLICY "Users can update their own flows or demo flows"
  ON public.positioning_flows FOR UPDATE
  USING (
    user_id IS NULL  -- Demo flows
    OR user_id = auth.uid()  -- User's own flows
  );

CREATE POLICY "Users can delete their own flows"
  ON public.positioning_flows FOR DELETE
  USING (user_id = auth.uid());

-- 2. Fix positioning_icps
DROP POLICY IF EXISTS "Users can view ICPs from their own positioning flows" ON public.positioning_icps;
DROP POLICY IF EXISTS "Users can insert ICPs to their own positioning flows" ON public.positioning_icps;

CREATE POLICY "Users can view ICPs from their own positioning flows"
  ON public.positioning_icps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_icps.parent_flow
      AND (
        positioning_flows.user_id IS NULL
        OR positioning_flows.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert ICPs to their own positioning flows"
  ON public.positioning_icps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_icps.parent_flow
      AND (
        positioning_flows.user_id IS NULL
        OR positioning_flows.user_id = auth.uid()
      )
    )
  );

-- 3. Fix positioning_value_props
DROP POLICY IF EXISTS "Users can view value props from their own positioning flows" ON public.positioning_value_props;
DROP POLICY IF EXISTS "Users can insert value props to their own positioning flows" ON public.positioning_value_props;
DROP POLICY IF EXISTS "Users can update their own value props" ON public.positioning_value_props;
DROP POLICY IF EXISTS "Users can delete their own value props" ON public.positioning_value_props;

CREATE POLICY "Users can view value props from their own positioning flows"
  ON public.positioning_value_props FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND (
        positioning_flows.user_id IS NULL
        OR positioning_flows.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert value props to their own positioning flows"
  ON public.positioning_value_props FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND (
        positioning_flows.user_id IS NULL
        OR positioning_flows.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own value props"
  ON public.positioning_value_props FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND (
        positioning_flows.user_id IS NULL
        OR positioning_flows.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own value props"
  ON public.positioning_value_props FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND (
        positioning_flows.user_id IS NULL
        OR positioning_flows.user_id = auth.uid()
      )
    )
  );

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ COMPLETE RLS FIX APPLIED';
  RAISE NOTICE '   All tables now support demo mode (user_id IS NULL)';
END $$;
