// Quick Supabase connection test
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iimjgbzrtazeiuamhvlc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbWpnYnpydGF6ZWl1YW1odmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDI1MjcsImV4cCI6MjA3MzE3ODUyN30.eZOmLoGvev2i2GD5ZbODHqbXTn0vwRkqn2lIIZvevB0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Connection error:', error);
      
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('❌ The profiles table has not been created yet');
        console.log('✅ Supabase connection works, but database setup is needed');
        return false;
      }
    } else {
      console.log('✅ Supabase connection successful!');
      return true;
    }
  } catch (err) {
    console.error('Network error:', err);
    return false;
  }
}

testConnection();