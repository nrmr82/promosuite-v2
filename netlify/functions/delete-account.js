// Netlify Function for hard account deletion
// This runs server-side with access to environment variables

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId } = JSON.parse(event.body || '{}');

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }

    // Get the user's JWT from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Missing or invalid Authorization header' }),
      };
    }

    const userToken = authHeader.replace('Bearer ', '');

    // Get service role key from environment variables (never exposed to client!)
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Create admin client with service role key (this is the crucial part!)
    console.log('🔧 Creating admin client...');
    console.log('  - URL valid:', !!supabaseUrl && supabaseUrl.startsWith('https://'));
    console.log('  - Service key starts with eyJ:', supabaseServiceKey?.startsWith('eyJ'));
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🗑️ Netlify Function: Starting hard delete for user:', userId);
    console.log('🗚️ Environment check:');
    console.log('  - SUPABASE_URL:', supabaseUrl);
    console.log('  - SERVICE_KEY available:', !!supabaseServiceKey);
    console.log('  - SERVICE_KEY length:', supabaseServiceKey?.length || 'N/A');

    // Verify the user token to ensure they're authorized to delete this account
    // Create a user client with the token to verify identity
    console.log('🔐 Verifying user token...');
    
    const supabaseUserClient = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY);
    const { data: { user: tokenUser }, error: tokenError } = await supabaseUserClient.auth.getUser(userToken);
    
    if (tokenError) {
      console.error('❌ Token verification failed:', tokenError);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token verification failed: ' + tokenError.message }),
      };
    }
    
    if (!tokenUser) {
      console.error('❌ No user found for token');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No user found for provided token' }),
      };
    }
    
    if (tokenUser.id !== userId) {
      console.error('❌ User ID mismatch:');
      console.error('  - Token user ID:', tokenUser.id);
      console.error('  - Requested user ID:', userId);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token does not match requested user ID' }),
      };
    }
    
    console.log('✅ Token verification successful for user:', tokenUser.email);

    // Step 1: Hard delete user data from all tables
    const tablesToDelete = [
      { name: 'user_analytics', column: 'user_id' },
      { name: 'analytics', column: 'user_id' },
      { name: 'usage_stats', column: 'user_id' },
      { name: 'media', column: 'user_id' },
      { name: 'user_media', column: 'user_id' },
      { name: 'uploads', column: 'user_id' },
      { name: 'social_posts', column: 'user_id' },
      { name: 'posts', column: 'user_id' },
      { name: 'user_posts', column: 'user_id' },
      { name: 'flyers', column: 'user_id' },
      { name: 'user_flyers', column: 'user_id' },
      { name: 'designs', column: 'user_id' },
      { name: 'template_likes', column: 'user_id' },
      { name: 'likes', column: 'user_id' },
      { name: 'collections', column: 'user_id' },
      { name: 'user_collections', column: 'user_id' },
      { name: 'collection_items', column: 'user_id' },
      { name: 'notifications', column: 'user_id' },
      { name: 'user_notifications', column: 'user_id' },
      { name: 'subscriptions', column: 'user_id' },
      { name: 'user_subscriptions', column: 'user_id' },
      { name: 'billing', column: 'user_id' },
      { name: 'profiles', column: 'id' }, // profiles table uses 'id' not 'user_id'
      { name: 'user_profiles', column: 'user_id' }
    ];

    const deletionResults = [];

    for (const table of tablesToDelete) {
      try {
        // Check if table exists and has data
        const { data: existingData, error: selectError } = await supabaseAdmin
          .from(table.name)
          .select('*')
          .eq(table.column, userId)
          .limit(1);

        if (selectError) {
          if (selectError.code === '42P01') {
            // Table doesn't exist
            console.log(`ℹ️ Table ${table.name} doesn't exist - skipping`);
            continue;
          }
          console.log(`⚠️ Cannot access table ${table.name}:`, selectError.message);
          deletionResults.push({ table: table.name, status: 'access_error', error: selectError.message });
          continue;
        }

        if (!existingData || existingData.length === 0) {
          console.log(`✓ Table ${table.name}: No data to delete`);
          deletionResults.push({ table: table.name, status: 'no_data' });
          continue;
        }

        console.log(`🗑️ Hard deleting from ${table.name}...`);

        // Perform hard delete
        const { error: deleteError, count } = await supabaseAdmin
          .from(table.name)
          .delete()
          .eq(table.column, userId);

        if (deleteError) {
          console.error(`❌ Failed to delete from ${table.name}:`, deleteError);
          deletionResults.push({ table: table.name, status: 'failed', error: deleteError.message });
        } else {
          console.log(`✅ Hard deleted from ${table.name} (${count || 'unknown'} rows)`);
          deletionResults.push({ table: table.name, status: 'success', count });
        }

      } catch (error) {
        console.error(`❌ Exception deleting from ${table.name}:`, error);
        deletionResults.push({ table: table.name, status: 'exception', error: error.message });
      }
    }

    // Step 2: Hard delete the auth user (this is the crucial part!)
    console.log('🗟️ Hard deleting auth user...');
    console.log('🗟️ User info:', tokenUser);
    
    // For OAuth users, we need to use a different approach
    let authDeleted = false;
    let deleteUserError = null;
    
    try {
      // First, try the standard admin delete
      const { data: deleteUserData, error: adminDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (adminDeleteError) {
        console.error('⚠️ Standard admin delete failed:', adminDeleteError);
        deleteUserError = adminDeleteError;
        
        // For OAuth users, try alternative deletion methods
        if (tokenUser.app_metadata?.provider) {
          console.log('🔐 Detected OAuth user, trying alternative deletion...');
          
          // Method 1: Try deleting with force option
          const { error: forceDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId, true);
          
          if (!forceDeleteError) {
            console.log('✅ OAuth user deleted with force option');
            authDeleted = true;
          } else {
            console.error('❌ Force delete also failed:', forceDeleteError);
            
            // Method 2: Use PostgreSQL function for OAuth user deletion (most reliable)
            try {
              console.log('🗑️ Attempting PostgreSQL function deletion...');
              
              const { data: functionResult, error: functionError } = await supabaseAdmin.rpc('delete_oauth_user_complete', {
                user_id: userId
              });
              
              if (functionError) {
                console.error('❌ PostgreSQL function error:', functionError);
              } else {
                console.log('✅ PostgreSQL function result:', functionResult);
                
                if (functionResult && functionResult.auth_deleted) {
                  console.log('✅ OAuth user successfully deleted via PostgreSQL function');
                  authDeleted = true;
                  
                  // Update deletion results with function results
                  if (functionResult.tables_deleted) {
                    for (const table of functionResult.tables_deleted) {
                      deletionResults.push({ table, status: 'success', method: 'postgresql_function' });
                    }
                  }
                } else {
                  console.error('❌ PostgreSQL function did not delete auth user');
                }
              }
              
            } catch (functionException) {
              console.error('❌ Exception during PostgreSQL function call:', functionException);
            }
          }
        }
      } else {
        console.log('✅ Standard admin delete successful:', deleteUserData);
        authDeleted = true;
      }
    } catch (error) {
      console.error('❌ Exception during auth user deletion:', error);
      deleteUserError = error;
    }
    
    // If we still couldn't delete the auth user, log detailed info but continue
    if (!authDeleted) {
      console.error('❌ All auth deletion methods failed. User details:');
      console.error('- User ID:', userId);
      console.error('- Provider:', tokenUser.app_metadata?.provider);
      console.error('- Email:', tokenUser.email);
      console.error('- Created:', tokenUser.created_at);
      
      // Don't fail the whole process - data deletion might still be valuable
      console.log('⚠️ Continuing with data deletion despite auth deletion failure...');
    }

    const successfulTables = deletionResults.filter(r => r.status === 'success').length;
    const totalAttempted = deletionResults.length;

    let message;
    if (authDeleted) {
      message = `Account hard deleted successfully. Data removed from ${successfulTables}/${totalAttempted} tables. Auth user deleted.`;
    } else {
      message = `Data deleted from ${successfulTables}/${totalAttempted} tables. Auth user deletion failed (OAuth issue).`;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message,
        deletionResults,
        authDeleted,
        authDeletionError: deleteUserError?.message || null
      }),
    };

  } catch (error) {
    console.error('❌ Netlify Function error during account deletion:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error during account deletion',
        details: error.message
      }),
    };
  }
};