# 🚀 Z2B DEPLOYMENT CHECKLIST - z2blegacybuilders.co.za

## ✅ **STEP-BY-STEP DEPLOYMENT GUIDE**

---

## 📋 **PREPARATION (Before You Start)**

- [ ] I have FTP/cPanel access to z2blegacybuilders.co.za
- [ ] I have database access (phpMyAdmin)
- [ ] I have my Yoco LIVE API keys ready
- [ ] I have backed up any existing files on the domain

---

## 🗄️ **STEP 1: DATABASE SETUP (10 minutes)**

### **1.1 Create Database**
- [ ] Log into cPanel → MySQL Databases
- [ ] Create new database: `z2b_legacy` (or with your username prefix)
- [ ] Create database user
- [ ] Add user to database with ALL PRIVILEGES
- [ ] **Write down:** Database name, username, password

### **1.2 Run SQL Setup**
- [ ] Log into phpMyAdmin
- [ ] Select your database from left sidebar
- [ ] Click "SQL" tab
- [ ] Open file: `database/PRODUCTION_SETUP.sql`
- [ ] Copy ALL content
- [ ] Paste into SQL tab
- [ ] Click "Go"
- [ ] **Verify:** You should see "payment_sessions" and "users" tables created

---

## 📁 **STEP 2: UPLOAD FILES (15 minutes)**

### **2.1 Connect via FTP**
Use FileZilla or cPanel File Manager

FTP Settings:
- Host: `ftp.z2blegacybuilders.co.za`
- Username: Your cPanel username
- Password: Your cPanel password
- Port: 21

### **2.2 Upload These Folders**

From `Z2B-v21/` → Upload to `public_html/`:

- [ ] `app/` folder → `public_html/app/`
- [ ] `api/` folder → `public_html/api/`
- [ ] `includes/` folder → `public_html/includes/`
- [ ] `config/` folder → `public_html/config/`
- [ ] `payment-success-register.php` → `public_html/`
- [ ] `payment-failed.php` → `public_html/`

**Files uploaded:** ✓

---

## 🔧 **STEP 3: CONFIGURE FILES (10 minutes)**

### **3.1 Database Configuration**

**On Server:** Edit `config/database.php`

Replace with:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_actual_db_name');     // From Step 1.1
define('DB_USER', 'your_actual_db_username'); // From Step 1.1
define('DB_PASS', 'your_actual_db_password'); // From Step 1.1
```

- [ ] Database config updated

### **3.2 Yoco Configuration**

**On Server:** Create new file `config/yoco.php`

Use template from: `config/yoco.PRODUCTION.php`

Add your LIVE keys from: https://portal.yoco.com/settings/keys

```php
define('YOCO_SECRET_KEY', 'sk_live_YOUR_KEY');
define('YOCO_PUBLIC_KEY', 'pk_live_YOUR_KEY');
```

- [ ] Yoco config created with LIVE keys

### **3.3 Email Configuration**

**On Server:** Edit `includes/EmailService.php`

Lines 8-11, update:
```php
$this->fromEmail = 'noreply@z2blegacybuilders.co.za';
$this->fromName = 'Z2B Legacy Builders';
$this->replyTo = 'support@z2blegacybuilders.co.za';
```

- [ ] Email addresses updated

---

## 🌐 **STEP 4: YOCO WEBHOOK SETUP (5 minutes)**

1. Go to: https://portal.yoco.com/settings/webhooks
2. Click "Add Webhook"
3. URL: `https://z2blegacybuilders.co.za/api/yoco-webhook.php`
4. Select events:
   - [x] checkout.succeeded
   - [x] checkout.completed
   - [x] payment.succeeded
   - [x] checkout.failed
5. Copy webhook secret
6. Add to `config/yoco.php`:
   ```php
   define('YOCO_WEBHOOK_SECRET', 'whsec_...');
   ```

- [ ] Webhook configured in Yoco
- [ ] Webhook secret added to config

---

## 🧪 **STEP 5: TESTING (20 minutes)**

### **5.1 Test Landing Page**

Visit: `https://z2blegacybuilders.co.za/app/landing-page.html`

- [ ] Page loads without errors
- [ ] All tier buttons visible
- [ ] Styling looks correct
- [ ] No console errors (F12 → Console)

### **5.2 Test Payment Flow (TEST MODE)**

**IMPORTANT:** Start with Yoco TEST keys first!

Edit `config/yoco.php` temporarily use test keys:
```php
define('YOCO_SECRET_KEY', 'sk_test_960bfde0VBrLlpK098e4ffeb53e1');
define('YOCO_PUBLIC_KEY', 'pk_test_ed3c54a6gOol69qa7f45');
```

