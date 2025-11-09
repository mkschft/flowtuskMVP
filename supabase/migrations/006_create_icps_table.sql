-- Create icps table for saved Ideal Customer Profiles
CREATE TABLE IF NOT EXISTS icps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_flow UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  website_url TEXT,
  
  -- Persona Information
  persona_name TEXT NOT NULL,
  persona_role TEXT NOT NULL,
  persona_company TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  
  -- ICP Metadata
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Arrays stored as JSONB
  pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  
  -- Metrics
  fit_score INTEGER DEFAULT 90,
  profiles_found INTEGER DEFAULT 12,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS icps_parent_flow_idx ON icps(parent_flow);
CREATE INDEX IF NOT EXISTS icps_website_url_idx ON icps(website_url);
CREATE INDEX IF NOT EXISTS icps_title_idx ON icps(title);
CREATE INDEX IF NOT EXISTS icps_created_at_idx ON icps(created_at DESC);

-- Enable Row Level Security
ALTER TABLE icps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see ICPs from their own flows
CREATE POLICY "Users can view ICPs from their own flows"
  ON icps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = icps.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can insert ICPs to their own flows
CREATE POLICY "Users can insert ICPs to their own flows"
  ON icps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = icps.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can update ICPs in their own flows
CREATE POLICY "Users can update ICPs in their own flows"
  ON icps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = icps.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can delete ICPs from their own flows
CREATE POLICY "Users can delete ICPs from their own flows"
  ON icps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = icps.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_icps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on icps
CREATE TRIGGER update_icps_updated_at
  BEFORE UPDATE ON icps
  FOR EACH ROW
  EXECUTE FUNCTION update_icps_updated_at();

