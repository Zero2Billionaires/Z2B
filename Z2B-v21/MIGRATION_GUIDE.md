# Z2B Legacy Builders - React Migration Guide

## Overview

This guide will help you complete the migration from the monolithic PHP application to the new React + PHP REST API architecture.

## ✅ What Has Been Completed

### Backend (PHP REST API)
- ✅ Project structure reorganized into `backend/` directory
- ✅ API router system with middleware support
- ✅ JWT authentication system implemented
- ✅ CORS middleware for cross-origin requests
- ✅ Rate limiting middleware
- ✅ Authentication endpoints (login, register, verify, refresh, logout)
- ✅ Environment configuration setup
- ✅ Database configuration migrated

### Frontend (React)
- ✅ React project created with Vite
- ✅ React Router configured with all routes
- ✅ Authentication context for global state management
- ✅ Protected route component
- ✅ API service layer with axios
- ✅ Authentication service (login, register, logout)
- ✅ Global styles and theme
- ✅ Login and Register pages
- ✅ Home/Landing page
- ✅ Placeholder pages for all routes

## 🚧 What Still Needs to Be Done

### Backend API Endpoints

1. **Members API** (`backend/api/v1/members/`)
   - Create `router.php`
   - Implement `profile.php` - Get/update member profile
   - Implement `team.php` - Get team structure and downlines
   - Implement `stats.php` - Get member statistics

2. **Commissions API** (`backend/api/v1/commissions/`)
   - Create `router.php`
   - Implement `earnings.php` - Get earnings summary
   - Implement `history.php` - Get transaction history
   - Implement `calculate.php` - Calculate commissions
   - Implement `payout.php` - Request payout

3. **Marketplace API** (`backend/api/v1/marketplace/`)
   - Create `router.php`
   - Implement `products.php` - CRUD operations for products
   - Implement `orders.php` - Order management

4. **Coach API** (`backend/api/v1/coach/`)
   - Create `router.php`
   - Implement `chat.php` - AI Coach chat interface
   - Implement `activities.php` - Activity submission and tracking
   - Implement `progress.php` - Progress tracking

5. **Tiers API** (`backend/api/v1/tiers/`)
   - Create `router.php`
   - Implement `list.php` - Get all tiers
   - Implement `upgrade.php` - Upgrade membership tier

6. **Admin API** (`backend/api/v1/admin/`)
   - Create `router.php`
   - Implement `members.php` - Member management
   - Implement `statistics.php` - System statistics
   - Implement `api-usage.php` - API usage tracking

### Frontend Development

1. **Complete Page Implementations**
   - Dashboard page with stats and charts
   - Team page with downline tree visualization
   - Income page with earnings breakdown
   - Marketplace page with product listings
   - Coach Manlaw page with AI chat interface
   - Tiers page with tier selection
   - Profile and Settings pages

2. **Additional Services**
   - Create `memberService.js`
   - Create `commissionService.js`
   - Create `marketplaceService.js`
   - Create `coachService.js`
   - Create `tierService.js`
   - Create `adminService.js`

3. **Shared Components**
   - Navbar component
   - Footer component
   - Card components
   - Modal component
   - Alert/Toast component
   - Chart components
   - Team tree visualization component

## 📋 Step-by-Step Migration Process

### Step 1: Set Up Environment

```bash
# 1. Set up backend environment
cd backend
cp .env.example .env
# Edit .env and configure your database and API keys

# 2. Set up frontend environment
cd ../frontend
cp .env.example .env
# Edit .env if needed (default should work for local development)
```

### Step 2: Start Development Servers

```bash
# Terminal 1 - Backend API
cd backend
php -S localhost:8000

# Terminal 2 - Frontend React
cd frontend
npm run dev
```

The frontend will be available at http://localhost:5173
The backend API will be available at http://localhost:8000

### Step 3: Test Authentication

1. Open http://localhost:5173 in your browser
2. Click "Register" and create a test account
3. Login with your new credentials
4. Verify JWT token is being stored in localStorage

### Step 4: Implement Remaining API Endpoints

Use the authentication endpoints as templates. For each new endpoint:

1. Create the router file
2. Create individual endpoint files
3. Implement proper error handling
4. Test with Postman or curl
5. Update the main router in `backend/index.php`

**Example: Members Profile Endpoint**

```php
// backend/api/v1/members/router.php
<?php
$action = $segments[1] ?? 'profile';

switch ($action) {
    case 'profile':
        require_once __DIR__ . '/profile.php';
        break;
    // ... other cases
}
```

```php
// backend/api/v1/members/profile.php
<?php
require_once __DIR__ . '/../../../config/database.php';

$currentUser = $GLOBALS['currentUser'];
$userId = $currentUser['userId'];

if ($requestMethod === 'GET') {
    // Get profile
    $stmt = $db->prepare("SELECT * FROM members WHERE id = ?");
    $stmt->execute([$userId]);
    $member = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'data' => $member
    ]);
} elseif ($requestMethod === 'PUT') {
    // Update profile
    $input = json_decode(file_get_contents('php://input'), true);
    // ... update logic
}
```

