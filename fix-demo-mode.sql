-- ============================================================================
-- DEMO MODE FIX - Run this entire file in Supabase SQL Editor
-- ============================================================================
-- This fixes RLS policies to allow demo mode (unauthenticated) access

-- ============================================================================
-- Migration 9: Fix positioning_icps RLS policies for demo mode support
-- ============================================================================

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

-- ============================================================================
-- Migration 10: Fix positioning_value_props and positioning_design_assets RLS
-- ============================================================================

-- positioning_value_props policies
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

-- positioning_design_assets policies
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

-- Success!
SELECT 'Demo mode RLS fix applied successfully! 🎉' as status;
