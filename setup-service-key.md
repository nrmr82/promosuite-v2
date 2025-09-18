# Setup Service Role Key for Hard Delete

## 🔑 Getting Your Service Role Key

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: **promosuite-v2**

2. **Navigate to Settings > API**
   - In the left sidebar, click "Settings"
   - Click "API" 

3. **Copy the Service Role Key**
   - Look for "Project API keys" section
   - Find "service_role" key (NOT the "anon public" key!)
   - Copy the entire key (starts with `eyJ...`)

## 🔧 Setting Up Environment Variables

### For Local Development (.env.local)

Add this line to your `.env.local` file:

```bash
# Add this to .env.local (NEVER commit this file!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### For Production (Netlify Dashboard)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Select your site

2. **Add Environment Variables**
   - Go to "Site settings" > "Environment variables"
   - Add new variable:
     - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
     - **Value**: Your service role key from Supabase

## 🚀 Testing the Setup

### 1. Install Netlify CLI (if not already installed)
```bash
npm install -g netlify-cli
```

### 2. Run Local Development with Functions
```bash
# Start both React app and Netlify functions locally
netlify dev
```

This will:
- Start your React app on `http://localhost:3000`
- Start Netlify functions on `http://localhost:8888/.netlify/functions/`
- Make environment variables available to functions

### 3. Test Account Deletion
1. Login to your app
2. Go to Settings
3. Try "Delete Account" - it should now work properly!

## 🔒 Security Notes

- ✅ **Service role key stays on server** (Netlify functions)
- ✅ **React app only uses anon key** (safe in browser)
- ✅ **JWT token verifies user authorization**
- ✅ **Hard delete removes data completely**

## 🐛 Troubleshooting

If deletion fails, check:

1. **Environment Variable Set?**
   ```bash
   # In Netlify function logs, you should see the key is loaded
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Function Deployed?**
   - Check `/.netlify/functions/delete-account` exists
   - Check Netlify deploy logs

3. **Console Errors?**
   - Check browser console for fetch errors
   - Check Netlify function logs for server errors

## 📝 What This Achieves

✅ **True Hard Delete**: Data actually removed from database
✅ **Auth User Deleted**: User removed from auth.users table  
✅ **Secure**: Service key never exposed to browser
✅ **Compliant**: Meets GDPR/CCPA deletion requirements