### Step 5: Implement Frontend Services

For each API endpoint, create a corresponding service function:

```javascript
// frontend/src/services/memberService.js
import { apiClient } from './api';

const memberService = {
  getProfile: async () => {
    const response = await apiClient.get('/members/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/members/profile', data);
    return response.data;
  },

  getTeam: async () => {
    const response = await apiClient.get('/members/team');
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/members/stats');
    return response.data;
  },
};

export default memberService;
```

### Step 6: Build Out React Pages

Replace placeholder pages with full implementations:

```javascript
// Example: Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import memberService from '../services/memberService';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await memberService.getStats();
        setStats(data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-5">
      <h1>Dashboard</h1>
      {/* Render stats and charts */}
    </div>
  );
};

export default Dashboard;
```

### Step 7: Testing

1. **Test Each API Endpoint**
   ```bash
   # Example: Test login
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"testpass"}'
   ```

2. **Test Frontend Integration**
   - Test all user flows
   - Test protected routes
   - Test error handling
   - Test token refresh

3. **Test Edge Cases**
   - Invalid credentials
   - Expired tokens
   - Rate limiting
   - Network errors

### Step 8: Migrate Existing Features

For each existing feature in the old app:

1. Identify the business logic
2. Move logic to appropriate API endpoint
3. Create React component for UI
4. Connect component to API via service
5. Test thoroughly

### Step 9: Production Deployment

#### Backend Deployment

```bash
# 1. Build for production
cd backend
# No build needed for PHP, just copy files

# 2. Copy to web server
# Upload backend/ folder to your server
# Configure Apache/Nginx to point to backend/index.php

# 3. Set up environment
cp .env.example .env
# Edit .env with production values
# Set DEBUG_MODE=false
# Set strong JWT_SECRET
# Configure production database

# 4. Set up database
# Import SQL schema and migrations
mysql -u username -p database_name < sql/z2b_complete_schema.sql
```

#### Frontend Deployment

```bash
# 1. Update environment
cd frontend
# Edit .env and set VITE_API_BASE_URL to production API URL
VITE_API_BASE_URL=https://yourdomain.com/api/v1

# 2. Build for production
npm run build

# 3. Deploy
# Upload dist/ folder contents to your web server
# Configure server to serve index.html for all routes (SPA mode)
```

#### Apache Configuration (.htaccess)

**Backend (.htaccess in backend/):**
```apache
RewriteEngine On
RewriteBase /api/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php/$1 [L]
```

**Frontend (.htaccess in dist/):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 🛠️ Development Scripts

### Backend

```bash
# Start PHP development server
cd backend && php -S localhost:8000

# Run database migrations
php database/migrate.php

# Check PHP version
php --version
```

### Frontend

```bash
# Install dependencies
cd frontend && npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 Additional Resources

### File Locations Reference

```
Backend:
- Entry point: backend/index.php
- API endpoints: backend/api/v1/
- Middleware: backend/middleware/
- Config: backend/config/
- Database: backend/database/

Frontend:
- Entry point: frontend/src/main.jsx
- App router: frontend/src/App.jsx
- Pages: frontend/src/pages/
- Components: frontend/src/components/
- Services: frontend/src/services/
- Context: frontend/src/context/
```

### API Testing with curl

```bash
# Register
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

# Access protected route
curl -X GET http://localhost:8000/api/v1/members/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐛 Troubleshooting

### CORS Errors
- Check `CORS_ALLOWED_ORIGINS` in backend/.env
- Ensure frontend URL is in the allowed origins list

### JWT Token Issues
- Check token expiry time
- Verify JWT_SECRET is set correctly
- Check browser localStorage for token

### Database Connection Errors
- Verify database credentials in backend/.env
- Ensure MySQL server is running
- Check database exists and schema is imported

### Frontend Build Errors
- Delete `node_modules` and run `npm install`
- Clear npm cache: `npm cache clean --force`
- Check Node version: `node --version` (should be 16+)

## 🎯 Next Steps

1. Implement remaining API endpoints (see list above)
2. Build out React page components
3. Add state management for complex features
4. Implement real-time features (WebSocket for Coach chat)
5. Add proper error boundaries
6. Implement loading states
7. Add unit and integration tests
8. Set up CI/CD pipeline
9. Performance optimization
10. Security audit

## 📞 Support

For questions or issues:
- Review the architecture documentation: `REACT_MIGRATION_ARCHITECTURE.md`
- Check existing code for examples
- Test API endpoints with Postman or curl
- Review browser console for frontend errors
- Check PHP error logs for backend issues

---

**Migration Status**: Foundation Complete ✅
**Next Priority**: Implement remaining API endpoints and complete page implementations
