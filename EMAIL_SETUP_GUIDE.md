# 📧 PromoSuite Email Branding Setup Guide

## Overview

This guide will help you set up professional, branded email templates for PromoSuite with custom SMTP to ensure all emails come from your domain with beautiful HTML designs.

## 🎯 What You'll Achieve

- **Professional branded emails** from PromoSuite (not Supabase)
- **Beautiful HTML templates** with responsive design
- **Custom domain** emails (e.g., noreply@promosuite.com)
- **Consistent branding** across all email types
- **Better deliverability** with proper authentication

---

## Step 1: Choose Email Service Provider

### Recommended Options:

#### **Option A: SendGrid (Recommended)**
- **Free tier**: 100 emails/day
- **Pros**: Great deliverability, easy setup, good templates
- **Cost**: Free → $14.95/month
- **Best for**: Professional businesses

#### **Option B: Mailgun**
- **Free tier**: 5,000 emails/month (first 3 months)
- **Pros**: Developer-friendly, good APIs
- **Cost**: $0.80/1000 emails after trial

#### **Option C: AWS SES**
- **Free tier**: 62,000 emails/month (if sending from EC2)
- **Pros**: Very cheap, AWS integration
- **Cost**: $0.10/1000 emails
- **Best for**: Technical users

#### **Option D: Postmark**
- **Free tier**: 100 emails/month
- **Pros**: Best deliverability, great support
- **Cost**: $10/month for 10,000 emails

---

## Step 2: Domain Setup (Required)

### 2.1 Purchase Domain Email
If you don't have `promosuite.com`, you'll need:
- Domain registrar (GoDaddy, Namecheap, etc.)
- Email subdomain setup (e.g., `mail.promosuite.com`)

### 2.2 DNS Records Setup
You'll need to add these DNS records (varies by provider):

```dns
# SPF Record (TXT)
v=spf1 include:sendgrid.net ~all

# DKIM Record (CNAME) 
s1._domainkey.promosuite.com → s1.domainkey.u12345.wl.sendgrid.net

# DMARC Record (TXT)
v=DMARC1; p=none; rua=mailto:dmarc@promosuite.com
```

---

## Step 3: Configure SMTP in Supabase

### 3.1 Get SMTP Credentials
From your email provider, get:
- **SMTP Host** (e.g., smtp.sendgrid.net)
- **SMTP Port** (587 or 465)
- **Username** (often "apikey")
- **Password** (your API key)

### 3.2 Configure Supabase SMTP
1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll to **SMTP Settings**
3. Fill in your credentials:

```
Enable custom SMTP: ✅
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Your SendGrid API Key]
Sender email: noreply@promosuite.com
Sender name: PromoSuite
```

---

## Step 4: Upload Custom Email Templates

### 4.1 Navigate to Email Templates
1. **Supabase Dashboard** → **Authentication** → **Email Templates**

### 4.2 Customize Each Template

#### **Confirm Signup Template:**
```html
<!-- Copy content from email-templates/confirm-signup.html -->
<!-- Replace variables with Supabase format: -->
{{ .ConfirmationURL }} → {{ .ConfirmationURL }}
{{ .Email }} → {{ .Email }}
{{ .SiteURL }} → {{ .SiteURL }}
```

#### **Reset Password Template:**
```html
<!-- Copy content from email-templates/reset-password.html -->
```

#### **Magic Link Template:**
```html
<!-- Create similar template for magic links -->
```

### 4.3 Template Variables
Supabase provides these variables:
- `{{ .ConfirmationURL }}` - Action link
- `{{ .Email }}` - User's email
- `{{ .SiteURL }}` - Your site URL
- `{{ .RedirectTo }}` - Redirect URL

---

## Step 5: Test Email Delivery

### 5.1 Test Registration Email
```bash
# Test new user registration
curl -X POST 'https://your-project.supabase.co/auth/v1/signup' \
-H "apikey: YOUR_ANON_KEY" \
-H "Content-Type: application/json" \
-d '{
  "email": "test@yourdomain.com",
  "password": "testpass123"
}'
```

### 5.2 Test Password Reset
```bash
# Test password reset
curl -X POST 'https://your-project.supabase.co/auth/v1/recover' \
-H "apikey: YOUR_ANON_KEY" \
-H "Content-Type: application/json" \
-d '{
  "email": "test@yourdomain.com"
}'
```

