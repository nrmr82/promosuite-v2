-- PromoSuite V2 Complete Database Setup
-- Comprehensive migration with schema, RLS policies, functions, and seed data

-- ============================================
-- EXTENSIONS
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- ENUMS AND TYPES
-- ============================================

-- User subscription status
CREATE TYPE subscription_status AS ENUM (
  'active',
  'canceled',
  'expired',
  'trial',
  'past_due'
);

-- Subscription plan types
CREATE TYPE plan_type AS ENUM (
  'free',
  'monthly',
  'annual',
  'lifetime'
);

-- Template subcategories
CREATE TYPE template_subcategory AS ENUM (
  'listing',
  'open_house',
  'sold',
  'coming_soon',
  'market_update',
  'testimonial',
  'agent_intro',
  'holiday',
  'seasonal'
);

-- Media types
CREATE TYPE media_type AS ENUM (
  'image',
  'video',
  'audio',
  'document'
);

-- Social platform types
CREATE TYPE social_platform AS ENUM (
  'facebook',
  'instagram',
  'twitter',
  'linkedin',
  'tiktok',
  'youtube'
);

-- Post status
CREATE TYPE post_status AS ENUM (
  'draft',
  'scheduled',
  'published',
  'failed'
);

-- Property types for listings
CREATE TYPE property_type AS ENUM (
  'single_family',
  'condo',
  'townhouse',
  'multi_family',
  'land',
  'commercial',
  'other'
);

-- ============================================
-- CORE TABLES
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  website TEXT,
  bio TEXT,
  
  -- Real estate specific fields
  license_number TEXT,
  brokerage_name TEXT,
  brokerage_address TEXT,
  specialties TEXT[],
  years_experience INTEGER,
  
  -- App preferences
  preferred_brand_colors TEXT[], -- Array of hex colors
  default_font TEXT DEFAULT 'Inter',
  timezone TEXT DEFAULT 'UTC',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  plan_type plan_type NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  
  -- Features
  max_flyers_per_month INTEGER,
  max_social_posts_per_month INTEGER,
  max_templates INTEGER,
  max_storage_gb INTEGER,
  
  -- Feature flags
  custom_branding BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  white_labeling BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  
  status subscription_status DEFAULT 'trial',
  
  -- Billing
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Trial tracking
  trial_starts_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Usage tracking
  flyers_used_this_month INTEGER DEFAULT 0,
  social_posts_used_this_month INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, plan_id)
);

-- ============================================
-- TEMPLATE SYSTEM
-- ============================================

-- Template categories taxonomy
CREATE TABLE template_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT, -- Lucide icon name
  color TEXT DEFAULT '#667eea',
  
  parent_id UUID REFERENCES template_categories(id),
  
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates
CREATE TABLE templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES template_categories(id),
  
  -- Template data
  template_data JSONB NOT NULL, -- Fabric.js or other editor data
  preview_image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Dimensions
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  dpi INTEGER DEFAULT 300,
  
  -- Categorization
  tags TEXT[],
  subcategory template_subcategory,
  property_types property_type[],
  
  -- Premium features
  is_premium BOOLEAN DEFAULT FALSE,
  required_plan_type plan_type DEFAULT 'free',
  
  -- Creator (for user-generated templates)
  created_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Engagement
  usage_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER CONTENT
-- ============================================

-- User's created flyers
CREATE TABLE flyers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Design data
  design_data JSONB NOT NULL, -- Modified template data
  final_image_url TEXT, -- Generated final image
  
  -- Property information (if applicable)
  property_data JSONB, -- Address, price, beds, baths, etc.
  
  -- Export settings
  export_formats TEXT[] DEFAULT ARRAY['png'], -- png, pdf, jpg
  
  -- Sharing
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE, -- For public sharing
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social media posts
CREATE TABLE social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  flyer_id UUID REFERENCES flyers(id),
  
  -- Content
  caption TEXT,
  hashtags TEXT[],
  media_urls TEXT[], -- Multiple images/videos
  
  -- Platform specific data
  platform social_platform NOT NULL,
  platform_specific_data JSONB, -- Platform-specific settings
  
  -- Scheduling
  status post_status DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- External IDs
  platform_post_id TEXT, -- ID from social platform
  platform_url TEXT,
  
  -- Engagement (updated via API)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDIA MANAGEMENT
