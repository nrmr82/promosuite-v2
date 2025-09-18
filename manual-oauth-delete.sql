-- Manual OAuth User Deletion Script for Supabase
-- Run this in: Supabase Dashboard > SQL Editor > New Query

-- STEP 1: Find your user ID
-- Replace 'your-email@example.com' with the email of the user you want to delete
SELECT 
    id,
    email,
    provider,
    created_at,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Copy the user ID from the result above and use it in the next steps
-- Replace 'USER_ID_HERE' with the actual UUID

-- STEP 2: Delete user data from your custom tables (adjust table names as needed)
-- Check what tables exist first:
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%user%' OR tablename IN ('profiles', 'media', 'flyers', 'posts', 'collections');

-- Delete from user data tables (replace USER_ID_HERE with actual user ID)
DELETE FROM public.user_analytics WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.analytics WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.media WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.uploads WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.social_posts WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.posts WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.flyers WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.designs WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.template_likes WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.likes WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.collections WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.collection_items WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.notifications WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.subscriptions WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.profiles WHERE id = 'USER_ID_HERE'; -- Note: profiles uses 'id' not 'user_id'

-- STEP 3: Delete from auth system tables (this is the key for OAuth users!)
-- Delete from auth.identities first (OAuth provider links)
DELETE FROM auth.identities WHERE user_id = 'USER_ID_HERE';

-- Delete from auth.sessions
DELETE FROM auth.sessions WHERE user_id = 'USER_ID_HERE';

-- Delete from auth.refresh_tokens  
DELETE FROM auth.refresh_tokens WHERE user_id = 'USER_ID_HERE';

-- Delete from auth.users (the main auth user record)
DELETE FROM auth.users WHERE id = 'USER_ID_HERE';

-- STEP 4: Verify deletion
-- Check that the user is gone
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
-- This should return no results

-- Check identities are gone
SELECT * FROM auth.identities WHERE user_id = 'USER_ID_HERE';
-- This should return no results

-- ALTERNATIVE: Create a function to delete OAuth users properly
-- Run this once to create the function:

CREATE OR REPLACE FUNCTION delete_oauth_user(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record auth.users%ROWTYPE;
    result json;
BEGIN
    -- Find the user
    SELECT * INTO user_record FROM auth.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'User not found');
    END IF;
    
    -- Delete user data (adjust table names as needed)
    DELETE FROM public.user_analytics WHERE user_id = user_record.id;
    DELETE FROM public.analytics WHERE user_id = user_record.id;
    DELETE FROM public.media WHERE user_id = user_record.id;
    DELETE FROM public.uploads WHERE user_id = user_record.id;
    DELETE FROM public.social_posts WHERE user_id = user_record.id;
    DELETE FROM public.posts WHERE user_id = user_record.id;
    DELETE FROM public.flyers WHERE user_id = user_record.id;
    DELETE FROM public.designs WHERE user_id = user_record.id;
    DELETE FROM public.template_likes WHERE user_id = user_record.id;
    DELETE FROM public.likes WHERE user_id = user_record.id;
    DELETE FROM public.collections WHERE user_id = user_record.id;
    DELETE FROM public.collection_items WHERE user_id = user_record.id;
    DELETE FROM public.notifications WHERE user_id = user_record.id;
    DELETE FROM public.subscriptions WHERE user_id = user_record.id;
    DELETE FROM public.profiles WHERE id = user_record.id;
    
    -- Delete auth data (critical for OAuth users)
    DELETE FROM auth.identities WHERE user_id = user_record.id;
    DELETE FROM auth.sessions WHERE user_id = user_record.id;
    DELETE FROM auth.refresh_tokens WHERE user_id = user_record.id;
    DELETE FROM auth.users WHERE id = user_record.id;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'User deleted successfully',
        'user_id', user_record.id,
        'email', user_email
    );
END;
$$;

-- Then use it like this:
-- SELECT delete_oauth_user('your-email@example.com');

-- STEP 5: Grant necessary permissions (run once)
-- This allows the function to delete from auth tables
GRANT DELETE ON auth.users TO authenticated;
GRANT DELETE ON auth.identities TO authenticated;
GRANT DELETE ON auth.sessions TO authenticated;
GRANT DELETE ON auth.refresh_tokens TO authenticated;