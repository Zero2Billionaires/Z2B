# Z2B Localhost Setup Guide

**Current Status:** ❌ No MySQL/PHP server detected
**What You Need:** XAMPP (Apache + MySQL + PHP + phpMyAdmin)

---

## 🔍 What I Found

Your system has:
- ✅ Python web server running on port 8000
- ✅ Node.js installed and working
- ❌ **MISSING:** MySQL database server
- ❌ **MISSING:** PHP server
- ❌ **MISSING:** phpMyAdmin (web interface for database)

Your code expects:
- Database: `z2b_legacy`
- MySQL on: `localhost:3306`
- Username: `root`
- Password: (empty)

---

## 🎯 SOLUTION: Install XAMPP (15 minutes)

XAMPP gives you everything in one package:
- ✅ Apache web server (replaces Python server)
- ✅ MySQL database
- ✅ PHP
- ✅ phpMyAdmin (web database manager)

---

## 📥 Step 1: Download XAMPP

1. **Go to:** https://www.apachefriends.org/download.html

2. **Download:** XAMPP for Windows (latest version with PHP 8.2 or 8.1)
   - File size: ~150 MB
   - File name: `xampp-windows-x64-8.2.x-installer.exe`

3. **Save** to your Downloads folder

---

## 🔧 Step 2: Install XAMPP

1. **Run** the downloaded installer
2. **Select components** (keep defaults checked):
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ phpMyAdmin
   - ⬜ FileZilla (uncheck - not needed)
   - ⬜ Mercury (uncheck - not needed)
   - ⬜ Tomcat (uncheck - not needed)

3. **Installation folder:** `C:\xampp` (recommended default)

4. **Click** "Next" through the installer

5. **Uncheck** "Learn more about Bitnami" at the end

6. **Finish** installation

---

## 🚀 Step 3: Start XAMPP Services

1. **Find** XAMPP Control Panel:
   - Press Windows Key
   - Type: `xampp`
   - Click: "XAMPP Control Panel"
   - *(Or find it at: `C:\xampp\xampp-control.exe`)*

2. **Start** these services (click "Start" button for each):
   - ✅ **Apache** (web server)
   - ✅ **MySQL** (database)

3. **Check** they turn GREEN with "Running" status

**Important:** If you get "Port 80 blocked" error:
- Click "Config" button (top right)
- Select "Service and Port Settings"
- Change Apache Main Port from 80 to 8080
- Click "Save"
- Try starting Apache again

---

## 🗄️ Step 4: Create Database

1. **Open** your web browser

2. **Go to:** http://localhost/phpmyadmin
   *(If you changed to port 8080: http://localhost:8080/phpmyadmin)*

3. **Click** "New" in the left sidebar

4. **Database name:** `z2b_legacy`

5. **Collation:** `utf8mb4_unicode_ci`

6. **Click** "Create"

---

## 📁 Step 5: Move Your Z2B Files

You have two options:

### Option A: Use XAMPP's htdocs folder (RECOMMENDED)

1. **Copy** your entire Z2B folder:
   ```
   FROM: C:\Users\Manana\Z2B\Z2B-v21
   TO:   C:\xampp\htdocs\Z2B-v21
   ```

2. **Access** your site at:
   ```
   http://localhost/Z2B-v21/app/coach-manlaw.html
   ```

### Option B: Keep files where they are (Advanced)

1. **Open:** `C:\xampp\apache\conf\extra\httpd-vhosts.conf`

2. **Add** at the end:
   ```apache
   <VirtualHost *:80>
       DocumentRoot "C:/Users/Manana/Z2B/Z2B-v21"
       ServerName z2b.local
       <Directory "C:/Users/Manana/Z2B/Z2B-v21">
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

3. **Restart** Apache in XAMPP Control Panel

---

## ✅ Step 6: Verify Everything Works

### Test 1: Check Apache
Open browser: http://localhost
**Expected:** XAMPP welcome page

### Test 2: Check phpMyAdmin
Open browser: http://localhost/phpmyadmin
**Expected:** phpMyAdmin login page (click "Go" without password)

### Test 3: Check Database
In phpMyAdmin left sidebar:
**Expected:** See `z2b_legacy` database

### Test 4: Check PHP
Create file: `C:\xampp\htdocs\test.php`
```php
<?php
phpinfo();
?>
```
Open: http://localhost/test.php
**Expected:** PHP configuration page

---

## 🗄️ Step 7: Run Database Migration

Now that MySQL is running:

1. **Open** phpMyAdmin: http://localhost/phpmyadmin

2. **Click** `z2b_legacy` database in left sidebar

3. **Click** "SQL" tab at the top

4. **Open** this file in Notepad:
   ```
   C:\Users\Manana\Z2B\Z2B-v21\database\migrations\create_coach_activity_responses.sql
   ```

5. **Copy ALL** the contents (Ctrl+A, Ctrl+C)

6. **Paste** into the SQL box in phpMyAdmin

7. **Click** "Go" button at bottom right

8. **Expected:** ✅ "MySQL returned an empty result set"

9. **Verify:** Click "Structure" tab, you should see table: `coach_activity_responses`

---

## 🎯 Step 8: Update Your Startup Process

### Old Way (Python + Node):
- ❌ `START_FULL.bat` (Python server)
- ❌ Runs on http://localhost:8000

### New Way (XAMPP):
1. **Start** XAMPP Control Panel
2. **Click** "Start" for Apache and MySQL
3. **Open** http://localhost/Z2B-v21/app/coach-manlaw.html

### Optional: Create New Startup Script

I can create a new `START_XAMPP.bat` that:
- Starts XAMPP services automatically
- Opens your default browser to the right page

---

## 📊 Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| **Your Z2B Site** | http://localhost/Z2B-v21/ | Main application |
| **phpMyAdmin** | http://localhost/phpmyadmin | Database management |
| **XAMPP Control** | C:\xampp\xampp-control.exe | Start/stop services |

### Database Credentials:
- **Host:** localhost
- **Database:** z2b_legacy
- **Username:** root
- **Password:** (leave empty)
- **Port:** 3306

---

## 🐛 Troubleshooting

### Problem: "Port 80 already in use"
**Solution:**
- Another program is using port 80 (maybe Skype, IIS, or another web server)
- Change Apache to port 8080 (see Step 3)
- Or close the other program

### Problem: "MySQL won't start"
**Solution:**
- Port 3306 might be in use
- In XAMPP Control, click "Config" for MySQL
- Change port to 3307
- Update `config/database.php`: `define('DB_HOST', 'localhost:3307');`

### Problem: "Access Forbidden" when accessing Z2B files
**Solution:**
- Files must be in `C:\xampp\htdocs\` folder
- Or configure virtual host (Option B in Step 5)

### Problem: "Database connection failed"
**Solution:**
- Check MySQL is running (green in XAMPP Control)
- Check database name is `z2b_legacy`
- Check credentials match in `config/database.php`

---

## 🎉 Success Checklist

After completing all steps, you should have:

- ✅ XAMPP installed and running
- ✅ Apache (green, running)
- ✅ MySQL (green, running)
- ✅ phpMyAdmin accessible
- ✅ Database `z2b_legacy` created
- ✅ Table `coach_activity_responses` created
- ✅ Z2B site accessible at http://localhost/Z2B-v21/
- ✅ Activity submissions working!

---

## 🚀 Next Steps After XAMPP Setup

1. Run the migration (Step 7 above)
2. Test Coach Manlaw activity submission
3. Configure remaining security items
4. Test all Z2B features

---

**Need help?** Follow these steps in order. Each step builds on the previous one.

**Estimated Time:** 15-20 minutes for complete setup
