-- Create flows table
CREATE TABLE IF NOT EXISTS flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on author for faster queries
CREATE INDEX IF NOT EXISTS flows_author_idx ON flows(author);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS flows_created_at_idx ON flows(created_at DESC);

-- Enable Row Level Security
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own flows
CREATE POLICY "Users can view their own flows"
  ON flows FOR SELECT
  USING (auth.uid() = author);

-- Policy: Users can insert their own flows
CREATE POLICY "Users can insert their own flows"
  ON flows FOR INSERT
  WITH CHECK (auth.uid() = author);

-- Policy: Users can update their own flows
CREATE POLICY "Users can update their own flows"
  ON flows FOR UPDATE
  USING (auth.uid() = author);

-- Policy: Users can delete their own flows
CREATE POLICY "Users can delete their own flows"
  ON flows FOR DELETE
  USING (auth.uid() = author);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_flows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on flows
CREATE TRIGGER update_flows_updated_at
  BEFORE UPDATE ON flows
  FOR EACH ROW
  EXECUTE FUNCTION update_flows_updated_at();

