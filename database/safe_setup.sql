-- =============================================================================
-- PromoSuite V2 - Safe Database Setup Script
-- =============================================================================
-- This script safely sets up the profiles table by checking existing structure
-- Run this if you got errors with the complete_setup.sql script
-- =============================================================================

-- First, let's check what already exists
SELECT 'Checking existing profiles table...' as status;

-- Check if profiles table exists and show its current structure
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE NOTICE 'Profiles table already exists. Checking structure...';
    ELSE
        RAISE NOTICE 'Profiles table does not exist. Will create it.';
    END IF;
END
$$;

-- Show current table structure (if table exists)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =============================================================================
-- 1. CREATE OR UPDATE PROFILES TABLE
-- =============================================================================

-- Create the basic profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add email column (safe - won't fail if exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Added email column';
    ELSE
        RAISE NOTICE 'Email column already exists';
    END IF;
END
$$;

-- Add full_name column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name VARCHAR(255);
        RAISE NOTICE 'Added full_name column';
    ELSE
        RAISE NOTICE 'Full_name column already exists';
    END IF;
END
$$;

-- Add avatar_url column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url VARCHAR(500);
        RAISE NOTICE 'Added avatar_url column';
    ELSE
        RAISE NOTICE 'Avatar_url column already exists';
    END IF;
END
$$;

-- Add provider column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'provider') THEN
        ALTER TABLE public.profiles ADD COLUMN provider VARCHAR(50) DEFAULT 'email';
        RAISE NOTICE 'Added provider column';
    ELSE
        RAISE NOTICE 'Provider column already exists';
    END IF;
END
$$;

-- Add subscription_status column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'subscription_status') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'free';
        RAISE NOTICE 'Added subscription_status column';
    ELSE
        RAISE NOTICE 'Subscription_status column already exists';
    END IF;
END
$$;

-- Add subscription_plan column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'subscription_plan') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free';
        RAISE NOTICE 'Added subscription_plan column';
    ELSE
        RAISE NOTICE 'Subscription_plan column already exists';
    END IF;
END
$$;

-- Add credits column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'credits') THEN
        ALTER TABLE public.profiles ADD COLUMN credits INTEGER DEFAULT 3;
        RAISE NOTICE 'Added credits column';
    ELSE
        RAISE NOTICE 'Credits column already exists';
    END IF;
END
$$;

-- Add preferences column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'preferences') THEN
        ALTER TABLE public.profiles ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added preferences column';
    ELSE
        RAISE NOTICE 'Preferences column already exists';
    END IF;
END
$$;

-- Ensure email column is unique and not null (if it has data)
DO $$
BEGIN
    -- First, check if email column has any null values
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email IS NULL LIMIT 1) THEN
        RAISE NOTICE 'Found profiles with null email, updating them...';
        
        -- Update null emails with a fallback value
        UPDATE public.profiles 
        SET email = 'user-' || id::text || '@unknown.local' 
        WHERE email IS NULL;
    END IF;
    
    -- Now try to add NOT NULL constraint if it doesn't exist
    BEGIN
        ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
        RAISE NOTICE 'Set email column to NOT NULL';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE 'Email column already has NOT NULL constraint or cannot be set';
    END;
    
    -- Try to add unique constraint on email if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_type = 'UNIQUE' 
                   AND table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND constraint_name LIKE '%email%') THEN
        BEGIN
            ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
            RAISE NOTICE 'Added unique constraint on email';
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Could not add unique constraint on email (may have duplicates)';
        END;
    ELSE
        RAISE NOTICE 'Email unique constraint already exists';
    END IF;
END
$$;

-- =============================================================================
-- 2. SET UP ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

SELECT 'Row Level Security policies created successfully' as status;

-- =============================================================================
-- 3. CREATE AUTOMATIC PROFILE CREATION FUNCTION
-- =============================================================================

-- Create or replace the function
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

SELECT 'Profile creation function created successfully' as status;

-- =============================================================================
-- 4. CREATE TRIGGER
-- =============================================================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'Profile creation trigger created successfully' as status;

-- =============================================================================
-- 5. CREATE UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the updated_at trigger
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

SELECT 'Updated_at trigger created successfully' as status;

-- =============================================================================
-- 6. SET PERMISSIONS
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

SELECT 'Permissions granted successfully' as status;

-- =============================================================================
-- 7. ADD INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON public.profiles(provider);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

SELECT 'Indexes created successfully' as status;

-- =============================================================================
-- 8. FINAL VERIFICATION
-- =============================================================================

SELECT 'Final verification - Table structure:' as status;

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT 'Verification - RLS Policies:' as status;

-- Show RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

SELECT 'Verification - Triggers:' as status;

-- Show triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'profiles';

-- Final success message
SELECT '🎉 PromoSuite database setup completed successfully! 🎉' as status;
SELECT 'You can now refresh your app - the 406 errors should be gone!' as message;