-- ============================================

-- Media assets (user uploads, stock photos, etc.)
CREATE TABLE media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- File info
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_size INTEGER NOT NULL, -- Bytes
  mime_type TEXT NOT NULL,
  media_type media_type NOT NULL,
  
  -- Image/Video specific
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER, -- For video/audio
  
  -- Organization
  folder_path TEXT DEFAULT '/',
  tags TEXT[],
  alt_text TEXT,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS & USAGE
-- ============================================

-- User analytics and usage tracking
CREATE TABLE user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Date tracking (daily aggregation)
  date DATE NOT NULL,
  
  -- Usage metrics
  flyers_created INTEGER DEFAULT 0,
  templates_used INTEGER DEFAULT 0,
  social_posts_created INTEGER DEFAULT 0,
  social_posts_published INTEGER DEFAULT 0,
  media_uploaded INTEGER DEFAULT 0,
  
  -- Time spent
  session_time_minutes INTEGER DEFAULT 0,
  
  -- Feature usage
  features_used TEXT[], -- Array of feature names
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Social post analytics (detailed)
CREATE TABLE post_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  
  -- Metrics snapshot
  date DATE NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Engagement rate
  engagement_rate DECIMAL(5,4), -- Calculated field
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(post_id, date)
);

-- ============================================
-- COLLABORATION & SHARING
-- ============================================

-- Template likes/favorites
CREATE TABLE template_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, template_id)
);

-- User collections (saved templates/flyers)
CREATE TABLE collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection items
CREATE TABLE collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  flyer_id UUID REFERENCES flyers(id),
  
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure only one reference
  CONSTRAINT single_reference CHECK (
    (template_id IS NOT NULL AND flyer_id IS NULL) OR
    (template_id IS NULL AND flyer_id IS NOT NULL)
  )
);

-- ============================================
-- SYSTEM TABLES
-- ============================================

-- App notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  
  -- Action data
  action_url TEXT,
  action_text TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System settings and feature flags
CREATE TABLE system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profile indexes
CREATE INDEX idx_profiles_email ON profiles(email);

-- Subscription indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Template indexes
CREATE INDEX idx_templates_category ON templates(category_id);
CREATE INDEX idx_templates_premium ON templates(is_premium);
CREATE INDEX idx_templates_active ON templates(is_active);
CREATE INDEX idx_templates_tags ON templates USING GIN(tags);
CREATE INDEX idx_templates_usage ON templates(usage_count DESC);

-- Flyer indexes
CREATE INDEX idx_flyers_user_id ON flyers(user_id);
CREATE INDEX idx_flyers_template_id ON flyers(template_id);
CREATE INDEX idx_flyers_created_at ON flyers(created_at DESC);

-- Social post indexes
CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_scheduled ON social_posts(scheduled_for) WHERE status = 'scheduled';

-- Media indexes
CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_type ON media(media_type);
CREATE INDEX idx_media_tags ON media USING GIN(tags);

-- Analytics indexes
CREATE INDEX idx_user_analytics_user_date ON user_analytics(user_id, date DESC);
CREATE INDEX idx_post_analytics_post_date ON post_analytics(post_id, date DESC);

