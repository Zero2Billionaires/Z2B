# MongoDB Atlas Setup Guide - 2 Minutes ⏱️

## Step 1: Create Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with:
   - Email & password
   - OR Google sign-in
   - OR GitHub sign-in

## Step 2: Create FREE Cluster
1. Click "Build a Database"
2. Choose **M0 FREE** (left option)
3. Select:
   - Provider: **AWS**
   - Region: **Closest to you** (e.g., us-east-1)
4. Cluster Name: **Cluster0** (default is fine)
5. Click **"Create Cluster"**

## Step 3: Create Database User
1. Security Quickstart appears
2. Authentication Method: **Username and Password**
3. Create credentials:
   - Username: `z2buser`
   - Password: `z2bpass123` (or your choice)
   - ⚠️ **REMEMBER THIS PASSWORD!**
4. Click **"Create User"**

## Step 4: Add IP Address
1. Still in Security Quickstart
2. Click **"Add My Current IP Address"**
3. OR click **"Allow Access from Anywhere"** (for development)
   - This adds `0.0.0.0/0` to whitelist
4. Click **"Finish and Close"**

## Step 5: Get Connection String
1. Click **"Connect"** button
2. Choose **"Connect your application"**
3. Driver: **Node.js**
4. Version: **4.1 or later**
5. Copy the connection string:
   ```
   mongodb+srv://z2buser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File
1. Open: `server/.env`
2. Find line with `MONGODB_URI=`
3. Replace with your connection string
4. **IMPORTANT:** Replace `<password>` with actual password
5. **IMPORTANT:** Add `/z2b` before the `?`

**Example:**
```env
MONGODB_URI=mongodb+srv://z2buser:z2bpass123@cluster0.abc123.mongodb.net/z2b?retryWrites=true&w=majority
```

## Step 7: Start Your Server
```bash
cd server
npm run dev
```

## ✅ You Should See:
```
╔═══════════════════════════════════════════════════════════╗
║   Zero to Billionaires (Z2B) API Server                 ║
║   Environment: development                                ║
║   Port: 5000                                             ║
╚═══════════════════════════════════════════════════════════╝

MongoDB Connected!
```

## 🎉 Done!
Now you can:
1. Open `quick-login.html`
2. Register an account
3. Use Glowie!

---

## ⚠️ Troubleshooting

**"Authentication failed"**
- Check password in connection string
- Password must match what you created

**"Network error"**
- Check IP whitelist (allow 0.0.0.0/0)
- Check internet connection

**"Database connection failed"**
- Check connection string format
- Must have `/z2b` before the `?`
- Example: `.../z2b?retryWrites=...`

---

## 🔄 Alternative: Use Local MongoDB

If you prefer local installation:

### Windows:
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB runs automatically as service
4. Use in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/z2b
   ```

### Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

Then use:
```env
MONGODB_URI=mongodb://localhost:27017/z2b
```

---

**Total Time: ~2 minutes**
**Cost: $0 (Forever Free tier)**
