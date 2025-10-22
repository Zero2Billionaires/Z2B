# 📦 Z2B DEPLOYMENT PACKAGE - COMPLETE FILE LIST
## Landing Page + Payment System Deployment to z2blegacybuilders.co.za

**Last Updated:** 2025-10-22
**Deployment Type:** Landing Page with Yoco Payment Integration
**Target Domain:** https://z2blegacybuilders.co.za

---

## ⚠️ CRITICAL: PRICE DISCREPANCY ALERT!

**MUST FIX BEFORE DEPLOYMENT:**

Your **Diamond tier** has different prices in different files:
- **Landing Page** (`app/landing-page.html`): R11,980
- **Config File** (`config/app.php`): R5,980

**Action Required:** Choose ONE correct price and update both files to match!
- If correct price is R11,980 → Update `config/app.php` line 87
- If correct price is R5,980 → Update `app/landing-page.html` line 1886

**Why This Matters:** Yoco will reject payments if amounts don't match!

---

## 📋 DEPLOYMENT CHECKLIST - CORE FILES

### ✅ **SECTION 1: LANDING PAGE** (app/ folder)

Upload to: `public_html/app/`

- [ ] **landing-page.html** (Main landing page)
  - Size: ~50KB
  - Purpose: Public-facing tier selection page
  - Contains: All 6 tier buttons (Bronze, Copper, Silver, Gold, Platinum, Diamond)
  - Payment Integration: ✓ Yoco payment buttons
  - Referral Tracking: ✓ Captures ?ref= parameter

**File Path on Server:**
```
public_html/app/landing-page.html
```

---

### ✅ **SECTION 2: PAYMENT API FILES** (api/ folder)

Upload to: `public_html/api/`

- [ ] **create-tier-checkout.php** (Payment API endpoint)
  - Size: ~6KB
  - Purpose: Creates Yoco checkout sessions
  - Requires: Yoco API keys in config/yoco.php
  - Used By: Landing page tier buttons
  - Captures: Tier code, referral code, creates payment session

- [ ] **yoco-webhook.php** (Webhook handler)
  - Size: ~6KB
  - Purpose: Receives payment confirmations from Yoco
  - Requires: Webhook secret in config/yoco.php
  - Updates: Payment status in database
  - Events: checkout.succeeded, payment.succeeded, checkout.failed

- [ ] **auto-register.php** (Auto-registration API)
  - Size: ~9KB
  - Purpose: Creates user accounts after successful payment
  - Generates: Username, password, referral code
  - Sends: Welcome email with credentials
  - Notifies: Referrer if applicable

**File Paths on Server:**
```
public_html/api/create-tier-checkout.php
public_html/api/yoco-webhook.php
public_html/api/auto-register.php
```

---

### ✅ **SECTION 3: EMAIL SERVICE** (includes/ folder)

Upload to: `public_html/includes/`

- [ ] **EmailService.php** (Email notification system)
  - Size: ~11KB
  - Purpose: Sends professional HTML emails
  - Email Types:
    1. Payment confirmation
    2. Registration welcome (with credentials)
    3. Referral notification
  - Branding: Navy blue + Gold Z2B colors
  - Method: PHP mail() function

**File Path on Server:**
```
public_html/includes/EmailService.php
```

---

### ✅ **SECTION 4: CONFIGURATION FILES** (config/ folder)

Upload to: `public_html/config/`

- [ ] **app.php** (Application configuration)
  - Size: ~10KB
  - Purpose: Tier definitions, MLM settings, app constants
  - Contains:
    - 6 tier configurations (BLB, CLB, SLB, GLB, PLB, DLB)
    - Prices, PV values, commission percentages
    - TLI levels and rewards
  - **ACTION:** Verify Diamond tier price (line 87) before upload!

- [ ] **database.php** (Database connection)
  - Size: ~6KB
  - **IMPORTANT:** Current file has LOCAL credentials!
  - **ACTION REQUIRED:** Update with production credentials BEFORE upload
  - Update these lines:
    ```php
    define('DB_HOST', 'localhost');           // Usually stays 'localhost'
    define('DB_NAME', 'YOUR_PRODUCTION_DB');  // Update this!
    define('DB_USER', 'YOUR_PRODUCTION_USER'); // Update this!
    define('DB_PASS', 'YOUR_PRODUCTION_PASS'); // Update this!
    ```

