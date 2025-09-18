# PromoSuite Database Setup Guide

## Quick Fix for 406 Errors

If you're experiencing repeated HTTP 406 errors in the console when starting the app, this is because the Supabase profiles table is not set up correctly. Here's how to fix it:

## Option 1: Run the Safe Setup Script (Recommended)

⚠️ **If you got an error like "column 'provider' does not exist", use this safer script instead:**

### Step 1: Open Supabase Dashboard
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your PromoSuite project

### Step 2: Access SQL Editor
1. Click on "SQL Editor" in the left sidebar
2. Click "New Query"

### Step 3: Run the Safe Setup Script
1. Open the file `database/safe_setup.sql` from this project
2. Copy all the contents
3. Paste into the Supabase SQL editor
4. Click the "Run" button

*This script safely checks your existing table structure and only adds missing columns.*

## Option 2: Run the Complete Setup Script (Fresh Install)

*Only use this if you don't have a profiles table yet:*

1. Open the file `database/complete_setup.sql` from this project
2. Copy all the contents and run it in Supabase SQL Editor

### Step 4: Verify Setup
Both scripts will automatically run verification queries at the end. You should see:
- ✅ Profiles table structure
- ✅ RLS policies configured  
- ✅ Triggers set up
- ✅ Functions created

### Step 5: Refresh the App
1. Go back to your PromoSuite app
2. Refresh the page (F5)
3. The 406 errors should be gone! 🎉

## Option 3: Clear Session (Temporary Fix)

If you need a quick temporary fix while you set up the database:

1. Open browser developer console (F12)
2. Run this command:
   ```javascript
   localStorage.removeItem('promosuiteUser');
   ```
3. Refresh the page

This will log you out and stop the repeated 406 errors, but you'll still need to run the database setup for a permanent solution.

## What the Setup Scripts Do

The setup scripts (`safe_setup.sql` and `complete_setup.sql`):

1. **Creates the profiles table** with all necessary columns
2. **Sets up Row Level Security (RLS)** so users can only access their own data
3. **Creates triggers** to automatically create profiles when users sign up
4. **Configures permissions** for proper database access
5. **Includes verification queries** to confirm everything works

## Troubleshooting

### Script Fails to Run
- Make sure you're running it in your correct Supabase project
- Check that you have admin privileges in Supabase
- Try running sections of the script individually if the full script fails

### Still Getting 406 Errors After Setup
1. Clear your browser cache and localStorage:
   ```javascript
   localStorage.clear();
   ```
2. Refresh the page
3. Try logging in again

### Need Help?
If you're still having issues:
1. Check the browser console for any specific error messages
2. Verify in Supabase that the `profiles` table was created
3. Make sure the RLS policies show up in the Supabase dashboard

## Benefits After Setup

Once the database is properly configured:
- ✅ No more 406 errors
- ✅ Proper user profiles stored in database
- ✅ User preferences and settings persist
- ✅ Subscription status tracking works
- ✅ OAuth login works seamlessly
- ✅ Better performance and reliability

The setup only needs to be done once per Supabase project!
