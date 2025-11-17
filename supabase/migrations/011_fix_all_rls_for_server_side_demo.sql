-- ============================================================================
-- Migration 11: Fix ALL RLS policies for server-side demo mode support
-- ============================================================================
-- Problem: Server-side Supabase client has no auth.uid() context, causing
-- RLS violations when inserting ICPs, value props, and design assets.
-- Solution: Update policies to allow operations when parent flow has user_id IS NULL
-- (demo flows) OR when user_id matches auth.uid() (authenticated flows).

-- ============================================================================
-- positioning_icps policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view ICPs from their own positioning flows" ON public.positioning_icps;
DROP POLICY IF EXISTS "Users can insert ICPs to their own positioning flows" ON public.positioning_icps;

-- Recreate with proper demo mode support
CREATE POLICY "Users can view ICPs from their own positioning flows"
  ON public.positioning_icps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_icps.parent_flow
      AND (
        positioning_flows.user_id IS NULL  -- Demo flows
        OR positioning_flows.user_id = auth.uid()  -- User's own flows
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
        positioning_flows.user_id IS NULL  -- Demo flows
        OR positioning_flows.user_id = auth.uid()  -- User's own flows
      )
    )
  );

-- ============================================================================
-- positioning_value_props policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view value props from their own positioning flows" ON public.positioning_value_props;
DROP POLICY IF EXISTS "Users can insert value props to their own positioning flows" ON public.positioning_value_props;
DROP POLICY IF EXISTS "Users can update their own value props" ON public.positioning_value_props;
DROP POLICY IF EXISTS "Users can delete their own value props" ON public.positioning_value_props;

-- Recreate with proper demo mode support
CREATE POLICY "Users can view value props from their own positioning flows"
  ON public.positioning_value_props FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_value_props.parent_flow
      AND (
        positioning_flows.user_id IS NULL  -- Demo flows
        OR positioning_flows.user_id = auth.uid()  -- User's own flows
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
        positioning_flows.user_id IS NULL  -- Demo flows
        OR positioning_flows.user_id = auth.uid()  -- User's own flows
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
        positioning_flows.user_id IS NULL  -- Demo flows
        OR positioning_flows.user_id = auth.uid()  -- User's own flows
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
        positioning_flows.user_id IS NULL  -- Demo flows
        OR positioning_flows.user_id = auth.uid()  -- User's own flows
      )
    )
  );

-- ============================================================================
-- positioning_design_assets policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view design assets from their own positioning flows" ON public.positioning_design_assets;
DROP POLICY IF EXISTS "Users can insert design assets to their own positioning flows" ON public.positioning_design_assets;
DROP POLICY IF EXISTS "Users can update their own design assets" ON public.positioning_design_assets;
DROP POLICY IF EXISTS "Users can delete their own design assets" ON public.positioning_design_assets;

-- Recreate with proper demo mode support
CREATE POLICY "Users can view design assets from their own positioning flows"
  ON public.positioning_design_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND (
        positioning_flows.user_id IS NULL  -- Demo flows
        OR positioning_flows.user_id = auth.uid()  -- User's own flows
      )
    )
  );

CREATE POLICY "Users can insert design assets to their own positioning flows"
  ON public.positioning_design_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND (
        positioning_flows.user_id IS NULL  -- Demo flows
        OR positioning_flows.user_id = auth.uid()  -- User's own flows
      )
    )
  );

CREATE POLICY "Users can update their own design assets"
  ON public.positioning_design_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND (
        positioning_flows.user_id IS NULL  -- Demo flows
        OR positioning_flows.user_id = auth.uid()  -- User's own flows
      )
    )
  );

CREATE POLICY "Users can delete their own design assets"
  ON public.positioning_design_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.positioning_flows
      WHERE positioning_flows.id = positioning_design_assets.parent_flow
      AND (
        positioning_flows.user_id IS NULL  -- Demo flows
        OR positioning_flows.user_id = auth.uid()  -- User's own flows
      )
    )
  );

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 11 Complete: All RLS policies now support server-side demo mode';
  RAISE NOTICE '   - positioning_icps: SELECT, INSERT policies updated';
  RAISE NOTICE '   - positioning_value_props: SELECT, INSERT, UPDATE, DELETE policies updated';
  RAISE NOTICE '   - positioning_design_assets: SELECT, INSERT, UPDATE, DELETE policies updated';
END $$;
