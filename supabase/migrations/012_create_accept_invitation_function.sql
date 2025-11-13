-- Create a SECURITY DEFINER function to accept invitations
-- This bypasses RLS and allows the API to accept invitations on behalf of users
CREATE OR REPLACE FUNCTION accept_invitation_by_email(invitee_email TEXT, invitee_user_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  invitation_id UUID
) AS $$
DECLARE
  invite_record invitations%ROWTYPE;
BEGIN
  -- Find pending invitation for this email
  SELECT * INTO invite_record
  FROM invitations
  WHERE LOWER(email) = LOWER(invitee_email)
    AND status = 'pending'
    AND expires_at >= NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no invitation found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'No pending invitation found for this email'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check if expired
  IF invite_record.expires_at < NOW() THEN
    RETURN QUERY SELECT false, 'Invitation has expired'::TEXT, invite_record.id;
    RETURN;
  END IF;

  -- Update invitation
  UPDATE invitations
  SET 
    status = 'accepted',
    accepted_at = NOW(),
    accepted_by = invitee_user_id
  WHERE id = invite_record.id;

  RETURN QUERY SELECT true, 'Invitation accepted successfully'::TEXT, invite_record.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

