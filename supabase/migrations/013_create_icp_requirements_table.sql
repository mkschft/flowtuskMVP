-- Create icp_requirements table for storing collected ICP information
CREATE TABLE IF NOT EXISTS icp_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_flow UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  
  -- Minimum Required Inputs
  business_description TEXT,
  core_value_prop TEXT,
  industry TEXT,
  customer_size TEXT, -- B2B/B2C + SMB/Mid/Enterprise
  
  -- Optional Inputs (improves precision)
  existing_customers JSONB DEFAULT '[]'::jsonb, -- Array of customer examples
  target_geography TEXT,
  buyer_roles JSONB DEFAULT '[]'::jsonb, -- Array of roles like CTO, Founder, Teacher
  competitors JSONB DEFAULT '[]'::jsonb, -- Array of competitors
  unique_selling_point TEXT,
  
  -- Absolute Minimal Inputs (fallback mode)
  product_description TEXT,
  target_user TEXT,
  primary_pain_point TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS icp_requirements_parent_flow_idx ON icp_requirements(parent_flow);
CREATE INDEX IF NOT EXISTS icp_requirements_created_at_idx ON icp_requirements(created_at DESC);

-- Enable Row Level Security
ALTER TABLE icp_requirements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see ICP requirements from their own flows
CREATE POLICY "Users can view ICP requirements from their own flows"
  ON icp_requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = icp_requirements.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can insert ICP requirements to their own flows
CREATE POLICY "Users can insert ICP requirements to their own flows"
  ON icp_requirements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = icp_requirements.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can update ICP requirements in their own flows
CREATE POLICY "Users can update ICP requirements in their own flows"
  ON icp_requirements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = icp_requirements.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can delete ICP requirements from their own flows
CREATE POLICY "Users can delete ICP requirements from their own flows"
  ON icp_requirements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = icp_requirements.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_icp_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on icp_requirements
CREATE TRIGGER update_icp_requirements_updated_at
  BEFORE UPDATE ON icp_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_icp_requirements_updated_at();

