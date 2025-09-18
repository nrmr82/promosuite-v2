-- Quick fix for remaining 406 errors
-- Run this in Supabase SQL Editor

-- Check if we can see the profiles table
SELECT 'Checking profiles table access...' as status;

-- Show current user access
SELECT auth.uid() as current_user_id;

-- Disable RLS temporarily to test
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

SELECT 'RLS temporarily disabled for testing' as status;

-- Test if we can access profiles now
SELECT COUNT(*) as profile_count FROM public.profiles;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies with more permissive settings
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Create more permissive policies
CREATE POLICY "Enable read access for authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on user_id" ON public.profiles
    FOR DELETE TO authenticated USING (auth.uid() = id);

SELECT 'Updated RLS policies with more permissive settings' as status;

-- Grant additional permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

SELECT 'Updated permissions granted' as status;

-- Test final access
SELECT 'Testing final access...' as status;
SELECT COUNT(*) as final_profile_count FROM public.profiles;
