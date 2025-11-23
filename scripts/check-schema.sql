-- Simple Diagnostic: What tables exist?
-- Run this first to see your actual schema

-- 1. List all tables in public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check specifically for flow-related tables
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name LIKE '%flow%'
ORDER BY table_name;

-- 3. Check for manifest-related tables
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name LIKE '%manifest%'
ORDER BY table_name;

-- 4. Check for ICP/positioning tables
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%positioning%' OR table_name LIKE '%icp%')
ORDER BY table_name;
