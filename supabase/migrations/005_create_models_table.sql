-- AI model tracking
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS models_code_idx ON models(code);

-- Allow nullable author in speech (for AI messages)
ALTER TABLE speech ALTER COLUMN author DROP NOT NULL;

-- Link speech to models
ALTER TABLE speech ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES models(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS speech_model_id_idx ON speech(model_id);

-- Seed default models
INSERT INTO models (name, code, description) VALUES
  ('GPT-4o', 'gpt-4o', 'OpenAI GPT-4o - Best reasoning'),
  ('GPT-4o-mini', 'gpt-4o-mini', 'OpenAI GPT-4o-mini - Fast and cost-effective')
ON CONFLICT (code) DO NOTHING;