-- Notification indexes
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  
  -- Create default subscription (trial)
  INSERT INTO subscriptions (user_id, plan_id, status)
  SELECT NEW.id, sp.id, 'trial'
  FROM subscription_plans sp
  WHERE sp.plan_type = 'free'
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage(template_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE templates 
  SET usage_count = usage_count + 1
  WHERE id = template_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user subscription limits
CREATE OR REPLACE FUNCTION check_user_limits(user_uuid UUID, resource_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  max_allowed INTEGER;
  user_sub RECORD;
BEGIN
  -- Get user's current subscription with plan details
  SELECT s.*, sp.max_flyers_per_month, sp.max_social_posts_per_month, sp.max_storage_gb
  INTO user_sub
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = user_uuid
  AND s.status IN ('active', 'trial')
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF user_sub IS NULL THEN
    RETURN FALSE; -- No active subscription
  END IF;
  
  -- Check specific resource limits
  CASE resource_type
    WHEN 'flyer' THEN
      IF user_sub.max_flyers_per_month IS NULL THEN
        RETURN TRUE; -- Unlimited
      END IF;
      RETURN user_sub.flyers_used_this_month < user_sub.max_flyers_per_month;
      
    WHEN 'social_post' THEN
      IF user_sub.max_social_posts_per_month IS NULL THEN
        RETURN TRUE; -- Unlimited
      END IF;
      RETURN user_sub.social_posts_used_this_month < user_sub.max_social_posts_per_month;
      
    WHEN 'storage' THEN
      IF user_sub.max_storage_gb IS NULL THEN
        RETURN TRUE; -- Unlimited
      END IF;
      RETURN user_sub.storage_used_mb < (user_sub.max_storage_gb * 1024);
      
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counters
CREATE OR REPLACE FUNCTION increment_usage_counter(user_uuid UUID, resource_type TEXT)
RETURNS void AS $$
BEGIN
  CASE resource_type
    WHEN 'flyer' THEN
      UPDATE subscriptions 
      SET flyers_used_this_month = flyers_used_this_month + 1
      WHERE user_id = user_uuid
      AND status IN ('active', 'trial');
      
    WHEN 'social_post' THEN
      UPDATE subscriptions 
      SET social_posts_used_this_month = social_posts_used_this_month + 1
      WHERE user_id = user_uuid
      AND status IN ('active', 'trial');
      
    ELSE
      -- Do nothing for unknown types
      NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage counters
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions 
  SET 
    flyers_used_this_month = 0,
    social_posts_used_this_month = 0
  WHERE status IN ('active', 'trial');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate engagement rate
CREATE OR REPLACE FUNCTION calculate_engagement_rate(post_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_engagement INTEGER;
  post_reach INTEGER;
  engagement_rate DECIMAL;
BEGIN
  SELECT 
    (likes_count + comments_count + shares_count),
    GREATEST(reach, 1) -- Avoid division by zero
  INTO total_engagement, post_reach
  FROM social_posts
  WHERE id = post_uuid;
  
  IF post_reach > 0 THEN
    engagement_rate = (total_engagement::DECIMAL / post_reach::DECIMAL) * 100;
    RETURN LEAST(engagement_rate, 100.0000); -- Cap at 100%
  ELSE
    RETURN 0.0000;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user dashboard stats
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  WITH user_stats AS (
    SELECT 
      (SELECT COUNT(*) FROM flyers WHERE user_id = user_uuid) as total_flyers,
      (SELECT COUNT(*) FROM social_posts WHERE user_id = user_uuid) as total_posts,
      (SELECT COUNT(*) FROM media WHERE user_id = user_uuid) as total_media,
      (SELECT COALESCE(SUM(file_size), 0) FROM media WHERE user_id = user_uuid) as storage_used,
      (SELECT COUNT(*) FROM template_likes tl JOIN templates t ON tl.template_id = t.id WHERE tl.user_id = user_uuid) as liked_templates
  )
  SELECT json_build_object(
    'total_flyers', total_flyers,
    'total_posts', total_posts,
    'total_media', total_media,
    'storage_used_bytes', storage_used,
    'liked_templates', liked_templates
  ) INTO stats FROM user_stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at triggers
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

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE flyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- SUBSCRIPTION POLICIES
-- ============================================

-- Anyone can view subscription plans
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- System can manage subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- TEMPLATE POLICIES
-- ============================================

-- Anyone can view active template categories
CREATE POLICY "Anyone can view template categories" ON template_categories
  FOR SELECT USING (is_active = true);

-- Anyone can view public active templates
CREATE POLICY "Anyone can view public templates" ON templates
  FOR SELECT USING (is_active = true AND is_public = true);

-- Users can view their own private templates
CREATE POLICY "Users can view own templates" ON templates
  FOR SELECT USING (auth.uid() = created_by);

-- Users can create templates
CREATE POLICY "Users can create templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own templates
CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (auth.uid() = created_by);

-- ============================================
-- FLYER POLICIES
-- ============================================

-- Users can view their own flyers
CREATE POLICY "Users can view own flyers" ON flyers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create flyers
CREATE POLICY "Users can create flyers" ON flyers
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    check_user_limits(auth.uid(), 'flyer')
  );

-- Users can update their own flyers
CREATE POLICY "Users can update own flyers" ON flyers
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own flyers
CREATE POLICY "Users can delete own flyers" ON flyers
  FOR DELETE USING (auth.uid() = user_id);

-- Anyone can view public flyers (with share_token)
CREATE POLICY "Anyone can view public flyers" ON flyers
  FOR SELECT USING (is_public = true AND share_token IS NOT NULL);

-- ============================================
-- SOCIAL POST POLICIES
-- ============================================

-- Users can manage their own social posts
CREATE POLICY "Users can view own social posts" ON social_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create social posts" ON social_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    check_user_limits(auth.uid(), 'social_post')
  );

CREATE POLICY "Users can update own social posts" ON social_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social posts" ON social_posts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- MEDIA POLICIES
-- ============================================

-- Users can manage their own media
CREATE POLICY "Users can view own media" ON media
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload media" ON media
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    check_user_limits(auth.uid(), 'storage')
  );

