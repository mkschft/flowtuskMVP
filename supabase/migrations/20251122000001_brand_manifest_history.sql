-- Migration: Create brand_manifest_history table
-- Purpose: Store version history of brand manifests for undo/redo functionality

CREATE TABLE IF NOT EXISTS brand_manifest_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID NOT NULL,
    manifest JSONB NOT NULL,
    action TEXT NOT NULL, -- e.g., 'color_update', 'market_shift', 'template_applied'
    description TEXT, -- Human-readable description of the change
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes for efficient queries
    CONSTRAINT fk_flow FOREIGN KEY (flow_id) REFERENCES positioning_flows(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_manifest_history_flow_id ON brand_manifest_history(flow_id);
CREATE INDEX IF NOT EXISTS idx_brand_manifest_history_created_at ON brand_manifest_history(created_at DESC);

-- Add RLS policies
ALTER TABLE brand_manifest_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own flow's history
CREATE POLICY "Users can read their own manifest history"
    ON brand_manifest_history
    FOR SELECT
    USING (
        flow_id IN (
            SELECT id FROM positioning_flows WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert history for their own flows
CREATE POLICY "Users can insert manifest history"
    ON brand_manifest_history
    FOR INSERT
    WITH CHECK (
        flow_id IN (
            SELECT id FROM positioning_flows WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete their own flow's history
CREATE POLICY "Users can delete their own manifest history"
    ON brand_manifest_history
    FOR DELETE
    USING (
        flow_id IN (
            SELECT id FROM positioning_flows WHERE user_id = auth.uid()
        )
    );

-- Add comment
COMMENT ON TABLE brand_manifest_history IS 'Stores version history of brand manifests for undo/redo functionality';
