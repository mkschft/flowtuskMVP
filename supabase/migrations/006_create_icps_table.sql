-- ICP persistence
CREATE TABLE IF NOT EXISTS icps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_flow UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  website_url TEXT,
  
  -- Persona
  persona_name TEXT NOT NULL,
  persona_role TEXT NOT NULL,
  persona_company TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  
  -- ICP Data
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  
  -- Metrics
  fit_score INTEGER DEFAULT 90,
  profiles_found INTEGER DEFAULT 12,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS icps_parent_flow_idx ON icps(parent_flow);
CREATE INDEX IF NOT EXISTS icps_website_url_idx ON icps(website_url);
CREATE INDEX IF NOT EXISTS icps_created_at_idx ON icps(created_at DESC);

ALTER TABLE icps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view ICPs from their own flows"
  ON icps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = icps.parent_flow
      AND flows.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ICPs to their own flows"
  ON icps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = icps.parent_flow
      AND flows.user_id = auth.uid()
    )
  );

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_icps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_icps_updated_at
  BEFORE UPDATE ON icps
  FOR EACH ROW
  EXECUTE FUNCTION update_icps_updated_at();