CREATE POLICY "Users can update own media" ON media
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own media" ON media
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ANALYTICS POLICIES
-- ============================================

-- Users can view their own analytics
CREATE POLICY "Users can view own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own post analytics" ON post_analytics
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM social_posts WHERE id = post_id)
  );

-- System can insert analytics data
CREATE POLICY "Service role can manage analytics" ON user_analytics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage post analytics" ON post_analytics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- COLLABORATION POLICIES
-- ============================================

-- Users can manage their own template likes
CREATE POLICY "Users can manage own template likes" ON template_likes
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own collections
CREATE POLICY "Users can manage own collections" ON collections
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage items in their own collections
CREATE POLICY "Users can manage own collection items" ON collection_items
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM collections WHERE id = collection_id)
  );

-- ============================================
-- NOTIFICATION POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can create notifications
CREATE POLICY "Service role can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- SYSTEM SETTINGS POLICIES
-- ============================================

-- Only service role can manage system settings
CREATE POLICY "Only service role can access system settings" ON system_settings
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- SEED DATA
-- ============================================

-- Insert subscription plans
INSERT INTO subscription_plans (name, description, plan_type, price_cents, max_flyers_per_month, max_social_posts_per_month, max_templates, max_storage_gb, custom_branding, priority_support, api_access, white_labeling, sort_order) VALUES
-- Free Trial Plan
('Free Trial', 'Try all features for 7 days', 'free', 0, 2, 2, NULL, 1, false, false, false, false, 0),
-- Monthly Plan
('Pro Monthly', 'Full access to all PromoSuite features', 'monthly', 999, NULL, NULL, NULL, 10, true, true, false, false, 1),
-- Annual Plan (Save $20)
('Pro Annual', 'Annual plan with 2 months free', 'annual', 10000, NULL, NULL, NULL, 50, true, true, true, false, 2),
-- Lifetime Plan (Future)
('Lifetime Pro', 'One-time payment, lifetime access', 'lifetime', 29900, NULL, NULL, NULL, 100, true, true, true, true, 3)
ON CONFLICT (name) DO NOTHING;

