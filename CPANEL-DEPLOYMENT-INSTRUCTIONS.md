# 🚀 Z2B React App - cPanel Deployment Guide

## 📦 Deployment Package Ready!

**File:** `z2b-cpanel-deployment.zip` (2.8 MB)
**Location:** `C:\Users\Manana\Documents\z2b-table\z2b-cpanel-deployment.zip`

---

## 🔧 cPanel Deployment Steps

### **Step 1: Access cPanel File Manager**

1. Log in to your cPanel at: `https://yourdomain.com/cpanel`
2. Navigate to **File Manager** (under "Files" section)
3. Go to `public_html` directory (this is your web root)

---

### **Step 2: Backup Old Files (IMPORTANT!)**

Before replacing files:

1. In `public_html`, select all files
2. Click **Compress** → Choose "Zip Archive"
3. Name it: `z2b-backup-YYYY-MM-DD.zip`
4. Download this backup to your computer for safety

---

### **Step 3: Clear Old React Files**

**Option A: Clean Slate (Recommended)**
1. Delete ALL files in `public_html` (except `.htaccess` if you have custom rules)

**Option B: Keep Non-React Files**
- Only delete React-related files: `index.html`, `manifest.json`, `asset-manifest.json`, `/static` folder

---

### **Step 4: Upload New Build**

1. Click **Upload** button in File Manager
2. Select `z2b-cpanel-deployment.zip` from your computer
3. Wait for upload to complete (shows 100%)
4. Go back to File Manager

---

### **Step 5: Extract Files**

1. Right-click on `z2b-cpanel-deployment.zip`
2. Click **Extract**
3. Extract to: `/public_html/` (current directory)
4. Click **Extract Files**
5. Wait for extraction to complete
6. Delete `z2b-cpanel-deployment.zip` (cleanup)

---

### **Step 6: Create/Update .htaccess File**

This is **CRITICAL** for React Router to work!

1. In `public_html`, check if `.htaccess` exists
2. If not, click **+ File** and create `.htaccess`
3. Right-click `.htaccess` → **Edit**
4. Paste this code:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l

  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Gzip Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

5. Click **Save Changes**

---

### **Step 7: Verify File Structure**

Your `public_html` should now look like this:

```
public_html/
├── .htaccess (created in Step 6)
├── index.html
├── manifest.json
├── asset-manifest.json
├── favicon.ico
├── z2b-apple-icon.png
├── z2b-icon-192.png
├── z2b-icon-512.png
├── robots.txt
└── static/
    ├── css/
    │   └── main.5b5515cc.css
    ├── js/
    │   ├── main.38375d45.js
    │   ├── 239.1369d195.chunk.js
    │   └── 453.e4b512da.chunk.js
    └── media/
        └── (image files)
```

---

### **Step 8: Test Your Deployment**

1. Open your browser (use Incognito/Private mode to avoid cache)
2. Navigate to: `https://www.z2blegacybuilders.co.za`
3. Test these features:

**✅ Navigation Tests:**
- [ ] Click "Home" - should load without #hash in URL
- [ ] Click "Opportunity" - should navigate cleanly
- [ ] Click "Membership Tiers" - should show tiers
- [ ] Click "TLI Challenge" - should open TLI page
- [ ] Click ⚡ icon (Quick Access) → "Milestones & Goals" - should open Milestone Tracker
- [ ] Click ⚡ icon → "Income Tracker" - should open Income Tracker (NOT old URL)

**✅ Functionality Tests:**
- [ ] Click "Join Z2B Now" on Home page - should go to Membership Tiers
- [ ] Select a tier on Membership Tiers page - should open Payment Processing page
- [ ] Click "Set SMART Goal" on TLI Challenge - modal should appear
- [ ] Check for NO duplicate "Members Login" menu

**✅ Ecosystem Test:**
- [ ] Navigate to Ecosystem page
- [ ] Features should be LEFT-aligned (not centered)
- [ ] Checkmarks (✓) should appear before each feature

---

### **Step 9: Clear Browser Cache (If Issues)**

If the site doesn't look right:

1. **Hard Refresh:**
   - Chrome/Firefox/Edge: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Safari: `Cmd + Option + R`

2. **Clear All Cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data
   - Check: Cached images and files

3. **Test in Incognito/Private Window**

---

## 🔍 Troubleshooting

### **Problem: Blank page or errors**

**Solution:**
1. Check browser console for errors (F12 → Console tab)
2. Verify `.htaccess` file is correct
3. Check File Permissions:
   - Files: 644
   - Folders: 755
   - Right-click in File Manager → **Change Permissions**

---

### **Problem: 404 errors on refresh**

**Solution:**
- `.htaccess` file is missing or incorrect
- Follow Step 6 again carefully
- Make sure `mod_rewrite` is enabled on your server (most cPanel hosts have this)

---

### **Problem: Old site still showing**

**Solution:**
1. Clear browser cache (Ctrl + Shift + R)
2. Wait 5-10 minutes for CDN/cache to clear
3. Test in Incognito mode
4. Check if old files are still in `public_html`

---

### **Problem: Images not loading**

**Solution:**
1. Verify `static/media/` folder exists and has images
2. Check File Permissions (should be 644)
3. Re-upload the zip and extract again

---

### **Problem: "Members Login" appears twice**

**Solution:**
- This was fixed in the latest build
- Make sure you uploaded the LATEST `z2b-cpanel-deployment.zip`
- If still appears, clear cache completely

---

## 📱 Mobile Testing

After deployment, test on mobile:

1. **iPhone/iPad:** Safari browser
2. **Android:** Chrome browser
3. Check responsive layout
4. Test navigation menu (hamburger icon)
5. Test touch interactions

---

## 🔐 SSL/HTTPS Setup (If Not Already Enabled)

For secure connections:

1. In cPanel, go to **SSL/TLS Status**
2. Click **Run AutoSSL** (if available)
3. Or install **Let's Encrypt Free SSL**
4. Force HTTPS by adding to `.htaccess` (at the top):

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 🎯 Post-Deployment Checklist

- [ ] Site loads at www.z2blegacybuilders.co.za
- [ ] All navigation working (no hash URLs)
- [ ] Sign Up buttons visible and working
- [ ] Payment page opens when tier selected
- [ ] TLI SMART Goal modal works
- [ ] Milestone Tracker accessible
- [ ] Income Tracker internal (not old URL)
- [ ] No duplicate login menus
- [ ] Ecosystem features left-aligned
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] No console errors (F12)

---

## 📞 Need Help?

If you encounter issues:

1. **Check cPanel Error Logs:**
   - cPanel → Metrics → Errors

2. **Browser Console:**
   - F12 → Console tab
   - Screenshot any errors

3. **File Permissions:**
   - All files: 644
   - All folders: 755

---

## 🎉 Success!

Once all tests pass, your Z2B React app is live with:
- ✅ 11 functional fixes implemented
- ✅ No old URL dependencies
- ✅ Payment processing integration
- ✅ Milestone & Income tracking
- ✅ Proper navigation throughout

**Congratulations! Your app is deployed!** 🚀

---

**Build Date:** January 1, 2026
**Build Version:** 8fe9946
**Main JS:** 116.19 kB
**Main CSS:** 17.92 kB
