-- ============================================================================
-- Migration 12: Add flat value prop columns to positioning_value_props
-- ============================================================================
-- Adds denormalized flat fields for direct UI consumption
-- Keeps existing JSONB columns for backward compatibility

-- Add flat columns
ALTER TABLE public.positioning_value_props
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS subheadline TEXT,
  ADD COLUMN IF NOT EXISTS problem TEXT,
  ADD COLUMN IF NOT EXISTS solution TEXT,
  ADD COLUMN IF NOT EXISTS outcome TEXT,
  ADD COLUMN IF NOT EXISTS target_audience TEXT,
  ADD COLUMN IF NOT EXISTS benefits TEXT[];

-- Create indexes for text search if needed
CREATE INDEX IF NOT EXISTS positioning_value_props_headline_idx 
  ON public.positioning_value_props USING gin(to_tsvector('english', COALESCE(headline, '')));

-- Backfill existing data from JSONB to flat columns
UPDATE public.positioning_value_props
SET 
  headline = COALESCE(headline, summary->>'mainInsight'),
  subheadline = COALESCE(subheadline, summary->>'approachStrategy'),
  problem = COALESCE(problem, (
    SELECT string_agg(value::text, ', ')
    FROM jsonb_array_elements_text(summary->'painPointsAddressed')
  )),
  solution = COALESCE(solution, summary->>'approachStrategy'),
  outcome = COALESCE(outcome, summary->>'expectedImpact'),
  target_audience = COALESCE(target_audience, ''),
  benefits = COALESCE(benefits, (
    SELECT array_agg(value->>'text')
    FROM jsonb_array_elements(variations)
  ))
WHERE 
  headline IS NULL 
  OR subheadline IS NULL 
  OR problem IS NULL 
  OR solution IS NULL 
  OR outcome IS NULL;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 12 Complete: Added flat value prop columns and backfilled data';
END $$;
