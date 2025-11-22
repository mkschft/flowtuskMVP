-- Delete existing brand manifests to trigger regeneration with fixed structure
-- Run this in Supabase SQL Editor

DELETE FROM brand_manifests 
WHERE flow_id IN (
  SELECT id FROM positioning_flows 
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
);

-- Or delete for a specific flow:
-- DELETE FROM brand_manifests WHERE flow_id = 'ccf7125a-9117-45b6-a07c-546f3203659b';

-- Verify deletion
SELECT COUNT(*) as remaining_manifests FROM brand_manifests;