Test Process:
1. Click "Get Bronze"
2. Use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVV: `123`
3. Complete payment

Check:
- [ ] Redirects to Yoco payment page
- [ ] Payment completes successfully
- [ ] Redirects to registration page
- [ ] Registration form appears

### **5.3 Test Registration**

On registration page:
- [ ] Enter test email (your email)
- [ ] Enter name
- [ ] Click "Create My Account"
- [ ] See success message
- [ ] Credentials displayed
- [ ] Referral link shown

### **5.4 Verify Database**

Check phpMyAdmin:
- [ ] `payment_sessions` has new record
- [ ] `users` table has new user
- [ ] Referral code generated

### **5.5 Test Referral Tracking**

Visit: `https://z2blegacybuilders.co.za/app/landing-page.html?ref=TESTREF123`

Complete payment and registration

Check database:
- [ ] `payment_sessions.referral_code` = 'TESTREF123'
- [ ] `users.referred_by` = 'TESTREF123'

### **5.6 Test Email (if configured)**

- [ ] Check inbox for welcome email
- [ ] Verify credentials received
- [ ] Check referral link works

---

## 🔒 **STEP 6: SECURITY (5 minutes)**

### **6.1 File Permissions**

Via FTP or cPanel:
```
config/database.php → 600 (read/write owner only)
config/yoco.php → 600
includes/ → 755
api/ → 755
```

### **6.2 Create/Update .htaccess**

In `public_html/.htaccess`:
```apache
# Protect config files
<FilesMatch "^(database|yoco)\.php$">
  Order allow,deny
  Deny from all
</FilesMatch>

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

- [ ] .htaccess created
- [ ] Config files protected
- [ ] HTTPS redirect working

---

## 🎯 **STEP 7: GO LIVE! (5 minutes)**

### **7.1 Switch to LIVE Mode**

**On Server:** Edit `config/yoco.php`

Replace test keys with LIVE keys:
```php
define('YOCO_SECRET_KEY', 'sk_live_YOUR_LIVE_KEY');
define('YOCO_PUBLIC_KEY', 'pk_live_YOUR_LIVE_KEY');
```

### **7.2 Final Live Test**

**IMPORTANT:** Use a REAL card for small amount!

1. Visit landing page
2. Click "Get Bronze" (R480)
3. Use real card
4. Complete payment
5. Verify registration works

- [ ] Live payment successful
- [ ] Registration completed
- [ ] Email received
- [ ] User account created

### **7.3 Monitor**

Check for first 24 hours:
- [ ] Payment confirmations working
- [ ] Emails sending
- [ ] Webhook receiving updates
- [ ] No errors in logs

---

## 📊 **POST-DEPLOYMENT MONITORING**

### **Daily (First Week)**
- [ ] Check error logs (`public_html/error_log`)
- [ ] Verify payments in Yoco portal
- [ ] Check user registrations in database
- [ ] Monitor email delivery

### **Weekly**
- [ ] Database backup
- [ ] Review referral tracking
- [ ] Check commission calculations
- [ ] File backup

---

## 🆘 **TROUBLESHOOTING**

### **Page shows blank/white screen**
- Check PHP error logs
- Verify file permissions
- Check database connection

### **Payments not working**
- Verify Yoco API keys are correct (live not test)
- Check API endpoints are accessible
- Review error logs

### **Emails not sending**
- Test hosting allows mail() function
- Check spam folder
- Verify email addresses are correct
- Consider SMTP if mail() fails

### **Referral not tracked**
- Check JavaScript console for errors
- Verify URL parameter format: `?ref=CODE`
- Check database column exists

---

## ✅ **DEPLOYMENT COMPLETE!**

When all checkboxes are ticked above, your system is LIVE! 🎉

### **Your Live URLs:**
- Landing Page: `https://z2blegacybuilders.co.za/app/landing-page.html`
- Webhook: `https://z2blegacybuilders.co.za/api/yoco-webhook.php`

### **Admin Access:**
- cPanel: `https://z2blegacybuilders.co.za:2083`
- phpMyAdmin: Usually linked in cPanel
- Yoco Portal: `https://portal.yoco.com`

---

## 📞 **NEED HELP?**

If you get stuck on any step:
1. Check `DEPLOY_TO_PRODUCTION.md` for detailed instructions
2. Review error logs on server
3. Contact your hosting support
4. Check Yoco documentation

**All your files are ready in:** `C:\Users\Manana\Z2B\Z2B-v21\`

---

**Good luck with your deployment! 🚀**