### 5.3 Check Email Client Rendering
Test in:
- Gmail (web + mobile)
- Outlook (web + desktop)
- Apple Mail
- Yahoo Mail

---

## Step 6: Advanced Features

### 6.1 Email Analytics (Optional)
Add tracking pixels for:
```html
<!-- Open tracking -->
<img src="https://track.promosuite.com/open/{{.Email}}" width="1" height="1" />

<!-- Click tracking -->
<a href="https://track.promosuite.com/click?url={{.ConfirmationURL}}&email={{.Email}}">
  Confirm Account
</a>
```

### 6.2 A/B Testing Templates
Create multiple versions:
- Template A: Standard design
- Template B: More visual design
- Template C: Minimal design

### 6.3 Personalization
Add dynamic content:
```html
<h1>Welcome {{.UserMetadata.full_name}}!</h1>
<p>Based on your location ({{.UserMetadata.city}}), here are nearby agents...</p>
```

---

## Step 7: Monitoring & Maintenance

### 7.1 Monitor Deliverability
Track:
- **Delivery rate** (should be >95%)
- **Open rate** (industry average: 20-25%)
- **Bounce rate** (should be <5%)
- **Spam rate** (should be <0.1%)

### 7.2 Email Health Checks
Monthly tasks:
- Review DNS records
- Check blacklist status
- Update templates if needed
- Monitor email volume

### 7.3 Backup Plan
Keep templates in version control:
```bash
git add email-templates/
git commit -m "feat: add professional email templates"
git push origin main
```

---

## 📋 Implementation Checklist

### Domain & DNS Setup
- [ ] Domain ownership verified
- [ ] SPF record added
- [ ] DKIM record added
- [ ] DMARC record added
- [ ] MX records configured (if needed)

### Email Service Provider
- [ ] Account created (SendGrid/Mailgun/etc.)
- [ ] Domain authenticated
- [ ] SMTP credentials generated
- [ ] Sender identity verified

### Supabase Configuration
- [ ] Custom SMTP enabled
- [ ] SMTP credentials added
- [ ] Sender email configured
- [ ] Templates uploaded
- [ ] Test emails working

### Template Quality
- [ ] Mobile responsive
- [ ] Dark mode support
- [ ] Cross-client compatibility
- [ ] Brand consistency
- [ ] Professional appearance

### Testing & Monitoring
- [ ] Registration emails working
- [ ] Password reset emails working
- [ ] Email analytics setup
- [ ] Deliverability monitoring
- [ ] Spam testing completed

---

## 🚨 Troubleshooting

### Common Issues:

#### **"SMTP Authentication Failed"**
- Check API key is correct
- Verify sender email is authenticated
- Ensure SMTP credentials match provider

#### **"Emails Going to Spam"**
- Verify SPF/DKIM records
- Check email content for spam triggers
- Warm up sending domain gradually
- Monitor sender reputation

#### **"Template Not Rendering"**
- Check HTML syntax
- Verify all variables are correct
- Test in email client preview tools
- Validate CSS compatibility

#### **"Emails Not Sending"**
- Check Supabase logs
- Verify SMTP service status
- Check rate limits
- Validate recipient email format

---

## 🎨 Template Customization

### Brand Colors
Current PromoSuite palette:
```css
--primary-color: #667eea;
--primary-dark: #764ba2;
--secondary-color: #f093fb;
--success-color: #10b981;
```

### Fonts
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

### Logo Options
- Use emoji (🚀) for compatibility
- Upload PNG logo to hosting service
- Use SVG for modern clients

---

## 💡 Pro Tips

1. **Start Simple**: Begin with basic templates, enhance later
2. **Test Early**: Send test emails to yourself frequently  
3. **Monitor Metrics**: Track deliverability from day one
4. **Keep Backups**: Store templates in version control
5. **Stay Compliant**: Include unsubscribe links
6. **Mobile First**: Design for mobile email clients
7. **Progressive Enhancement**: Basic HTML + CSS enhancements

---

## 📞 Support Resources

- **Supabase Email Docs**: https://supabase.com/docs/guides/auth/auth-email-templates
- **SendGrid Setup**: https://docs.sendgrid.com/for-developers/sending-email/supabase
- **Email Testing**: https://litmus.com/checklist/
- **Deliverability Guide**: https://postmarkapp.com/guides/deliverability

---

**Next Steps**: Choose your email service provider and follow Step 2 to begin domain setup!