**Template Files (DO NOT upload, use as reference):**

- [ ] **database.PRODUCTION.php** (Production template)
  - Size: ~1.5KB
  - Purpose: Reference template for production database config
  - Action: Copy settings to database.php with your real credentials

- [ ] **yoco.PRODUCTION.php** (Yoco API template)
  - Size: ~2KB
  - Purpose: Reference template for Yoco live API keys
  - **ACTION REQUIRED:** Create `config/yoco.php` on server with:
    ```php
    define('YOCO_SECRET_KEY', 'sk_live_YOUR_LIVE_KEY');
    define('YOCO_PUBLIC_KEY', 'pk_live_YOUR_LIVE_KEY');
    define('YOCO_WEBHOOK_SECRET', 'whsec_YOUR_WEBHOOK_SECRET');
    ```
  - Get keys from: https://portal.yoco.com/settings/keys

**File Paths on Server:**
```
public_html/config/app.php                    ← Upload after fixing price
public_html/config/database.php               ← Upload after updating credentials
public_html/config/yoco.php                   ← CREATE NEW on server with live keys
```

---

### ✅ **SECTION 5: DATABASE SQL SCRIPT** (database/ folder)

**DO NOT upload this folder. Run SQL manually in phpMyAdmin.**

- [ ] **PRODUCTION_SETUP.sql** (Database setup script)
  - Size: ~4KB
  - Purpose: Creates all required database tables
  - Creates:
    - `payment_sessions` table (tracks all payments)
    - `users` table (user accounts)
    - `referral_commissions` table (commission tracking)
    - `email_queue` table (email logging)
  - **ACTION:** Copy contents, paste in phpMyAdmin SQL tab, click "Go"

**How to Use:**
1. Log into phpMyAdmin on your hosting
2. Select your database from left sidebar
3. Click "SQL" tab at top
4. Open `database/PRODUCTION_SETUP.sql` on your computer
5. Copy ALL contents (Ctrl+A, Ctrl+C)
6. Paste into SQL tab
7. Click "Go" button
8. Verify tables created successfully

---

### ✅ **SECTION 6: PAYMENT PAGES** (Root folder files)

Upload to: `public_html/` (root directory)

- [ ] **payment-success-register.php** (Registration form after payment)
  - Size: ~9KB
  - Purpose: Shown after successful payment
  - Contains: Registration form for user details
  - Calls: auto-register.php API
  - Displays: Generated credentials and referral link
  - Flow: Payment → This Page → Enter Email/Name → Account Created

- [ ] **payment-failed.php** (Payment failure page)
  - Size: ~3KB
  - Purpose: Shown if payment fails
  - Contains: Error message and retry button
  - Links: Back to landing page

**File Paths on Server:**
```
public_html/payment-success-register.php
public_html/payment-failed.php
```

---

## 🚫 DO NOT UPLOAD - EXCLUDED FILES

These files should **NOT** be uploaded to production:

### Development/Testing Files:
- ❌ `.env` (Contains API keys - NEVER upload!)
- ❌ `test-*.html` (Test files)
- ❌ `test-*.js` (Test files)
- ❌ `coach-cli.js` (CLI tool)
- ❌ All `.bat` files (Windows batch scripts)
- ❌ All `.sh` files (Shell scripts)
- ❌ All `.md` files (Documentation)

### Backend Files (Not needed for landing page):
- ❌ `index.php` (Old monolithic file)
- ❌ `server-quick.js` (Local dev server)
- ❌ `run_server.py` (Local dev server)

### Other App Pages (Not deploying yet):
- ❌ `app/dashboard.html` (Member dashboard - future)
- ❌ `app/marketplace.html` (Marketplace - future)
- ❌ `app/coach-manlaw.html` (AI Coach - future)
- ❌ All other `app/*.html` files (Future features)

