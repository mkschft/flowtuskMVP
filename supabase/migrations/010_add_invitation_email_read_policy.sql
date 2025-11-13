-- Add policy to allow users to read invitations sent to their email
-- This is needed for auto-accept functionality
-- We use a function to get email from JWT claims instead of querying auth.users

-- Create a function to get user email from JWT (works in RLS context)
CREATE OR REPLACE FUNCTION get_user_email_from_jwt()
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email')::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- Policy: Users can view invitations sent to their email (for auto-accept)
CREATE POLICY "Users can view invitations by email"
  ON invitations FOR SELECT
  USING (
    email = LOWER(get_user_email_from_jwt())
  );

