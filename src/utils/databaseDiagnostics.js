/**
 * Database diagnostic utilities for troubleshooting OAuth callback issues
 */

import { supabase } from './supabase';

export const runDatabaseDiagnostics = async (userId = null) => {
  console.log('🔍 Database Diagnostics - Starting comprehensive database tests...');
  
  const results = {
    connection: null,
    profilesTable: null,
    permissions: null,
    userAccess: null,
    details: []
  };

  try {
    // Test 1: Basic connection
    console.log('🔍 Database Diagnostics - Testing connection...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        results.connection = 'failed';
        results.details.push(`Connection error: ${error.message}`);
      } else {
        results.connection = 'success';
        results.details.push('Supabase connection successful');
      }
    } catch (connError) {
      results.connection = 'failed';
      results.details.push(`Connection exception: ${connError.message}`);
    }

    // Test 2: Profiles table existence
    console.log('🔍 Database Diagnostics - Testing profiles table...');
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .limit(1);
        
      if (error) {
        results.profilesTable = 'failed';
        if (error.message?.includes('relation "profiles" does not exist')) {
          results.details.push('Profiles table does not exist - needs to be created');
        } else {
          results.details.push(`Profiles table error: ${error.message}`);
        }
      } else {
        results.profilesTable = 'success';
        results.details.push(`Profiles table exists with ${count ?? 'unknown'} records`);
      }
    } catch (tableError) {
      results.profilesTable = 'failed';
      results.details.push(`Profiles table exception: ${tableError.message}`);
    }

    // Test 3: Insert permission test (only if userId provided)
    if (userId && results.profilesTable === 'success') {
      console.log('🔍 Database Diagnostics - Testing insert permissions...');
      try {
        // Try to insert a test record (we'll delete it immediately)
        const testProfile = {
          id: userId,
          email: 'test@example.com',
          full_name: 'Test User',
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('profiles')
          .upsert([testProfile])
          .select()
          .single();

        if (error) {
          results.permissions = 'failed';
          results.details.push(`Insert permission error: ${error.message}`);
        } else {
          results.permissions = 'success';
          results.details.push('Insert permissions working');
          
          // Clean up the test record
          await supabase
            .from('profiles')
            .delete()
            .eq('id', userId)
            .eq('email', 'test@example.com');
        }
      } catch (permError) {
        results.permissions = 'failed';
        results.details.push(`Insert permission exception: ${permError.message}`);
      }
    }

    // Test 4: User-specific access (if userId provided)
    if (userId && results.profilesTable === 'success') {
      console.log('🔍 Database Diagnostics - Testing user-specific access...');
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          results.userAccess = 'failed';
          results.details.push(`User access error: ${error.message}`);
        } else {
          results.userAccess = 'success';
          if (data) {
            results.details.push(`User profile found: ${data.email}`);
          } else {
            results.details.push('User profile does not exist yet');
          }
        }
      } catch (accessError) {
        results.userAccess = 'failed';
        results.details.push(`User access exception: ${accessError.message}`);
      }
    }

  } catch (globalError) {
    results.details.push(`Global diagnostic error: ${globalError.message}`);
  }

  console.log('🔍 Database Diagnostics - Results:', results);
  return results;
};

export const createProfileIfMissing = async (userData) => {
  console.log('🔍 Database Diagnostics - Attempting to create profile:', userData);
  
  try {
    // First check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id)
      .maybeSingle();

    if (fetchError && !fetchError.message?.includes('relation "profiles" does not exist')) {
      console.error('🔍 Database Diagnostics - Error checking existing profile:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (existingProfile) {
      console.log('🔍 Database Diagnostics - Profile already exists:', existingProfile);
      return { success: true, profile: existingProfile, created: false };
    }

    // Create new profile
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([{
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        provider: userData.provider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (createError) {
      console.error('🔍 Database Diagnostics - Profile creation failed:', createError);
      return { success: false, error: createError.message };
    }

    console.log('🔍 Database Diagnostics - Profile created successfully:', newProfile);
    return { success: true, profile: newProfile, created: true };

  } catch (error) {
    console.error('🔍 Database Diagnostics - Exception in profile creation:', error);
    return { success: false, error: error.message };
  }
};

export const getSupabaseConfig = () => {
  return {
    url: process.env.REACT_APP_SUPABASE_URL,
    hasUrl: !!process.env.REACT_APP_SUPABASE_URL,
    hasKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
    keyPrefix: process.env.REACT_APP_SUPABASE_ANON_KEY?.substring(0, 10) + '...',
  };
};
