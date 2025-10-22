# 🚀 DEPLOY Z2B LANDING PAGE TO z2blegacybuilders.co.za

## ✅ PRODUCTION DEPLOYMENT GUIDE

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **What You'll Need:**
- [ ] FTP/SSH access to z2blegacybuilders.co.za
- [ ] Database access (phpMyAdmin or MySQL)
- [ ] Yoco LIVE API keys
- [ ] Email configuration (SMTP or hosting email)

---

## 📁 **FILES TO UPLOAD**

### **Upload these folders/files to your domain's public_html:**

```
public_html/
├── app/
│   └── landing-page.html          ← Main landing page
├── api/
│   ├── create-tier-checkout.php   ← Payment API
│   ├── auto-register.php          ← Registration API
│   └── yoco-webhook.php           ← Webhook handler
├── includes/
│   └── EmailService.php           ← Email system
├── config/
│   ├── database.php               ← Database config
│   └── app.php                    ← Tier configuration
├── payment-success-register.php   ← Success page
├── payment-failed.php             ← Failure page
└── .env                           ← Environment variables
```

---

## 🗄️ **DATABASE SETUP**

### **Step 1: Create Database**

1. Log into **phpMyAdmin** (usually at yourdomain.co.za/phpmyadmin)
2. Click **"New"** to create database
3. Database name: `z2b_legacy` (or your preference)
4. Collation: `utf8mb4_unicode_ci`
5. Click **"Create"**

### **Step 2: Run SQL Scripts**

Copy and paste these SQL commands in phpMyAdmin → SQL tab:

```sql
-- Create payment_sessions table
CREATE TABLE IF NOT EXISTS payment_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(255) NOT NULL UNIQUE,
  tier_code VARCHAR(10) NOT NULL,
  referral_code VARCHAR(255),
  checkout_id VARCHAR(255),
  user_id INT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reference (reference),
  INDEX idx_checkout_id (checkout_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  tier_code VARCHAR(10),
  referral_code VARCHAR(50) UNIQUE,
  referred_by VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_referral_code (referral_code),
  INDEX idx_referred_by (referred_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔑 **CONFIGURATION FILES**

### **File 1: config/database.php**

```php
<?php
/**
 * Production Database Configuration
 */

define('DB_HOST', 'localhost');  // Usually 'localhost' on shared hosting
define('DB_NAME', 'z2b_legacy'); // Your database name
define('DB_USER', 'your_db_user');     // Your cPanel database username
define('DB_PASS', 'your_db_password'); // Your database password
define('DB_CHARSET', 'utf8mb4');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];

    $db = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    die("We're experiencing technical difficulties. Please try again later.");
}
?>
```

### **File 2: config/yoco.php** (CREATE NEW)

```php
<?php
/**
 * Yoco API Configuration - PRODUCTION
 */

// LIVE KEYS - Get from https://portal.yoco.com/settings/keys
define('YOCO_SECRET_KEY', 'sk_live_YOUR_LIVE_SECRET_KEY_HERE');
define('YOCO_PUBLIC_KEY', 'pk_live_YOUR_LIVE_PUBLIC_KEY_HERE');

// Webhook secret for signature verification
define('YOCO_WEBHOOK_SECRET', 'whsec_YOUR_WEBHOOK_SECRET_HERE');
?>
```

---

## 📧 **EMAIL CONFIGURATION**

### **Option A: Use Hosting Email (Easiest)**

Your current `EmailService.php` uses PHP `mail()` which works on most hosting.

**Update in `includes/EmailService.php`:**

```php
public function __construct() {
    $this->fromEmail = 'noreply@z2blegacybuilders.co.za';
    $this->fromName = 'Z2B Legacy Builders';
    $this->replyTo = 'support@z2blegacybuilders.co.za';
}
```

### **Option B: Use SMTP (Recommended for Better Deliverability)**

Add SMTP configuration to EmailService.php using PHPMailer:

```bash
# Install PHPMailer via Composer (if available)
composer require phpmailer/phpmailer
```

---

## 🌐 **YOCO WEBHOOK SETUP**

### **Step 1: Configure in Yoco Portal**

1. Go to: https://portal.yoco.com/settings/webhooks
2. Click **"Add Webhook"**
3. Enter URL: `https://z2blegacybuilders.co.za/api/yoco-webhook.php`
4. Select events:
   - ✅ `checkout.succeeded`
   - ✅ `checkout.completed`
   - ✅ `payment.succeeded`
   - ✅ `checkout.failed`
5. Copy webhook secret
6. Add to `config/yoco.php`

---

## 🔒 **SECURITY SETTINGS**

### **1. Update .htaccess (CREATE if not exists)**

