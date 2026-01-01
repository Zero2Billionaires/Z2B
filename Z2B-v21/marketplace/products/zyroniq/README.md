# 🚀 ZYRONIQ — The Futuristic Pay Intelligence Engine

**Tagline:** "Intelligence that Calculates Your Legacy."

---

## 📋 Overview

Zyroniq is a standalone, white-labelable Network Marketing Intelligence Platform designed to be sold as an independent product or licensed to other network marketing companies. Built on the proven Z2B Legacy Builders MLM framework, it offers:

- **100% White-Label Customization**
- **6 Income Stream Calculators** (ISP, QPB, TSC, TPB, TLI, CEO Awards)
- **10-Generation Team Tracking**
- **Real-Time Earnings Intelligence**
- **Enterprise-Grade Security**
- **Futuristic UI Design**

---

## 💰 Pricing

**R19,980/month** - Enterprise White-Label License

### Includes:
- ✅ Unlimited Members
- ✅ Full White-Label Rights
- ✅ Custom Branding & Logo
- ✅ Configurable Commission Plans
- ✅ All Income Stream Calculators
- ✅ Real-Time Analytics Dashboard
- ✅ Member Portal & Admin Panel
- ✅ API Access
- ✅ Priority Support
- ✅ Lifetime Updates

---

## 🎨 Brand Identity

