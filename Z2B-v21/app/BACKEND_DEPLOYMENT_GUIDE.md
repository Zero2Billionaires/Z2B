# Z2B Legacy Builders - Complete Backend Deployment Guide

## Overview

This guide will help you deploy the Z2B Admin Panel backend to make your admin panel fully functional. The backend is a Node.js + Express API that connects to MongoDB Atlas (cloud database).

---

## What You'll Deploy

- **Node.js Backend API** (manages tiers, users, content, payments)
- **MongoDB Database** (stores all your data)
- **Admin Panel Connection** (admin.html will work fully)

---

## Part 1: Quick Overview

### Backend Files Needed:
The backend was created in git commit `6cb7e44` and includes:

```
backend/
├── server.js              # Main Express server
├── package.json           # Dependencies
├── .env                   # Environment variables (MongoDB URI, secrets)
├── models/                # Database schemas
│   ├── Settings.js
│   ├── User.js
│   ├── Content.js
│   ├── PaymentGateway.js
│   └── Statistics.js
├── routes/                # API endpoints
│   ├── auth.js           # Login/authentication
│   ├── settings.js       # Tier/pricing settings
│   ├── users.js          # User management
│   ├── content.js        # Content management
│   ├── stats.js          # Statistics
│   └── payment.js        # Payment gateways
└── middleware/
    └── auth.js           # JWT authentication
```

---

## Part 2: Extract Backend Files from Git

Since the backend files exist in git history, let's extract them:

###  Step 1: Create Backend Directory

```bash
cd C:\Users\Manana\Z2B\Z2B-v21
mkdir admin-backend
cd admin-backend
```

### Step 2: Extract Files from Git

```bash
# Extract all backend files from the commit
git show 6cb7e44:Z2B-v21/backend/server.js > server.js
git show 6cb7e44:Z2B-v21/backend/package.json > package.json

# Extract models
mkdir models
git show 6cb7e44:Z2B-v21/backend/models/Settings.js > models/Settings.js
git show 6cb7e44:Z2B-v21/backend/models/User.js > models/User.js
git show 6cb7e44:Z2B-v21/backend/models/Content.js > models/Content.js
git show 6cb7e44:Z2B-v21/backend/models/PaymentGateway.js > models/PaymentGateway.js
git show 6cb7e44:Z2B-v21/backend/models/Statistics.js > models/Statistics.js

# Extract routes
mkdir routes
git show 6cb7e44:Z2B-v21/backend/routes/auth.js > routes/auth.js
git show 6cb7e44:Z2B-v21/backend/routes/settings.js > routes/settings.js
git show 6cb7e44:Z2B-v21/backend/routes/users.js > routes/users.js
git show 6cb7e44:Z2B-v21/backend/routes/content.js > routes/content.js
git show 6cb7e44:Z2B-v21/backend/routes/stats.js > routes/stats.js
git show 6cb7e44:Z2B-v21/backend/routes/payment.js > routes/payment.js

# Extract middleware
mkdir middleware
git show 6cb7e44:Z2B-v21/backend/middleware/auth.js > middleware/auth.js
```

---

## Part 3: Setup MongoDB Atlas (Free Cloud Database)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for FREE (no credit card required)
3. Choose **M0 FREE** tier (512MB storage)
4. Select a cloud provider (AWS, Google Cloud, or Azure)
5. Choose region closest to South Africa (e.g., eu-west-1)
6. Click **Create Cluster** (takes 3-5 minutes)

### Step 2: Create Database User

1. In MongoDB Atlas Dashboard, click **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `z2b_admin`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **Atlas Admin**
7. Click **Add User**

### Step 3: Whitelist IP Addresses

1. Click **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for now - you can restrict later)
4. Confirm

### Step 4: Get Connection String

1. Click **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://z2b_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Save this connection string - you'll need it!

---

## Part 4: Deploy to Railway (Recommended - FREE)

Railway is perfect for this project: FREE tier, easy deployment, automatic HTTPS.

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub (easiest method)
3. Verify your email

### Step 2: Create New Project

1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. If first time: Authorize Railway to access your GitHub
4. Select your Z2B repository (or create new one for backend only)

**OR Deploy from Local Files:**

1. Click **New Project**
2. Select **Empty Project**
3. Click **Deploy from Local**

### Step 3: Configure Environment Variables

In Railway project dashboard:

1. Click on your service
2. Go to **Variables** tab
3. Add these environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://z2b_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/z2b_legacy?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-abc123xyz789
FRONTEND_URL=https://z2blegacybuilders.co.za
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with your MongoDB password
- Replace `JWT_SECRET` with a long random string (minimum 32 characters)
- Update `FRONTEND_URL` with your actual domain

### Step 4: Deploy

1. Railway will automatically detect Node.js and install dependencies
2. It will run `npm install` then `npm start`
3. Wait for deployment to complete (2-5 minutes)
4. You'll get a URL like: `https://your-project.railway.app`

### Step 5: Get Your Backend URL

1. In Railway dashboard, click **Settings**
2. Scroll to **Domains**
3. Click **Generate Domain**
4. Save this URL - this is your backend API URL!
   Example: `https://z2b-backend-production.up.railway.app`

---

## Part 5: Alternative - Deploy to Render (Also FREE)

If you prefer Render:

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up (free tier available)

### Step 2: Create New Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: z2b-admin-backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables

Same as Railway - add all environment variables from Part 4, Step 3.