### Other API Files (Not needed for landing page):
- ❌ `api/marketplace.php` (Future feature)
- ❌ `api/ai-coach.php` (Future feature)
- ❌ `api/monthly-refuel.php` (Future feature)
- ❌ All other `api/*.php` files except the 3 listed above

### Migration/Setup Files:
- ❌ `database/migrate.php` (Setup tool)
- ❌ `database/migrations/` folder (Migration history)

---

## 📊 DEPLOYMENT SUMMARY

**Total Files to Upload: 9**

| Folder | Files | Upload To |
|--------|-------|-----------|
| `app/` | 1 file | `public_html/app/` |
| `api/` | 3 files | `public_html/api/` |
| `includes/` | 1 file | `public_html/includes/` |
| `config/` | 2 files | `public_html/config/` |
| Root | 2 files | `public_html/` |
| Database | 1 SQL script | Run in phpMyAdmin |

**Additional Setup Required:**
- Create `config/yoco.php` on server
- Update database credentials in `config/database.php`
- Configure Yoco webhook in Yoco portal
- Fix Diamond tier price discrepancy

---

## 🎯 PRE-UPLOAD ACTIONS REQUIRED

**BEFORE uploading ANY files, complete these tasks:**

### 1. Fix Diamond Tier Price
- [ ] Choose correct price: R5,980 or R11,980?
- [ ] Update `config/app.php` line 87 if needed
- [ ] Update `app/landing-page.html` line 1886 if needed
- [ ] Both files MUST have matching price!

### 2. Update Database Credentials
- [ ] Get production database name from hosting
- [ ] Get production database username from hosting
- [ ] Get production database password from hosting
- [ ] Update `config/database.php` lines 11-14
- [ ] Test database connection after upload

### 3. Get Yoco Live API Keys
- [ ] Log into https://portal.yoco.com
- [ ] Go to Settings → API Keys
- [ ] Copy Live Secret Key (starts with `sk_live_`)
- [ ] Copy Live Public Key (starts with `pk_live_`)
- [ ] Keep these safe for config/yoco.php creation

---

## 📁 COMPLETE FILE LIST WITH EXACT PATHS

### Files from Your Computer → Server

```plaintext
LOCAL PATH                                    → SERVER PATH
================================================================

app/landing-page.html                         → public_html/app/landing-page.html

api/create-tier-checkout.php                  → public_html/api/create-tier-checkout.php
api/yoco-webhook.php                          → public_html/api/yoco-webhook.php
api/auto-register.php                         → public_html/api/auto-register.php

includes/EmailService.php                     → public_html/includes/EmailService.php

config/app.php                                → public_html/config/app.php
config/database.php (AFTER updating)          → public_html/config/database.php

payment-success-register.php                  → public_html/payment-success-register.php
payment-failed.php                            → public_html/payment-failed.php

database/PRODUCTION_SETUP.sql                 → Copy & Paste into phpMyAdmin SQL tab
```

### Files to CREATE on Server

```plaintext
SERVER PATH                                   → ACTION
================================================================

public_html/config/yoco.php                   → CREATE NEW with live API keys
                                                 Use yoco.PRODUCTION.php as template
```

---

## ✅ VERIFICATION CHECKLIST

After uploading all files, verify:

### File Upload Verification
- [ ] Landing page accessible at: `https://z2blegacybuilders.co.za/app/landing-page.html`
- [ ] All 6 tier buttons visible (Bronze, Copper, Silver, Gold, Platinum, Diamond)
- [ ] Payment success page exists: `https://z2blegacybuilders.co.za/payment-success-register.php`
- [ ] Payment failed page exists: `https://z2blegacybuilders.co.za/payment-failed.php`

### API File Verification
- [ ] `api/create-tier-checkout.php` uploaded
- [ ] `api/yoco-webhook.php` uploaded
- [ ] `api/auto-register.php` uploaded

### Config Verification
- [ ] `config/app.php` uploaded with correct Diamond price
- [ ] `config/database.php` uploaded with production credentials
- [ ] `config/yoco.php` created with live API keys