-- Insert template categories
INSERT INTO template_categories (name, slug, description, icon_name, color, sort_order) VALUES
-- Main Categories
('Flyers', 'flyers', 'Professional real estate flyers for listings and marketing', 'FileText', '#667eea', 1),
('Social Media Posts', 'social-posts', 'Engaging social media content for all platforms', 'Share2', '#8b5cf6', 2),
('Stories & Reels', 'stories-reels', 'Vertical content for Instagram Stories and Reels', 'Video', '#ec4899', 3),
('Brochures', 'brochures', 'Multi-page marketing brochures and booklets', 'Book', '#10b981', 4),
('Business Cards', 'business-cards', 'Professional business cards and contact materials', 'CreditCard', '#f59e0b', 5),
('Banners', 'banners', 'Web banners and display advertising', 'Image', '#ef4444', 6)
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories for Flyers
INSERT INTO template_categories (name, slug, description, icon_name, color, parent_id, sort_order) 
SELECT 'Listing Flyers', 'listing-flyers', 'Traditional property listing flyers', 'Home', '#667eea', id, 1
FROM template_categories WHERE slug = 'flyers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO template_categories (name, slug, description, icon_name, color, parent_id, sort_order) 
SELECT 'Open House', 'open-house', 'Open house announcement flyers', 'DoorOpen', '#667eea', id, 2
FROM template_categories WHERE slug = 'flyers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO template_categories (name, slug, description, icon_name, color, parent_id, sort_order) 
SELECT 'Just Sold', 'just-sold', 'Property sold announcement flyers', 'CheckCircle', '#10b981', id, 3
FROM template_categories WHERE slug = 'flyers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO template_categories (name, slug, description, icon_name, color, parent_id, sort_order) 
SELECT 'Coming Soon', 'coming-soon', 'Property coming soon teasers', 'Clock', '#f59e0b', id, 4
FROM template_categories WHERE slug = 'flyers'
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories for Social Posts
INSERT INTO template_categories (name, slug, description, icon_name, color, parent_id, sort_order) 
SELECT 'Property Showcase', 'property-showcase', 'Beautiful property showcase posts', 'Camera', '#8b5cf6', id, 1
FROM template_categories WHERE slug = 'social-posts'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO template_categories (name, slug, description, icon_name, color, parent_id, sort_order) 
SELECT 'Market Updates', 'market-updates', 'Real estate market news and updates', 'TrendingUp', '#8b5cf6', id, 2
FROM template_categories WHERE slug = 'social-posts'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO template_categories (name, slug, description, icon_name, color, parent_id, sort_order) 
SELECT 'Agent Branding', 'agent-branding', 'Personal branding and introduction posts', 'User', '#8b5cf6', id, 3
FROM template_categories WHERE slug = 'social-posts'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO template_categories (name, slug, description, icon_name, color, parent_id, sort_order) 
SELECT 'Testimonials', 'testimonials', 'Client testimonial and review posts', 'MessageSquare', '#10b981', id, 4
FROM template_categories WHERE slug = 'social-posts'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO template_categories (name, slug, description, icon_name, color, parent_id, sort_order) 
SELECT 'Holiday & Seasonal', 'holiday-seasonal', 'Holiday and seasonal themed posts', 'Calendar', '#ec4899', id, 5
FROM template_categories WHERE slug = 'social-posts'
ON CONFLICT (slug) DO NOTHING;

-- Insert sample templates
INSERT INTO templates (name, description, category_id, template_data, preview_image_url, width, height, tags, subcategory, is_premium, required_plan_type) 
SELECT 
  'Modern Listing Flyer',
  'Clean and modern listing flyer with photo placeholders',
  tc.id,
  '{"version":"5.3.0","objects":[{"type":"rect","width":400,"height":600,"fill":"#ffffff"}]}',
  'https://via.placeholder.com/400x600/667eea/ffffff?text=Modern+Listing',
  400,
  600,
  ARRAY['modern', 'clean', 'listing', 'professional'],
  'listing',
  false,
  'free'
FROM template_categories tc WHERE tc.slug = 'listing-flyers'
ON CONFLICT DO NOTHING;

INSERT INTO templates (name, description, category_id, template_data, preview_image_url, width, height, tags, subcategory, is_premium, required_plan_type) 
SELECT 
  'Luxury Property Showcase',
  'Premium template for luxury property marketing',
  tc.id,
  '{"version":"5.3.0","objects":[{"type":"rect","width":1080,"height":1080,"fill":"#1a1a1a"}]}',
  'https://via.placeholder.com/1080x1080/8b5cf6/ffffff?text=Luxury+Showcase',
  1080,
  1080,
  ARRAY['luxury', 'premium', 'showcase', 'social'],
  'listing',
  true,
  'monthly'
