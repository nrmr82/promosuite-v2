-- Create PostgreSQL function for OAuth user deletion
-- Run this ONCE in Supabase Dashboard > SQL Editor > New Query

CREATE OR REPLACE FUNCTION delete_oauth_user_complete(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_exists boolean := false;
    deletion_results json := '{}';
    tables_deleted text[] := '{}';
    auth_deleted boolean := false;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;
    
    IF NOT user_exists THEN
        RETURN json_build_object(
            'success', false, 
            'message', 'User not found',
            'user_id', user_id
        );
    END IF;
    
    -- Delete from public schema tables (user data)
    BEGIN
        DELETE FROM public.user_analytics WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'user_analytics');
    EXCEPTION WHEN OTHERS THEN
        -- Table might not exist, continue
        NULL;
    END;
    
    BEGIN
        DELETE FROM public.analytics WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'analytics');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.media WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'media');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.uploads WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'uploads');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.social_posts WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'social_posts');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.posts WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'posts');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.flyers WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'flyers');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.designs WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'designs');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.template_likes WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'template_likes');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.likes WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'likes');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.collections WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'collections');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.collection_items WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'collection_items');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.notifications WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'notifications');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.subscriptions WHERE user_id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'subscriptions');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        -- profiles table uses 'id' not 'user_id'
        DELETE FROM public.profiles WHERE id = delete_oauth_user_complete.user_id;
        tables_deleted := array_append(tables_deleted, 'profiles');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    -- Delete from auth schema (this is crucial for OAuth users)
    BEGIN
        -- Delete identities first (OAuth provider connections)
        DELETE FROM auth.identities WHERE user_id = delete_oauth_user_complete.user_id;
        
        -- Delete sessions
        DELETE FROM auth.sessions WHERE user_id = delete_oauth_user_complete.user_id;
        
        -- Delete refresh tokens
        DELETE FROM auth.refresh_tokens WHERE user_id = delete_oauth_user_complete.user_id;
        
        -- Finally delete the main user record
        DELETE FROM auth.users WHERE id = delete_oauth_user_complete.user_id;
        
        auth_deleted := true;
        
    EXCEPTION WHEN OTHERS THEN
        auth_deleted := false;
    END;
    
    -- Return results
    RETURN json_build_object(
        'success', true,
        'message', 'OAuth user deletion completed',
        'user_id', user_id,
        'tables_deleted', tables_deleted,
        'auth_deleted', auth_deleted
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'message', 'Error during deletion: ' || SQLERRM,
        'user_id', user_id
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_oauth_user_complete(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_oauth_user_complete(uuid) TO service_role;