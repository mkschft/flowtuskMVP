-- Migration: Add Prompt-First Flow Support
-- Date: 2025-11-27
-- Description: Add columns to support both URL-first and prompt-first brand creation flows

-- ============================================================================
-- Add input_type column to positioning_flows
-- ============================================================================

-- Add input_type column (url or idea)
ALTER TABLE positioning_flows
ADD COLUMN IF NOT EXISTS input_type TEXT DEFAULT 'url' CHECK (input_type IN ('url', 'idea'));

-- Add idea_metadata column for storing prompt-first flow data
ALTER TABLE positioning_flows
ADD COLUMN IF NOT EXISTS idea_metadata JSONB;

-- Add comment for documentation
COMMENT ON COLUMN positioning_flows.input_type IS 'Source of brand facts: url (website scraping) or idea (prompt-based generation)';
COMMENT ON COLUMN positioning_flows.idea_metadata IS 'Stores user input for prompt-first flows (idea, targetMarket, problemStatement, etc.)';

-- ============================================================================
-- Create index for filtering by input type (analytics)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_flows_input_type ON positioning_flows(input_type);

-- ============================================================================
-- Backfill existing flows with default values
-- ============================================================================

-- Set all existing flows to 'url' input type (they were all URL-based before this migration)
UPDATE positioning_flows
SET input_type = 'url'
WHERE input_type IS NULL;

-- ============================================================================
-- Update RLS policies to support both flow types
-- ============================================================================

-- No RLS changes needed - existing policies work for both flow types
-- since we're just adding optional metadata columns

-- ============================================================================
-- Verification queries (for manual testing)
-- ============================================================================

-- Verify column additions
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'positioning_flows'
-- AND column_name IN ('input_type', 'idea_metadata');

-- Verify index creation
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'positioning_flows'
-- AND indexname = 'idx_flows_input_type';

-- Check distribution of input types
-- SELECT input_type, COUNT(*) as count
-- FROM positioning_flows
-- GROUP BY input_type;
