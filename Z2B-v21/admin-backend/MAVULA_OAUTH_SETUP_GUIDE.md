# MAVULA Social Media OAuth Configuration Guide

This guide explains how to set up OAuth authentication for Facebook, Instagram, and TikTok integration with MAVULA's prospect import feature.

---

## Table of Contents

1. [Overview](#overview)
2. [Facebook App Setup](#facebook-app-setup)
3. [Instagram App Setup](#instagram-app-setup)
4. [TikTok App Setup](#tiktok-app-setup)
5. [Environment Configuration](#environment-configuration)
6. [Testing OAuth Flows](#testing-oauth-flows)
7. [Troubleshooting](#troubleshooting)

---

## Overview

MAVULA uses OAuth 2.0 to connect to social media platforms and import prospects (friends/followers). Users authorize MAVULA to access their social accounts, and the system imports contacts as prospects for automated conversations.

**What each platform provides:**
- **Facebook:** Friends list (limited to app users)
- **Instagram:** Profile access (follower import requires Business API)
- **TikTok:** Profile access only (no follower import)

**Important Notes:**
- All platforms have strict API usage policies
- Most require app review for production access
- Testing is possible with developer/test accounts

---

## Facebook App Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** as app type
4. Fill in app details:
   - **App Name:** Z2B MAVULA
   - **App Contact Email:** Your email
   - **Business Account:** (Optional)
5. Click **Create App**

### Step 2: Configure Facebook Login

1. In app dashboard, go to **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Select **Web** platform
4. Enter **Site URL:**
   ```
   https://z2blegacybuilders.co.za
   ```
   (Or your production domain)
5. Click **Save** → **Continue**

### Step 3: Configure OAuth Settings

1. Go to **Facebook Login** → **Settings**
2. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://z2blegacybuilders.co.za/api/mavula/social/facebook/callback
   http://localhost:5000/api/mavula/social/facebook/callback
   ```
   (Add both production and development URLs)
3. Enable **Login with the JavaScript SDK:** OFF
4. Enable **Use Strict Mode for Redirect URIs:** ON
5. Click **Save Changes**

### Step 4: Get App Credentials

1. Go to **Settings** → **Basic**
2. Copy **App ID** → This is your `FACEBOOK_APP_ID`
3. Copy **App Secret** → This is your `FACEBOOK_APP_SECRET`
4. Save these for environment configuration

### Step 5: Set Permissions

1. Go to **App Review** → **Permissions and Features**
2. Request permissions (required for production):
   - `public_profile` (Default - no review needed)
   - `email` (Default - no review needed)
   - `user_friends` (Requires app review)

**Note:** In development mode, `user_friends` only returns friends who also use your app.

### Step 6: App Review (For Production)

1. Go to **App Review** → **Requests**
2. Click **Add Items**
3. Select `user_friends` permission
4. Provide:
   - **Detailed Description:** Explain how you'll use friend data
   - **Step-by-step Instructions:** How to test the feature
   - **Screencast:** Video demo of the feature
5. Submit for review (typically 3-7 days)

---

## Instagram App Setup

### Step 1: Prerequisites

Instagram OAuth requires:
- Facebook Developer account
- Instagram Business or Creator account
- Facebook Page linked to Instagram account

### Step 2: Create Facebook App (if not already)

Follow the Facebook setup steps above.

### Step 3: Add Instagram Basic Display Product

1. In Facebook app dashboard, go to **Add Product**
2. Find **Instagram Basic Display** and click **Set Up**
3. Click **Create New App**
4. Fill in details:
   - **Display Name:** Z2B MAVULA
   - **Privacy Policy URL:** Your privacy policy
   - **User Data Deletion URL:** Your data deletion endpoint
5. Click **Create App**

### Step 4: Configure OAuth Settings

1. Go to **Instagram Basic Display** → **Basic Display**
2. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://z2blegacybuilders.co.za/api/mavula/social/instagram/callback
   http://localhost:5000/api/mavula/social/instagram/callback
   ```
3. Click **Save Changes**

### Step 5: Get App Credentials

1. In **Instagram Basic Display** → **Basic Display**
2. Copy **Instagram App ID** → This is your `INSTAGRAM_APP_ID`
3. Copy **Instagram App Secret** → This is your `INSTAGRAM_APP_SECRET`

### Step 6: Add Test Users (For Development)

1. Go to **Instagram Basic Display** → **Roles** → **Roles**
2. Click **Add Instagram Testers**
3. Enter Instagram username
4. Test user must accept invitation in Instagram app

**Important:** Instagram Basic Display API does **NOT** provide follower lists. For follower import, you need Instagram Graph API with Business account approval.

---

## TikTok App Setup

### Step 1: Create TikTok Developer Account

1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Click **Login** → Sign in with TikTok account
3. Complete developer registration

### Step 2: Create TikTok App

1. Go to **My Apps**
2. Click **Create an App**
3. Fill in app details:
   - **App Name:** Z2B MAVULA
   - **Category:** Business Services
   - **Description:** Automated prospecting and marketing system
4. Click **Submit**

### Step 3: Configure OAuth

1. In app dashboard, go to **Configuration**
2. Under **Login Kit**, click **Configure**
3. Add **Redirect URIs:**
   ```
   https://z2blegacybuilders.co.za/api/mavula/social/tiktok/callback
   http://localhost:5000/api/mavula/social/tiktok/callback
   ```
4. Select **Scopes:**
   - `user.info.basic` (User profile information)
5. Click **Save**

### Step 4: Get App Credentials

1. In app dashboard, go to **Basic Information**
2. Copy **Client Key** → This is your `TIKTOK_CLIENT_KEY`
3. Copy **Client Secret** → This is your `TIKTOK_CLIENT_SECRET`

### Step 5: App Review (For Production)

1. Go to **App Review** → **Submit for Review**
2. Provide:
   - App screenshots
   - Privacy policy
   - Use case description
3. Submit (review typically 5-10 days)

**Important:** TikTok API does **NOT** provide follower lists in any API tier.

---

## Environment Configuration

Add the following to your `.env` file:

```bash
# MAVULA SOCIAL MEDIA OAUTH CONFIGURATION

# Facebook
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Instagram
INSTAGRAM_APP_ID=your_instagram_app_id_here
INSTAGRAM_APP_SECRET=your_instagram_app_secret_here

# TikTok
TIKTOK_CLIENT_KEY=your_tiktok_client_key_here
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret_here

# Frontend URL (for OAuth redirects)
FRONTEND_URL=https://z2blegacybuilders.co.za
```

**For Development (localhost):**
```bash
FRONTEND_URL=http://localhost:5000
```

---

## Testing OAuth Flows

### Test Facebook Integration

1. **Get Auth URL:**
   ```bash
   curl http://localhost:5000/api/mavula/social/facebook/auth \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

   Response:
   ```json
   {
     "success": true,
     "authURL": "https://www.facebook.com/v18.0/dialog/oauth?..."
   }
   ```

2. **Visit Auth URL** in browser
3. Click **Continue as [Your Name]**
4. You'll be redirected to callback URL
5. Should see "Facebook Connected Successfully!"

6. **Import Friends:**
   ```bash
   curl -X POST http://localhost:5000/api/mavula/social/facebook/import \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

   Response:
   ```json
   {
     "success": true,
     "platform": "facebook",
     "imported": 5,
     "skipped": 0,
     "duplicates": 2
   }
   ```

### Test Instagram Integration

1. **Get Auth URL:**
   ```bash
   curl http://localhost:5000/api/mavula/social/instagram/auth \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

2. **Visit Auth URL** → Authorize app
3. Should see "Instagram Connected Successfully!"

4. **Check Connection Status:**
   ```bash
   curl http://localhost:5000/api/mavula/social/status \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

   Response:
   ```json
   {
     "success": true,
     "status": {
       "facebook": { "connected": true, "connectedAt": "2025-12-08..." },
       "instagram": { "connected": true, "connectedAt": "2025-12-08..." },
       "tiktok": { "connected": false }
     }
   }
   ```

### Test TikTok Integration

1. **Get Auth URL:**
   ```bash
   curl http://localhost:5000/api/mavula/social/tiktok/auth \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

2. **Visit Auth URL** → Authorize app
3. Should see "TikTok Connected Successfully!"

### Test Disconnect

```bash
curl -X POST http://localhost:5000/api/mavula/social/facebook/disconnect \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "message": "facebook disconnected successfully"
}
```

---

## Troubleshooting

### Facebook Issues

**Problem:** "Given URL is not allowed by the Application configuration"

**Solution:**
1. Go to Facebook App → **Facebook Login** → **Settings**
2. Ensure redirect URI exactly matches what's configured
3. Check for typos, trailing slashes, http vs https

**Problem:** `user_friends` returns empty array

**Solution:**
- In development mode, only returns friends who also use your app
- Add test users as developers in app dashboard
- For production, complete app review for `user_friends` permission

**Problem:** "This app is in Development Mode"

**Solution:**
1. Go to **App Review** → **Request**
2. Submit app for review with required permissions
3. OR: Add specific test users in **Roles** section

### Instagram Issues

**Problem:** "Unable to import followers"

**Solution:**
- Instagram Basic Display API doesn't provide follower lists
- Need Instagram Graph API (Business accounts only)
- Alternative: Manually import prospects or use Facebook friends

**Problem:** "Invalid redirect URI"

**Solution:**
1. Check **Instagram Basic Display** → **Basic Display** settings
2. Ensure exact match (including protocol and path)
3. Wait 5-10 minutes after changing settings (caching)

### TikTok Issues

**Problem:** "Invalid client_key"

**Solution:**
1. Verify credentials in TikTok app dashboard
2. Check environment variables are loaded
3. Restart server after updating `.env`

**Problem:** "Unable to import followers"

**Solution:**
- TikTok API doesn't provide follower access
- Use manual import or other platforms

### General OAuth Issues

**Problem:** Access token expires

**Solution:**
- Facebook: Tokens expire after 60 days (short-lived) or 60+ days (long-lived)
- Instagram: Tokens expire after 60 days, need refresh
- TikTok: Tokens don't expire unless user revokes
- Implement token refresh logic for production

**Problem:** "redirect_uri_mismatch"

**Solution:**
1. Ensure exact match in platform settings
2. Check `FRONTEND_URL` in `.env`
3. Verify no trailing slashes
4. Protocol must match (http/https)

---

## API Rate Limits

### Facebook
- 200 calls per hour per user
- 4800 calls per hour per app
- Exceeding limits: 1-hour temporary ban

### Instagram
- 200 requests per hour per user
- Graph API: Different limits for Business accounts

### TikTok
- Varies by app tier
- Standard: 100 requests/day
- Growth: 1000 requests/day
- Premium: Custom limits

**Best Practice:** Cache imported prospects, don't re-import frequently.

---

## Security Best Practices

1. **Never commit OAuth secrets to Git**
   - Use `.env` file (add to `.gitignore`)
   - Use environment variables in production

2. **Validate state parameter**
   - Prevents CSRF attacks
   - MAVULA uses userId as state

3. **Use HTTPS in production**
   - OAuth requires HTTPS for security
   - Only use HTTP for local development

4. **Store tokens securely**
   - MAVULA stores in encrypted MongoDB
   - Never expose tokens in API responses

5. **Implement token refresh**
   - Refresh before expiration
   - Handle expired token errors gracefully

6. **Respect user privacy**
   - Only request necessary permissions
   - Provide clear privacy policy
   - Allow easy disconnection

---

## Next Steps After Setup

1. **Test OAuth flows** with personal accounts
2. **Add test users** for team testing
3. **Submit apps for review** (required for production)
4. **Monitor API usage** in platform dashboards
5. **Implement frontend UI** for social connect buttons
6. **Add error handling** for edge cases

---

**Last Updated:** December 2025
**Version:** 1.0.0
**Part of:** MAVULA - Marketing Automation Via Unified Learning AI
