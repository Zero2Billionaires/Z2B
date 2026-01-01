# Email Setup Guide for Z2B Welcome Emails

## Overview
Your Z2B admin panel now automatically sends beautiful welcome emails to new members when they are registered. The email includes:
- Login credentials (email + password)
- Referral code and link
- Next steps and guidance
- Information about the 7 income streams

---

## Option 1: Gmail (Recommended for Testing)

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left menu
3. Find **2-Step Verification** and turn it ON
4. Follow the prompts to set it up

### Step 2: Create App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "Z2B Backend"
4. Click **Generate**
5. Copy the 16-character app password (example: `abcd efgh ijkl mnop`)

### Step 3: Configure Railway Environment Variables
1. Go to Railway Dashboard: https://railway.app/dashboard
2. Open your **Z2B** service
3. Click **Variables** tab
4. Add these variables:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  (your app password, remove spaces)
```

5. Click **Redeploy** to apply changes

---

## Option 2: cPanel Email (Recommended for Production)

### Step 1: Create Email Account in cPanel
1. Login to cPanel: https://z2blegacybuilders.co.za:2083
2. Find **Email Accounts** under the Email section
3. Click **Create**
4. Fill in:
   - **Email:** `support@z2blegacybuilders.co.za`
   - **Password:** Create a strong password
   - **Storage:** At least 500MB
5. Click **Create**

### Step 2: Find Mail Server Settings
1. In cPanel, click **Email Accounts**
2. Find your email account and click **Connect Devices**
3. Note down:
   - **Incoming Mail Server:** Usually `mail.z2blegacybuilders.co.za`
   - **Outgoing Mail Server (SMTP):** Same as incoming
   - **SMTP Port:** 587 (recommended) or 465
   - **Username:** Full email address
   - **Password:** Your email password

### Step 3: Configure Railway Environment Variables
1. Go to Railway Dashboard: https://railway.app/dashboard
2. Open your **Z2B** service
3. Click **Variables** tab
4. Add these variables:

```
EMAIL_HOST=mail.z2blegacybuilders.co.za
EMAIL_PORT=587
EMAIL_USER=support@z2blegacybuilders.co.za
EMAIL_PASSWORD=your-cpanel-email-password
```

5. Click **Redeploy** to apply changes

---

## Option 3: Other Email Providers

### SendGrid (Professional Solution)
1. Sign up at: https://sendgrid.com/ (Free for 100 emails/day)
2. Create API Key
3. Configure Railway:
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### Mailgun (Professional Solution)
1. Sign up at: https://www.mailgun.com/ (Free for 5,000 emails/month)
2. Get SMTP credentials
3. Configure Railway:
```
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
```

---

## Testing Your Email Setup

### After Configuring Railway Variables:

1. Wait 2-3 minutes for Railway to redeploy
2. Go to your admin panel: https://z2blegacybuilders.co.za/admin.html
3. Create a test user:
   - Name: **Test User**
   - Email: **YOUR OWN EMAIL** (so you can receive the welcome email)
   - Phone: Any number
   - Password: Any password
   - Click "Register Member"

4. **Check your email inbox** (and spam folder) for the welcome email

---

## Troubleshooting

### Email Not Sending?

**Check Railway Logs:**
1. Go to Railway Dashboard
2. Open Z2B service
3. Click **Deployments** tab
4. Click latest deployment
5. Look for error messages containing "email" or "SMTP"

**Common Issues:**

1. **Gmail "Less secure apps" error**
   - Solution: Use App Password (see Gmail setup above)

2. **Authentication failed**
   - Check EMAIL_USER and EMAIL_PASSWORD are correct
   - For Gmail, ensure you're using the App Password, not your regular password
   - For cPanel, ensure you're using the full email address as username

3. **Connection timeout**
   - Try changing EMAIL_PORT to 465
   - Check if your hosting provider blocks outgoing SMTP on port 587

4. **"Email not configured" message**
   - Ensure all 4 email variables are set in Railway
   - Redeploy after adding variables

---

## Email Template Preview

The welcome email includes:
- **Header:** Z2B branding with gradient background
- **Personal Greeting:** "Dear [Member Name]"
- **Login Credentials:** Email, Password, Tier (with security warning)
- **Referral Info:** Member number (Z2BXXXXXXXX) and referral link
- **Login Button:** Direct link to dashboard
- **Next Steps:** 5-step onboarding checklist
- **7 Income Streams:** Complete list with descriptions
- **Footer:** Contact information and support email

---

## Important Security Notes

⚠️ **Never commit the .env file to GitHub!**
- The .env file contains sensitive credentials
- It's already in .gitignore
- Only configure email settings in Railway environment variables

⚠️ **Use strong passwords**
- For cPanel email accounts
- For your email service providers

⚠️ **Monitor email usage**
- Gmail App Passwords: 100 emails/day limit
- SendGrid free tier: 100 emails/day
- Mailgun free tier: 5,000 emails/month

---

## Need Help?

If you need assistance setting up email:
1. Check Railway logs for specific error messages
2. Test your SMTP credentials with an email client first
3. Contact your email provider's support for SMTP issues
4. Consider using SendGrid or Mailgun for production (more reliable than Gmail)

---

**Email Feature Status:** ✅ Implemented
**Default Behavior:** If email is not configured, user creation will still work, but no email will be sent (logged as warning in Railway console)

