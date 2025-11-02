-- Create models table for AI models
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS models_code_idx ON models(code);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on models
CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_models_updated_at();

-- Make author nullable (for AI messages)
ALTER TABLE speech ALTER COLUMN author DROP NOT NULL;

-- Add model_id column to speech table (nullable)
ALTER TABLE speech ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES models(id) ON DELETE SET NULL;

-- Create index on model_id for faster queries
CREATE INDEX IF NOT EXISTS speech_model_id_idx ON speech(model_id);

-- Update RLS policies to allow viewing speech with models
DROP POLICY IF EXISTS "Users can view speech from their own flows" ON speech;
CREATE POLICY "Users can view speech from their own flows"
  ON speech FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = speech.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Update RLS policy for INSERT to allow model_id
DROP POLICY IF EXISTS "Users can insert speech to their own flows" ON speech;
CREATE POLICY "Users can insert speech to their own flows"
  ON speech FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = speech.parent_flow
      AND flows.author = auth.uid()
    )
  );

