-- Cleanup and verification script for demo mode
-- Run this in Supabase SQL Editor

-- 1. Show current flows
SELECT 
  id,
  title,
  user_id,
  website_url,
  created_at,
  metadata->'feature_flags'->>'is_demo' as is_demo
FROM positioning_flows
ORDER BY created_at DESC
LIMIT 10;

-- 2. Show ICPs and their parent flows
SELECT 
  i.id as icp_id,
  i.persona_name,
  i.parent_flow,
  f.user_id as flow_user_id,
  f.metadata->'feature_flags'->>'is_demo' as flow_is_demo
FROM positioning_icps i
LEFT JOIN positioning_flows f ON f.id = i.parent_flow
ORDER BY i.created_at DESC
LIMIT 10;

-- 3. Check RLS policies on positioning_icps
SELECT 
  policyname,
  cmd,
  qual::text as using_expression
FROM pg_policies 
WHERE tablename = 'positioning_icps';

-- 4. (OPTIONAL) Delete all test data to start fresh
-- Uncomment these lines if you want to clear everything and start over:

-- DELETE FROM positioning_icps WHERE parent_flow IN (
--   SELECT id FROM positioning_flows WHERE metadata->'feature_flags'->>'is_demo' = 'true'
-- );
-- DELETE FROM positioning_flows WHERE metadata->'feature_flags'->>'is_demo' = 'true';
