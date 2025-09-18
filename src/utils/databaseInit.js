/**
 * Database Initialization Utility
 * Detects database setup issues and provides guidance for fixing them
 */

import { supabase } from './supabase';

class DatabaseInitializer {
  constructor() {
    this.setupChecked = false;
    this.setupResults = null;
  }

  /**
   * Check if the database is properly set up
   */
  async checkDatabaseSetup() {
    if (this.setupChecked && this.setupResults) {
      return this.setupResults;
    }

    const results = {
      tablesExist: false,
      rlsPoliciesExist: false,
      triggersExist: false,
      permissionsCorrect: false,
      issues: [],
      suggestions: []
    };

    try {
      // Check if profiles table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (tableError) {
        if (tableError.code === 'PGRST116' || tableError.message?.includes('relation "profiles" does not exist')) {
          results.issues.push('Profiles table does not exist');
          results.suggestions.push('Run the database setup script to create the profiles table');
        } else if (tableError.code === 'PGRST102' || tableError.status === 406) {
          results.issues.push('Database permission issues detected');
          results.suggestions.push('Check Row Level Security (RLS) policies on the profiles table');
        } else {
          results.issues.push(`Database connection issue: ${tableError.message}`);
          results.suggestions.push('Verify your Supabase connection and project settings');
        }
      } else {
        results.tablesExist = true;
      }

      // If table exists, check RLS policies
      if (results.tablesExist) {
        try {
          // Try to perform a simple operation that would fail without proper RLS
          const { data: currentUser } = await supabase.auth.getUser();
          if (currentUser.user) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', currentUser.user.id)
              .single();

            if (!profileError) {
              results.rlsPoliciesExist = true;
              results.permissionsCorrect = true;
            } else if (profileError.code === 'PGRST301') {
              // No profile found, but RLS is working
              results.rlsPoliciesExist = true;
              results.permissionsCorrect = true;
              results.issues.push('User profile not found in database');
              results.suggestions.push('Profile will be created automatically on next login');
            }
          }
        } catch (error) {
          results.issues.push('RLS policies may not be configured correctly');
          results.suggestions.push('Ensure RLS policies allow users to access their own profiles');
        }
      }

