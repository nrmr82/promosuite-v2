# Setup OAuth User Deletion

## 🔧 Step 1: Create the PostgreSQL Function

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: **promosuite-v2**

2. **Open SQL Editor**
   - In left sidebar, click "SQL Editor"
   - Click "New Query"

3. **Copy and Run the SQL**
   - Copy the entire contents of `create-delete-function.sql`
   - Paste it into the SQL editor
   - Click "Run" button
   - You should see: "Success. No rows returned"

## 🧪 Step 2: Test the Function

Run this in the SQL Editor to test:

```sql
-- Test the function (replace with a real user email)
SELECT delete_oauth_user_complete(
  (SELECT id FROM auth.users WHERE email = 'your-test-email@example.com')
);
```

## 🚀 Step 3: Test via the App

1. **Make sure Netlify Dev is running**:
   ```bash
   netlify dev
   ```

2. **Login to your app**: http://localhost:3000

3. **Try Delete Account**:
   - Go to Settings
   - Click "Delete Account"
   - Follow the confirmation steps
   - Check the console for logs

## 🔍 Step 4: Verify Deletion

In Supabase Dashboard > Authentication > Users:
- The user should be completely gone
- Check the logs for detailed output

## 🛠️ What This Does

✅ **PostgreSQL Function**: Runs server-side with full database access
✅ **OAuth Compatible**: Properly handles Google/LinkedIn users  
✅ **Complete Deletion**: Removes from all auth tables:
   - `auth.identities` (OAuth provider links)
   - `auth.sessions` (active sessions)
   - `auth.refresh_tokens` (stored tokens)
   - `auth.users` (main user record)
✅ **Data Deletion**: Also removes from your app tables
✅ **Error Handling**: Continues even if some tables don't exist

## 🐛 Troubleshooting

If it still doesn't work:

1. **Check Function Created?**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'delete_oauth_user_complete';
   ```

2. **Check Permissions?**
   ```sql
   SELECT grantor, grantee, privilege_type 
   FROM information_schema.routine_privileges 
   WHERE routine_name = 'delete_oauth_user_complete';
   ```

3. **Check Console Logs**:
   - Browser console (F12)
   - Netlify Dev terminal
   - Supabase Dashboard > Logs

## 🎯 Expected Flow

1. **User clicks "Delete Account"** → React app
2. **Calls Netlify function** → Server-side 
3. **Verifies JWT token** → Authentication check
4. **Tries standard admin delete** → Usually fails for OAuth
5. **Calls PostgreSQL function** → `delete_oauth_user_complete()`
6. **Function deletes everything** → Both data and auth records
7. **Returns success** → User gets logged out
8. **Data is gone** → Check Supabase dashboard

This should finally work for OAuth users! 🎉