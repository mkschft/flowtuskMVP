-- Delete the bad manifest for your flow
-- This will force a clean regeneration with our fixed prompts

DELETE FROM brand_manifests 
WHERE flow_id = '2835ae62-799b-42bd-baf0-af784c26a925';

-- Verify it's deleted
SELECT COUNT(*) as remaining_manifests 
FROM brand_manifests 
WHERE flow_id = '2835ae62-799b-42bd-baf0-af784c26a925';
-- Should return 0
