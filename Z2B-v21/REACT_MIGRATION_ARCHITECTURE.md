# Z2B Legacy Builders - React Migration Architecture

## Overview
This document outlines the complete architecture for migrating the Z2B Legacy Builders platform from a monolithic PHP application to a modern React frontend with a PHP REST API backend.

## Current Architecture (Monolithic PHP)
```
PHP Application (Monolithic)
├── Frontend & Backend Mixed
├── Server-side rendering
├── Direct database access from pages
└── Session-based authentication
```

## New Architecture (Separated)
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

## Directory Structure

```
Z2B-v21/
│
├── backend/                          # PHP REST API
│   ├── api/                          # API Endpoints
│   │   ├── v1/                       # API Version 1
│   │   │   ├── auth/                 # Authentication
│   │   │   │   ├── login.php
│   │   │   │   ├── register.php
│   │   │   │   ├── logout.php
│   │   │   │   ├── verify.php
│   │   │   │   └── refresh.php
│   │   │   ├── members/              # Member Management
│   │   │   │   ├── profile.php
│   │   │   │   ├── update.php
│   │   │   │   ├── team.php
│   │   │   │   └── stats.php
│   │   │   ├── commissions/          # Commission System
│   │   │   │   ├── earnings.php
│   │   │   │   ├── calculate.php
│   │   │   │   ├── history.php
│   │   │   │   └── payout.php
│   │   │   ├── marketplace/          # Marketplace
│   │   │   │   ├── products.php
│   │   │   │   ├── create.php
│   │   │   │   ├── update.php
│   │   │   │   ├── delete.php
│   │   │   │   └── orders.php
│   │   │   ├── coach/                # AI Coach (Coach Manlaw)
│   │   │   │   ├── chat.php
│   │   │   │   ├── activities.php
│   │   │   │   └── progress.php
│   │   │   ├── tiers/                # Tier Management
│   │   │   │   ├── list.php
│   │   │   │   └── upgrade.php
│   │   │   ├── admin/                # Admin Endpoints
│   │   │   │   ├── members.php
│   │   │   │   ├── statistics.php
│   │   │   │   ├── api-usage.php
│   │   │   │   └── settings.php
│   │   │   └── apps/                 # Integrated Apps
│   │   │       ├── benown.php
│   │   │       ├── zyra.php
│   │   │       ├── vidzie.php
│   │   │       ├── glowie.php
│   │   │       ├── zynect.php
│   │   │       └── zyro.php
│   │   └── router.php                # Main API Router
│   ├── includes/                     # Shared Classes & Functions
│   │   ├── Database.php              # Database connection class
│   │   ├── Auth.php                  # Authentication handler
│   │   ├── JWTHandler.php            # JWT token management
│   │   ├── RateLimiter.php           # Rate limiting
│   │   ├── Validator.php             # Input validation
│   │   ├── Commission.php            # Commission calculations
│   │   ├── Member.php                # Member model
│   │   ├── Marketplace.php           # Marketplace logic
│   │   └── helpers.php               # Helper functions
│   ├── middleware/                   # Middleware
│   │   ├── AuthMiddleware.php        # Authentication check
│   │   ├── AdminMiddleware.php       # Admin access check
│   │   ├── CorsMiddleware.php        # CORS handling
│   │   └── RateLimitMiddleware.php   # Rate limiting
│   ├── config/                       # Configuration
│   │   ├── app.php                   # App configuration
│   │   ├── database.php              # Database configuration
│   │   ├── cors.php                  # CORS settings
│   │   └── jwt.php                   # JWT settings
│   ├── database/                     # Database
│   │   ├── migrations/               # SQL migrations
│   │   └── seeds/                    # Seed data
│   ├── uploads/                      # File uploads
│   ├── logs/                         # Application logs
│   ├── .env                          # Environment variables
│   ├── .htaccess                     # Apache configuration
│   └── index.php                     # Backend entry point
│
├── frontend/                         # React Application
│   ├── public/                       # Static files
│   │   ├── index.html
│   │   └── assets/                   # Images, fonts, etc.
│   ├── src/
│   │   ├── components/               # Reusable Components
│   │   │   ├── common/               # Common UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Alert.jsx
│   │   │   ├── auth/                 # Auth components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── dashboard/            # Dashboard components
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   ├── EarningsChart.jsx
│   │   │   │   ├── TeamTree.jsx
│   │   │   │   └── RecentActivity.jsx
│   │   │   ├── marketplace/          # Marketplace components
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductList.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   └── OrderHistory.jsx
│   │   │   ├── coach/                # Coach components
│   │   │   │   ├── ChatInterface.jsx
│   │   │   │   ├── ActivityList.jsx
│   │   │   │   └── ProgressTracker.jsx
│   │   │   └── tiers/                # Tier components
│   │   │       ├── TierCard.jsx
│   │   │       └── UpgradeModal.jsx
│   │   ├── pages/                    # Page Components
│   │   │   ├── Home.jsx              # Landing page
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx         # Member dashboard
│   │   │   ├── Team.jsx              # Team management
│   │   │   ├── Income.jsx            # Earnings page
│   │   │   ├── Marketplace.jsx       # Marketplace
│   │   │   ├── CoachManlaw.jsx       # AI Coach
│   │   │   ├── Tiers.jsx             # Tier selection
│   │   │   ├── Profile.jsx           # User profile
│   │   │   ├── Settings.jsx          # Account settings
│   │   │   ├── admin/                # Admin pages
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── MemberManagement.jsx
│   │   │   │   └── APIUsage.jsx
│   │   │   └── apps/                 # Integrated apps
│   │   │       ├── Benown.jsx
│   │   │       ├── Zyra.jsx
│   │   │       ├── Vidzie.jsx
│   │   │       ├── Glowie.jsx
│   │   │       ├── Zynect.jsx
│   │   │       └── Zyro.jsx
│   │   ├── services/                 # API Services
│   │   │   ├── api.js                # Base API client (axios)
│   │   │   ├── authService.js        # Authentication API
│   │   │   ├── memberService.js      # Member API
│   │   │   ├── commissionService.js  # Commission API
│   │   │   ├── marketplaceService.js # Marketplace API
│   │   │   ├── coachService.js       # Coach API
│   │   │   ├── tierService.js        # Tier API
│   │   │   └── adminService.js       # Admin API
│   │   ├── context/                  # State Management (Context API)
│   │   │   ├── AuthContext.jsx       # Authentication state
│   │   │   ├── MemberContext.jsx     # Member data state
│   │   │   ├── ThemeContext.jsx      # Theme/UI state
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/                    # Custom React Hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   ├── useDebounce.js
│   │   │   └── useLocalStorage.js
│   │   ├── utils/                    # Utility Functions
│   │   │   ├── formatters.js         # Format currency, dates, etc.
│   │   │   ├── validators.js         # Input validation
│   │   │   ├── constants.js          # App constants
│   │   │   └── helpers.js            # Helper functions
│   │   ├── styles/                   # Global Styles
│   │   │   ├── global.css
│   │   │   ├── variables.css         # CSS variables
│   │   │   └── themes.css            # Theme styles
│   │   ├── App.jsx                   # Main App component
│   │   ├── main.jsx                  # App entry point
│   │   └── routes.jsx                # Route definitions
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Example env file
│   ├── package.json                  # Dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── eslint.config.js              # ESLint config
│   └── README.md                     # Frontend documentation
│
├── shared/                           # Shared Resources
│   ├── assets/                       # Shared assets
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   └── uploads/                      # User uploads (shared)
│
├── docs/                             # Documentation
│   ├── API.md                        # API documentation
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── DEVELOPMENT.md                # Development guide
│
├── scripts/                          # Utility Scripts
│   ├── deploy-backend.sh
│   ├── deploy-frontend.sh
│   └── build-all.sh
│
├── .gitignore
└── README.md                         # Project documentation
```

