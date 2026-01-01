# Z2B Legacy Builders Platform v21 - Deployment Guide

## 🚀 **QUICK DEPLOYMENT STEPS**

### **Prerequisites**
- PHP 7.4+ with MySQL support
- MySQL 5.7+ or MariaDB 10.3+
- Apache/Nginx web server
- SSL certificate (for production)
- Yoco payment gateway account

---

## 📋 **STEP-BY-STEP DEPLOYMENT**

### **Step 1: Database Setup**
```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE z2b_legacy;
EXIT;

# 2. Import schema
mysql -u root -p z2b_legacy < sql/z2b_complete_schema.sql
```

### **Step 2: Configuration**
1. Edit `config/database.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'z2b_legacy');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
```

2. Create `config/yoco.php`:
```php
<?php
define('YOCO_SECRET_KEY', 'sk_live_YOUR_KEY');
define('YOCO_PUBLIC_KEY', 'pk_live_YOUR_KEY');
define('YOCO_WEBHOOK_SECRET', 'YOUR_WEBHOOK_SECRET');
```

3. Update `config/database.php` encryption key:
```php
define('ENCRYPTION_KEY', 'generate_32_character_random_key');
```

### **Step 3: File Permissions**
```bash
# Set proper permissions
chmod 755 -R /path/to/Z2B-v21/
chmod 777 uploads/
chmod 777 logs/
```

### **Step 4: Apache Configuration**
```apache
<VirtualHost *:443>
    ServerName z2blegacybuilders.co.za
    DocumentRoot /var/www/Z2B-v21

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    <Directory /var/www/Z2B-v21>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/z2b_error.log
    CustomLog ${APACHE_LOG_DIR}/z2b_access.log combined
</VirtualHost>
```

### **Step 5: Create .htaccess**
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# API routing
RewriteRule ^api/(.*)$ api/$1.php [L,QSA]

# Security headers
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"

# Block access to sensitive files
<FilesMatch "\.(sql|log|ini)$">
    Order deny,allow
    Deny from all
</FilesMatch>
```

### **Step 6: Cron Jobs Setup**
```bash
# Add to crontab
crontab -e

# Daily billing processing (runs at 2 AM)
0 2 * * * curl -s https://z2blegacybuilders.co.za/api/monthly-refuel.php?action=process-billing

# Hourly notification processing
0 * * * * php /var/www/Z2B-v21/cron/process_notifications.php

# Daily report generation (runs at 1 AM)
0 1 * * * php /var/www/Z2B-v21/cron/generate_reports.php
```

### **Step 7: Admin Account Creation**
```sql
-- Create default admin account
INSERT INTO admin_users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@z2blegacybuilders.co.za',
    '$2y$10$YourHashedPasswordHere', -- Use password_hash('your_password', PASSWORD_DEFAULT)
    'System Administrator',
    'super_admin'
);
```

---

## 🔒 **SECURITY CHECKLIST**

- [ ] Change all default passwords
- [ ] Set DEBUG_MODE to false in production
- [ ] Configure SSL certificate
- [ ] Enable firewall (allow only 80, 443, 22)
- [ ] Set up backup strategy
- [ ] Configure error logging
- [ ] Implement rate limiting
- [ ] Enable CSRF protection
- [ ] Secure file uploads directory
- [ ] Set proper CORS headers

---

## 📊 **MONITORING & MAINTENANCE**

### **Health Check Endpoints**
- System Status: `/api/health.php`
- Database Check: `/api/health.php?check=database`
- Payment Gateway: `/api/health.php?check=payment`

### **Log Files Location**
- Application logs: `/logs/app.log`
- Error logs: `/logs/error.log`
- Payment logs: `/logs/payment.log`
- Coach Manlaw logs: `/logs/ai_coach.log`

### **Backup Strategy**
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p z2b_legacy > /backups/z2b_backup_$DATE.sql
find /backups -name "*.sql" -mtime +30 -delete
```

---

## 🎯 **POST-DEPLOYMENT TESTING**

### **1. Core Functionality Tests**
- [ ] Member registration and login
- [ ] Payment processing (test mode first)
- [ ] Coach Manlaw interaction
- [ ] Marketplace product creation
- [ ] Commission calculations
- [ ] Monthly refuel subscription

### **2. Admin Panel Tests**
- [ ] Admin login
- [ ] Member management
- [ ] Product approval workflow
- [ ] Payout processing
- [ ] Report generation

### **3. Performance Tests**
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] Database query optimization
- [ ] CDN configuration for assets

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues & Solutions**

**1. Database Connection Failed**
```bash
# Check MySQL service
sudo systemctl status mysql
# Verify credentials
mysql -u your_user -p -h localhost z2b_legacy
```

**2. Payment Gateway Not Working**
- Verify API keys in `config/yoco.php`
- Check webhook URL configuration
- Ensure SSL is properly configured

**3. Coach Manlaw Not Responding**
- Check PHP memory limit (minimum 256M)
- Verify database tables exist
- Check error logs for API issues

**4. File Upload Issues**
```bash
# Fix permissions
sudo chown -R www-data:www-data uploads/
sudo chmod 755 uploads/
```

---

## 📞 **SUPPORT CONTACTS**

- **Technical Support**: tech@z2blegacybuilders.co.za
- **Payment Issues**: payments@z2blegacybuilders.co.za
- **General Inquiries**: support@z2blegacybuilders.co.za

---

## 🚀 **LAUNCH CHECKLIST**

### **Pre-Launch (1 week before)**
- [ ] Complete all testing
- [ ] Train admin users
- [ ] Prepare marketing materials
- [ ] Set up monitoring tools
- [ ] Create user documentation

### **Launch Day**
- [ ] Enable production mode
- [ ] Monitor system performance
- [ ] Check all integrations
- [ ] Test with real payments
- [ ] Monitor error logs

### **Post-Launch (First week)**
- [ ] Daily performance monitoring
- [ ] User feedback collection
- [ ] Bug fixes and optimization
- [ ] Backup verification
- [ ] Security audit

---

## 📈 **SCALING CONSIDERATIONS**

### **When you reach 1000+ members:**
1. Implement database read replicas
2. Add Redis caching layer
3. Use CDN for static assets
4. Implement queue system for heavy tasks
5. Consider load balancing

### **Performance Optimization:**
```sql
-- Add these indexes for better performance
CREATE INDEX idx_member_activity ON members(last_login, is_active);
CREATE INDEX idx_transaction_member_date ON transactions(member_id, created_at);
CREATE INDEX idx_product_seller_status ON marketplace_products(seller_id, status);
```

---

## 🎉 **CONGRATULATIONS!**

Your Z2B Legacy Builders Platform v21 is now ready for deployment. This platform includes:

✅ Complete MLM system with 6 income streams
✅ AI Business Coach with hybrid personality
✅ Intelligent Marketplace with pricing algorithms
✅ Monthly refuel subscription system
✅ Comprehensive admin panel
✅ Automated recruiting funnel
✅ Video creator integration
✅ Full commission tracking

**Remember to:**
1. Test thoroughly in staging first
2. Keep regular backups
3. Monitor system performance
4. Collect user feedback
5. Plan for continuous improvement

**Version 21 - Ready to Transform Employees into Entrepreneurs! 🚀**