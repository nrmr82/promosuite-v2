// Debug script to test the deletion function directly
// Run this in browser console while logged in

window.debugDeleteFunction = async function() {
  console.log('🔍 Debug: Testing deletion function...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ No user logged in:', userError?.message);
      return;
    }
    
    console.log('👤 Current user:', user.id, user.email);
    console.log('👤 Provider:', user.app_metadata?.provider);
    
    // Get session token
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session?.access_token) {
      console.log('❌ No session token');
      return;
    }
    
    console.log('🔑 Session token exists:', session.access_token.substring(0, 20) + '...');
    
    // Test the Netlify function endpoint
    const endpoint = 'http://localhost:8888/.netlify/functions/delete-account';
    console.log('📡 Testing endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        userId: user.id
      })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Success response:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return null;
  }
};

// Test if PostgreSQL function exists
window.testPostgreSQLFunction = async function() {
  console.log('🔍 Testing PostgreSQL function...');
  
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
      console.log('❌ No user logged in');
      return;
    }
    
    // Test if we can call the function
    const { data, error } = await window.supabase.rpc('delete_oauth_user_complete', {
      user_id: 'fake-test-uuid-12345678-1234-1234-1234-123456789abc'
    });
    
    if (error) {
      console.log('❌ PostgreSQL function error:', error);
      if (error.message.includes('function delete_oauth_user_complete')) {
        console.log('💡 Function not found - you need to create it in Supabase SQL Editor');
      }
    } else {
      console.log('✅ PostgreSQL function exists and responding:', data);
    }
    
    return { data, error };
    
  } catch (error) {
    console.error('❌ Exception testing PostgreSQL function:', error);
    return null;
  }
};

console.log('🔧 Debug functions loaded:');
console.log('- window.debugDeleteFunction() - Test full deletion flow');
console.log('- window.testPostgreSQLFunction() - Test if PostgreSQL function exists');