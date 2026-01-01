# Z2B React App - cPanel Deployment Guide

## 🎯 What You're Deploying

Your complete Z2B Legacy Builders React application with:
- ✅ Members Dashboard with 7 income streams
- ✅ Admin Panel with NO-CODE compensation plan editor
- ✅ Public Members Login (visible button)
- ✅ Secret Admin Login (5-click footer access)
- ✅ Password reset for both login types
- ✅ All About pages, Ecosystem, Tiers, etc.
- ✅ Integration with existing Railway + PHP backends

## 📦 Deployment Package Contents

The `build/` folder contains:
- `index.html` - Main React app entry point
- `.htaccess` - Server configuration (preserves API routes)
- `static/` - JavaScript, CSS, and media files
- `manifest.json` - PWA configuration
- Icons and assets

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Backup Current Site

**CRITICAL: Always backup first!**

1. Login to cPanel at your hosting provider
2. Go to **File Manager**
3. Navigate to `public_html` folder
4. Select all files → Click **Compress** → Create `backup-YYYY-MM-DD.zip`
5. Download the backup to your computer

### Step 2: Prepare for Upload

**Two Deployment Options:**

#### Option A: Fresh Install (Recommended if starting new)
1. Delete everything in `public_html` EXCEPT:
   - `/api/` folder (Railway backend)
   - `/payment-api/` folder (PHP payment system)
   - Any `.html` files you want to keep (income.html, marketplace.html, etc.)

#### Option B: Merge with Existing (Recommended for you)
1. Keep all existing folders (`api/`, `payment-api/`, etc.)
2. The React app will coexist with them
3. .htaccess will route properly

### Step 3: Upload Build Files

1. In cPanel File Manager, navigate to `public_html`
2. Click **Upload** button
3. Upload the compressed `z2b-react-deployment.zip` file
4. Wait for upload to complete
5. Right-click the zip file → **Extract**
6. Delete the zip file after extraction

**OR upload files directly:**
1. Select all files from your `build/` folder
2. Drag and drop into `public_html` in cPanel File Manager
3. Confirm overwrite if prompted

### Step 4: Verify .htaccess File

1. In `public_html`, look for `.htaccess` file
2. Click on it → **Edit**
3. Verify it contains the React routing rules
4. Make sure these lines are present:
   ```apache
   RewriteRule ^api/ - [L]
   RewriteRule ^payment-api/ - [L]
   ```

### Step 5: Set Correct Permissions

1. Select all files in `public_html`
2. Click **Permissions** (or **Change Permissions**)
3. Set directories to `755`
4. Set files to `644`
5. Click **Apply to all subdirectories**

### Step 6: Test Your Deployment

**Test these URLs:**

1. **Main Site:**
   - https://www.z2blegacybuilders.co.za/
   - Should load React app homepage

2. **Members Login (PUBLIC):**
   - Click "Members Login" button in navigation
   - Should show login page

3. **Admin Login (SECRET):**
   - Scroll to footer
   - Click "Z2B Legacy Builders" text **5 times**
   - Should navigate to secret admin login

4. **Navigation:**
   - Click Home, About, Ecosystem, Tiers, TLI Challenge
   - All should work without page refresh

5. **Backend APIs:**
   - Login with test credentials
   - Should authenticate with Railway backend

## 🔧 Troubleshooting

### Issue: "404 Not Found" on page refresh

**Solution:**
- .htaccess file is missing or not working
- Check if mod_rewrite is enabled in cPanel
- Contact hosting support to enable mod_rewrite

### Issue: API calls failing

**Solution:**
- Check .env.production is configured correctly
- Verify Railway backend is running
- Check browser console for CORS errors

### Issue: Blank white page

**Solution:**
- Check browser console for errors
- Verify all files uploaded correctly
- Clear browser cache (Ctrl + Shift + R)

### Issue: Admin login not accessible

**Solution:**
- Scroll to very bottom of page
- Click "Z2B Legacy Builders" text 5 times (not the heart ❤️)
- Make sure you're on a public page (not dashboard)

### Issue: CSS not loading

**Solution:**
- Check file permissions (644 for files, 755 for directories)
- Verify `static/` folder uploaded completely
- Clear CDN/caching if enabled

## 🌐 Live URLs After Deployment

**Public Pages:**
- Home: https://www.z2blegacybuilders.co.za/
- About Z2B: https://www.z2blegacybuilders.co.za/about-z2b
- Meet Coach: https://www.z2blegacybuilders.co.za/about-coach
- Ecosystem: https://www.z2blegacybuilders.co.za/ecosystem
- Tiers: https://www.z2blegacybuilders.co.za/tiers
- TLI Challenge: https://www.z2blegacybuilders.co.za/tli

**Members (After Login):**
- Members Login: Click button in navigation
- Dashboard: https://www.z2blegacybuilders.co.za/dashboard (protected)

**Admin (Secret Access):**
- Admin Login: 5-click footer secret
- Admin Panel: https://www.z2blegacybuilders.co.za/admin (protected)

**Legacy Pages (Still Work):**
- https://www.z2blegacybuilders.co.za/income.html
- https://www.z2blegacybuilders.co.za/marketplace.html
- https://www.z2blegacybuilders.co.za/tier-upgrade-payment.html

## 📱 Mobile Testing

Test on mobile devices:
1. Open on phone browser
2. Click hamburger menu (☰)
3. Navigate to different pages
4. Test login functionality
5. Test admin secret (5 clicks on footer)

## 🔐 Security Checklist

After deployment:
- [ ] Test admin 5-click secret works
- [ ] Verify admin role verification (non-admins rejected)
- [ ] Test password reset emails
- [ ] Check SSL certificate is active (https://)
- [ ] Verify API endpoints are secure
- [ ] Test logout functionality
- [ ] Check session timeout

## 📊 Performance Optimization

**Optional but recommended:**
1. Enable Gzip compression (should be in .htaccess)
2. Enable browser caching (should be in .htaccess)
3. Use CDN if available in cPanel
4. Enable OPcache for PHP files

## 🔄 Future Updates

To update the site:
1. Make changes locally
2. Run `npm run build`
3. Upload only changed files from `build/`
4. Or upload full `build/` folder again

## 📞 Support

**If something doesn't work:**
1. Check browser console (F12) for errors
2. Check cPanel error logs
3. Verify .htaccess is correct
4. Contact hosting support for server issues
5. Check Railway backend logs for API errors

---

## ✅ Deployment Complete Checklist

- [ ] Backed up existing site
- [ ] Uploaded all build files
- [ ] .htaccess file present and correct
- [ ] File permissions set (755/644)
- [ ] Main homepage loads
- [ ] Navigation works
- [ ] Members login accessible
- [ ] Admin 5-click secret works
- [ ] Mobile responsive
- [ ] APIs connecting to Railway
- [ ] Legacy HTML pages still work

**Status:** Ready for Production ✅
**Deployment Date:** January 1, 2026
**Build Size:** ~106 KB (gzipped)
