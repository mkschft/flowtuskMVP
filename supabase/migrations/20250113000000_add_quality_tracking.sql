-- Migration: Add Quality Tracking for AI Generations
-- Purpose: Track quality metrics, evidence usage, and validation results
-- Date: 2025-01-13

-- Create generation_quality_logs table
CREATE TABLE IF NOT EXISTS generation_quality_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL,
  model TEXT,
  validation_passed BOOLEAN DEFAULT false,
  repair_attempted BOOLEAN DEFAULT false,
  quality_score NUMERIC(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
  evidence_count INTEGER DEFAULT 0,
  issues JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quality_operation ON generation_quality_logs(operation);
CREATE INDEX IF NOT EXISTS idx_quality_score ON generation_quality_logs(quality_score);
CREATE INDEX IF NOT EXISTS idx_quality_created_at ON generation_quality_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quality_validation ON generation_quality_logs(validation_passed);

-- Add comment for documentation
COMMENT ON TABLE generation_quality_logs IS 'Tracks quality metrics for AI-generated content including evidence usage, validation results, and quality scores';
COMMENT ON COLUMN generation_quality_logs.operation IS 'Type of generation (e.g., value-prop, email, linkedin)';
COMMENT ON COLUMN generation_quality_logs.model IS 'AI model used (e.g., gpt-4o, gpt-4o-mini)';
COMMENT ON COLUMN generation_quality_logs.quality_score IS 'Overall quality score from 0.0 to 1.0';
COMMENT ON COLUMN generation_quality_logs.evidence_count IS 'Number of fact citations (sourceFactIds) in the output';
COMMENT ON COLUMN generation_quality_logs.issues IS 'Array of quality issues found (e.g., missing evidence, generic phrases)';
COMMENT ON COLUMN generation_quality_logs.metadata IS 'Additional context (e.g., user_id, session_id, attempt_count)';