```apache
# Protect sensitive files
<FilesMatch "^\.env$">
  Order allow,deny
  Deny from all
</FilesMatch>

<FilesMatch "^(config|includes)/.*\.php$">
  Order allow,deny
  Deny from all
</FilesMatch>

# Enable HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### **2. File Permissions**

```bash
# Set correct permissions
chmod 644 *.php
chmod 755 api/
chmod 755 includes/
chmod 600 config/*.php
chmod 600 .env
```

---

## 🧪 **TESTING AFTER DEPLOYMENT**

### **Test Checklist:**

1. **Landing Page**
   - Visit: `https://z2blegacybuilders.co.za/app/landing-page.html`
   - ✅ Page loads correctly
   - ✅ All tier buttons visible

2. **Payment Flow**
   - Click "Get Bronze"
   - ✅ Redirects to Yoco payment page
   - ✅ Test with Yoco test card:
     - Card: `4242 4242 4242 4242`
     - Expiry: Any future date
     - CVV: `123`

3. **Registration**
   - Complete payment
   - ✅ Redirects to registration page
   - ✅ Enter email and name
   - ✅ Account created
   - ✅ Credentials displayed

4. **Referral Tracking**
   - Visit: `https://z2blegacybuilders.co.za/app/landing-page.html?ref=TEST123`
   - Click tier button and pay
   - ✅ Check database: referral_code should be 'TEST123'

5. **Email Sending**
   - Complete a test registration
   - ✅ Check email inbox for welcome email
   - ✅ Check for payment confirmation

6. **Webhook**
   - Complete test payment
   - Check Yoco webhook logs in portal
   - ✅ Webhook received
   - ✅ Payment status updated

---

## 📝 **DEPLOYMENT STEPS (DETAILED)**

### **Method 1: FTP Upload (Most Common)**

1. **Download FileZilla** (or use your hosting's file manager)

2. **Connect to your server:**
   - Host: `ftp.z2blegacybuilders.co.za` (or provided by host)
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21

3. **Upload files:**
   ```
   Local (your computer)          →  Remote (server)
   Z2B-v21/app/                   →  public_html/app/
   Z2B-v21/api/                   →  public_html/api/
   Z2B-v21/includes/              →  public_html/includes/
   Z2B-v21/config/                →  public_html/config/
   Z2B-v21/payment-success-*.php  →  public_html/
   Z2B-v21/payment-failed.php     →  public_html/
   ```

4. **Update config files** on server:
   - Edit `config/database.php` (add real database credentials)
   - Create `config/yoco.php` (add live API keys)
   - Update `includes/EmailService.php` (set production email)

### **Method 2: cPanel File Manager**

1. Log into cPanel
2. Open **File Manager**
3. Navigate to `public_html`
4. Click **Upload**
5. Upload the files/folders listed above
6. Edit config files using built-in editor

---

## 🎯 **POST-DEPLOYMENT CONFIGURATION**

### **1. Update Email Service**

Edit `includes/EmailService.php` on server:

```php
// Line 8-11
$this->fromEmail = 'noreply@z2blegacybuilders.co.za';
$this->fromName = 'Z2B Legacy Builders';
$this->replyTo = 'support@z2blegacybuilders.co.za';
```

### **2. Configure Database**

Edit `config/database.php` on server:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'username_z2blegacy'); // Often prefixed with username
define('DB_USER', 'username_z2buser');   // Your actual DB user
define('DB_PASS', 'your_secure_password'); // Your actual DB password
```

### **3. Add Yoco Live Keys**

Create `config/yoco.php` on server with your live keys from Yoco portal.

---

## ⚠️ **IMPORTANT NOTES**

### **1. Switch to LIVE Mode**

When ready for real payments:
- Replace test keys with live keys in `config/yoco.php`
- Test with small real payment first
- Monitor first few transactions closely

### **2. Email Testing**

Before live launch:
- Send test emails to yourself
- Check spam folder
- Verify all links work
- Confirm formatting looks good

### **3. Database Backups**

Set up automatic backups:
- Daily database backups
- Weekly file backups
- Store offsite (Google Drive, Dropbox)

### **4. Monitoring**

Monitor these files for errors:
- `error_log` (PHP errors)
- Apache error logs
- Yoco webhook logs in portal

---

## 🆘 **TROUBLESHOOTING**

### **Payment not working?**
- Check Yoco API keys are correct
- Verify database connection
- Check PHP error logs
- Ensure `api/` folder has execute permissions

### **Emails not sending?**
- Check hosting allows `mail()` function
- Verify email addresses are correct
- Check spam folder
- Consider SMTP if mail() doesn't work

### **Referral tracking not working?**
- Check if JavaScript is enabled
- Verify localStorage is working
- Check database has referral_code column
- Test with `?ref=TEST` in URL

### **Webhook not receiving?**
- Verify webhook URL in Yoco portal
- Check webhook endpoint is accessible
- Review Yoco webhook logs
- Check server error logs

---

## 📞 **SUPPORT RESOURCES**

### **Hosting Support:**
- Contact your hosting provider for:
  - Database credentials
  - FTP/SSH access
  - Email configuration
  - File permissions

### **Yoco Support:**
- Portal: https://portal.yoco.com
- Support: support@yoco.com
- Docs: https://developer.yoco.com

### **Your Files:**
- All production-ready files are in: `C:\Users\Manana\Z2B\Z2B-v21\`
- Tested locally on XAMPP ✓
- Database structure ready ✓
- All features working ✓

---

## ✅ **DEPLOYMENT SUMMARY**

**Steps:**
1. Upload files via FTP
2. Create database and run SQL
3. Update config files (database, yoco, email)
4. Configure Yoco webhook
5. Test payment flow
6. Switch to live mode when ready

**Your system includes:**
- ✅ Payment processing
- ✅ Auto-registration
- ✅ Referral tracking
- ✅ Email notifications
- ✅ Webhook automation

**Everything is ready for production! 🚀**

---

**Questions? Need help with deployment? Let me know!**
