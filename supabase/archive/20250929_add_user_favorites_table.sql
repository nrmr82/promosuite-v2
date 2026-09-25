-- PromoSuite V2 - Add Missing User Favorites Table
-- This migration adds the user_favorites table that is used by the favorites service
-- Run this in your Supabase SQL Editor to fix the heart button favorites functionality

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL,
    template_type TEXT DEFAULT 'template', -- 'flyer_template', 'social_template', 'template'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, template_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_template_id ON public.user_favorites(template_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_template_type ON public.user_favorites(template_type);

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Optional: Migrate existing template_likes data if it exists
INSERT INTO public.user_favorites (user_id, template_id, template_type, created_at)
SELECT 
    user_id, 
    template_id, 
    'template' as template_type,
    created_at
FROM public.template_likes
ON CONFLICT (user_id, template_id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE public.user_favorites IS 'Stores user favorite templates and flyers';
COMMENT ON COLUMN public.user_favorites.template_type IS 'Type of template: flyer_template, social_template, template';