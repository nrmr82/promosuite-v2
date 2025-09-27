/**
 * PromoSuite V2 - Supabase Configuration
 * Centralized Supabase client configuration and initialization
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `Missing Supabase environment variables:
- REACT_APP_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗ Missing'}
- REACT_APP_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗ Missing'}

Please check your .env file (local) or Vercel environment variables (production).`;
  
  console.error(errorMessage);
  
  // In production, throw an error instead of falling back to dummy values
  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMessage);
  }
  
  console.warn('Running in development mode with missing variables. Some features may not work.');
}

// Prevent dummy URL usage in production
if ((supabaseUrl && supabaseUrl.includes('dummy.supabase.co')) || 
    (supabaseAnonKey && supabaseAnonKey.includes('dummy'))) {
  const errorMessage = 'Detected dummy Supabase configuration in production. Please set real Supabase environment variables.';
  console.error(errorMessage);
  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMessage);
  }
}

// Create Supabase client with configuration - NO FALLBACKS
const actualUrl = supabaseUrl;
const actualKey = supabaseAnonKey;

// Final validation before creating client
if (!actualUrl || !actualKey) {
  throw new Error('Cannot create Supabase client without valid URL and API key');
}

export const supabase = createClient(actualUrl, actualKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key) => {
        // Try sessionStorage first, then fallback to localStorage for OAuth flow
        let value = sessionStorage.getItem(key);
        if (!value) {
          value = localStorage.getItem(key);
          // If found in localStorage, migrate to sessionStorage
          if (value) {
            sessionStorage.setItem(key, value);
            localStorage.removeItem(key);
          }
        }
        return value;
      },
      setItem: (key, value) => {
        // Store in both for OAuth redirect, will clean up localStorage after
        sessionStorage.setItem(key, value);
        localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'promosuite-v2'
    }
  }
});

/**
 * Database table names
 */
export const TABLES = {
  USERS: 'users',
  PROFILES: 'profiles',
  SUBSCRIPTIONS: 'subscriptions',
  SUBSCRIPTION_PLANS: 'subscription_plans',
  TEMPLATES: 'templates',
  TEMPLATE_CATEGORIES: 'template_categories',
  FLYERS: 'flyers',
  MEDIA: 'media',
  SOCIAL_POSTS: 'social_posts',
  ANALYTICS: 'analytics',
  USER_USAGE: 'user_usage',
  USER_ANALYTICS: 'user_analytics'
};

/**
 * Storage bucket names
 */
export const BUCKETS = {
  TEMPLATES: 'templates',
  FLYERS: 'flyers',
  USER_UPLOADS: 'user-uploads',
  MEDIA: 'media',
  AVATARS: 'avatars'
};

/**
 * Helper function to handle Supabase errors
 */
export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase error ${context}:`, error);
  
  // Map common Supabase errors to user-friendly messages
  const errorMessages = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email address before signing in',
    'User not found': 'No account found with this email address',
    'Email already registered': 'An account with this email already exists',
    'Password should be at least 6 characters': 'Password must be at least 6 characters long',
    'Row Level Security policy violation': 'You do not have permission to perform this action',
    'JWT expired': 'Your session has expired. Please sign in again'
  };

  const userMessage = errorMessages[error.message] || error.message || 'An unexpected error occurred';
  
  return {
    message: userMessage,
    code: error.code || 'UNKNOWN_ERROR',
    details: error.details || null
  };
};

/**
 * Helper function to get current user
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (user) return user;
    
    // Fallback: If Supabase API doesn't return user but we have localStorage session
    console.log('🔍 getCurrentUser: No user from Supabase API, checking localStorage fallback...');
    const storedUser = localStorage.getItem('promosuiteUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.id && userData.session) {
          console.log('✅ getCurrentUser: Using localStorage fallback for user:', userData.email);
          // Return a user object that matches Supabase user structure
          return {
            id: userData.id,
            email: userData.email,
            user_metadata: userData.user_metadata || {},
            app_metadata: userData.app_metadata || {},
            aud: userData.aud || 'authenticated',
            created_at: userData.created_at,
            updated_at: userData.updated_at
          };
        }
      } catch (parseError) {
        console.warn('getCurrentUser: Error parsing localStorage user data:', parseError);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    
    // Try localStorage fallback on any error
    console.log('🔍 getCurrentUser: Supabase error, trying localStorage fallback...');
    try {
      const storedUser = localStorage.getItem('promosuiteUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData && userData.id && userData.session) {
          console.log('✅ getCurrentUser: Using localStorage fallback after error for user:', userData.email);
          return {
            id: userData.id,
            email: userData.email,
            user_metadata: userData.user_metadata || {},
            app_metadata: userData.app_metadata || {},
            aud: userData.aud || 'authenticated',
            created_at: userData.created_at,
            updated_at: userData.updated_at
          };
        }
      }
    } catch (fallbackError) {
      console.error('getCurrentUser: Fallback also failed:', fallbackError);
    }
    
    return null;
  }
};

/**
 * Helper function to get user session
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

/**
 * Helper function to check if user is authenticated
 */
export const isAuthenticated = async () => {
  const session = await getCurrentSession();
  return !!session?.user;
};

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (bucket, filePath, file, options = {}) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        ...options
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw handleSupabaseError(error, 'uploading file');
  }
};

/**
 * Get public URL for file
 */
export const getPublicUrl = (bucket, filePath) => {
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Get public URL error:', error);
    return null;
  }
};

/**
 * Delete file from storage
 */
export const deleteFile = async (bucket, filePaths) => {
  try {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Delete file error:', error);
    throw handleSupabaseError(error, 'deleting file');
  }
};

/**
 * Real-time subscription helper
 */
export const subscribeToTable = (table, callback, filter = {}) => {
  let channel = supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: table,
        ...filter 
      }, 
      callback
    )
    .subscribe();

  return channel;
};

/**
 * Unsubscribe from real-time updates
 */
export const unsubscribeFromTable = (channel) => {
  if (channel) {
    supabase.removeChannel(channel);
  }
};

export default supabase;
