-- =============================================================================
-- PromoSuite V2 - Complete Database Setup Script
-- =============================================================================
-- This script sets up all necessary tables, policies, and triggers for PromoSuite
-- Run this in your Supabase SQL Editor to fix OAuth and profile creation issues
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. PROFILES TABLE SETUP
-- =============================================================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON public.profiles(provider);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- =============================================================================
-- 2. ROW LEVEL SECURITY (RLS) SETUP
-- =============================================================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- =============================================================================
-- 3. AUTOMATIC PROFILE CREATION FUNCTION
-- =============================================================================

-- Create or replace the function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        avatar_url, 
        provider,
        subscription_status,
        subscription_plan,
        credits,
        preferences
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name', 
            NEW.raw_user_meta_data->>'display_name',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            NEW.raw_user_meta_data->>'photo'
        ),
        COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
        'free',
        'free',
        3,
        '{}'::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        provider = COALESCE(EXCLUDED.provider, profiles.provider),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 4. TRIGGERS SETUP
-- =============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 5. UPDATED_AT TRIGGER
-- =============================================================================

-- Create or replace updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing updated_at trigger if it exists
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;

-- Create trigger for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 6. PERMISSIONS AND GRANTS
-- =============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Allow authenticated users to insert/update/delete their own profiles
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- =============================================================================
-- 7. BACKFILL EXISTING USERS (Optional)
-- =============================================================================

-- This will create profiles for any existing auth.users who don't have profiles
-- Uncomment the following block if you have existing users without profiles:

/*
INSERT INTO public.profiles (id, email, full_name, avatar_url, provider, subscription_status, subscription_plan, credits)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'display_name',
        split_part(au.email, '@', 1)
    ),
    COALESCE(
        au.raw_user_meta_data->>'avatar_url',
        au.raw_user_meta_data->>'picture',
        au.raw_user_meta_data->>'photo'
    ),
    COALESCE(au.raw_app_meta_data->>'provider', 'email'),
    'free',
    'free',
    3
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
*/

-- =============================================================================
-- 8. VERIFICATION QUERIES
-- =============================================================================

-- Run these queries to verify the setup worked correctly:

-- Check if profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'profiles';

-- Check if function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE '%handle_new_user%';

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

-- If you see results from all the verification queries above, the setup is complete!
-- Your PromoSuite app should now work without 406 errors.

SELECT 'PromoSuite database setup completed successfully!' as status;
