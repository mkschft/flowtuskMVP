-- Add selected_icp field to flows table
ALTER TABLE flows
ADD COLUMN IF NOT EXISTS selected_icp UUID REFERENCES icps(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS flows_selected_icp_idx ON flows(selected_icp);

