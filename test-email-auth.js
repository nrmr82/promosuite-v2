// Test email/password authentication
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iimjgbzrtazeiuamhvlc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbWpnYnpydGF6ZWl1YW1odmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDI1MjcsImV4cCI6MjA3MzE3ODUyN30.eZOmLoGvev2i2GD5ZbODHqbXTn0vwRkqn2lIIZvevB0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailAuth() {
  console.log('Testing email/password authentication...');
  
  const testEmail = `test${Date.now()}@promosuite.com`;
  const testPassword = 'password123';
  
  try {
    // Try to register first
    console.log('1. Testing registration...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.log('Registration error:', signUpError.message);
      
      if (signUpError.message.includes('already registered')) {
        console.log('✅ User already exists, trying login...');
      }
    } else {
      console.log('✅ Registration successful:', !!signUpData.user);
      if (signUpData.user && !signUpData.session) {
        console.log('⚠️ Registration requires email confirmation');
      }
    }
    
    // Try to login
    console.log('2. Testing login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.log('❌ Login error:', signInError.message);
      return false;
    } else {
      console.log('✅ Login successful!');
      console.log('User ID:', signInData.user.id);
      console.log('Email:', signInData.user.email);
      console.log('Has session:', !!signInData.session);
      return true;
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

testEmailAuth();