### Step 4: Deploy

Render will automatically deploy. You'll get a URL like:
`https://z2b-admin-backend.onrender.com`

**Note:** Free tier spins down after inactivity, first request may be slow (15-30 seconds).

---

## Part 6: Update Frontend to Use Production Backend

Now update your admin.html to connect to the deployed backend:

### Step 1: Update admin.html

Find line ~547 in admin.html:

**BEFORE:**
```javascript
const API_URL = 'http://localhost:5000/api'; // Change to your backend URL
```

**AFTER:**
```javascript
const API_URL = 'https://your-backend-url.railway.app/api'; // Your production backend
```

Replace `your-backend-url.railway.app` with your actual Railway or Render URL.

### Step 2: Upload Updated admin.html

1. Go to cPanel File Manager
2. Navigate to `public_html`
3. Find `admin.html`
4. Delete old version
5. Upload new version with updated API_URL

---

## Part 7: Test Your Deployment

### Step 1: Test Backend Health

Visit in your browser:
```
https://your-backend-url.railway.app/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Z2B Admin Backend is running",
  "timestamp": "2025-10-28T..."
}
```

### Step 2: Test Admin Login

1. Go to `https://z2blegacybuilders.co.za/admin.html`
2. Click "Z2B Legacy Builders" title 5 times (secret trigger)
3. Login with:
   - **Username**: `admin`
   - **Password**: `Admin@Z2B2024!`
4. You should see the admin dashboard!

### Step 3: Test Admin Functions

Try these:
- View Dashboard (statistics)
- View/Edit Tiers
- View Users
- Update Settings

If everything loads, congratulations! Your backend is live!

---

## Part 8: Local Development (Optional)

If you want to run the backend locally for testing:

### Step 1: Install Dependencies

```bash
cd C:\Users\Manana\Z2B\Z2B-v21\admin-backend
npm install
```

### Step 2: Create .env File

Create `.env` file with:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:8080
```

### Step 3: Run Backend

```bash
npm start
```

Backend runs at: `http://localhost:5000`

Admin panel: `http://localhost:5000/admin.html`

---

## Troubleshooting

### Issue: "Backend is not running"

**Check:**
1. Is Railway/Render deployment successful?
2. Visit `/api/health` endpoint - does it respond?
3. Check Railway/Render logs for errors
4. Verify MongoDB connection string is correct
5. Ensure all environment variables are set

### Issue: "CORS Error"

**Solution:**
- Add your domain to `FRONTEND_URL` environment variable in Railway/Render
- Example: `FRONTEND_URL=https://z2blegacybuilders.co.za`

### Issue: "Invalid credentials"

**Default login:**
- Username: `admin`
- Password: `Admin@Z2B2024!`

If you changed it, check the auth route or reset in MongoDB.

### Issue: "MongoDB connection failed"

**Check:**
1. Is connection string correct?
2. Did you replace `<password>` with actual password?
3. Did you whitelist IP addresses in MongoDB Atlas?
4. Does your cluster have the database name `z2b_legacy`?

### Issue: Railway/Render app sleeps

**Free tier limitations:**
- Railway: Always on (no sleeping)
- Render: Spins down after 15 minutes inactivity
  - First request after sleep takes 30-60 seconds
  - Consider paid plan ($7/month) for always-on

---

## Cost Breakdown

### FREE Option:
- **MongoDB Atlas**: FREE (M0 tier, 512MB)
- **Railway**: FREE (500 hours/month, $5 credit)
- **Total**: $0/month

### Paid Option (Recommended for production):
- **MongoDB Atlas**: FREE (M0 tier)
- **Railway Pro**: $5/month (always-on, more resources)
- **Total**: $5/month

---

## Security Best Practices

### 1. Change Default Admin Password

After first login:
1. Go to MongoDB Atlas
2. Find `users` collection
3. Change admin password hash
4. Or create new admin user with different password

### 2. Restrict MongoDB IP Access

1. In MongoDB Atlas → Network Access
2. Remove "Allow from anywhere"
3. Add only Railway/Render IP addresses
4. Get Railway IPs from: Settings → Networking

### 3. Use Strong JWT Secret

Generate a random 64-character string for `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Enable HTTPS Only

Railway and Render provide HTTPS automatically. Never use HTTP for admin panel.

---

## Next Steps After Deployment

1. ✅ Upload updated `index.html` with new slogan to cPanel
2. ✅ Test complete user flow: Landing → Tiers → Registration → Payment → Dashboard
3. ✅ Configure payment gateways (Payfast, CoinPayments) in admin panel
4. ✅ Add your first tier pricing in admin panel
5. ✅ Test creating users and assigning tiers
6. ✅ Customize branding colors in admin panel

---

## Summary

You now have:
- ✅ Frontend deployed on cPanel (z2blegacybuilders.co.za)
- ✅ Backend API deployed on Railway/Render
- ✅ MongoDB database on Atlas
- ✅ Fully functional admin panel
- ✅ Updated contact info and slogan
- ✅ Fixed user registration flow

**Your admin panel is now production-ready!**

---

## Support

**Need help?**
- Railway Discord: https://discord.gg/railway
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

**Backend errors?**
- Check Railway/Render logs
- Check MongoDB Atlas metrics
- Test `/api/health` endpoint

---

**Created**: October 28, 2025
**By**: Claude Code
**For**: Z2B Legacy Builders Platform
