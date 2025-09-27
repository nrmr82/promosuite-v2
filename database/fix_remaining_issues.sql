-- =============================================================================
-- PromoSuite V2 - Fix Remaining Database Issues
-- =============================================================================
-- This script fixes the remaining minor issues:
-- 1. Creates social_connections table (404 error fix)  
-- 2. Fixes subscriptions table permissions (406 error fix)
-- 3. Creates any other missing tables
-- =============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. CREATE SOCIAL_CONNECTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.social_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'facebook')),
    platform_user_id TEXT NOT NULL,
    platform_username TEXT,
    platform_display_name TEXT,
    avatar_url TEXT,
    
    -- OAuth tokens (encrypted)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Connection details
    scopes TEXT[],
    connection_status TEXT DEFAULT 'active' CHECK (connection_status IN ('active', 'expired', 'revoked', 'error')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Platform-specific data
    platform_data JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one connection per platform per user
    UNIQUE(user_id, platform)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON public.social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON public.social_connections(platform);
CREATE INDEX IF NOT EXISTS idx_social_connections_status ON public.social_connections(connection_status);
CREATE INDEX IF NOT EXISTS idx_social_connections_user_platform ON public.social_connections(user_id, platform);

-- Enable RLS
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own social connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can insert own social connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can update own social connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can delete own social connections" ON public.social_connections;

-- Create RLS policies
CREATE POLICY "Users can view own social connections" ON public.social_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social connections" ON public.social_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social connections" ON public.social_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social connections" ON public.social_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Create update trigger function
CREATE OR REPLACE FUNCTION public.update_social_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_social_connections_updated_at_trigger ON public.social_connections;
CREATE TRIGGER update_social_connections_updated_at_trigger
    BEFORE UPDATE ON public.social_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_social_connections_updated_at();

-- =============================================================================
-- 2. CREATE/FIX SUBSCRIPTIONS TABLE
-- =============================================================================

-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- Usage tracking
    flyers_used_this_month INTEGER DEFAULT 0,
    social_posts_used_this_month INTEGER DEFAULT 0,
    storage_used_mb NUMERIC DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active subscription per user
    UNIQUE(user_id)
);

-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'enterprise')),
    stripe_price_id TEXT,
    price_monthly NUMERIC,
    price_yearly NUMERIC,
    
    -- Limits
    max_flyers_per_month INTEGER,
    max_social_posts_per_month INTEGER,
    max_storage_gb NUMERIC,
    
    -- Features
    features JSONB DEFAULT '{}',
    
    -- Metadata
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscription" ON public.subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policy for subscription plans (readable by all authenticated users)
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

-- =============================================================================
-- 3. CREATE USER_ANALYTICS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    
    -- Daily usage metrics
    flyers_created INTEGER DEFAULT 0,
    templates_used INTEGER DEFAULT 0,
    social_posts_created INTEGER DEFAULT 0,
    social_posts_published INTEGER DEFAULT 0,
    media_uploaded INTEGER DEFAULT 0,
    session_time_minutes INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per day
    UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Users can insert own analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Users can update own analytics" ON public.user_analytics;

-- Create RLS policies
CREATE POLICY "Users can view own analytics" ON public.user_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON public.user_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON public.user_analytics
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_date ON public.user_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_analytics_date ON public.user_analytics(date);

-- =============================================================================
-- 4. GRANT PERMISSIONS
-- =============================================================================

-- Grant permissions for social_connections
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.social_connections TO authenticated;
GRANT SELECT ON public.social_connections TO anon;

-- Grant permissions for subscriptions
GRANT ALL ON public.subscriptions TO authenticated;
GRANT SELECT ON public.subscription_plans TO authenticated, anon;
GRANT ALL ON public.subscription_plans TO authenticated;

-- Grant permissions for user_analytics  
GRANT ALL ON public.user_analytics TO authenticated;

-- =============================================================================
-- 5. INSERT DEFAULT SUBSCRIPTION PLANS
-- =============================================================================

-- Insert default subscription plans if they don't exist
INSERT INTO public.subscription_plans (name, plan_type, price_monthly, price_yearly, max_flyers_per_month, max_social_posts_per_month, max_storage_gb, description, sort_order)
VALUES 
    ('Free', 'free', 0, 0, 3, 5, 0.1, 'Get started with basic features', 1),
    ('Pro', 'pro', 19.99, 199.99, 100, 200, 10, 'Perfect for growing businesses', 2),
    ('Enterprise', 'enterprise', 49.99, 499.99, NULL, NULL, 100, 'Unlimited everything for agencies', 3)
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 6. CREATE DEFAULT SUBSCRIPTIONS FOR EXISTING USERS
-- =============================================================================

-- Create free subscriptions for users who don't have any subscription
INSERT INTO public.subscriptions (user_id, plan_id, status)
SELECT 
    p.id as user_id,
    (SELECT id FROM public.subscription_plans WHERE plan_type = 'free' LIMIT 1) as plan_id,
    'active' as status
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id
);

-- =============================================================================
-- END OF SCRIPT
-- =============================================================================