### Colors
- **Primary:** Electric Cyan (#00FFF0) - Intelligence, Innovation
- **Secondary:** Deep Space Black (#0C0C1C) - Power, Mystery
- **Accent:** Quantum Purple (#6C63FF) - Futurism, Creativity
- **Neon Silver:** #C0C0C0
- **Luminous Blue:** #3AEFFF

### Typography
- **Primary Font:** Orbitron (futuristic, sci-fi)
- **Secondary Font:** Inter (modern, readable)

### Logo Concept
- Stylized "Z" with quantum/neural-grid circuitry
- Optional glowing ring or orbit path
- Symbolizes continuous profit flow

---

## 📁 File Structure

```
zyroniq/
├── index.html                      # Landing page (COMPLETED ✅)
├── README.md                       # This file (COMPLETED ✅)
├── config/
│   └── whitelabel-config.php      # All customizable settings (COMPLETED ✅)
├── includes/
│   ├── Database.php               # Database connection (TO BUILD)
│   ├── MLMCalculator.php          # Commission calculator (TO BUILD)
│   ├── Authentication.php         # User auth system (TO BUILD)
│   └── API.php                    # REST API endpoints (TO BUILD)
├── app/
│   ├── zyroniq_dashboard.html     # Member dashboard (COMPLETED ✅)
│   ├── earnings.html              # Earnings breakdown (TO BUILD)
│   ├── team.html                  # Genealogy tree (TO BUILD)
│   ├── analytics.html             # Performance analytics (TO BUILD)
│   └── profile.html               # Member profile (TO BUILD)
├── admin/
│   ├── index.html                 # Admin dashboard (TO BUILD)
│   ├── whitelabel.html            # White-label config panel (TO BUILD)
│   ├── members.html               # Member management (TO BUILD)
│   ├── commissions.html           # Commission management (TO BUILD)
│   └── tli-approval.html          # TLI CEO approval (TO BUILD)
└── assets/
    ├── logo.png                   # Company logo (TO CREATE)
    ├── favicon.ico                # Favicon (TO CREATE)
    └── screenshots/               # Product screenshots (TO CREATE)
```

---

## ⚙️ Configuration System

### White-Label Settings (config/whitelabel-config.php)

All aspects of the platform can be customized:

#### 1. **Brand Identity**
- App name, company name, tagline
- Logo and favicon URLs
- Support contact information
- Version and launch date

#### 2. **Design System**
- Primary, secondary, accent colors
- Font families
- Dark/light mode preferences
- Animation settings

#### 3. **MLM Commission Structure**
```php
'commissions' => [
    'isp' => [25, 28, 30, 35, 40, 50],      // By tier
    'qpb' => ['first_three' => 7.5, 'subsequent' => 10],
    'tsc_generations' => [10, 5, 3, 2, 1, 1, 1, 1, 1, 1],
    'tpb_percentage' => 5,
    'tli_pool_percentage' => 10,
    'marketplace_fee' => 5
]
```

#### 4. **Membership Tiers** (Fully Customizable)
- 6 default tiers included
- Each tier configurable:
  - Name, price, PV value
  - ISP percentage
  - TSC generations allowed
  - TLI max level access
  - Color and features

#### 5. **TLI Recognition Levels**
- 10 achievement levels
- Monthly TeamPV requirements
- Quarterly rewards
- Leader requirements

#### 6. **Payment Settings**
- Currency, payment methods
- Payout schedule (monthly/weekly)
- Minimum payout threshold

#### 7. **System Settings**
- Timezone, date/time formats
- Language, maintenance mode
- API rate limits

#### 8. **Feature Toggles**
- Enable/disable specific features
- Genealogy tree, analytics, leaderboard
- Notifications, marketplace, training center

#### 9. **License Information**
- License type, key, licensee details
- Max members, allowed domains

---

## 🔧 Technical Architecture

### Backend (PHP)
- **Database:** MySQL/MariaDB
- **Framework:** Native PHP (no dependencies)
- **API:** RESTful JSON API
- **Authentication:** Session-based + JWT tokens
- **Security:** Password hashing, CSRF protection, SQL injection prevention

### Frontend
- **HTML5, CSS3, JavaScript**
- **Fonts:** Google Fonts (Orbitron, Inter)
- **Icons:** Font Awesome 6
- **Responsive:** Mobile-first design
- **Animations:** CSS3 + vanilla JS

### Database Schema (TO CREATE)

**Tables needed:**
1. `zyroniq_members` - User accounts
2. `zyroniq_tiers` - Membership tiers
3. `zyroniq_transactions` - All transactions
4. `zyroniq_commissions` - Commission records
5. `zyroniq_genealogy` - Team structure
6. `zyroniq_tli_qualifications` - TLI tracking
7. `zyroniq_settings` - System settings
8. `zyroniq_licenses` - License management

---

## 📊 Core Features

### 1. **Real-Time Earnings Dashboard**
- Live commission calculations
- Income stream breakdown (ISP, QPB, TSC, TPB, TLI, CEO)
- Daily/weekly/monthly/yearly views
- Graphical trend analysis

### 2. **10-Generation Genealogy Tree**
- Interactive visual tree
- Expandable/collapsible nodes
- Performance metrics per member
- Filter by tier, status, activity

### 3. **Performance Analytics**
- Team PV tracking
- TLI qualification status
- Rank advancement progress
- Predictive earning forecasts

### 4. **White-Label Admin Panel**
- One-click branding updates
- Commission structure editor
- Tier management
- Member management
- TLI approval workflow

### 5. **Member Portal**
- Personal dashboard
- Earnings reports
- Team management
- Replicated site generator
- Training resources

### 6. **TLI Recognition System**
- Automatic qualification checking
- 3-month rolling performance tracking
- Leader requirement validation
- CEO approval workflow
- Quarterly pool calculation

---

## 🚀 Deployment Instructions

### For Z2B Marketplace:

1. **Upload to Marketplace:**
   - Package entire `/zyroniq/` folder
   - Create product listing with:
     - Title: "🚀 Zyroniq — The Futuristic Pay Intelligence Engine"
     - Price: R19,980/month
     - Category: Business Tools / MLM Software
     - Description: (Use landing page content)

2. **Product Images:**
   - Landing page screenshot
   - Dashboard screenshot
   - Admin panel screenshot
   - Genealogy tree screenshot

3. **License Delivery:**
   - Upon purchase, generate unique license key
   - Email buyer with download link + license key
   - Provide white-label configuration guide

### For External Sales:

1. **Custom Domain Setup:**
   - Point buyer's domain to Zyroniq installation
   - Configure SSL certificate
   - Update `domains_allowed` in license config

2. **Branding Customization:**
   - Access white-label admin panel
   - Update all brand settings
   - Upload custom logo and favicon
   - Set custom color scheme

3. **Commission Structure:**
   - Configure tier pricing
   - Set ISP percentages
   - Define TSC generation breakdown
   - Set TLI recognition levels

4. **Training & Handoff:**
   - Provide admin training video
   - Document custom configuration
   - Set up support channel
   - Schedule follow-up check-in

---

## 📈 Marketing Strategy

### Target Audience:
1. **Network Marketing Companies** seeking custom software
2. **MLM Startups** needing turnkey solution
3. **Entrepreneurs** launching new MLM ventures
4. **Existing Companies** wanting to upgrade systems

### Value Propositions:
- ✅ **Save Development Costs:** No need to build from scratch (R500K+ value)
- ✅ **Instant Deployment:** Live in days, not months
- ✅ **Proven System:** Based on working Z2B framework
- ✅ **Full Customization:** Make it 100% your brand
- ✅ **Continuous Updates:** Always get latest features

### Sales Channels:
1. **Z2B Marketplace** (internal members)
2. **Direct B2B Sales** (external companies)
3. **Affiliate Program** (Z2B members sell for commission)
4. **MLM Industry Events** (conferences, expos)
5. **LinkedIn/Facebook Ads** (B2B targeting)

---

## 🛠️ Development Roadmap

### Phase 1: Core Foundation (COMPLETED ✅)
- [x] Landing page with futuristic design
- [x] White-label configuration system
- [x] File structure and architecture

### Phase 2: Backend Development (IN PROGRESS)
- [ ] Database schema creation
- [ ] MLM calculator engine
- [ ] Authentication system
- [ ] API endpoints
- [ ] Commission automation

### Phase 3: Member Portal (NEXT)
- [ ] Dashboard with real-time earnings
- [ ] Earnings breakdown page
- [ ] Team genealogy tree
- [ ] Performance analytics
- [ ] Profile management

### Phase 4: Admin Panel (UPCOMING)
- [ ] White-label customization interface
- [ ] Member management
- [ ] Commission management
- [ ] TLI approval workflow
- [ ] System settings

### Phase 5: Advanced Features (FUTURE)
- [ ] Mobile app (iOS/Android)
- [ ] AI-powered insights
- [ ] Replicated site generator
- [ ] Marketplace integration
- [ ] Training center CMS

### Phase 6: Launch & Marketing
- [ ] Product photography/screenshots
- [ ] Demo video creation
- [ ] Sales materials
- [ ] Marketplace listing
- [ ] Affiliate program setup

---

## 💡 Selling Points for Z2B Members

Encourage Z2B members to sell Zyroniq to network marketing companies with these benefits:

### For the Seller (Z2B Member):
- **High-Ticket Commission:** R19,980/month = potential R2,000-R5,000 commission per sale
- **Recurring Revenue:** Monthly subscriptions = passive income
- **Proven Product:** Based on Z2B's working system
- **Full Support:** Z2B handles technical support and updates
- **Easy Sales:** Proven demand in MLM industry

### For the Buyer (MLM Company):
- **Instant Solution:** No 6-12 month development time
- **Cost Savings:** R500K+ development cost avoided
- **Proven System:** Battle-tested on Z2B platform
- **Full Control:** 100% white-label customization
- **Scalable:** Unlimited members supported

---

## 📞 Support & Contact

**Developer Support:** support@zyroniq.com
**Sales Inquiries:** sales@z2blegacybuilders.co.za
**White-Label Customization:** whitelabel@zyroniq.com

---

## 📝 License

**Proprietary Software**
© 2026 Z2B Legacy Builders
All Rights Reserved

White-label licensees receive perpetual license for their company use.
Resale of white-labeled versions requires separate distribution agreement.

---

## 🎯 Next Steps

1. ✅ **Review Landing Page** - Check design and branding
2. 🔨 **Complete Backend** - Build MLM calculator and database
3. 🎨 **Build Member Dashboard** - Create futuristic UI
4. ⚙️ **Create Admin Panel** - White-label configuration interface
5. 📸 **Product Screenshots** - Professional imagery for marketing
6. 🚀 **Launch on Marketplace** - List at R19,980/month
7. 📣 **Train Sales Team** - Equip Z2B members to sell

---

**Built with 💜 by the Z2B Development Team**
*Transforming Employees to Entrepreneurs*
