# 📂 Z2B Legacy Builders - Project Structure

## 🏗️ Architecture Overview

```
Z2B-Legacy-Builders/
│
├── 📱 FRONTEND (React + Vite)
│   └── client/
│       ├── index.html                 # Entry HTML
│       ├── vite.config.js             # Vite configuration
│       ├── package.json               # Frontend dependencies
│       │
│       └── src/
│           ├── main.jsx               # React entry point
│           ├── App.jsx                # Main App component
│           ├── index.css              # Global styles
│           │
│           ├── pages/
│           │   ├── Dashboard.jsx      # Main dashboard layout
│           │   └── Dashboard.css
│           │
│           └── components/
│               ├── Sidebar.jsx        # Collapsible navigation
│               ├── Sidebar.css
│               │
│               ├── shared/
│               │   └── SharedStyles.css  # Reusable styles
│               │
│               └── sections/          # Dashboard sections
│                   ├── DashboardSection.jsx  ✅
│                   ├── MembersSection.jsx
│                   ├── TiersSection.jsx
│                   ├── QPBSection.jsx
│                   ├── BetaSection.jsx
│                   ├── RulesSection.jsx
│                   ├── TSCSection.jsx
│                   ├── TPBSection.jsx
│                   ├── CEOSection.jsx
│                   ├── TLISection.jsx
│                   ├── MarketplaceSection.jsx
│                   ├── PricingSection.jsx
│                   ├── AISection.jsx
│                   ├── RefuelSection.jsx
│                   ├── PlatformSection.jsx
│                   └── AnalyticsSection.jsx
│
├── 🖥️ BACKEND (Node.js + Express)
│   └── server/
│       ├── server.js                  # Express app entry
│       ├── package.json               # Backend dependencies
│       ├── .env                       # Environment variables
│       │
│       ├── config/
│       │   └── db.js                  # MongoDB connection
│       │
│       ├── models/
│       │   └── Member.js              # Member schema
│       │
│       └── routes/
│           ├── memberRoutes.js        # Member CRUD API
│           ├── tierRoutes.js          # Tier configuration
│           └── commissionRoutes.js    # Commission rates
│
├── 📦 ROOT
│   ├── package.json                   # Workspace config
│   ├── .gitignore
│   ├── README.md                      # Full documentation
│   ├── QUICKSTART.md                  # Quick setup guide
│   └── PROJECT_STRUCTURE.md           # This file
│
└── 🗄️ DATABASE (MongoDB)
    └── z2b-legacy-builders/
        └── members                     # Member collection
```

## 🔄 Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser   │ ◄────► │ React Client │ ◄────► │ Express API  │
│  localhost  │  HTTP   │  Port 3000   │  REST  │  Port 5000   │
│   :3000     │         │              │   API  │              │
└─────────────┘         └──────────────┘         └──────────────┘
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │   MongoDB    │
                                                  │   Database   │
                                                  └──────────────┘
```

## 🎨 Frontend Components

### Main Layout
- **App.jsx** → Routes to Dashboard
- **Dashboard.jsx** → Container with Sidebar + Content
- **Sidebar.jsx** → Collapsible navigation menu

### Section Components (16 total)
Each section is a separate React component:

1. **DashboardSection** - Overview stats
2. **MembersSection** - Member management
3. **TiersSection** - Tier configuration
4. **QPBSection** - Quick Performance Bonus
5. **BetaSection** - First 100 Beta Testers
6. **RulesSection** - Rules builder
7. **TSCSection** - Team Sales Commission
8. **TPBSection** - Team Performance Bonus
9. **CEOSection** - CEO Targets
10. **TLISection** - Leadership Incentives
11. **MarketplaceSection** - Product management
12. **PricingSection** - Pricing rules
13. **AISection** - AI Credits
14. **RefuelSection** - Monthly refuel
15. **PlatformSection** - Platform settings
16. **AnalyticsSection** - Analytics & reports

## 🔌 Backend API Endpoints

### Members API (`/api/members`)
- `GET /` - List all members
- `GET /:id` - Get member details
- `POST /` - Create new member
- `PUT /:id` - Update member
- `DELETE /:id` - Delete member

### Tiers API (`/api/tiers`)
- `GET /` - Get all tier configurations

### Commissions API (`/api/commissions`)
- `GET /rates` - Get commission rates
- `PUT /rates` - Update commission rates

## 📊 Database Schema

### Member Model
```javascript
{
  membershipId: String (unique),    // Z2B-00001
  fullName: String,
  email: String (unique),
  phone: String,
  tier: Enum,                       // FAM, Bronze, Silver, etc.
  status: Enum,                     // active, suspended, inactive
  referralLink: String,
  sponsorId: ObjectId,
  isBetaTester: Boolean,
  betaPosition: Number,
  joinedDate: Date,
  builderSales: Number,
  totalCommissions: Number,
  pv: Number
}
```

## 🛠️ Tech Stack

### Frontend
- ⚛️ React 18
- 🚀 Vite (Build tool)
- 🎨 Custom CSS
- 🔄 React Router DOM
- 📦 Zustand (State management ready)
- 🌐 Axios (API calls ready)

### Backend
- 🟢 Node.js
- 🚂 Express.js
- 🍃 MongoDB + Mongoose
- 🔐 JWT (ready to implement)
- 🔑 bcryptjs (ready to implement)

### Development Tools
- 📝 Nodemon (auto-reload)
- 🔥 Vite HMR (hot module replacement)
- 🧵 Concurrently (run both servers)

## 🎯 Current Status

### ✅ Completed
- [x] Project structure created
- [x] React frontend setup with Vite
- [x] All 16 dashboard sections created
- [x] Sidebar navigation with routing
- [x] Express backend API setup
- [x] MongoDB integration
- [x] Member CRUD operations
- [x] Tier configuration API
- [x] Commission rates API
- [x] Shared styling system
- [x] Responsive design matching original

### 🚧 To Be Implemented
- [ ] Full section component implementations
- [ ] Authentication & authorization
- [ ] Commission calculation engine
- [ ] Payment gateway integration
- [ ] Email notification system
- [ ] File upload functionality
- [ ] Analytics dashboards
- [ ] PDF/Excel report generation

## 📝 Environment Setup

### Required Environment Variables
```env
# Server (.env in server folder)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/z2b-legacy-builders
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 🚀 How to Run

```bash
# Install all dependencies
npm install && cd client && npm install && cd ../server && npm install && cd ..

# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:client  # Frontend only
npm run dev:server  # Backend only
```

## 📚 Resources

- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- Express Docs: https://expressjs.com
- MongoDB Docs: https://www.mongodb.com/docs
- Mongoose Docs: https://mongoosejs.com

---

**Project Created: 2025**
**Framework: React + Node.js + MongoDB**
**Status: Ready for Development** ✨
