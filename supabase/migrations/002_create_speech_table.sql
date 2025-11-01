-- Create speech table (messages)
CREATE TABLE IF NOT EXISTS speech (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_flow UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on parent_flow for faster queries
CREATE INDEX IF NOT EXISTS speech_parent_flow_idx ON speech(parent_flow);

-- Create index on author for faster queries
CREATE INDEX IF NOT EXISTS speech_author_idx ON speech(author);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS speech_created_at_idx ON speech(created_at DESC);

-- Enable Row Level Security
ALTER TABLE speech ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see speech from their own flows
CREATE POLICY "Users can view speech from their own flows"
  ON speech FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = speech.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can insert speech to their own flows
CREATE POLICY "Users can insert speech to their own flows"
  ON speech FOR INSERT
  WITH CHECK (
    auth.uid() = author AND
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = speech.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can update speech in their own flows
CREATE POLICY "Users can update speech in their own flows"
  ON speech FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = speech.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can delete speech from their own flows
CREATE POLICY "Users can delete speech from their own flows"
  ON speech FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = speech.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_speech_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on speech
CREATE TRIGGER update_speech_updated_at
  BEFORE UPDATE ON speech
  FOR EACH ROW
  EXECUTE FUNCTION update_speech_updated_at();