### Database Verification
- [ ] Database created in hosting control panel
- [ ] PRODUCTION_SETUP.sql executed successfully
- [ ] Tables visible in phpMyAdmin:
  - [ ] payment_sessions
  - [ ] users
  - [ ] referral_commissions
  - [ ] email_queue

### Email Service Verification
- [ ] `includes/EmailService.php` uploaded
- [ ] Email addresses updated for production

---

## 🔐 SECURITY CHECKLIST

Before going live:

- [ ] `.env` file NOT uploaded (check!)
- [ ] Database credentials updated in `config/database.php`
- [ ] Yoco LIVE keys (not test keys) in `config/yoco.php`
- [ ] File permissions set correctly:
  - `config/*.php` → 600 (read/write owner only)
  - `api/*.php` → 644 (standard)
  - `includes/*.php` → 644 (standard)
- [ ] `.htaccess` file created to protect config files
- [ ] HTTPS redirect enabled

---

## 🚀 DEPLOYMENT ORDER

**Follow this exact order for successful deployment:**

1. **Database Setup** (10 minutes)
   - Create database in cPanel/hosting
   - Run PRODUCTION_SETUP.sql in phpMyAdmin
   - Verify tables created

2. **Update Local Files** (5 minutes)
   - Fix Diamond tier price if needed
   - Update database.php with production credentials
   - Save all changes

3. **Upload Folders First** (10 minutes)
   - Upload `app/` folder
   - Upload `api/` folder
   - Upload `includes/` folder
   - Upload `config/` folder

4. **Upload Root Files** (2 minutes)
   - Upload `payment-success-register.php`
   - Upload `payment-failed.php`

5. **Create Yoco Config** (3 minutes)
   - Create `config/yoco.php` on server
   - Add live API keys
   - Save file

6. **Configure Yoco Webhook** (5 minutes)
   - Log into Yoco portal
   - Add webhook URL: `https://z2blegacybuilders.co.za/api/yoco-webhook.php`
   - Select events, get webhook secret
   - Add webhook secret to `config/yoco.php`

7. **Test with Test Keys First** (15 minutes)
   - Use Yoco test keys temporarily
   - Test payment flow
   - Verify registration works
   - Check database updates

8. **Switch to Live Mode** (2 minutes)
   - Replace test keys with live keys in `config/yoco.php`
   - Test with real payment (small amount)

---

## 📞 SUPPORT RESOURCES

**Deployment Guides:**
- Detailed Guide: `DEPLOY_TO_PRODUCTION.md`
- Step-by-step Checklist: `DEPLOYMENT_CHECKLIST.md`
- System Overview: `PAYMENT_SYSTEM_COMPLETE.md`

**Yoco Resources:**
- Portal: https://portal.yoco.com
- API Docs: https://developer.yoco.com
- Support: support@yoco.com

**Your Hosting:**
- cPanel: `https://z2blegacybuilders.co.za:2083`
- Contact hosting support for:
  - Database credentials
  - FTP/SSH access
  - Email configuration
  - File permissions

---

## ✅ FINAL CHECKLIST

**Before you say "I'm ready to deploy":**

- [ ] I have read this entire document
- [ ] I have fixed the Diamond tier price discrepancy
- [ ] I have my production database credentials
- [ ] I have my Yoco live API keys
- [ ] I have FTP/cPanel access to my hosting
- [ ] I have backed up any existing files on the domain
- [ ] I understand what files to upload and what NOT to upload
- [ ] I have the DEPLOYMENT_CHECKLIST.md ready to follow

---

**YOU ARE NOW READY TO DEPLOY! 🚀**

**Start with:** `DEPLOYMENT_CHECKLIST.md` for step-by-step guidance

**Questions?** Review `DEPLOY_TO_PRODUCTION.md` for detailed explanations

---

**Package Created:** 2025-10-22
**Files Ready:** C:\Users\Manana\Z2B\Z2B-v21\
**Target Domain:** https://z2blegacybuilders.co.za
**Status:** ✅ ALL SYSTEMS READY FOR DEPLOYMENT
