# Z2B Legacy Builders Platform - React Migration

## 🚀 Overview

Z2B Legacy Builders is a comprehensive MLM (Multi-Level Marketing) platform that transforms employees into entrepreneurs. This project represents a complete architectural migration from a monolithic PHP application to a modern React frontend with a PHP REST API backend.

## 📋 Project Status

### ✅ Completed
- React frontend structure with Vite
- PHP REST API backend with JWT authentication
- Complete authentication system (login, register, verify, refresh)
- API routing and middleware system
- CORS and rate limiting
- Protected routes in React
- Authentication context for state management
- Base API service layer
- Responsive UI with Bootstrap 5
- All page placeholders created

### 🚧 In Progress
- Additional API endpoints (members, commissions, marketplace, coach, tiers, admin)
- Full page implementations
- Advanced state management
- Real-time features

## 🏗️ Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   React Frontend    │<─HTTP──>│   PHP REST API      │
│   (Port 5173)       │         │   (Port 8000)       │
│                     │         │                     │
│ - React Components  │         │ - API Endpoints     │
│ - State Management  │         │ - Business Logic    │
│ - Client Routing    │         │ - Database Access   │
│ - UI/UX Layer       │         │ - Authentication    │
└─────────────────────┘         └─────────────────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │  MySQL Database  │
                                └──────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Bootstrap 5** - UI framework
- **Context API** - State management

### Backend
- **PHP 8.1+** - Server-side language
- **MySQL 8.0+** - Database
- **JWT** - Authentication
- **PDO** - Database layer

## 📁 Project Structure

```
Z2B-v21/
├── backend/                 # PHP REST API
│   ├── api/v1/             # API endpoints
│   ├── config/             # Configuration
│   ├── middleware/         # Middleware
│   ├── includes/           # Helper classes
│   ├── database/           # Database & migrations
│   └── index.php           # Entry point
│
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # State management
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utilities
│   │   └── styles/        # Global styles
│   ├── public/            # Static files
│   └── package.json       # Dependencies
│
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites
- PHP 8.1 or higher
- MySQL 8.0 or higher
- Node.js 16+ and npm
- Composer (optional)

### Installation

1. **Clone the repository**
   ```bash
   cd Z2B-v21
   ```

2. **Set up Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and configure your database
   ```

3. **Import Database**
   ```bash
   mysql -u root -p
   CREATE DATABASE z2b_legacy;
   exit
   mysql -u root -p z2b_legacy < sql/z2b_complete_schema.sql
   ```

4. **Set up Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers**

   **Option A: Use the batch script (Windows)**
   ```bash
   # From project root
   START_DEV.bat
   ```

   **Option B: Manual start**
   ```bash
   # Terminal 1 - Backend
   cd backend
   php -S localhost:8000

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 📖 Documentation

- **[Migration Guide](MIGRATION_GUIDE.md)** - Complete migration process and next steps
- **[Architecture Documentation](REACT_MIGRATION_ARCHITECTURE.md)** - Detailed architecture overview
- **[API Documentation](docs/API.md)** - API endpoint reference (TODO)

## 🔑 Key Features

### MLM System
- **Tiered Membership**: 6 membership levels (Bronze to Diamond)
- **Commission Structure**: ISP, TSC, QPB, TPB, TLI
- **Team Management**: Multi-level downline tracking
- **Referral System**: Unique referral codes for each member

### Platform Features
- **Dashboard**: Real-time stats and earnings
- **Marketplace**: Buy/sell products
- **AI Coach**: Coach Manlaw - AI-powered business coaching
- **Integrated Apps**: Benown, Zyra, Vidzie, Glowie, Zynect, Zyro
- **Team Visualization**: Downline tree view
- **Income Tracking**: Detailed earnings breakdown
- **Admin Panel**: System management and analytics

## 🔐 Authentication

### JWT-Based Authentication Flow
1. User logs in with credentials
2. Backend validates and issues JWT token + refresh token
3. Frontend stores tokens in localStorage
4. All API requests include token in Authorization header
5. Backend validates token on each request
6. Token auto-refreshes before expiry

### Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/verify` - Verify token
- `POST /api/v1/auth/refresh` - Refresh token

## 🧪 Testing

### Test Authentication
```bash
# Register a user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "tier": "BLB"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## 🚢 Deployment

### Frontend Build
```bash
cd frontend
npm run build
# Deploy dist/ folder to web server
```

### Backend Deployment
```bash
# Copy backend/ folder to web server
# Set up .env with production values
# Configure Apache/Nginx to route to backend/index.php
```

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed deployment instructions.

## 🛣️ Roadmap

### Phase 1: Foundation (✅ Complete)
- [x] Project structure setup
- [x] Authentication system
- [x] React routing
- [x] API infrastructure

### Phase 2: Core Features (In Progress)
- [ ] Members API endpoints
- [ ] Commissions API endpoints
- [ ] Dashboard implementation
- [ ] Team management

### Phase 3: Advanced Features
- [ ] Marketplace functionality
- [ ] AI Coach integration
- [ ] Real-time notifications
- [ ] Payment integration

### Phase 4: Polish & Deploy
- [ ] Performance optimization
- [ ] Security audit
- [ ] Testing suite
- [ ] Production deployment

## 💡 Development Tips

### Frontend
- Components are in `frontend/src/components/`
- Pages are in `frontend/src/pages/`
- API calls go through services in `frontend/src/services/`
- Use `useAuth()` hook to access authentication state

### Backend
- All endpoints require JWT token (except auth routes)
- Use middleware for common functionality
- Follow existing patterns in auth endpoints
- Always validate input data

## 🐛 Troubleshooting

### CORS Issues
Check `CORS_ALLOWED_ORIGINS` in `backend/.env`

### Database Connection Failed
Verify credentials in `backend/.env` and ensure MySQL is running

### Frontend Won't Build
```bash
cd frontend
rm -rf node_modules
npm install
```

### JWT Token Errors
- Check token in browser localStorage
- Verify JWT_SECRET in backend/.env
- Check token expiry time

## 📄 License

Proprietary - Z2B Legacy Builders

## 👥 Team

- **Platform**: Z2B Legacy Builders
- **Version**: 21.0.0
- **Migration Date**: October 2025

## 📞 Support

For issues and questions:
1. Check the [Migration Guide](MIGRATION_GUIDE.md)
2. Review the [Architecture Documentation](REACT_MIGRATION_ARCHITECTURE.md)
3. Check browser console for frontend errors
4. Check PHP logs for backend errors

---

**Status**: Foundation Complete ✅ | Ready for Feature Development 🚀

**Next Steps**: Implement remaining API endpoints and complete page implementations (see [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md))
