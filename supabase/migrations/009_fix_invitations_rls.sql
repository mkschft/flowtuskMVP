-- Fix RLS policies that try to access auth.users directly
-- Regular users don't have permission to query auth.users table

-- Drop the problematic policies that query auth.users
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON invitations;
DROP POLICY IF EXISTS "Users can accept invitations sent to their email" ON invitations;

-- Create a function to get invitation by token (for accepting flow)
-- This function runs with SECURITY DEFINER so it can read any invitation
CREATE OR REPLACE FUNCTION get_invitation_by_token(invite_token TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  token TEXT,
  invited_by UUID,
  status TEXT,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.email,
    i.token,
    i.invited_by,
    i.status,
    i.expires_at,
    i.accepted_at,
    i.accepted_by,
    i.created_at,
    i.updated_at
  FROM invitations i
  WHERE i.token = invite_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a policy that allows users to update invitations where they are accepting it
-- Email verification is handled in the API layer
CREATE POLICY "Users can accept invitations"
  ON invitations FOR UPDATE
  USING (status = 'pending')
  WITH CHECK (
    status = 'accepted'
    AND accepted_by = auth.uid()
  );

