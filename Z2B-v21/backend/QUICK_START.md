# Admin Panel - Quick Start Guide

## ❌ Issue: "Connection error. Please ensure the backend server is running."

This means MongoDB is not set up yet. You have 2 options:

---

## ⚡ OPTION 1: Quick Setup with MongoDB Atlas (RECOMMENDED - 5 minutes)

**No installation needed! Free cloud database.**

### Step 1: Create Free MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email (or use Google/GitHub login)
3. Select **FREE tier** (M0 Sandbox - Forever Free)
4. Choose **AWS** as provider
5. Select region closest to you (e.g., Cape Town or Frankfurt)
6. Cluster Name: `z2b-cluster` (or any name)
7. Click **Create Cluster** (takes 3-5 minutes)

### Step 2: Create Database User

1. Click **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `z2badmin`
5. Password: Click **Autogenerate Secure Password** (copy this!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### Step 3: Whitelist Your IP

1. Click **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access From Anywhere** (for now)
   - This adds `0.0.0.0/0`
   - ⚠️ In production, use specific IP
4. Click **Confirm**

### Step 4: Get Connection String

1. Click **Database** (left sidebar)
2. Click **Connect** button on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://z2badmin:<password>@z2b-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you copied in Step 2

### Step 5: Update Backend Configuration

Open file: `C:\Users\Manana\Z2B\Z2B-v21\backend\.env`

Find line 17:
```
MONGODB_URI=mongodb://localhost:27017/z2b_legacy_builders
```

Replace with your MongoDB Atlas connection string:
```
MONGODB_URI=mongodb+srv://z2badmin:YOUR_PASSWORD@z2b-cluster.xxxxx.mongodb.net/z2b_legacy_builders?retryWrites=true&w=majority
```

**Make sure to:**
- Replace `YOUR_PASSWORD` with actual password
- Add `/z2b_legacy_builders` before the `?`

### Step 6: Start Backend Server

Open terminal/PowerShell:
```bash
cd C:\Users\Manana\Z2B\Z2B-v21\backend
npm start
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Z2B Admin Backend Server running on port 5000
```

### Step 7: Access Admin Panel

1. Go to: `http://localhost/dashboard.html`
2. Click **"Z2B Legacy Builders"** in footer **5 times**
3. Login:
   - Username: `admin`
   - Password: `Admin@Z2B2024!`

---

## 💻 OPTION 2: Install MongoDB Locally (Takes longer)

### For Windows:

1. **Download MongoDB:**
   - Go to: https://www.mongodb.com/try/download/community
   - Version: Latest
   - Platform: Windows
   - Package: MSI
   - Click Download

2. **Install MongoDB:**
   - Run the downloaded MSI file
   - Choose "Complete" installation
   - Install as Windows Service: ✅ (checked)
   - Service Name: MongoDB
   - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data`
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log`
   - Click Install

3. **Verify Installation:**
   ```bash
   mongod --version
   ```

4. **Start MongoDB Service:**
   - Windows Services should auto-start it
   - Or manually: `net start MongoDB`

5. **Start Backend:**
   ```bash
   cd C:\Users\Manana\Z2B\Z2B-v21\backend
   npm start
   ```

---

## 🔧 Troubleshooting

### "npm is not recognized"
**Solution:** Install Node.js from https://nodejs.org (already done ✅)

### "Connection failed" after starting server
**Check:**
1. MongoDB Atlas connection string is correct
2. Password has no special characters (or is URL-encoded)
3. IP whitelist includes `0.0.0.0/0`
4. Cluster is active (green status in Atlas)

### "Port 5000 already in use"
**Solution:**
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
```

### Backend starts but admin panel still shows error
**Check:**
1. Backend is running on port 5000
2. `admin.html` API_URL points to correct backend
   - Open `app/admin.html`
   - Find line ~735: `const API_URL = 'http://localhost:5000/api';`
   - Make sure it matches your backend URL

---

## ✅ Quick Test

After starting backend, test the API:

Open browser and go to: http://localhost:5000/api/health

You should see:
```json
{
  "status": "OK",
  "message": "Z2B Admin Backend is running",
  "timestamp": "2025-10-27T..."
}
```

---

## 📋 Summary of What You Need

1. ✅ Node.js (Already installed - v22.19.0)
2. ✅ Backend dependencies (Just installed)
3. ⏳ MongoDB (Choose Option 1 or 2 above)
4. ⏳ Backend server running

---

## Need Help?

**I recommend Option 1 (MongoDB Atlas)** because:
- ✅ No software to install
- ✅ Setup in 5 minutes
- ✅ Free forever (M0 tier)
- ✅ Automatic backups
- ✅ Better security
- ✅ Can access from anywhere

**Choose Option 2 (Local MongoDB)** only if:
- You want full control
- You have admin rights on your PC
- You prefer local data storage

---

## After Setup Complete

Your admin panel will have:
- ✅ User Management
- ✅ Tier & Pricing Control
- ✅ Content Management
- ✅ Branding Settings
- ✅ Payment Gateway Config
- ✅ Statistics Dashboard
- ✅ Compensation Plan Settings

**Full control without touching code!** 🎉