## API Endpoints Structure

### Authentication
```
POST   /api/v1/auth/login          - User login
POST   /api/v1/auth/register       - User registration
POST   /api/v1/auth/logout         - User logout
POST   /api/v1/auth/verify         - Verify JWT token
POST   /api/v1/auth/refresh        - Refresh JWT token
POST   /api/v1/auth/admin-login    - Admin login
```

### Members
```
GET    /api/v1/members/profile     - Get profile
PUT    /api/v1/members/profile     - Update profile
GET    /api/v1/members/team        - Get team structure
GET    /api/v1/members/stats       - Get member statistics
GET    /api/v1/members/:id         - Get specific member
```

### Commissions
```
GET    /api/v1/commissions/earnings       - Get earnings summary
GET    /api/v1/commissions/history        - Get transaction history
POST   /api/v1/commissions/calculate      - Calculate commissions
POST   /api/v1/commissions/payout         - Request payout
GET    /api/v1/commissions/types          - Get commission types
```

### Marketplace
```
GET    /api/v1/marketplace/products       - List products
POST   /api/v1/marketplace/products       - Create product
PUT    /api/v1/marketplace/products/:id   - Update product
DELETE /api/v1/marketplace/products/:id   - Delete product
GET    /api/v1/marketplace/orders         - Get orders
POST   /api/v1/marketplace/orders         - Create order
```

