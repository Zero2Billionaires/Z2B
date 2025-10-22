# Z2B Legacy Builders - Proper User Flow Architecture

## 🎯 User Journey Overview

```
Landing Page → Register/Login → Tier Selection → Payment → Dashboard → Apps
     ↓              ↓               ↓               ↓          ↓
  Public        Auth Flow      Choose Plan      Pay Now    Main App
```

## 📱 Complete User Flow

### 1. **Landing Page** (Public - Unauthenticated)
**File**: `landing-page.html` → React Component
**Route**: `/`
**Purpose**: Marketing page with hero section
**Actions**:
- View hero section and features
- Click "Get Started" → Go to `/register`
- Click "Login" → Go to `/login`
- View tier information

**Sections**:
- Hero with CTA buttons
- Stats section
- Features showcase
- Tier preview
- Testimonials
- Footer

---

### 2. **Registration Flow** (Public)

#### 2a. **Registration Page**
**Route**: `/register`
**Purpose**: Collect user information
**Fields**:
- First Name, Last Name
- Email, Username
- Password
- Phone (optional)
- Sponsor/Referral Code (optional)

**Actions**:
- Submit form → Go to `/select-tier`
- Have account? → Go to `/login`

---

#### 2b. **Tier Selection Page**
**File**: `tiers.html` → React Component
**Route**: `/select-tier`
**Purpose**: Choose membership level
**State**: User registered but not paid

**Tiers Available**:
1. Family Legacy Builder (FAM) - FREE
2. Bronze Legacy Builder (BLB) - R480
3. Copper Legacy Builder (CLB) - R980
4. Silver Legacy Builder (SLB) - R1480
5. Gold Legacy Builder (GLB) - R2980 ⭐ Popular
6. Platinum Legacy Builder (PLB) - R4980
7. Diamond Legacy Builder (DLB) - R5980

**Actions**:
- Select tier → Go to `/payment` (with tier data)
- Skip payment (FREE tier) → Go to `/dashboard`

---

#### 2c. **Payment/Checkout Page**
**File**: `checkout.html` → React Component
**Route**: `/payment`
**Purpose**: Process payment for selected tier
**State**: User registered, tier selected

**Payment Steps**:
1. Review order summary
2. Enter payment details
3. Select payment method (Card, Bank, Yoco, etc.)
4. Process payment
5. Payment success → Go to `/dashboard`

**Features**:
- Order summary card (shows selected tier)
- Payment form
- Payment method selection
- Secure payment processing
- Loading states
- Success/Error handling

---

### 3. **Login Flow** (Public)

**Route**: `/login`
**Purpose**: Authenticate existing users
**Actions**:
- Enter credentials
- Submit → Check payment status:
  - If paid → Go to `/dashboard`
  - If not paid → Go to `/select-tier`
  - If tier selected but not paid → Go to `/payment`
- No account? → Go to `/register`
- Forgot password? → Go to `/forgot-password`

---

### 4. **Dashboard Application** (Protected - Authenticated)

#### Main Dashboard Layout
**File**: `dashboard.html` → React Component
**Route**: `/dashboard`
**Purpose**: Main application hub
**State**: User authenticated and paid

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│             Top Header                   │
│  (Logo, Search, Notifications, Profile)  │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │        Main Content          │
│  Menu    │        (Dynamic Pages)       │
│          │                              │
│  - Home  │                              │
│  - Team  │                              │
│  - Income│                              │
│  - Apps  │                              │
│  etc...  │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

**Sidebar Navigation**:
- 🏠 Dashboard Home
- 👥 My Team
- 💰 Income & Commissions
- 📊 Compensation Plan
- 🛒 Marketplace
- 🎯 Competitions
- 🏆 Achievements
- 💬 Coach Manlaw (AI Coach)
- 📱 Z2B Apps Submenu:
  - Benown (Business Management)
  - Zyra (Lead Generation AI)
  - Vidzie (Video Creator)
  - Glowie (Social Media)
  - Zynect (Team Connection)
  - Zyro (Gamification)
- ⚙️ Settings
- 👤 Profile

---

### 5. **Dashboard Pages** (All Protected)

#### 5a. **Dashboard Home**
**Route**: `/dashboard`
**Content**:
- Welcome message with user's name
- Key statistics cards (earnings, team size, rank)
- Recent activity feed
- Quick actions
- Charts and graphs

#### 5b. **Team Page**
**Route**: `/dashboard/team`
**Content**:
- Team tree visualization
- Downline members list
- Team statistics
- Sponsor information

#### 5c. **Income Page**
**Route**: `/dashboard/income`
**Content**:
- Earnings summary
- Commission breakdown (ISP, TSC, QPB, TPB, TLI)
- Transaction history
- Payout requests
- Earnings charts

