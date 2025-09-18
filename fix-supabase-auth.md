# Fix Supabase Authentication

## The Problem
Your Supabase authentication is failing because:
1. Email confirmation is required but email service isn't configured
2. This prevents both registration and login

## Quick Fix (2 minutes)

### Go to your Supabase Dashboard:
1. Go to https://app.supabase.com
2. Select your project: `promosuite-v2` 
3. Go to **Authentication** → **Settings**
4. Find **"Enable email confirmations"** 
5. **TURN IT OFF** (toggle to disabled)
6. Click **Save**

### Alternative: Configure Email (if you want confirmations)
If you prefer email confirmations:
1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Configure with your email provider (Gmail, SendGrid, etc.)

## Test After Fix
Run this command to test:
```bash
node test-email-auth.js
```

You should see:
- ✅ Registration successful  
- ✅ Login successful

## Then Test Your App
1. Go to http://localhost:3000
2. Try registering with email/password
3. Should work immediately!

## Why This Happened
Supabase defaults to requiring email confirmation, but without SMTP configured, it can't send emails, so registration fails.