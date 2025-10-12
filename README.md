# Z2B LEGACY BUILDERS APP

A premium React + Node.js application for managing an elite network marketing platform with multi-tier commission structures, member management, and marketplace features.

## 🏆 Premium Gold & Black Edition

## 🚀 Features

- **Multi-Tier System**: FAM, Bronze, Silver, Gold, Platinum, Diamond tiers
- **Commission Management**: QPB, TSC, TPB, TLI systems
- **Member Management**: Full CRUD operations for members
- **First 100 Beta Testers**: Exclusive profit sharing program
- **Marketplace**: Product management with tier-based access
- **Dynamic Pricing Engine**: Automated pricing calculations
- **Payment Gateways**: MLM-friendly and cryptocurrency support
- **Responsive Dashboard**: Modern UI with collapsible sidebar

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

### 1. Install Root Dependencies
```bash
npm install
```

### 2. Install All Project Dependencies
```bash
npm run install:all
```

Or manually:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

## ⚙️ Configuration

### Server Configuration
Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/z2b-legacy-builders
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in `server/.env`
3. Database will be created automatically on first run

## 🎯 Running the Application

### Development Mode (Recommended)
Run both frontend and backend concurrently:
```bash
npm run dev
```

### Run Individually

**Frontend Only:**
```bash
npm run dev:client
# Opens at http://localhost:3000
```

**Backend Only:**
```bash
npm run dev:server
# Runs at http://localhost:5000
```

## 📁 Project Structure

```
Z2B/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── sections/   # Dashboard sections
│   │   │   ├── shared/     # Shared styles
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── models/
│   │   └── Member.js      # Member schema
│   ├── routes/
│   │   ├── memberRoutes.js
│   │   ├── tierRoutes.js
│   │   └── commissionRoutes.js
│   ├── .env               # Environment variables
│   ├── server.js          # Express server
│   └── package.json
│
├── package.json           # Root package.json
└── README.md
```

## 🔌 API Endpoints

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Tiers
- `GET /api/tiers` - Get all tier information

### Commissions
- `GET /api/commissions/rates` - Get commission rates
- `PUT /api/commissions/rates` - Update commission rates

## 💡 Key Features Explained

### Tier System
- **FAM Member**: Free tier with 20% ISP
- **Bronze Legacy**: R480 - 25% ISP, 3 TSC generations
- **Silver Legacy**: R1,480 - 30% ISP, 5 TSC generations
- **Gold Legacy**: R2,980 - 35% ISP, 7 TSC generations
- **Platinum Legacy**: R4,980 - 40% ISP, 10 TSC generations
- **Diamond Legacy**: By invitation, custom structure

### Commission Types
- **ISP**: Individual Sales Profit (20-45%)
- **TSC**: Team Sales Commission (multi-generation)
- **TPB**: Team Performance Bonus (pool-based)
- **QPB**: Quick Performance Bonus (3 sales/30 days)
- **TLI**: Leadership Incentives (10 levels)

### First 100 Beta Testers
- Lifetime 10% profit sharing
- Must maintain Bronze+ tier monthly
- Auto-fill from waitlist if disqualified

## 🎨 Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Vite (Build tool)
- CSS3 (Custom styling)
- Zustand (State management - ready to use)

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication (ready to implement)
- bcryptjs (Password hashing)

## 🚦 Next Steps

1. **Authentication**: Implement JWT-based auth system
2. **Payment Integration**: Add PayFast, crypto gateways
3. **Commission Calculator**: Build commission calculation engine
4. **Reports**: Generate PDF/Excel reports
5. **Email System**: Member notifications
6. **Dashboard Analytics**: Real-time charts and graphs

## 📝 Environment Variables

```env
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/z2b-legacy-builders
JWT_SECRET=your-secret-key-here
NODE_ENV=development

# Optional: Add payment gateway keys
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
```

## 🐛 Troubleshooting

**MongoDB Connection Error:**
```bash
# Make sure MongoDB is running
mongod

# Or use MongoDB Atlas cloud connection string
```

**Port Already in Use:**
```bash
# Change port in server/.env or client/vite.config.js
```

**Module Not Found:**
```bash
# Re-install dependencies
npm run install:all
```

## 📄 License

This project is proprietary to Z2B Legacy Builders.

## 🤝 Support

For support, contact the development team or open an issue in the repository.

---

**Built with ❤️ for Z2B Legacy Builders**
