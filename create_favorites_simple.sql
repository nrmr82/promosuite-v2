-- Drop existing table if it has issues
DROP TABLE IF EXISTS public.user_favorites;

-- Create simple user_favorites table
CREATE TABLE public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    template_id TEXT NOT NULL, -- Using TEXT instead of UUID to be flexible
    template_type TEXT DEFAULT 'template',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, template_id)
);

-- Add foreign key constraint
ALTER TABLE public.user_favorites 
ADD CONSTRAINT user_favorites_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies that definitely work
CREATE POLICY "users_can_manage_own_favorites" 
ON public.user_favorites 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_favorites TO authenticated;
GRANT ALL ON public.user_favorites TO anon;

-- Test the table
INSERT INTO public.user_favorites (user_id, template_id, template_type)
VALUES (auth.uid(), 'test-template-123', 'test_type');