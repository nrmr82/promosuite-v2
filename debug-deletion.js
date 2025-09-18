// Debug script for checking account deletion
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iimjgbzrtazeiuamhvlc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbWpnYnpydGF6ZWl1YW1odmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDI1MjcsImV4cCI6MjA3MzE3ODUyN30.eZOmLoGvev2i2GD5ZbODHqbXTn0vwRkqn2lIIZvevB0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDeletion() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user?.id || 'No user logged in');
    
    if (userError) {
      console.log('User error:', userError);
      return;
    }
    
    if (!user) {
      console.log('❌ No user logged in - cannot test deletion');
      return;
    }
    
    const userId = user.id;
    
    // Test each table that we're trying to delete from
    const tablesToTest = [
      'user_analytics',
      'media', 
      'social_posts',
      'flyers',
      'template_likes',
      'collections',
      'notifications',
      'subscriptions',
      'profiles'
    ];
    
    for (const table of tablesToTest) {
      try {
        console.log(`\n📋 Testing table: ${table}`);
        
        // First, check if table exists and user has data
        const { data, error: selectError } = await supabase
          .from(table)
          .select('*')
          .eq(table === 'profiles' ? 'id' : 'user_id', userId)
          .limit(5);
        
        if (selectError) {
          console.log(`❌ ${table}: SELECT error -`, selectError.message, `(Code: ${selectError.code})`);
          continue;
        }
        
        console.log(`✅ ${table}: Found ${data?.length || 0} records`);
        
        // Test deletion permissions (without actually deleting)
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq(table === 'profiles' ? 'id' : 'user_id', userId + '_test_fake_id'); // Use fake ID so nothing gets deleted
        
        if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows found (expected)
          console.log(`⚠️  ${table}: DELETE permission error -`, deleteError.message, `(Code: ${deleteError.code})`);
        } else {
          console.log(`✅ ${table}: DELETE permissions OK`);
        }
        
      } catch (error) {
        console.log(`❌ ${table}: Exception -`, error.message);
      }
    }
    
    // Test auth deletion permissions
    console.log('\n🔐 Testing auth deletion permissions...');
    try {
      // Test admin delete (will likely fail)
      const { error: adminError } = await supabase.auth.admin.deleteUser('fake-user-id');
      if (adminError) {
        console.log('❌ Admin delete error:', adminError.message);
      } else {
        console.log('✅ Admin delete permissions OK');
      }
    } catch (error) {
      console.log('❌ Admin delete exception:', error.message);
    }
    
  } catch (error) {
    console.error('Debug script error:', error);
  }
}

// Run the debug
debugDeletion().then(() => {
  console.log('\n🏁 Debug complete');
  process.exit(0);
}).catch(error => {
  console.error('Debug script failed:', error);
  process.exit(1);
});