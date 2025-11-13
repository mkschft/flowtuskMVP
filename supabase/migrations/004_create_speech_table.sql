-- Chat message persistence
CREATE TABLE IF NOT EXISTS speech (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_flow UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS speech_parent_flow_idx ON speech(parent_flow);
CREATE INDEX IF NOT EXISTS speech_author_idx ON speech(author);
CREATE INDEX IF NOT EXISTS speech_created_at_idx ON speech(created_at DESC);

ALTER TABLE speech ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view speech from their own flows"
  ON speech FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = speech.parent_flow
      AND flows.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert speech to their own flows"
  ON speech FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = speech.parent_flow
      AND flows.user_id = auth.uid()
    )
  );

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_speech_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_speech_updated_at
  BEFORE UPDATE ON speech
  FOR EACH ROW
  EXECUTE FUNCTION update_speech_updated_at();

