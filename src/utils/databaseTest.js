/**
 * Database Test Utility
 * Helper functions to test Supabase connection and database setup
 */

import { supabase, TABLES } from './supabase';
import authService from '../services/authService';

export const runDatabaseTests = async () => {
  const results = {
    connection: null,
    tablesExist: {},
    authConfig: null,
    errors: []
  };

  console.log('🔍 Starting database tests...');

  try {
    // Test 1: Basic connection
    console.log('🔍 Test 1: Testing basic Supabase connection...');
    const connectionTest = await authService.testDatabaseConnection();
    results.connection = connectionTest;
    
    if (!connectionTest.connected) {
      results.errors.push(`Connection failed: ${connectionTest.error}`);
    }

    // Test 2: Check if required tables exist
    console.log('🔍 Test 2: Checking required tables...');
    const requiredTables = [
      TABLES.PROFILES,
      TABLES.SUBSCRIPTIONS,
      TABLES.TEMPLATES,
      TABLES.FLYERS
    ];

    for (const tableName of requiredTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        results.tablesExist[tableName] = !error;
        if (error) {
          results.errors.push(`Table ${tableName} error: ${error.message}`);
          console.error(`🔍 Table ${tableName} test failed:`, error);
        } else {
          console.log(`🔍 Table ${tableName} exists and is accessible`);
        }
      } catch (err) {
        results.tablesExist[tableName] = false;
        results.errors.push(`Table ${tableName} exception: ${err.message}`);
      }
    }

    // Test 3: Auth configuration
    console.log('🔍 Test 3: Testing auth configuration...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      results.authConfig = {
        sessionExists: !!session,
        error: error?.message || null
      };
      console.log('🔍 Auth config test completed:', results.authConfig);
    } catch (authError) {
      results.authConfig = { error: authError.message };
      results.errors.push(`Auth config error: ${authError.message}`);
    }

    // Test 4: Try to create a test profile entry (if possible)
    console.log('🔍 Test 4: Testing profile creation capability...');
    try {
      // This will fail if RLS is working properly (which is good)
      // but will tell us about table structure issues
      const { error } = await supabase
        .from(TABLES.PROFILES)
        .select('id, email, full_name')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('RLS')) {
          console.log('🔍 RLS is working correctly (expected behavior)');
          results.rlsWorking = true;
        } else {
          results.errors.push(`Profile structure test failed: ${error.message}`);
          console.error('🔍 Profile structure test failed:', error);
        }
      } else {
        console.log('🔍 Profile table structure looks good');
      }
    } catch (err) {
      results.errors.push(`Profile test exception: ${err.message}`);
    }

  } catch (generalError) {
    results.errors.push(`General test error: ${generalError.message}`);
    console.error('🔍 General test error:', generalError);
  }

  console.log('🔍 Database tests completed:', results);
  return results;
};

// Export individual test functions
export const testConnection = () => authService.testDatabaseConnection();

export const testTableExists = async (tableName) => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    return { exists: !error, error: error?.message || null };
  } catch (err) {
    return { exists: false, error: err.message };
  }
};

export const getSupabaseInfo = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return {
    url: url ? url.substring(0, 30) + '...' : 'Not configured',
    anonKeyConfigured: !!anonKey,
    anonKeyLength: anonKey ? anonKey.length : 0
  };
};
