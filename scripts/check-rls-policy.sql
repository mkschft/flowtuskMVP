-- Check if RLS policy exists for public brand key access
-- Run this in Supabase SQL Editor

-- 1. Check existing policies on brand_manifests table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'brand_manifests';

-- 2. If policy doesn't exist, create it:
-- CREATE POLICY "Allow public read via brand_key"
-- ON brand_manifests FOR SELECT
-- USING (brand_key IS NOT NULL);

-- 3. Test the policy by fetching a manifest
-- SELECT manifest FROM brand_manifests WHERE brand_key = 'YOUR-BRAND-KEY' LIMIT 1;
