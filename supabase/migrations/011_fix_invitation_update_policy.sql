-- Fix the update policy to allow users to accept invitations sent to their email
-- The current policy doesn't verify email match, which could cause issues

-- Drop the existing accept policy
DROP POLICY IF EXISTS "Users can accept invitations" ON invitations;

-- Create a better policy that verifies email match
-- This allows users to update invitations where:
-- 1. The invitation is pending
-- 2. The invitation email matches the user's email (case-insensitive)
-- 3. They're setting themselves as the accepted_by
CREATE POLICY "Users can accept invitations"
  ON invitations FOR UPDATE
  USING (
    status = 'pending'
    AND LOWER(email) = LOWER(COALESCE(get_user_email_from_jwt(), ''))
  )
  WITH CHECK (
    status = 'accepted'
    AND accepted_by = auth.uid()
    AND LOWER(email) = LOWER(COALESCE(get_user_email_from_jwt(), ''))
  );

