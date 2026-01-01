# How to Backup public_html in cPanel - Step by Step

## Method 1: Using cPanel File Manager (EASIEST)

### Step 1: Login to cPanel
1. Go to your hosting control panel URL (usually one of these):
   - `https://www.z2blegacybuilders.co.za:2083`
   - `https://www.z2blegacybuilders.co.za/cpanel`
   - Or login through your hosting provider's client area

2. Enter your cPanel username and password

### Step 2: Open File Manager
1. Once in cPanel, scroll down to the **"Files"** section
2. Click on **"File Manager"**
   - This will open in a new window/tab

### Step 3: Navigate to public_html
1. In File Manager, look at the left sidebar
2. Click on **"public_html"** folder
   - This is where all your website files are stored
   - You should see files like index.html, folders like payment-api/, etc.

### Step 4: Select All Files
1. Click the checkbox at the top of the file list (next to "Name")
   - This selects ALL files and folders in public_html
   - Or press **Ctrl+A** to select all

2. You should see all files highlighted/selected

### Step 5: Compress (Create ZIP)
1. With all files selected, click the **"Compress"** button at the top toolbar
   - Icon looks like a folder with a zipper

2. A popup window will appear asking for compression settings

3. Choose:
   - **Compression Type:** Zip Archive (recommended)
   - **Compressed Archive Name:** Give it a clear name like:
     - `backup-z2b-before-react-2024-12-31.zip`
     - `backup-public_html-Dec31-2024.zip`
     - `backup-old-site-[current-date].zip`

4. **Important:** The file will be created IN the public_html folder

5. Click **"Compress File(s)"** button

6. Wait for compression to complete (may take 1-2 minutes depending on size)
   - You'll see a progress indicator
   - When done, you'll see "Successfully compressed..."

### Step 6: Download the Backup
1. After compression completes, you'll see the new .zip file in your file list
   - Example: `backup-z2b-before-react-2024-12-31.zip`

2. **RIGHT-CLICK** on the backup .zip file

3. Select **"Download"** from the menu
   - Or select the file and click "Download" button in toolbar

4. Save the file to your local computer
   - Choose a location you'll remember, like:
     - `C:\Backups\Z2B\`
     - Your Desktop
     - Your Documents folder

5. **Wait for download to complete** before proceeding

### Step 7: Verify Your Backup
1. Once downloaded, go to where you saved the file on your computer

2. **Check the file size:**
   - Right-click the .zip file → Properties
   - Should be several MB (at least a few megabytes)
   - If it's only a few KB, something went wrong - redo the backup

3. **Test the backup (OPTIONAL but recommended):**
   - Extract the .zip file to a test folder on your computer
   - Verify you can see all your files inside
   - Look for: payment-api/, api/, income.html, etc.

### Step 8: Keep Multiple Copies
1. Copy the backup file to at least 2 locations:
   - Your computer
   - External hard drive or USB
   - Cloud storage (Google Drive, Dropbox, OneDrive)

2. **DO NOT delete the backup from cPanel yet** (keep it as extra safety)

---

## Method 2: Using cPanel Backup Wizard (FULL BACKUP)

This creates a complete backup of your entire account, not just files.

### Step 1: Access Backup Wizard
1. Login to cPanel
2. Scroll to **"Files"** section
3. Click **"Backup Wizard"**

### Step 2: Backup Type
1. Click **"Backup"** (not Restore)
2. Click **"Next"**

### Step 3: Choose What to Backup
Choose one or more:
- **Full Backup** - Everything (files, databases, emails) - LARGEST
- **Home Directory** - All your files including public_html - RECOMMENDED
- **MySQL Databases** - Just databases (if you have any)
- **Email Forwarders & Filters** - Just email settings

**For your case, choose "Home Directory"**

### Step 4: Download Backup
1. Click **"Generate Backup"**
2. Wait for backup to complete (may take 5-10 minutes)
3. You'll receive an email when ready
4. Come back to this page and click **"Download"** next to the backup file

---

## Method 3: Using FTP (If cPanel is slow or unavailable)

### Step 1: Download FTP Client
If you don't have one:
- Download **FileZilla** (free): https://filezilla-project.org/
- Or use **Cyberduck**, **WinSCP**, etc.

### Step 2: Connect to Your Server
1. Open FileZilla
2. Enter connection details:
   - **Host:** `ftp.z2blegacybuilders.co.za` (or your hosting IP)
   - **Username:** Your cPanel username
   - **Password:** Your cPanel password
   - **Port:** 21

3. Click **"Quickconnect"**

### Step 3: Navigate and Download
1. On the **right side** (Remote site), navigate to `/public_html/`
2. Select ALL files and folders in public_html
3. **RIGHT-CLICK** → **"Download"**
4. Choose local folder on your computer
5. Wait for download to complete (may take 10-30 minutes depending on size)

---

## ✅ Backup Checklist

Before proceeding with deployment, make sure you have:

- [ ] Created backup ZIP file in cPanel
- [ ] Downloaded backup to local computer
- [ ] Verified backup file size (not 0 KB or suspiciously small)
- [ ] Saved backup to at least 2 locations
- [ ] Written down backup file name and location
- [ ] (Optional) Tested extracting the ZIP to verify contents
- [ ] Kept original backup in cPanel as extra safety

---

## 🎯 Quick Reference - cPanel File Manager Backup

```
1. Login to cPanel
2. Click "File Manager"
3. Click "public_html" folder
4. Press Ctrl+A (select all)
5. Click "Compress" button
6. Name: backup-z2b-Dec31-2024.zip
7. Click "Compress File(s)"
8. Wait for completion
9. Right-click the .zip file
10. Click "Download"
11. Save to your computer
12. VERIFY file size
13. Copy to 2+ locations
✅ DONE - You're safe to deploy!
```

---

## ⚠️ Common Mistakes to Avoid

1. **DON'T skip the backup** - "I'll be careful" is not a backup strategy
2. **DON'T only compress** - You must DOWNLOAD it to your computer
3. **DON'T overwrite an old backup** - Use unique names with dates
4. **DON'T compress from wrong folder** - Make sure you're IN public_html
5. **DON'T delete backup too soon** - Keep it for at least 30 days after deployment

---

## 🔄 How to Restore from Backup (If Something Goes Wrong)

### If you need to roll back:

1. Login to cPanel File Manager
2. Go to public_html
3. **DELETE** all current files (select all → Delete)
4. Upload your backup .zip file to public_html
5. Right-click the .zip → Extract
6. Choose "Extract to: /public_html/"
7. Click "Extract Files"
8. Delete the .zip file after extraction
9. Your site is restored!

---

## 📞 Need Help?

**Can't access cPanel?**
- Contact your hosting provider
- Check your hosting welcome email for cPanel URL and credentials

**Backup too large to download?**
- Use FTP method instead
- Or ask hosting support to create backup for you

**Unsure if backup worked?**
- Check file size (should be multiple MB)
- Extract and verify contents before proceeding

---

**Remember:** A backup you can restore from is your safety net. Take 5 minutes to do this right! 🛡️
