# Z2B Legacy Builders - Registration System Documentation

## Overview
The Z2B Legacy Builders platform now features a comprehensive public registration system that allows prospects to register directly from the landing page with sponsor tracking, multiple payment options, and automated welcome emails.

## Features Implemented

### 1. Landing Page Updates
- **Login Button**: Links to the dashboard for existing members
- **Register Button**: Opens the registration page for new prospects
- Located in the top navigation bar for easy access

### 2. Registration Page (`register.html`)
A fully-featured registration form with the following capabilities:

#### Personal Information Collection
- First Name
- Last Name
- Email Address
- WhatsApp Number
- ID Number
- Password (minimum 6 characters)

#### Sponsor Tracking
- Automatically captures sponsor ID from URL parameter (`?ref=REFERRALCODE`)
- Displays sponsor information when a valid referral link is used
- Tracks the referral relationship in the database

#### Membership Tier Selection
Users can choose from 7 membership tiers:
- FAM - Free Access Member (R0)
- BRONZE - R960/month (or R480 Beta Price)
- COPPER - R1,980/month (or R990 Beta Price)
- SILVER - R2,980/month (or R1,490 Beta Price)
- GOLD - R4,980/month (or R2,490 Beta Price)
- PLATINUM - R6,980/month (or R3,490 Beta Price)
- LIFETIME - R12,000 One-Time (or R6,000 Beta Price)

#### Payment Method Options
The system supports 4 different payment methods:

1. **Pay Online** (Yoco/Payfast/Crypto)
   - Instant activation
   - Supports credit cards, EFT, and cryptocurrency

2. **Bank EFT Transfer**
   - Account Name: Zero2billionaires Amavulandlela
   - Account Number: 1318257727
   - Bank: FNB
   - Reference: User's WhatsApp Number
   - Activation after payment verification

3. **Cryptocurrency**
   - Redirects to CoinPayments gateway
   - Accepts 2000+ cryptocurrencies (BTC, ETH, USDT, etc.)

4. **Direct Cash Deposit** ⭐ SPECIAL FEATURE
   - **FREE ACCESS until Admin receives Proof of Payment**
   - Account Name: Zero2billionaires Amavulandlela
   - Account Number: 1318257727
   - Bank: FNB
   - Reference: User's WhatsApp Number
   - Users get immediate access to their selected tier
   - Account remains active until POP is verified
   - Instructions: Make deposit, send proof to WhatsApp: 077 490 1639

### 3. Backend API Endpoints

#### Public Registration Endpoint
**POST** `/api/auth/register`

Registers a new user without authentication required.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "0774901639",
  "idNumber": "8001015800083",
  "password": "SecurePass123",
  "tier": "BRONZE",
  "sponsorCode": "Z2BXYZ123", // Optional
  "paymentMethod": "cash" // Options: online, eft, crypto, cash
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Welcome email sent.",
  "data": {
    "id": "user_id_here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "referralCode": "Z2BABCDEF",
    "memberId": "Z2BABCDEF",
    "referralLink": "https://z2blegacybuilders.co.za/register.html?ref=Z2BABCDEF",
    "tier": "BRONZE",
    "accountStatus": "ACTIVE"
  }
}
```

#### Get User by Referral Code (Public)
**GET** `/api/users/by-referral/:referralCode`

Retrieves basic user information by referral code (no authentication required).

**Response:**
```json
{
  "success": true,
  "data": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "referralCode": "Z2BXYZ123",
    "tier": "GOLD"
  }
}
```

### 4. Welcome Email System

When a user registers, they receive an automated welcome email containing:

- **Personal Greeting** with their name
- **Login Credentials**: Email and password
- **Membership Details**: Selected tier and member ID
- **Referral Information**:
  - Unique Member ID (same as referral code)
  - Complete referral link for sharing
- **7 Income Streams Overview**:
  1. ISP - Individual Sales Profit (20%-45%)
  2. QPB - Quick Pathfinder Bonus (7.5%-10%)
  3. TSC - Team Sales Commission (10 levels)
  4. TPB - Team Performance Bonus
  5. TLI - Team Leadership Incentive
  6. CEO - CEO Awards & Competitions
  7. MKT - Marketplace Sales (95% yours!)
- **Next Steps Guide**
- **Dashboard Login Link**

### 5. Sponsor Tracking & Team Building

The system automatically:
- Links new members to their sponsors
- Updates sponsor's direct referral count
- Increments sponsor's total team size
- Maintains the referral hierarchy for commission calculations

### 6. Cash Deposit Approval Workflow

#### For Cash Deposit Users:
1. User selects "Direct Cash Deposit" payment method
2. System creates account with `accountStatus: "ACTIVE"`
3. User gets immediate FREE ACCESS to their selected tier
4. User makes cash deposit at FNB branch
5. User sends proof of payment to WhatsApp: 077 490 1639
6. Admin receives and verifies the payment
7. Admin can then:
   - Keep the user active with full tier benefits
   - Or downgrade to FAM if payment not received

#### For Admin:
- Cash deposit users are marked as ACTIVE immediately
- Admin can view and manage all users in the admin panel
- Check account notes to track payment status
- Update user status or tier as needed

## Usage Instructions

### For New Members
1. Visit the landing page: `https://z2blegacybuilders.co.za/landing-page.html`
2. Click the "Register" button in the top navigation
3. Fill in personal information
4. Select your membership tier
5. Choose your payment method:
   - **For Cash Deposit**: Get instant access, make deposit, send POP to WhatsApp
   - **For Online/EFT/Crypto**: Follow payment instructions
