// Server-side API endpoint for account deletion
// This should be deployed as a Netlify Function, Vercel API route, or similar

import { createClient } from '@supabase/supabase-js';

// These should be environment variables on your server
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // NOT the anon key!

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, userToken } = req.body;

    if (!userId || !userToken) {
      return res.status(400).json({ error: 'Missing userId or userToken' });
    }

    console.log('🗑️ Server: Starting hard delete for user:', userId);

    // Verify the user token to ensure they're authorized to delete this account
    const { data: tokenUser, error: tokenError } = await supabaseAdmin.auth.getUser(userToken);
    
    if (tokenError || tokenUser.user?.id !== userId) {
      console.error('❌ Unauthorized deletion attempt:', tokenError);
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
          console.log(`✓ Hard deleted from ${table.name} (${count || 'unknown'} rows)`);
          deletionResults.push({ table: table.name, status: 'success', count });
        }

      } catch (error) {
        console.error(`❌ Exception deleting from ${table.name}:`, error);
        deletionResults.push({ table: table.name, status: 'exception', error: error.message });
      }
    }

    // Step 2: Hard delete the auth user (this is the crucial part!)
    console.log('🗑️ Hard deleting auth user...');
    
    const { data: deleteUserData, error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteUserError) {
      console.error('❌ Failed to delete auth user:', deleteUserError);
      return res.status(500).json({
        error: 'Failed to delete auth user',
        details: deleteUserError.message,
        deletionResults
      });
    }

    console.log('✅ Auth user hard deleted successfully:', deleteUserData);

    const successfulTables = deletionResults.filter(r => r.status === 'success').length;
    const totalAttempted = deletionResults.length;

    return res.status(200).json({
      success: true,
      message: `Account hard deleted successfully. Data removed from ${successfulTables}/${totalAttempted} tables.`,
      deletionResults,
      authDeleted: true
    });

  } catch (error) {
    console.error('❌ Server error during account deletion:', error);
    return res.status(500).json({
      error: 'Internal server error during account deletion',
      details: error.message
    });
  }
}