FROM template_categories tc WHERE tc.slug = 'property-showcase'
ON CONFLICT DO NOTHING;

INSERT INTO templates (name, description, category_id, template_data, preview_image_url, width, height, tags, subcategory, is_premium, required_plan_type) 
SELECT 
  'Open House Announcement',
  'Eye-catching open house announcement template',
  tc.id,
  '{"version":"5.3.0","objects":[{"type":"rect","width":400,"height":600,"fill":"#f59e0b"}]}',
  'https://via.placeholder.com/400x600/f59e0b/ffffff?text=Open+House',
  400,
  600,
  ARRAY['open house', 'announcement', 'event', 'marketing'],
  'open_house',
  false,
  'free'
FROM template_categories tc WHERE tc.slug = 'open-house'
ON CONFLICT DO NOTHING;

INSERT INTO templates (name, description, category_id, template_data, preview_image_url, width, height, tags, subcategory, is_premium, required_plan_type) 
SELECT 
  'Just Sold Celebration',
  'Celebrate successful sales with this template',
  tc.id,
  '{"version":"5.3.0","objects":[{"type":"rect","width":1080,"height":1080,"fill":"#10b981"}]}',
  'https://via.placeholder.com/1080x1080/10b981/ffffff?text=Just+Sold',
  1080,
  1080,
  ARRAY['sold', 'success', 'celebration', 'achievement'],
  'sold',
  false,
  'free'
FROM template_categories tc WHERE tc.slug = 'just-sold'
ON CONFLICT DO NOTHING;

INSERT INTO templates (name, description, category_id, template_data, preview_image_url, width, height, tags, subcategory, is_premium, required_plan_type) 
SELECT 
  'Market Update Post',
  'Professional market statistics and updates',
  tc.id,
  '{"version":"5.3.0","objects":[{"type":"rect","width":1080,"height":1080,"fill":"#667eea"}]}',
  'https://via.placeholder.com/1080x1080/667eea/ffffff?text=Market+Update',
  1080,
  1080,
  ARRAY['market', 'statistics', 'professional', 'data'],
  'market_update',
  false,
  'free'
FROM template_categories tc WHERE tc.slug = 'market-updates'
ON CONFLICT DO NOTHING;

INSERT INTO templates (name, description, category_id, template_data, preview_image_url, width, height, tags, subcategory, is_premium, required_plan_type) 
SELECT 
  'Agent Introduction',
  'Professional agent introduction and branding',
  tc.id,
  '{"version":"5.3.0","objects":[{"type":"rect","width":1080,"height":1080,"fill":"#ec4899"}]}',
  'https://via.placeholder.com/1080x1080/ec4899/ffffff?text=Agent+Intro',
  1080,
  1080,
  ARRAY['agent', 'introduction', 'branding', 'personal'],
  'agent_intro',
  false,
  'free'
FROM template_categories tc WHERE tc.slug = 'agent-branding'
ON CONFLICT DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (key, value, description) VALUES
('app_version', '"2.0.0"', 'Current application version'),
('maintenance_mode', 'false', 'Whether the app is in maintenance mode'),
('max_file_upload_size_mb', '50', 'Maximum file upload size in MB'),
('allowed_file_types', '["image/jpeg", "image/png", "image/webp", "application/pdf"]', 'Allowed file types for uploads'),
('social_platforms_enabled', '["facebook", "instagram", "twitter", "linkedin"]', 'Enabled social media platforms'),
('trial_duration_days', '7', 'Trial period duration in days'),
('free_plan_limits', '{"flyers_per_month": 2, "posts_per_month": 2, "storage_gb": 1}', 'Limits for free/trial plans'),
('feature_flags', '{"social_scheduling": true, "ai_suggestions": false, "collaboration": true}', 'Feature flags for the application'),
('support_email', '"support@promosuite.com"', 'Support contact email'),
('company_info', '{"name": "PromoSuite", "tagline": "Real Estate Marketing Made Simple", "website": "https://promosuite.com"}', 'Company information')
ON CONFLICT (key) DO NOTHING;
