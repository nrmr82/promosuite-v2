# 🚀 Supabase + Vercel Deployment Configuration Guide

## 📋 Overview
This guide will help you configure Supabase authentication to work with your Vercel deployment.

## ⚠️ Current Issue
Login works locally but fails on Vercel because Supabase doesn't recognize your Vercel domain for authentication redirects.

## 🔧 Required Steps

### **1. Update Supabase Dashboard - Authentication Settings**

Go to your Supabase Dashboard → Project → Authentication → URL Configuration:

#### **Site URL:**
Replace with your Vercel deployment URL:
```
https://your-app-name.vercel.app
```

#### **Additional Redirect URLs:**
Add ALL of these URLs (replace `your-app-name` with your actual Vercel app name):
```
https://your-app-name.vercel.app
https://your-app-name.vercel.app/auth/callback
https://your-app-name.vercel.app/**
https://*.vercel.app/**
```

#### **Allowed Origins (CORS):**
Add these domains:
```
https://your-app-name.vercel.app
https://*.vercel.app
```

### **2. Configure Vercel Environment Variables**

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add these environment variables:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**
- Go to Supabase Dashboard → Project → Settings → API
- Copy the "Project URL" and "anon public" key

### **3. Update OAuth Provider Settings (if using social login)**

If you're using Google/LinkedIn/other OAuth providers:

#### **Google OAuth:**
- Go to Google Cloud Console → OAuth consent screen
- Add your Vercel domain to "Authorized domains":
  - `vercel.app`
- In OAuth 2.0 Client IDs → Add redirect URIs:
  - `https://your-project-id.supabase.co/auth/v1/callback`

#### **LinkedIn OAuth:**
- Go to LinkedIn Developer Portal → Your App
- Add redirect URLs:
  - `https://your-project-id.supabase.co/auth/v1/callback`

### **4. Enable Email Confirmation (Optional but Recommended)**

In Supabase Dashboard → Authentication → Settings:
- Enable "Enable email confirmations"
- Set "Email Templates" if needed

### **5. Test the Configuration**

After making these changes:

1. **Deploy your app to Vercel** (if not already deployed)
2. **Wait 2-3 minutes** for Supabase settings to propagate
3. **Test authentication** on your live Vercel URL:
   - Try email/password login
   - Try social login (if configured)
   - Try registration

## 🐛 Common Issues & Solutions

### **Issue 1: "Invalid redirect URL"**
**Solution:** Make sure you added your exact Vercel URL to the redirect URLs list

### **Issue 2: OAuth fails with "redirect_uri_mismatch"**
**Solution:** 
- Check that OAuth provider (Google/LinkedIn) has the correct Supabase callback URL
- The callback URL should be: `https://your-project-id.supabase.co/auth/v1/callback`

### **Issue 3: "Failed to fetch" errors**
**Solution:** 
- Verify CORS settings include your Vercel domain
- Check that environment variables are correctly set in Vercel

### **Issue 4: Works locally but not on Vercel**
**Solution:**
- Ensure you've updated the Site URL in Supabase to your Vercel domain
- Check that all environment variables are set in Vercel (not just locally)

## 📝 Verification Checklist

Before testing, verify you've completed:

- [ ] Updated Supabase Site URL to Vercel domain
- [ ] Added all redirect URLs in Supabase
- [ ] Set CORS origins in Supabase
- [ ] Added environment variables in Vercel
- [ ] Updated OAuth provider settings (if applicable)
- [ ] Redeployed your Vercel app
- [ ] Waited 2-3 minutes for settings to propagate

## 🔄 After Configuration

1. **Redeploy your Vercel app** to pick up environment variables
2. **Clear your browser cache** before testing
3. **Test in incognito/private mode** to avoid cached auth states

## 📞 Still Having Issues?

If authentication still doesn't work:

1. **Check browser console** for specific error messages
2. **Check Vercel logs** in your deployment dashboard
3. **Verify Supabase logs** in the Supabase dashboard
4. **Test with a fresh user account** (not one used during local testing)

## 🎯 Expected Behavior After Fix

✅ Users can register new accounts on your Vercel deployment
✅ Users can login with email/password on your Vercel deployment  
✅ Social login works (if configured)
✅ Email confirmations work (if enabled)
✅ Session management works properly

---

**Note:** Replace `your-app-name` and `your-project-id` with your actual Vercel app name and Supabase project ID throughout this guide.