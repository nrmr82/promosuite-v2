-- PromoSuite V2 - Supabase Database Schema
-- This file contains all table definitions, RLS policies, and functions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    phone TEXT,
    website TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    trial_status JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE public.subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'yearly')),
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    stripe_price_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'inactive')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template categories table
CREATE TABLE public.template_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE public.templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES template_categories(id),
    thumbnail_url TEXT,
    preview_url TEXT,
    template_data JSONB NOT NULL DEFAULT '{}',
    tags TEXT[],
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User flyers table
CREATE TABLE public.flyers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id),
    title TEXT NOT NULL,
    description TEXT,
    flyer_data JSONB NOT NULL DEFAULT '{}',
    thumbnail_url TEXT,
    export_urls JSONB DEFAULT '{}', -- URLs for different formats (PDF, PNG, etc.)
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_favorite BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media library table
CREATE TABLE public.media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    file_path TEXT NOT NULL,
    public_url TEXT,
    alt_text TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media posts table (for SocialSpark)
CREATE TABLE public.social_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flyer_id UUID REFERENCES flyers(id),
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'pinterest')),
    post_content TEXT,
    post_data JSONB DEFAULT '{}',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    platform_post_id TEXT,
    engagement_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User usage analytics table
CREATE TABLE public.user_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics summary table
CREATE TABLE public.analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_templates_category ON templates(category_id);
CREATE INDEX idx_templates_active ON templates(is_active);
CREATE INDEX idx_flyers_user_id ON flyers(user_id);
CREATE INDEX idx_flyers_status ON flyers(status);
CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX idx_user_usage_created_at ON user_usage(created_at);
CREATE INDEX idx_analytics_user_date ON analytics(user_id, date);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Flyers policies
CREATE POLICY "Users can view own flyers" ON flyers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create flyers" ON flyers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flyers" ON flyers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flyers" ON flyers
    FOR DELETE USING (auth.uid() = user_id);

-- Media policies
CREATE POLICY "Users can view own media" ON media
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload media" ON media
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media" ON media
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own media" ON media
    FOR DELETE USING (auth.uid() = user_id);

-- Social posts policies
CREATE POLICY "Users can view own social posts" ON social_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create social posts" ON social_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social posts" ON social_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social posts" ON social_posts
    FOR DELETE USING (auth.uid() = user_id);

-- User usage policies
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON user_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON analytics
    FOR UPDATE USING (auth.uid() = user_id);

-- Public access policies for templates and categories
CREATE POLICY "Templates are viewable by everyone" ON templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Template categories are viewable by everyone" ON template_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Subscription plans are viewable by everyone" ON subscription_plans
    FOR SELECT USING (is_active = true);

-- Functions and Triggers

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_template_categories_updated_at
    BEFORE UPDATE ON template_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_flyers_updated_at
    BEFORE UPDATE ON flyers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_social_posts_updated_at
    BEFORE UPDATE ON social_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_analytics_updated_at
    BEFORE UPDATE ON analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, billing_interval, features, stripe_price_id) VALUES
('Free Trial', 'Try our tools for free with limited access', 0.00, 'monthly', '["2 flyer creations", "Basic templates", "Standard export formats"]', null),
('Pro Monthly', 'Full access to all features billed monthly', 19.99, 'monthly', '["Unlimited flyers", "Premium templates", "All export formats", "Social media scheduling", "Analytics dashboard"]', 'price_pro_monthly'),
('Pro Yearly', 'Full access to all features billed yearly (2 months free)', 199.99, 'yearly', '["Unlimited flyers", "Premium templates", "All export formats", "Social media scheduling", "Analytics dashboard", "Priority support"]', 'price_pro_yearly');

-- Insert default template categories
INSERT INTO template_categories (name, slug, description, icon, color) VALUES
('Real Estate', 'real-estate', 'Professional real estate flyers and marketing materials', 'home', '#2563eb'),
('Business', 'business', 'Corporate and business promotional materials', 'briefcase', '#059669'),
('Events', 'events', 'Event announcements and invitations', 'calendar', '#dc2626'),
('Sale & Promotion', 'sale-promotion', 'Sales flyers and promotional materials', 'tag', '#ea580c'),
('Healthcare', 'healthcare', 'Medical and healthcare service flyers', 'heart', '#7c3aed'),
('Education', 'education', 'Educational and training program materials', 'academic-cap', '#0d9488'),
('Food & Restaurant', 'food-restaurant', 'Restaurant menus and food service flyers', 'cake', '#be123c'),
('Fitness', 'fitness', 'Gym and fitness center promotional materials', 'lightning-bolt', '#7c2d12');

-- Insert sample templates (you would add actual template data here)
INSERT INTO templates (title, description, category_id, thumbnail_url, template_data, tags, is_premium) 
SELECT 
    'Modern Real Estate Flyer',
    'Clean and professional real estate listing template',
    id,
    '/templates/thumbnails/modern-real-estate.jpg',
    '{"elements": [], "canvas": {"width": 800, "height": 1000, "backgroundColor": "#ffffff"}}',
    ARRAY['modern', 'clean', 'professional'],
    false
FROM template_categories WHERE slug = 'real-estate';
