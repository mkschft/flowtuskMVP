-- Add selected_site field to flows table
ALTER TABLE flows
ADD COLUMN IF NOT EXISTS selected_site UUID REFERENCES sites(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS flows_selected_site_idx ON flows(selected_site);

