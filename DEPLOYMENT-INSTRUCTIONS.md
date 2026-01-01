# Z2B Legacy Builders - cPanel Deployment Instructions

## Package Contents
Your deployment package is ready! The `build` folder contains all optimized production files.

## Deployment Steps for cPanel

### Option 1: Using File Manager (Recommended for cPanel)

1. **Login to cPanel**
   - Go to https://www.z2blegacybuilders.co.za/cpanel
   - Enter your credentials

2. **Navigate to File Manager**
   - Click on "File Manager" in the Files section
   - Navigate to `public_html` directory

3. **Backup Existing Files (IMPORTANT)**
   - Select all existing files in `public_html`
   - Click "Compress" and create a backup (e.g., `backup-old-site.zip`)
   - Download the backup to your local machine

4. **Clear public_html**
   - Delete all existing files in `public_html` (after backup!)
   - Keep the folder empty

5. **Upload New Files**

   **Method A: Upload the zip file**
   - Upload `z2b-deployment.zip` to `public_html`
   - Right-click the zip file and select "Extract"
   - Delete the zip file after extraction

   **Method B: Upload files directly**
   - Click "Upload" button
   - Navigate to your local `build` folder
   - Select ALL files and folders inside the build folder
   - Upload them to `public_html`

6. **Verify .htaccess File**
   - Make sure `.htaccess` file is in `public_html`
   - If you don't see it, click "Settings" in File Manager and enable "Show Hidden Files"
   - The `.htaccess` file is crucial for React Router to work properly

7. **Set Permissions**
   - All files should be 644
   - All folders should be 755
   - The `.htaccess` file should be 644

### Option 2: Using FTP

1. **Use an FTP Client** (FileZilla, Cyberduck, etc.)
   - Host: ftp.z2blegacybuilders.co.za
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21

2. **Navigate to public_html**

3. **Backup existing files** (download them to local machine)

4. **Delete old files** from public_html

5. **Upload all contents** from the `build` folder to `public_html`

## Important Files Included

### .htaccess
This file enables:
- React Router to work properly (URL routing)
- Browser caching for better performance
- GZIP compression for faster loading

### Build Structure
```
build/
├── .htaccess (routing & performance)
├── index.html (main entry point)
├── manifest.json (PWA config)
├── robots.txt (SEO)
├── asset-manifest.json
├── favicon.ico
├── static/
│   ├── css/ (stylesheets)
│   ├── js/ (JavaScript bundles)
│   └── media/ (images, logos)
└── z2b-*.png (PWA icons)
```

## Post-Deployment Checklist

1. **Test the Website**
   - Visit https://www.z2blegacybuilders.co.za
   - Test all navigation menu items
   - Test the About dropdown (About Z2B, Meet Coach Manlaw, Success Stories)
   - Test Milestone 1 (Vision Board)
   - Test Milestone 2 (Skills Assessment)
   - Test Membership Tiers page
   - Test Ecosystem page

2. **Test External Links**
   - Income Tracker (side menu)
   - Marketplace (side menu)
   - Upgrade Tier (side menu)

3. **Clear Browser Cache**
   - Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in browser settings

4. **Test on Mobile**
   - Check responsive design
   - Test hamburger menu
   - Verify images load properly

## Troubleshooting

### Issue: Blank page or "Cannot GET" error
**Solution:** Make sure `.htaccess` file is uploaded and in the root of `public_html`

### Issue: Images not loading
**Solution:**
- Check that the `static` folder uploaded correctly
- Verify all image files are in `static/media/`
- Check file permissions (should be 644)

### Issue: CSS not loading properly
**Solution:**
- Clear browser cache
- Check that `static/css/` folder uploaded correctly
- Verify files have correct permissions

### Issue: Navigation not working
**Solution:**
- Verify `.htaccess` is present and correct
- Make sure mod_rewrite is enabled (ask hosting support if needed)

## Environment Notes

- **Production Build:** Optimized for performance
- **File Size:** All JavaScript and CSS are minified
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Responsive:** Fully responsive design

## Build Information

- Build Date: December 31, 2024
- React Version: 18.3.1
- Node Version: Compatible with Node 14+
- Total Bundle Size: ~160 KB (gzipped)

## Need Help?

If you encounter any issues:
1. Check cPanel error logs (Errors section in cPanel)
2. Verify all files uploaded correctly
3. Ensure .htaccess is present and readable
4. Contact your hosting support if needed

---

**Your Z2B Legacy Builders platform is now ready for production deployment!**
