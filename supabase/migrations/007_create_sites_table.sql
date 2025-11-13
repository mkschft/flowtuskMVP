-- Create sites table for scraped website data
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_flow UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  
  -- Scraped Content
  content TEXT,
  source TEXT,
  
  -- Metadata
  title TEXT,
  description TEXT,
  summary TEXT,
  hero_image TEXT,
  favicon_url TEXT,
  language TEXT,
  
  -- Structured Data
  facts_json JSONB,
  
  -- Metrics
  pages INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS sites_parent_flow_idx ON sites(parent_flow);
CREATE INDEX IF NOT EXISTS sites_url_idx ON sites(url);
CREATE INDEX IF NOT EXISTS sites_created_at_idx ON sites(created_at DESC);

-- Enable Row Level Security
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see sites from their own flows
CREATE POLICY "Users can view sites from their own flows"
  ON sites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = sites.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can insert sites to their own flows
CREATE POLICY "Users can insert sites to their own flows"
  ON sites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = sites.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can update sites in their own flows
CREATE POLICY "Users can update sites in their own flows"
  ON sites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = sites.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can delete sites from their own flows
CREATE POLICY "Users can delete sites from their own flows"
  ON sites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = sites.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on sites
CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_sites_updated_at();