#### 5d. **Compensation Plan**
**Route**: `/dashboard/compensation`
**Content**:
- MLM structure explanation
- Commission types
- TLI levels and rewards
- Qualification requirements

#### 5e. **Marketplace**
**Route**: `/dashboard/marketplace`
**Content**:
- Product listings
- Create/sell products
- Order history
- Marketplace earnings

#### 5f. **Competitions**
**Route**: `/dashboard/competitions`
**Content**:
- Active competitions
- Leaderboards
- My progress
- Rewards

#### 5g. **Achievements**
**Route**: `/dashboard/achievements`
**Content**:
- TLI level progress
- Badges and awards
- Milestone tracking

#### 5h. **Coach Manlaw** (AI Coach)
**Route**: `/dashboard/coach`
**Content**:
- AI chat interface
- Activity submissions
- Progress tracking
- Curriculum modules

---

### 6. **Z2B Apps** (All Protected)

#### 6a. **Benown** - Business Management
**Route**: `/dashboard/apps/benown`
**Purpose**: Manage business operations
**Features**:
- Business planning tools
- Task management
- Document storage

#### 6b. **Zyra** - Lead Generation AI
**Route**: `/dashboard/apps/zyra`
**Purpose**: AI-powered lead generation
**Features**:
- Lead capture forms
- AI conversation
- Lead management

#### 6c. **Vidzie** - Video Creator
**Route**: `/dashboard/apps/vidzie`
**Purpose**: Create marketing videos
**Features**:
- Video templates
- Edit and customize
- Share to social media

#### 6d. **Glowie** - Social Media Manager
**Route**: `/dashboard/apps/glowie`
**Purpose**: Manage social media presence
**Features**:
- Post scheduler
- Content calendar
- Analytics

#### 6e. **Zynect** - Team Connection
**Route**: `/dashboard/apps/zynect`
**Purpose**: Connect with team members
**Features**:
- Team chat
- Announcements
- Events

#### 6f. **Zyro** - Gamification Platform
**Route**: `/dashboard/apps/zyro`
**Purpose**: Gamified learning and engagement
**Features**:
- Games and challenges
- Leaderboards
- Rewards

---

### 7. **Settings & Profile** (Protected)

#### Profile Page
**Route**: `/dashboard/profile`
**Content**:
- Personal information
- Profile picture
- Bio and contact details
- Referral code

#### Settings Page
**Route**: `/dashboard/settings`
**Content**:
- Account settings
- Payment methods
- Notification preferences
- Security settings
- Tier upgrade option

---

## 🎨 Layout Components Structure

### Public Layout (Landing, Login, Register)
```jsx
<PublicLayout>
  <Navbar /> {/* Simple navbar with logo and auth buttons */}
  <main>{children}</main>
  <Footer />
</PublicLayout>
```

### Onboarding Layout (Tier Selection, Payment)
```jsx
<OnboardingLayout>
  <SimpleHeader /> {/* Logo and progress steps */}
  <main>{children}</main>
</OnboardingLayout>
```

### Dashboard Layout (All authenticated pages)
```jsx
<DashboardLayout>
  <Sidebar />  {/* Fixed sidebar with navigation */}
  <div className="main-wrapper">
    <TopHeader />  {/* Search, notifications, profile */}
    <main className="content">{children}</main>
  </div>
</DashboardLayout>
```

---

## 🔄 State Management Strategy

### Authentication State
```javascript
{
  isAuthenticated: boolean,
  user: {
    id, username, email, firstName, lastName,
    tierId, hasPaid, referralCode
  },
  token: string,
  refreshToken: string
}
```

### Registration Flow State
```javascript
{
  step: 'register' | 'select-tier' | 'payment',
  userData: { ...registrationData },
  selectedTier: { ...tierData },
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed'
}
```

---

## 🛣️ Complete Route Structure

```javascript
// Public Routes
/                          → Landing Page
/login                     → Login Page
/register                  → Registration Page
/forgot-password           → Password Reset

// Onboarding (Semi-Protected - Registered but not paid)
/select-tier               → Tier Selection
/payment                   → Payment/Checkout

// Protected Dashboard Routes
/dashboard                 → Dashboard Home
/dashboard/team            → Team Management
/dashboard/income          → Income & Commissions
/dashboard/compensation    → Compensation Plan
/dashboard/marketplace     → Marketplace
/dashboard/competitions    → Competitions
/dashboard/achievements    → Achievements
/dashboard/coach           → AI Coach (Coach Manlaw)
/dashboard/profile         → User Profile
/dashboard/settings        → Account Settings

// Protected App Routes
/dashboard/apps/benown     → Benown App
/dashboard/apps/zyra       → Zyra App
/dashboard/apps/vidzie     → Vidzie App
/dashboard/apps/glowie     → Glowie App
/dashboard/apps/zynect     → Zynect App
/dashboard/apps/zyro       → Zyro App

// Admin Routes (Super Protected)
/admin                     → Admin Dashboard
/admin/members             → Member Management
/admin/statistics          → System Stats
/admin/api-usage           → API Usage
```

