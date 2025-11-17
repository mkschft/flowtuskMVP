-- Add summary column to sites table if it doesn't exist
ALTER TABLE sites
ADD COLUMN IF NOT EXISTS summary TEXT;

