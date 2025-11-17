-- ============================================================================
-- Migration 10: Fix positioning_value_props and positioning_design_assets RLS for demo mode
-- ============================================================================
-- These tables also need demo mode support (OR user_id IS NULL pattern)

-- ============================================================================
-- positioning_value_props
-- ============================================================================

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

-- ============================================================================
-- positioning_design_assets
-- ============================================================================

DROP POLICY IF EXISTS "Users can view design assets from their own positioning flows" ON public.positioning_design_assets;
DROP POLICY IF EXISTS "Users can insert design assets to their own positioning flows" ON public.positioning_design_assets;
DROP POLICY IF EXISTS "Users can update their own design assets" ON public.positioning_design_assets;
DROP POLICY IF EXISTS "Users can delete their own design assets" ON public.positioning_design_assets;

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

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 10 Complete: positioning_value_props and positioning_design_assets RLS now support demo mode';
END $$;
