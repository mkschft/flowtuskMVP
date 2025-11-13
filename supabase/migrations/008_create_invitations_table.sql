-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  
  -- Metadata
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS invitations_email_idx ON invitations(email);
CREATE INDEX IF NOT EXISTS invitations_token_idx ON invitations(token);
CREATE INDEX IF NOT EXISTS invitations_status_idx ON invitations(status);
CREATE INDEX IF NOT EXISTS invitations_invited_by_idx ON invitations(invited_by);
CREATE INDEX IF NOT EXISTS invitations_expires_at_idx ON invitations(expires_at);

-- Enable Row Level Security
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations they sent
CREATE POLICY "Users can view invitations they sent"
  ON invitations FOR SELECT
  USING (auth.uid() = invited_by);

-- Policy: Users can view invitations sent to their email (for accepting)
CREATE POLICY "Users can view invitations sent to their email"
  ON invitations FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy: Users can insert invitations (only for themselves as inviter)
CREATE POLICY "Users can insert invitations"
  ON invitations FOR INSERT
  WITH CHECK (auth.uid() = invited_by);

-- Policy: Users can update invitations they sent
CREATE POLICY "Users can update invitations they sent"
  ON invitations FOR UPDATE
  USING (auth.uid() = invited_by);

-- Policy: Users can accept invitations sent to their email
CREATE POLICY "Users can accept invitations sent to their email"
  ON invitations FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending'
  )
  WITH CHECK (
    status = 'accepted'
    AND accepted_by = auth.uid()
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on invitations
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitations_updated_at();

-- Create function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

