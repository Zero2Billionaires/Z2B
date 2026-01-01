# 🚀 Quick Start Guide - Z2B Legacy Builders

## Step 1: Install Dependencies

```bash
# Install root package (concurrently for running both servers)
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
cd ..
```

## Step 2: Setup MongoDB

**Option A: Local MongoDB**
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use default URI in `server/.env`: `mongodb://localhost:27017/z2b-legacy-builders`

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create cluster and get connection string
3. Update `MONGODB_URI` in `server/.env` with your connection string

## Step 3: Run the Application

### Option 1: Run Both (Recommended)
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Option 2: Run Separately

**Terminal 1 - Frontend:**
```bash
cd client
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
```

## Step 4: Test the Application

1. Open browser to http://localhost:3000
2. You should see the Z2B Admin Dashboard
3. Test API: http://localhost:5000/api/test

## 🎯 What's Working

✅ React frontend with routing
✅ Express backend API
✅ MongoDB integration
✅ Member CRUD operations
✅ Tier system configuration
✅ Commission rates management
✅ Beautiful UI matching your design

## 📱 Dashboard Sections

All sections are accessible from the sidebar:
- Dashboard (Stats overview)
- Members Management
- Tier System
- QPB Monitoring
- First 100 Beta Testers
- Rules Builder
- TSC (Team Sales Commission)
- TPB (Team Performance Bonus)
- CEO Targets
- TLI (Leadership Incentives)
- Marketplace
- Pricing Rules
- AI Credits
- Monthly Refuel
- Platform Settings
- Analytics

## 🔧 Common Issues

**Cannot connect to MongoDB:**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

**Port 3000 already in use:**
Edit `client/vite.config.js` and change port

**Port 5000 already in use:**
Edit `server/.env` and change PORT value

## 📝 Next Development Steps

1. Connect frontend to backend API
2. Build out individual section components
3. Add authentication system
4. Implement commission calculations
5. Add payment gateway integration

## 💻 Development Commands

```bash
# Root directory
npm run dev              # Run both client and server
npm run dev:client       # Run client only
npm run dev:server       # Run server only
npm run build            # Build client for production

# Client directory
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Server directory
npm run dev              # Start with nodemon (auto-reload)
npm start                # Start production server
```

## 🌟 Pro Tips

1. Keep both terminal windows open while developing
2. Frontend auto-reloads on file changes (Vite HMR)
3. Backend auto-reloads on file changes (nodemon)
4. Check browser console for frontend errors
5. Check terminal for backend errors

---

**Happy Coding! 🎉**