---

## 🎯 Navigation Guards

### Route Protection Logic

```javascript
// Public Route (/, /login, /register)
if (isAuthenticated && hasPaid) {
  redirect to '/dashboard'
}

// Onboarding Routes (/select-tier, /payment)
if (!isAuthenticated) {
  redirect to '/register'
}
if (isAuthenticated && hasPaid) {
  redirect to '/dashboard'
}

// Dashboard Routes (/dashboard/*)
if (!isAuthenticated) {
  redirect to '/login'
}
if (isAuthenticated && !hasPaid) {
  redirect to '/select-tier'
}

// Admin Routes (/admin/*)
if (!isAuthenticated || !isAdmin) {
  redirect to '/dashboard'
}
```

---

## 📦 Component Organization

```
frontend/src/
├── layouts/
│   ├── PublicLayout.jsx       # Landing, Login, Register
│   ├── OnboardingLayout.jsx   # Tier Selection, Payment
│   └── DashboardLayout.jsx    # All dashboard pages
│
├── components/
│   ├── navigation/
│   │   ├── Navbar.jsx         # Public navbar
│   │   ├── Sidebar.jsx        # Dashboard sidebar
│   │   └── TopHeader.jsx      # Dashboard top bar
│   ├── landing/
│   │   ├── HeroSection.jsx
│   │   ├── StatsSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   └── TiersPreview.jsx
│   ├── tiers/
│   │   └── TierCard.jsx
│   ├── payment/
│   │   ├── OrderSummary.jsx
│   │   ├── PaymentForm.jsx
│   │   └── PaymentMethods.jsx
│   └── dashboard/
│       ├── StatsCard.jsx
│       ├── ActivityFeed.jsx
│       ├── TeamTree.jsx
│       └── EarningsChart.jsx
│
├── pages/
│   ├── public/
│   │   ├── LandingPage.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── onboarding/
│   │   ├── TierSelection.jsx
│   │   └── Payment.jsx
│   ├── dashboard/
│   │   ├── DashboardHome.jsx
│   │   ├── Team.jsx
│   │   ├── Income.jsx
│   │   ├── Compensation.jsx
│   │   ├── Marketplace.jsx
│   │   ├── Competitions.jsx
│   │   ├── Achievements.jsx
│   │   ├── CoachManlaw.jsx
│   │   ├── Profile.jsx
│   │   └── Settings.jsx
│   └── apps/
│       ├── Benown.jsx
│       ├── Zyra.jsx
│       ├── Vidzie.jsx
│       ├── Glowie.jsx
│       ├── Zynect.jsx
│       └── Zyro.jsx
```

---

## 🎨 Design System

### Color Scheme (From existing HTML)
```css
:root {
  --navy-blue: #0A2647;
  --gold: #FFD700;
  --royal-gold: #D4AF37;
  --orange: #FF6B35;
  --dark-navy: #051428;
  --white: #FFFFFF;
  --light-bg: #FAF8F3;
}
```

### Typography
- Font: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- Headings: Bold, with text-shadow for emphasis
- Body: Regular weight

### Component Patterns
- Card-based layouts
- Gradient backgrounds
- Hover effects with transform
- Box shadows for depth
- Rounded corners (border-radius: 15-20px)
- Icon-driven navigation

---

## ✅ Implementation Checklist

1. [ ] Create Layout Components
   - [ ] PublicLayout
   - [ ] OnboardingLayout
   - [ ] DashboardLayout (with Sidebar)

2. [ ] Convert Landing Page
   - [ ] Hero Section
   - [ ] Stats Section
   - [ ] Features Section
   - [ ] Tier Preview
   - [ ] Footer

3. [ ] Create Onboarding Flow
   - [ ] Update Register page to redirect to tier selection
   - [ ] Convert Tier Selection page
   - [ ] Convert Payment/Checkout page

4. [ ] Create Dashboard Components
   - [ ] Sidebar navigation
   - [ ] Top header with search and profile
   - [ ] Dashboard home with stats

5. [ ] Convert All Dashboard Pages
   - [ ] Team page with tree visualization
   - [ ] Income page with charts
   - [ ] Marketplace page
   - [ ] Coach Manlaw page
   - [ ] All 6 app pages

6. [ ] Update Routing
   - [ ] Add route guards
   - [ ] Add payment status check
   - [ ] Add admin routes

7. [ ] Add State Management
   - [ ] Registration flow context
   - [ ] Payment status context
   - [ ] User preferences context

---

This architecture ensures a proper user flow from landing → registration → payment → dashboard, matching your existing HTML structure while modernizing it with React!
