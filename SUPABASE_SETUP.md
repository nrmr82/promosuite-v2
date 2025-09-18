# PromoSuite V2 - Supabase Integration Setup Guide

This guide will walk you through setting up Supabase as the backend for PromoSuite V2, replacing the custom API backend with Supabase's full-stack platform.

## Overview

PromoSuite V2 has been fully migrated to use Supabase for:
- **Authentication** - User registration, login, password reset, social auth
- **Database** - PostgreSQL database with Row Level Security (RLS)
- **File Storage** - Media uploads, templates, flyer exports
- **Real-time** - Live updates for collaborative features
- **API** - Auto-generated REST and GraphQL APIs

## Prerequisites

Before starting, you'll need:
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Basic knowledge of PostgreSQL and React

## Step 1: Create Supabase Project

1. **Sign up/Login to Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account or login

2. **Create New Project**
   - Click "New Project" 
   - Choose your organization
   - Enter project name: `promosuite-v2`
   - Generate a strong database password
   - Choose a region close to your users
   - Click "Create new project"

3. **Wait for Setup**
   - Supabase will provision your PostgreSQL database
   - This usually takes 1-2 minutes

## Step 2: Configure Database Schema

1. **Access SQL Editor**
   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New query"

2. **Run Database Schema**
   - Copy the entire contents of `supabase-schema.sql` 
   - Paste into the SQL editor
   - Click "Run" to execute the schema

3. **Verify Tables Created**
   - Go to "Table Editor" in the sidebar
   - You should see all tables: profiles, subscriptions, templates, flyers, etc.

## Step 3: Set Up Storage Buckets

1. **Go to Storage**
   - In Supabase dashboard, navigate to "Storage"

2. **Create Buckets**
   Create the following buckets (make them public for easier access):
   
   ```sql
   -- Run these in SQL Editor to create storage buckets
   INSERT INTO storage.buckets (id, name, public) VALUES 
   ('templates', 'templates', true),
   ('flyers', 'flyers', true),
   ('user-uploads', 'user-uploads', true),
   ('media', 'media', true),
   ('avatars', 'avatars', true);
   ```

3. **Configure Storage Policies**
   Add these RLS policies for storage:

   ```sql
   -- Allow users to upload to their own folders
   CREATE POLICY "Users can upload own files" ON storage.objects
     FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to view their own files
   CREATE POLICY "Users can view own files" ON storage.objects
     FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to delete their own files  
   CREATE POLICY "Users can delete own files" ON storage.objects
     FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Step 4: Configure Authentication

1. **Enable Auth Providers**
   - Go to "Authentication" → "Providers"
   - Enable desired social providers (Google, Twitter, LinkedIn, etc.)
   - Configure OAuth app credentials for each provider

2. **Configure Email Settings**
   - Go to "Authentication" → "Settings"
   - Configure SMTP settings for email verification
   - Customize email templates if needed

3. **Set Auth Policies**
   - Email confirmation: Enable/disable based on your needs
   - Password requirements: Set minimum length, etc.

## Step 5: Environment Variables

1. **Get Supabase Credentials**
   - Go to "Settings" → "API" in Supabase dashboard
   - Copy your Project URL and anon public key

2. **Update Environment File**
   Create/update `.env.local` in your project root:

   ```env
   REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   
   # Optional: Analytics
   REACT_APP_GA_TRACKING_ID=your-google-analytics-id
   
   # Feature Flags
   REACT_APP_ENABLE_SOCIAL_AUTH=true
   REACT_APP_ENABLE_ANALYTICS=true
   
   # Environment
   REACT_APP_ENVIRONMENT=development
   
   # File Upload Configuration
   REACT_APP_MAX_FILE_SIZE=10485760
   REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
   ```

3. **Update .env.example**
   The `.env.example` file has been updated with Supabase configuration

## Step 6: Install Dependencies

Supabase client is already installed, but verify:

```bash
npm install @supabase/supabase-js
```

## Step 7: Test the Integration

1. **Start Development Server**
   ```bash
   npm start
   ```

2. **Test Authentication**
   - Try registering a new user
   - Check if profile is created in Supabase
   - Test login/logout functionality

3. **Test Database Operations**
   - Create a flyer
   - Check if it appears in Supabase database
   - Test CRUD operations

## Step 8: Configure Row Level Security (RLS)

RLS is already configured in the schema, but here's what it does:

- **Profiles**: Users can only see/edit their own profile
- **Subscriptions**: Users can only access their own subscription data
- **Flyers**: Users can only access their own flyers
- **Media**: Users can only access their own uploaded files
- **Templates**: Public read access, admin write access
- **Categories**: Public read access

## Step 9: Set Up Database Functions

Add these helper functions to your database:

```sql
-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE templates 
  SET usage_count = usage_count + 1 
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Step 10: Production Configuration

For production deployment:

1. **Upgrade Supabase Plan** (if needed for higher limits)
2. **Configure Custom Domain** (optional)
3. **Set Up Database Backups**
4. **Configure Monitoring and Alerts**
5. **Review and Test RLS Policies**
6. **Set Up Edge Functions** (for advanced features)

## Migration from Custom API

The codebase has been updated to use Supabase instead of the custom API:

### Updated Services:
- `authService.js` - Now uses Supabase Auth
- `subscriptionService.js` - Uses Supabase database
- `flyerProService.js` - New service for flyer management
- `mediaService.js` - New service for file uploads
- `api.js` - Replaced with Supabase client

### Key Changes:
- Authentication is handled by Supabase Auth
- JWT tokens are managed automatically
- Database queries use Supabase client
- File uploads use Supabase Storage
- Real-time features available out-of-the-box

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**
   - Restart development server after changing .env
   - Use `.env.local` for local development

2. **Authentication Errors**
   - Check if email confirmation is required
   - Verify OAuth provider configuration
   - Check Supabase Auth logs

3. **Database Connection Issues**
   - Verify project URL and anon key
   - Check if RLS policies are too restrictive
   - Review database logs in Supabase

4. **Storage Upload Failures**
   - Check file size limits
   - Verify storage bucket policies
   - Ensure bucket exists and is public (if needed)

### Getting Help:

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Community Support**: [supabase.com/community](https://supabase.com/community)
- **GitHub Issues**: Check the PromoSuite repository for issues

## Next Steps

After setup is complete:

1. **Seed Initial Data** - Add template categories and sample templates
2. **Configure Stripe** - For subscription payments
3. **Set Up Analytics** - For user tracking and insights
4. **Deploy to Production** - Using Vercel, Netlify, or similar

## Backup and Security

### Regular Backups:
- Supabase automatically backs up your database
- Consider setting up additional backup strategies for critical data

### Security Best Practices:
- Regularly review RLS policies
- Monitor authentication logs
- Keep dependencies updated
- Use environment variables for sensitive data
- Enable two-factor authentication on Supabase account

## Performance Optimization

### Database:
- Monitor query performance in Supabase dashboard
- Add indexes for frequently queried columns
- Use database functions for complex operations

### Storage:
- Optimize image sizes before upload
- Use CDN for static assets
- Implement caching strategies

### Real-time:
- Only subscribe to necessary database changes
- Unsubscribe from channels when components unmount
- Use filters to reduce payload size

---

This completes the Supabase integration for PromoSuite V2. The application now has a modern, scalable backend with built-in authentication, real-time capabilities, and automatic API generation.
