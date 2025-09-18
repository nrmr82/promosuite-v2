# Simple Debug Commands

## 1. First, check if you created the PostgreSQL function

Go to Supabase Dashboard > SQL Editor and run:

```sql
-- Check if the function exists
SELECT proname FROM pg_proc WHERE proname = 'delete_oauth_user_complete';
```

If this returns no results, you need to run the `create-delete-function.sql` file first.

## 2. Test directly in browser console

Open your app at http://localhost:3000, login, then press F12 and run:

```javascript
// Test 1: Check if user is logged in
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user?.id, user?.email);

// Test 2: Check session token
const { data: { session } } = await supabase.auth.getSession();
console.log('Session token exists:', !!session?.access_token);

// Test 3: Test the Netlify function directly
fetch('http://localhost:8888/.netlify/functions/delete-account', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify({ userId: user.id })
})
.then(response => {
  console.log('Status:', response.status);
  return response.text();
})
.then(text => {
  console.log('Response:', text);
})
.catch(error => {
  console.error('Error:', error);
});
```

## 3. Check the PostgreSQL function (if it exists)

```javascript
// Test the PostgreSQL function directly
const { data, error } = await supabase.rpc('delete_oauth_user_complete', {
  user_id: 'fake-uuid-test'
});
console.log('PostgreSQL function test:', { data, error });
```

## 4. What to check in terminal logs

Look at your `netlify dev` terminal for logs that start with:
- `🗑️ Netlify Function: Starting hard delete`
- `❌` (errors)
- `✅` (successes)

Run these commands and tell me what output you get!