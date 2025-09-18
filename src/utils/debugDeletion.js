// Debug functions for account deletion - call from browser console
import supabase from './supabase';

// Add this to window so it can be called from browser console
window.debugAccountDeletion = async function() {
  console.log('🔍 Debugging account deletion...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ No user logged in:', userError?.message);
      return;
    }
    
    console.log('👤 Current user ID:', user.id);
    
    // Test tables that exist in your database
    const tablesToTest = [
      'profiles',
      'user_analytics', 
      'analytics',
      'media',
      'uploads', 
      'social_posts',
      'posts',
      'flyers',
      'designs',
      'collections',
      'subscriptions',
      'notifications'
    ];
    
    const results = [];
    
    for (const table of tablesToTest) {
      try {
        console.log(`\n📋 Testing table: ${table}`);
        
        // Test if we can read from the table
        const { data, error: selectError } = await supabase
          .from(table)
          .select('*')
          .eq(table === 'profiles' ? 'id' : 'user_id', user.id)
          .limit(3);
        
        if (selectError) {
          if (selectError.code === '42P01') {
            console.log(`❌ Table ${table} doesn't exist`);
            results.push({ table, status: 'not_exists', error: selectError.message });
          } else {
            console.log(`⚠️ Cannot access ${table}:`, selectError.message);
            results.push({ table, status: 'access_denied', error: selectError.message });
          }
          continue;
        }
        
        console.log(`✅ ${table}: Found ${data?.length || 0} records`);
        results.push({ table, status: 'accessible', count: data?.length || 0, data: data?.slice(0, 2) });
        
        // Test deletion permissions (with fake ID)
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq(table === 'profiles' ? 'id' : 'user_id', 'fake-test-id-12345');
        
        if (deleteError && deleteError.code !== 'PGRST116') {
          console.log(`⚠️ Delete permission issue for ${table}:`, deleteError.message);
          results[results.length - 1].deletePermission = 'denied';
          results[results.length - 1].deleteError = deleteError.message;
        } else {
          console.log(`✅ Delete permission OK for ${table}`);
          results[results.length - 1].deletePermission = 'allowed';
        }
        
      } catch (error) {
        console.log(`❌ Exception testing ${table}:`, error.message);
        results.push({ table, status: 'exception', error: error.message });
      }
    }
    
    console.log('\n📊 Summary of tables:');
    console.table(results);
    
    // Test auth deletion
    console.log('\n🔐 Testing auth capabilities...');
    try {
      const { error } = await supabase.auth.admin.deleteUser('fake-test-user-id');
      if (error) {
        console.log('❌ Admin delete not available:', error.message);
      } else {
        console.log('✅ Admin delete is available');
      }
    } catch (error) {
      console.log('❌ Admin delete exception:', error.message);
    }
    
    return results;
    
  } catch (error) {
    console.error('Debug function error:', error);
    return null;
  }
};

// Also add a function to actually perform deletion with detailed logging
window.performAccountDeletion = async function() {
  console.log('🚨 PERFORMING ACTUAL ACCOUNT DELETION - THIS CANNOT BE UNDONE!');
  console.log('⏰ Waiting 3 seconds... Call window.cancelDeletion() to stop!');
  
  window.cancelDeletion = () => {
    console.log('❌ Deletion cancelled by user');
    clearTimeout(window.deletionTimeout);
    window.deletionTimeout = null;
  };
  
  window.deletionTimeout = setTimeout(async () => {
    try {
      console.log('🗑️ Starting actual deletion...');
      
      const authService = await import('../services/authService');
      const result = await authService.default.deleteAccount();
      
      console.log('✅ Deletion result:', result);
      
    } catch (error) {
      console.error('❌ Deletion failed:', error);
    }
    
    window.deletionTimeout = null;
  }, 3000);
  
  return 'Deletion scheduled in 3 seconds. Call window.cancelDeletion() to stop.';
};

console.log('🔧 Debug functions loaded. Use:');
console.log('- window.debugAccountDeletion() - Check tables and permissions');
console.log('- window.performAccountDeletion() - Actually delete account (careful!)');

export { }; // Make this a module