### Coach (AI)
```
POST   /api/v1/coach/chat                 - Send message
GET    /api/v1/coach/activities           - Get activities
POST   /api/v1/coach/activities           - Submit activity
GET    /api/v1/coach/progress             - Get progress
```

### Tiers
```
GET    /api/v1/tiers                      - List all tiers
POST   /api/v1/tiers/upgrade              - Upgrade tier
GET    /api/v1/tiers/:id                  - Get tier details
```

### Admin
```
GET    /api/v1/admin/members              - Get all members
GET    /api/v1/admin/statistics           - Get system stats
GET    /api/v1/admin/api-usage            - Get API usage
PUT    /api/v1/admin/settings             - Update settings
```

## Authentication Flow

### JWT Token-Based Authentication
```
1. User logs in → Backend validates credentials
2. Backend generates JWT token (expires in 24h)
3. Backend sends token + refresh token to frontend
4. Frontend stores token in localStorage
5. Frontend sends token in Authorization header: "Bearer {token}"
6. Backend middleware validates token on each request
7. Frontend refreshes token before expiry using refresh token
```

## State Management Strategy

### React Context API
```javascript
AuthContext       - User authentication state, login/logout functions
MemberContext     - Member profile, team data, statistics
ThemeContext      - UI theme, dark mode toggle
NotificationContext - Toast notifications, alerts
```

## Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Context API + useReducer
- **HTTP Client**: Axios
- **Styling**: CSS Modules + Bootstrap 5
- **Charts**: Chart.js / Recharts
- **Icons**: Font Awesome / React Icons
- **Forms**: React Hook Form
- **Validation**: Yup

### Backend
- **Language**: PHP 8.1+
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **API Style**: RESTful
- **File Structure**: MVC-inspired
- **Rate Limiting**: Custom middleware
- **CORS**: Configurable

## Environment Variables

### Backend (.env)
```env
APP_ENV=production
APP_URL=https://z2blegacybuilders.co.za
DEBUG_MODE=false

DB_HOST=localhost
DB_NAME=z2b_legacy
DB_USER=root
DB_PASS=

JWT_SECRET=your-secret-key-here
JWT_EXPIRY=86400
REFRESH_TOKEN_EXPIRY=604800

ENCRYPTION_KEY=your-encryption-key

CORS_ALLOWED_ORIGINS=http://localhost:5173,https://z2blegacybuilders.co.za

API_RATE_LIMIT=100
API_RATE_WINDOW=60

CLAUDE_API_KEY=your-claude-api-key
OPENAI_API_KEY=your-openai-api-key
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Z2B Legacy Builders
VITE_APP_VERSION=21.0.0
```

## Development Workflow

### Local Development
```bash
# Terminal 1 - Backend
cd backend
php -S localhost:8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Build
```bash
# Backend - Copy to web server
cp -r backend/* /var/www/html/api/

# Frontend - Build and deploy
cd frontend
npm run build
cp -r dist/* /var/www/html/
```

## Migration Steps

1. ✅ Analyze existing codebase
2. ✅ Design new architecture
3. Set up React project with Vite
4. Reorganize backend into REST API structure
5. Create API router and middleware
6. Implement authentication endpoints
7. Migrate all API endpoints
8. Create React components
9. Implement state management
10. Connect frontend to backend
11. Test thoroughly
12. Deploy

## Security Considerations

- JWT token validation on all protected endpoints
- CSRF protection not needed (using JWT instead of cookies)
- Rate limiting per endpoint
- Input validation and sanitization
- SQL injection prevention (prepared statements)
- XSS prevention (React escapes by default)
- CORS configuration for allowed origins
- HTTPS enforced in production
- File upload validation
- Password hashing (bcrypt)

## Performance Optimizations

- React code splitting and lazy loading
- API response caching
- Database query optimization
- Image optimization
- Minified production builds
- CDN for static assets
- Gzip compression

## Next Steps

1. Initialize React project
2. Set up backend API structure
3. Create base API router
4. Implement authentication system
5. Build core React components
6. Migrate features incrementally
7. Test and deploy
