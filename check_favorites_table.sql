-- Quick check to see if user_favorites table exists and is properly configured
-- Run this in your Supabase SQL Editor

-- 1. Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_favorites';

-- 2. Check table structure if it exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_favorites'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_favorites';

-- 4. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_favorites';

-- 5. Try a simple select (this will fail if permissions are wrong)
SELECT COUNT(*) as total_favorites FROM user_favorites;