6. Check your email for welcome message with login credentials
7. Login to dashboard and start building your legacy!

### For Existing Members (Building Team)
1. Login to your dashboard
2. Copy your referral link from dashboard or email
3. Share link via WhatsApp, social media, or email
4. When prospects click your link and register, they're automatically linked as your referral
5. Track your team growth in the dashboard
6. Earn commissions on your team's purchases

### For Administrators
1. Login to admin panel: `https://z2blegacybuilders.co.za/admin.html`
2. View all registered users in "Users" section
3. Filter by tier, status, or search by name/email
4. For cash deposit users:
   - Check account notes
   - Verify POP received via WhatsApp
   - Update user status if needed
5. Grant free app access or adjust tiers as needed

## Technical Details

### Frontend
- **Registration Page**: `app/register.html`
- **Landing Page**: `app/landing-page.html` (updated with Login/Register buttons)

### Backend
- **Registration Route**: `admin-backend/routes/auth.js` (POST /api/auth/register)
- **User Routes**: `admin-backend/routes/users.js` (GET /api/users/by-referral/:code)
- **User Model**: `admin-backend/models/User.js`
- **Email Service**: `admin-backend/utils/emailService.js`

### Database Schema Updates
The User model includes:
- `sponsorId`: Reference to sponsor user
- `sponsorCode`: Sponsor's referral code (for tracking)
- `referralCode`: User's unique referral code (auto-generated)
- `accountStatus`: ACTIVE, PENDING, SUSPENDED, BLOCKED
- `directReferrals`: Count of direct referrals
- `totalTeamSize`: Total team members under this user

### Account Status Flow
- **Cash Deposit**: `ACTIVE` → (Free access until POP verified)
- **EFT/Online**: `PENDING` → `ACTIVE` (After payment verification)
- **FAM (Free)**: `ACTIVE` (Immediate access to limited features)

## Security Features
- Passwords are hashed using bcrypt (10 rounds)
- Email addresses are stored in lowercase
- Duplicate email prevention
- Input validation on both frontend and backend
- CORS configuration for API security

## Email Configuration
To enable welcome emails, configure these environment variables in `.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Future Enhancements
- [ ] Email verification with OTP
- [ ] Payment gateway integration (Yoco, Payfast, CoinPayments)
- [ ] Automated proof of payment processing
- [ ] SMS notifications
- [ ] Social media login (Google, Facebook)
- [ ] Team genealogy tree visualization
- [ ] Commission calculator

## Support
For technical support or questions:
- WhatsApp: 077 490 1639
- Email: support@z2blegacybuilders.co.za

---

**Last Updated**: January 2025
**Version**: 1.0.0