      // Check for triggers (indirect check by looking for the function)
      try {
        const { data: functionCheck, error: functionError } = await supabase
          .rpc('handle_new_user') // This will fail but tells us if function exists
          .single();
      } catch (error) {
        if (error.message?.includes('function handle_new_user() does not exist')) {
          results.issues.push('Automatic profile creation trigger not set up');
          results.suggestions.push('Run the database setup script to create profile creation triggers');
        } else {
          // Function exists (it failed for other reasons, which is expected)
          results.triggersExist = true;
        }
      }

    } catch (error) {
      console.error('Database setup check failed:', error);
      results.issues.push(`Database setup check failed: ${error.message}`);
      results.suggestions.push('Verify your Supabase connection and try again');
    }

    this.setupChecked = true;
    this.setupResults = results;
    return results;
  }

  /**
   * Get a comprehensive database status report
   */
  async getDatabaseStatus() {
    const setup = await this.checkDatabaseSetup();
    
    const status = {
      isHealthy: setup.tablesExist && setup.rlsPoliciesExist && setup.permissionsCorrect,
      setupComplete: setup.tablesExist && setup.rlsPoliciesExist && setup.triggersExist && setup.permissionsCorrect,
      issues: setup.issues,
      suggestions: setup.suggestions,
      details: {
        tables: setup.tablesExist ? '✅ Profiles table exists' : '❌ Profiles table missing',
        rls: setup.rlsPoliciesExist ? '✅ RLS policies configured' : '❌ RLS policies missing',
        triggers: setup.triggersExist ? '✅ Auto-creation triggers active' : '❌ Triggers not configured',
        permissions: setup.permissionsCorrect ? '✅ Permissions correct' : '❌ Permission issues'
      }
    };

    return status;
  }

  /**
   * Generate setup instructions based on detected issues
   */
  getSetupInstructions(status) {
    if (status.isHealthy) {
      return {
        title: 'Database Setup Complete! 🎉',
        message: 'Your database is properly configured and ready to use.',
        steps: []
      };
    }

    const instructions = {
      title: 'Database Setup Required',
      message: 'Your database needs to be set up to fix the current issues.',
      steps: [
        {
          step: 1,
          title: 'Open Supabase Dashboard',
          description: 'Go to your Supabase project dashboard at https://app.supabase.com'
        },
        {
          step: 2,
          title: 'Access SQL Editor',
          description: 'Navigate to "SQL Editor" in the left sidebar'
        },
        {
          step: 3,
          title: 'Run Setup Script',
          description: 'Copy and paste the contents of `database/complete_setup.sql` into the SQL editor and click "Run"'
        },
        {
          step: 4,
          title: 'Verify Setup',
          description: 'The script will show verification queries at the end. Make sure all queries return results.'
        },
        {
          step: 5,
          title: 'Refresh Application',
          description: 'Refresh this page and try logging in again. The 406 errors should be gone!'
        }
      ]
    };

    // Add specific steps based on issues
    if (status.issues.some(issue => issue.includes('Profiles table'))) {
      instructions.steps.splice(3, 0, {
        step: '3a',
        title: 'Create Profiles Table',
        description: 'The setup script will create the profiles table with proper structure and constraints'
      });
    }

    if (status.issues.some(issue => issue.includes('permission') || issue.includes('RLS'))) {
      instructions.steps.splice(-1, 0, {
        step: '4a',
        title: 'Configure Row Level Security',
        description: 'The setup script will configure RLS policies so users can only access their own profiles'
      });
    }

    return instructions;
  }

  /**
   * Attempt to create a profile for the current user (fallback method)
   */
  async attemptProfileCreation(user) {
    if (!user || !user.id) return null;

    try {
      // Try to insert a basic profile
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        provider: user.app_metadata?.provider || 'email',
        subscription_status: 'free',
        subscription_plan: 'free',
        credits: 3,
        preferences: {}
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.warn('Could not create profile in database:', error.message);
        return null;
      }

      console.log('✅ Successfully created profile in database');
      return data;
    } catch (error) {
      console.warn('Profile creation attempt failed:', error.message);
      return null;
    }
  }

  /**
   * Reset the setup check (useful after running setup script)
   */
  resetSetupCheck() {
    this.setupChecked = false;
    this.setupResults = null;
  }

  /**
   * Show database setup guidance in console
   */
  showSetupGuidance() {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 PromoSuite Database Setup Required');
    console.log('='.repeat(60));
    console.log('To fix the 406 errors and enable proper user profiles:');
    console.log('\n1. Go to your Supabase project dashboard');
    console.log('2. Open the SQL Editor');
    console.log('3. Run the script: database/complete_setup.sql');
    console.log('4. Refresh the application');
    console.log('\nThis will create the profiles table and fix all authentication issues.');
    console.log('='.repeat(60) + '\n');
  }
}

// Export singleton instance
export const databaseInit = new DatabaseInitializer();

// Export class for testing
export { DatabaseInitializer };

// Helper function to quickly check and report database status
export async function checkAndReportDatabaseStatus() {
  try {
    const status = await databaseInit.getDatabaseStatus();
    
    if (!status.isHealthy) {
      console.warn('⚠️ Database setup incomplete. Issues detected:');
      status.issues.forEach(issue => console.warn(`  • ${issue}`));
      
      if (status.suggestions.length > 0) {
        console.log('💡 Suggestions:');
        status.suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
      }
      
      databaseInit.showSetupGuidance();
    } else {
      console.log('✅ Database setup is healthy!');
    }
    
    return status;
  } catch (error) {
    console.error('Database status check failed:', error);
    return { isHealthy: false, error: error.message };
  }
}
