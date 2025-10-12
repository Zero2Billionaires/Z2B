# Z2B - Zero to Billionaire Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.x-blue)](https://reactjs.org/)
[![PHP Version](https://img.shields.io/badge/php-%3E%3D7.4-purple)](https://php.net/)
[![MongoDB](https://img.shields.io/badge/mongodb-6.x-green)](https://www.mongodb.com/)

A comprehensive MLM (Multi-Level Marketing) platform with AI coaching, universal marketplace, gamification, and intelligent commission distribution systems.

## 🏆 Premium Gold & Black Edition

**Zero to Billionaire** is an all-in-one business ecosystem featuring:
- 🤖 **AI-Powered Coaching** (Zyra, Benown, Coach ManLaw)
- 🎮 **Gamification Suite** (Zyro: Challenges, Roulette, Bingo)
- 🛒 **Universal Marketplace** with vendor management
- 💰 **Advanced MLM Commission System** with 10-level depth
- 📊 **Real-time Analytics & Dashboards**
- 🔐 **Enterprise-grade Security**

## 📚 Table of Contents

- [Features](#-features)
- [Ecosystem Apps](#-ecosystem-apps)
- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Tech Stack](#-tech-stack)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### Core Platform
- **Multi-Tier Membership System**: FAM, Bronze, Silver, Gold, Platinum, Diamond tiers
- **Advanced Commission Engine**: QPB, TSC, TPB, TLI with 10-level depth
- **Member Management**: Complete CRUD operations with genealogy tracking
- **First 100 Beta Testers Program**: Lifetime 10% profit sharing
- **Monthly Refuel System**: Automatic tier maintenance
- **Payment Gateways**: MLM-friendly payment processors & cryptocurrency
- **Responsive Dashboard**: Gold & black premium UI
- **Achievements System**: Gamified milestone tracking

### AI Coaching Suite
- **Zyra AI**: Personal business mentor with Firebase integration
- **Benown AI**: Business strategy and growth advisor
- **Coach ManLaw**: Specialized coaching curriculum with progress tracking

### Gamification (Zyro)
- **Daily Challenges**: Earn points and climb leaderboards
- **Idea Roulette**: Gamified idea generation wheel
- **Mad Libs Generator**: Fun content creation tool
- **Quiz System**: Knowledge testing and rewards
- **Bingo Game**: Business milestone tracking game
- **Social Sharing**: Integrated social media features
- **Z2B Integration**: Seamless connection with main platform

### Universal Marketplace
- **Multi-Vendor Support**: Sell physical and digital products
- **Digital Product Delivery**: Automated delivery system
- **Service Booking**: Calendar-based appointment system
- **Commission Distribution**: Automatic MLM commission splits
- **Shipping Integration**: Real-time shipping calculations
- **Product Management**: Complete inventory system
- **Whitelabel Support**: Zyroniq and other vendor products
- **Checkout System**: Streamlined purchase flow

## 🎮 Ecosystem Apps

### 1. Main Dashboard (`/app/dashboard.html`)
Central hub for accessing all Z2B features:
- Income tracking and analytics
- Team management
- Quick access to all apps
- Tier progression status
- Commission summaries

### 2. Zyra AI Coach (`/app/zyra.html`)
Personal AI business mentor powered by Firebase:
- Natural language conversations
- Business strategy guidance
- Goal setting and tracking
- Personalized recommendations
- Knowledge base integration

### 3. Benown AI (`/app/benown.html`)
Advanced business intelligence assistant:
- Market analysis
- Growth strategies
- Financial planning
- Competitive insights

### 4. Coach ManLaw (`/app/coach-manlaw.html`)
Structured coaching curriculum:
- Progressive lesson system
- Interactive exercises
- Progress tracking
- Certification paths

### 5. Zyro Games Hub (`/app/zyro.html`)
Gamification suite with multiple games:
- **Challenges** (`zyro-challenges-game.html`): Daily business challenges
- **Idea Roulette** (`zyro-roulette-game.html`): Spin for creative ideas
- **Bingo** (`zyro-bingo-game.html`): Achievement tracking game
- Leaderboards and social features
- Points and rewards system

### 6. Glowie Analytics (`/app/glowie.html`)
Performance tracking and insights

### 7. Universal Marketplace (`/app/marketplace.html`)
- Browse products and services
- Vendor dashboard
- Product listing management
- Order tracking
- Commission reports

### 8. Zyroniq (Whitelabel Product)
Complete whitelabel MLM system available in marketplace:
- Custom branding
- Commission calculator
- Admin dashboard
- Deployment ready

## ⚡ Quick Start

### Option 1: Windows Quick Start
```bash
# Run the automated setup
setup.bat

# Start the application
run.bat
```

### Option 2: Cross-Platform
```bash
# Run setup script
./setup.sh  # Linux/Mac
setup.bat   # Windows

# Start development servers
npm run dev
```

### Option 3: Manual Setup
See [Installation](#-installation) section below.

## 📋 Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **PHP** 7.4+ (for marketplace APIs)
- **MySQL/MariaDB** (for marketplace database)
- **npm** or **yarn**
- **Git** (for version control)

Optional:
- **Firebase account** (for Zyra AI features)
- **Python 3.x** (for running local development server)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Zero2Billionaires/Z2B.git
cd Z2B
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Install All Project Dependencies
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
cd ..
```

### 4. Database Setup

#### MongoDB (Main App)
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas connection string
# Update MONGODB_URI in server/.env
```

#### MySQL (Marketplace)
```bash
# Import the schema
mysql -u root -p < Z2B-v21/sql/z2b_complete_schema.sql

# Or for marketplace only
mysql -u root -p < Z2B-v21/database/marketplace-schema.sql
```

### 5. Configure Environment Variables

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/z2b-legacy-builders
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development

# Optional: Firebase (for Zyra AI)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id

# Optional: Payment Gateways
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
```

Create `Z2B-v21/config/database.php`:
```php
<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'z2b_marketplace');
```

## 🎯 Running the Application

### Development Mode (Recommended)
Run both frontend and backend concurrently:
```bash
npm run dev
```

This starts:
- React frontend at `http://localhost:3000`
- Node.js API server at `http://localhost:5000`

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

### PHP Legacy App (Z2B-v21)
```bash
# Using Python server
cd Z2B-v21
python run_server.py

# Or using PHP built-in server
php -S localhost:8000

# Or use START.bat on Windows
Z2B-v21/START.bat
```

Access at `http://localhost:8000`

## 📁 Project Structure

```
Z2B/
├── client/                          # React Frontend (Main Dashboard)
│   ├── src/
│   │   ├── components/
│   │   │   ├── sections/            # Dashboard sections
│   │   │   │   ├── AICoachSection.jsx
│   │   │   │   ├── BTSSDashboard.jsx
│   │   │   │   ├── MarketplaceSection.jsx
│   │   │   │   └── ...
│   │   │   ├── shared/              # Shared styles
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── server/                          # Node.js Backend API
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── aiConfig.js              # AI configuration
│   ├── models/
│   │   ├── Member.js
│   │   ├── CoachUser.js
│   │   ├── Lesson.js
│   │   ├── BTSSScore.js
│   │   └── ...
│   ├── routes/
│   │   ├── memberRoutes.js
│   │   ├── tierRoutes.js
│   │   ├── commissionRoutes.js
│   │   ├── coachRoutes.js
│   │   ├── btssRoutes.js
│   │   └── lessonRoutes.js
│   ├── services/
│   │   └── aiCoachEngine.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── Z2B-v21/                         # PHP/HTML Legacy App & Marketplace
│   ├── app/                         # All app pages
│   │   ├── dashboard.html
│   │   ├── zyra.html               # Zyra AI Coach
│   │   ├── benown.html             # Benown AI
│   │   ├── coach-manlaw.html       # Coach ManLaw
│   │   ├── zyro.html               # Zyro Games Hub
│   │   ├── zyro-challenges-game.html
│   │   ├── zyro-roulette-game.html
│   │   ├── zyro-bingo-game.html
│   │   ├── glowie.html
│   │   ├── marketplace.html
│   │   ├── checkout.html
│   │   ├── book-service.html
│   │   ├── achievements.html
│   │   ├── income.html
│   │   ├── team.html
│   │   ├── tiers.html
│   │   └── settings.html
│   ├── admin/
│   │   ├── index.html
│   │   └── marketplace-products.html
│   ├── api/
│   │   ├── auth.php
│   │   ├── marketplace.php
│   │   ├── ai-coach.php
│   │   ├── monthly-refuel.php
│   │   └── admin-access.php
│   ├── includes/
│   │   ├── Auth.php
│   │   ├── Database.php
│   │   ├── MLMCalculator.php
│   │   ├── MarketplaceCommissionDistributor.php
│   │   ├── DigitalProductDelivery.php
│   │   ├── ServiceBookingSystem.php
│   │   ├── ShippingIntegration.php
│   │   └── payment-gateway.php
│   ├── marketplace/
│   │   └── products/
│   │       └── zyroniq/            # Whitelabel product
│   ├── config/
│   │   ├── app.php
│   │   └── database.php
│   ├── database/
│   │   └── marketplace-schema.sql
│   ├── sql/
│   │   └── z2b_complete_schema.sql
│   ├── js/
│   │   ├── app-config.js
│   │   └── ecosystem-footer.js
│   ├── index.php
│   ├── run_server.py
│   ├── setup.bat
│   └── START.bat
│
├── .github/
│   └── workflows/
│       └── ci.yml                   # CI/CD configuration
│
├── docs/                            # Documentation
│   ├── DEPLOYMENT.md
│   ├── API.md
│   ├── CONTRIBUTING.md
│   └── SECURITY.md
│
├── package.json
├── run.bat
├── setup.bat
├── setup.sh
├── .gitignore
├── LICENSE
└── README.md
```

## 🔌 API Endpoints

### Members API
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `GET /api/members/:id/team` - Get member's team

### Tiers API
- `GET /api/tiers` - Get all tier information
- `GET /api/tiers/:id` - Get specific tier details
- `POST /api/tiers/upgrade` - Upgrade member tier

### Commissions API
- `GET /api/commissions/rates` - Get commission rates
- `PUT /api/commissions/rates` - Update commission rates
- `GET /api/commissions/calculate` - Calculate commissions
- `GET /api/commissions/history/:memberId` - Get commission history

### AI Coach API
- `POST /api/coach/chat` - Send message to AI coach
- `GET /api/coach/sessions/:userId` - Get coaching sessions
- `POST /api/coach/sessions` - Create new session
- `GET /api/coach/progress/:userId` - Get progress data

### Lessons API
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons/progress` - Update progress
- `GET /api/lessons/user/:userId` - Get user's lesson progress

### BTSS (Business Tracking Score System) API
- `GET /api/btss/:userId` - Get BTSS score
- `POST /api/btss/update` - Update BTSS metrics
- `GET /api/btss/leaderboard` - Get leaderboard

### Marketplace API (PHP)
- `GET /api/marketplace.php?action=products` - Get all products
- `GET /api/marketplace.php?action=product&id={id}` - Get product
- `POST /api/marketplace.php?action=purchase` - Purchase product
- `POST /api/marketplace.php?action=sell` - List product for sale
- `GET /api/marketplace.php?action=orders&user_id={id}` - Get orders

## 💡 Key Features Explained

### Tier System
- **FAM Member**: Free tier with 20% ISP
- **Bronze Legacy**: R480 - 25% ISP, 3 TSC generations
- **Silver Legacy**: R1,480 - 30% ISP, 5 TSC generations
- **Gold Legacy**: R2,980 - 35% ISP, 7 TSC generations
- **Platinum Legacy**: R4,980 - 40% ISP, 10 TSC generations
- **Diamond Legacy**: By invitation, custom structure

### Commission Types
- **ISP (Individual Sales Profit)**: 20-45% based on tier
- **TSC (Team Sales Commission)**: Multi-generation team commissions
- **TPB (Team Performance Bonus)**: Pool-based performance rewards
- **QPB (Quick Performance Bonus)**: 3 sales in 30 days = R300
- **TLI (Ten Level Incentive)**: 10-level deep genealogy tracking

### First 100 Beta Testers
- Lifetime 10% profit sharing from company profits
- Must maintain Bronze+ tier monthly to qualify
- Auto-fill from waitlist if member is disqualified
- Exclusive recognition and benefits

### Monthly Refuel System
- Automatic tier maintenance subscriptions
- Prevents downgrade at month end
- Flexible payment options
- Grace period management

## 🎨 Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router DOM** - Routing
- **Vite** - Build tool & dev server
- **CSS3** - Custom styling (Gold & Black theme)
- **Zustand** - State management (ready to use)

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database & ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **PHP 7.4+** - Legacy APIs & marketplace
- **MySQL** - Marketplace database

### AI & Integrations
- **Firebase** - Zyra AI backend & real-time features
- **Claude API** - AI coaching intelligence
- **PayFast** - Payment gateway (South Africa)
- **Cryptocurrency APIs** - Crypto payment support

### DevOps
- **Git** - Version control
- **GitHub Actions** - CI/CD
- **Python** - Local dev server

## 🚀 Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

#### Option 1: Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel
```

#### Option 2: Heroku (Full Stack)
```bash
# Install Heroku CLI
# Create Heroku app
heroku create z2b-platform

# Add MongoDB addon
heroku addons:create mongolab

# Deploy
git push heroku master
```

#### Option 3: VPS (Recommended for Full Control)
1. Set up Ubuntu 20.04+ server
2. Install Node.js, MongoDB, PHP, MySQL
3. Clone repository
4. Configure environment variables
5. Set up Nginx reverse proxy
6. Configure SSL with Let's Encrypt
7. Set up PM2 for process management

Detailed instructions in [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 🔒 Security

- All passwords hashed with bcrypt
- JWT tokens for authentication
- Environment variables for sensitive data
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting on APIs
- Input validation & sanitization

See [SECURITY.md](./docs/SECURITY.md) for security best practices.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run client tests
npm run test:client

# Run server tests
npm run test:server

# Generate coverage report
npm run test:coverage
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Documentation

- [Quick Start Guide](./QUICKSTART.md)
- [Setup Complete Guide](./SETUP_COMPLETE.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [AI Coach Setup](./AI_COACH_SETUP.md)
- [Marketplace System](./MARKETPLACE-COMPLETE-SYSTEM.md)
- [Branding Guide](./BRANDING_GUIDE.md)
- [Deployment Guide](./Z2B-v21/DEPLOYMENT.md)

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod

# Or use MongoDB Atlas connection string
# Update MONGODB_URI in server/.env
```

### Port Already in Use
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 5000 (Linux/Mac)
lsof -ti:5000 | xargs kill -9
```

### Module Not Found
```bash
# Re-install all dependencies
npm run install:all

# Clear cache if needed
npm cache clean --force
```

### Firebase Not Working (Zyra AI)
1. Check Firebase configuration in `Z2B-v21/app/zyra-firebase.js`
2. Verify API keys in environment variables
3. Ensure Firebase project is active
4. Check browser console for specific errors

### PHP Errors
```bash
# Check PHP version
php -v

# Enable error reporting (development only)
# Edit php.ini: display_errors = On
```

## 📊 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered lead generation
- [ ] Blockchain integration for transparency
- [ ] Multi-currency support
- [ ] Video conferencing integration
- [ ] Advanced reporting & exports
- [ ] Email marketing automation
- [ ] SMS notifications
- [ ] Social media integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Claude AI for development assistance
- React team for amazing framework
- MongoDB team for robust database
- All contributors and beta testers

## 📞 Support

For support, email support@z2b.com or open an issue in the repository.

## 🌟 Star Us!

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ for Zero to Billionaires Community**

[GitHub](https://github.com/Zero2Billionaires/Z2B) | [Website](#) | [Documentation](./docs/) | [Support](#)
