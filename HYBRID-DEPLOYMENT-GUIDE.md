# Z2B Legacy Builders - Hybrid Deployment Guide
## Preserving Backend While Deploying React Frontend

## 🎯 Your Setup (Hybrid Architecture)

**Frontend:** React PWA (what we're deploying)
**Backend:**
- PHP payment API at `/payment-api/`
- Railway/Node.js API at `/api/`
- Existing HTML pages (income.html, marketplace.html, tier-upgrade-payment.html)

## ⚠️ CRITICAL: DO NOT OVERWRITE THESE FOLDERS

When deploying, you MUST preserve these existing files/folders:
- ✅ `payment-api/` (PHP payment processing)
- ✅ `api/` or `backend/` (Railway backend)
- ✅ `income.html`
- ✅ `marketplace.html`
- ✅ `tier-upgrade-payment.html`
- ✅ Any `.htaccess` rules for API routing

## 📋 Safe Deployment Steps

### Step 1: Backup Everything (CRITICAL!)

```bash
# In cPanel File Manager:
1. Navigate to public_html
2. Select ALL files
3. Click "Compress" → Create "backup-YYYY-MM-DD.zip"
4. Download the backup to your local machine
5. Store it safely!
```

### Step 2: Document Current Structure

Before deploying, note your current folder structure:
```
public_html/
├── index.html (OLD - will be replaced)
├── payment-api/ (KEEP - PHP backend)
├── api/ (KEEP - Railway backend)
├── income.html (KEEP)
├── marketplace.html (KEEP)
├── tier-upgrade-payment.html (KEEP)
├── assets/ (OLD - will be replaced)
└── .htaccess (MERGE - see Step 4)
```

### Step 3: Deploy React App (Selective Upload)

**Option A: Manual Selective Upload (SAFEST)**

1. Login to cPanel → File Manager
2. Navigate to `public_html`
3. **DO NOT delete everything!**
4. Upload ONLY these files from your `build` folder:
   - `index.html` (replace old one)
   - `manifest.json`
   - `robots.txt`
   - `asset-manifest.json`
   - `favicon.ico`
   - All PWA icon files (z2b-*.png)
   - **ENTIRE `static/` folder** (CSS, JS, media)

5. **SKIP uploading if these already exist:**
   - `payment-api/`
   - `api/`
   - `income.html`
   - `marketplace.html`
   - `tier-upgrade-payment.html`

**Option B: Upload ZIP, Then Restore Backend (More Work)**

1. Upload `z2b-deployment.zip` to a temporary folder (e.g., `temp-react-app/`)
2. Extract it there
3. Move React files from `temp-react-app/` to `public_html/` (but skip backend folders)
4. Delete `temp-react-app/`

### Step 4: Merge .htaccess Files (IMPORTANT!)

Your current `.htaccess` likely has routing rules for your API. You need to MERGE, not replace.

**Current .htaccess (example):**
```apache
# API routing (KEEP THIS!)
RewriteRule ^api/(.*)$ api/index.php?path=$1 [L,QSA]
RewriteRule ^payment-api/(.*)$ payment-api/$1 [L,QSA]
```

**New React .htaccess (from build folder):**
```apache
# React Router (ADD THIS!)
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**MERGED .htaccess (what you need):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # API routing (EXISTING - KEEP THIS!)
  RewriteRule ^api/(.*)$ api/index.php?path=$1 [L,QSA]
  RewriteRule ^payment-api/(.*)$ payment-api/$1 [L,QSA]

  # Preserve existing HTML pages
  RewriteRule ^income\.html$ - [L]
  RewriteRule ^marketplace\.html$ - [L]
  RewriteRule ^tier-upgrade-payment\.html$ - [L]

  # React Router (NEW - ADD THIS!)
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api/
  RewriteCond %{REQUEST_URI} !^/payment-api/
  RewriteRule . /index.html [L]
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/javascript
</IfModule>
```

### Step 5: Verify Backend Still Works

After deployment, test:

1. **React Frontend:**
   - https://www.z2blegacybuilders.co.za (should show new React app)
   - Navigation works
   - All pages load

2. **Existing HTML Pages:**
   - https://www.z2blegacybuilders.co.za/income.html
   - https://www.z2blegacybuilders.co.za/marketplace.html
   - https://www.z2blegacybuilders.co.za/tier-upgrade-payment.html

3. **Backend APIs:**
   - Test payment processing
   - Test any API endpoints

## 🔧 API Configuration

The React app is configured to use:
- **PHP Payment API:** `https://www.z2blegacybuilders.co.za/payment-api/`
- **Railway/Main API:** `https://www.z2blegacybuilders.co.za/api/`

These are set in:
- `.env.production` file
- `src/config/api.js` file

## 📁 Final Folder Structure

After successful deployment:
```
public_html/
├── index.html (NEW - React app entry)
├── manifest.json (NEW - PWA config)
├── robots.txt (NEW - SEO)
├── asset-manifest.json (NEW)
├── favicon.ico (NEW)
├── z2b-*.png (NEW - PWA icons)
├── static/ (NEW - React bundles)
│   ├── css/
│   ├── js/
│   └── media/
├── payment-api/ (PRESERVED - PHP backend)
├── api/ (PRESERVED - Railway backend)
├── income.html (PRESERVED)
├── marketplace.html (PRESERVED)
├── tier-upgrade-payment.html (PRESERVED)
└── .htaccess (MERGED - both React and API routing)
```

## 🚨 Troubleshooting

### Issue: Backend APIs return 404
**Cause:** .htaccess routing is wrong
**Solution:** Check .htaccess has API routing rules BEFORE React routing

### Issue: Existing HTML pages don't load
**Cause:** React router is catching all routes
**Solution:** Add exclusion rules in .htaccess (see merged version above)

### Issue: Payment processing broken
**Cause:** payment-api/ folder was overwritten
**Solution:** Restore from backup, then redeploy carefully

## ✅ Post-Deployment Checklist

- [ ] React app loads at root URL
- [ ] Navigation works in React app
- [ ] Milestone 1 & 2 save to localStorage
- [ ] income.html loads correctly
- [ ] marketplace.html loads correctly
- [ ] tier-upgrade-payment.html loads correctly
- [ ] Payment API responds (test with curl or Postman)
- [ ] Railway API responds (if applicable)
- [ ] Side menu external links work
- [ ] Clear browser cache and test again

## 💡 Pro Tips

1. **Always test in staging first** (if you have a staging subdomain)
2. **Keep multiple backups** before major deployments
3. **Document your .htaccess changes** for future reference
4. **Test payment flows thoroughly** after deployment
5. **Monitor error logs** in cPanel for first 24 hours

---

**Need help?** Check cPanel error logs or contact hosting support if issues persist.
