# 🛒 Z2B UNIVERSAL MARKETPLACE SYSTEM

**Version:** 2.0
**Date:** January 2026
**Status:** ✅ Core System Complete

---

## 📋 OVERVIEW

The Z2B Universal Marketplace allows **ALL members** to sell products and services while automatically distributing MLM commissions throughout the network. Every sale triggers the full Z2B compensation plan (ISP, QPB, TSC, TPB, TLI, CEO).

### Key Features:
✅ **Member-Created Products** - Any member can list and sell
✅ **Admin Products** - Z2B official products (like Zyroniq)
✅ **3 Product Types** - Digital, Physical, Services
✅ **Dynamic Pricing** - Automatic MLM commission pool calculation
✅ **Automated Distribution** - Commissions paid instantly on sale
✅ **Platform Fee** - Z2B earns 7.5% on every transaction

---

## 💰 PRICING FORMULA

### How It Works:

```
Member wants to earn:        R 100.00
MLM Commission Pool (100%):  R 100.00  (distributed to upline)
Z2B Platform Fee (7.5%):     R  15.00  (on R200 subtotal)
─────────────────────────────────────
FINAL RETAIL PRICE:          R 215.00
```

### Formula:
```
MLM Pool = Member Desired Income × 100%
Platform Fee = (Member Income + MLM Pool) × 7.5%
Final Price = Member Income + MLM Pool + Platform Fee
```

### Real Examples:

| Member Wants | MLM Pool | Platform Fee | **Buyer Pays** |
|--------------|----------|--------------|----------------|
| R 50         | R 50     | R 7.50       | **R 107.50**   |
| R 100        | R 100    | R 15.00      | **R 215.00**   |
| R 500        | R 500    | R 75.00      | **R 1,075.00** |
| R 1,000      | R 1,000  | R 150.00     | **R 2,150.00** |
| R 10,000     | R 10,000 | R 1,500.00   | **R 21,500.00**|

---

## 🎯 COMMISSION DISTRIBUTION

### When a Product Sells for R215 (Member wanted R100):

**Revenue Breakdown:**
- **Seller Income:** R100 (goes to product creator)
- **MLM Commissions:** R100 (distributed as follows)
- **Platform Fee:** R15 (Z2B's cut)

### MLM Commission Distribution (R100 pool):

#### 1. ISP (Individual Sales Profit) - R25-R32
Paid to buyer's **direct sponsor** based on their tier:
- Bronze: 25% = R25
- Copper: 26% = R26
- Silver: 27% = R27
- Gold: 28% = R28
- Platinum: 30% = R30
- Diamond: 32% = R32

#### 2. QPB (Quick Pathfinder Bonus) - R7.50-R10
Paid to buyer's sponsor if buyer is among their first referrals:
- First 3 referrals: 7.5% = R7.50
- Referrals 4+: 10% = R10

#### 3. TSC (Team Sales Commission) - R42 total across 10 generations
Paid to 10 generations up from buyer's sponsor:
- Generation 1: 10% = R10
- Generation 2: 5% = R5
- Generation 3: 3% = R3
- Generation 4: 2% = R2
- Generations 5-10: 1% each = R6

**Example Chain:**
```
YOU (Buyer) makes R215 purchase
    ↓
Sponsor (Gen 1): R10 TSC + R28 ISP + R7.50 QPB = R45.50
    ↓
Sponsor's Sponsor (Gen 2): R5 TSC
    ↓
Gen 3: R3 TSC
    ↓
Gen 4: R2 TSC
    ↓
Generations 5-10: R1 each = R6 total
```

#### 4. TPB & TLI (Quarterly Pool Bonuses)
- Marketplace sales count toward TeamPV
- Contribute to quarterly TPB and TLI distributions

---

## 📂 SYSTEM ARCHITECTURE

### Files Created:

#### 1. Database Schema
**Location:** `C:\Users\Manana\Z2B\Z2B-v21\database\marketplace-schema.sql`

**Tables:**
- `marketplace_categories` - Product categories
- `marketplace_products` - Universal products table
- `marketplace_digital_files` - Digital product files
- `marketplace_shipping_options` - Shipping for physical products
- `marketplace_services` - Service configurations
- `marketplace_orders` - Customer orders
- `marketplace_order_items` - Individual items in orders
- `marketplace_commissions` - Commission distribution log
- `marketplace_reviews` - Product reviews
- `marketplace_seller_profiles` - Member seller profiles

**Key Features:**
- Tracks all 3 product types (digital, physical, service)
- Separates admin vs member products
- Stores pricing breakdown (member income, MLM pool, platform fee)
- Logs every commission payment
- Supports product reviews and ratings

#### 2. Admin Panel
**Location:** `C:\Users\Manana\Z2B\Z2B-v21\admin\marketplace-products.html`

**Features:**
- ✅ View all products (admin + member created)
- ✅ Add new Z2B official products
- ✅ Edit/delete any product
- ✅ Approve/reject member submissions
- ✅ Configure pricing using dynamic calculator
- ✅ Set product type (digital/physical/service)
- ✅ Upload images and files
- ✅ Set featured products
- ✅ View sales statistics
- ✅ Export to CSV

**Dynamic Pricing Calculator:**
- Admin enters desired Z2B income
- System auto-calculates MLM pool (100%)
- System auto-calculates platform fee (7.5%)
- Shows final retail price in real-time

#### 3. Member Product Creation Interface
**Location:** `C:\Users\Manana\Z2B\Z2B-v21\app\sell-product.html`

**Features:**
- ✅ Beautiful, user-friendly interface
- ✅ Choose product type (digital/physical/service)
- ✅ Set desired income per sale
- ✅ Auto-calculates final retail price
- ✅ Upload product images and files
- ✅ Write descriptions
- ✅ Type-specific fields (stock for physical, duration for services)
- ✅ Save as draft or submit for review
- ✅ Clear pricing breakdown explanation

**User Experience:**
- Simple 3-step product type selector
- Live pricing calculator showing exactly how much they'll earn
- Example breakdown: "You want R100, buyer pays R215, you keep R100"
- File upload for digital products
- Stock management for physical products
- Service duration/booking for services

#### 4. Commission Distribution Engine
**Location:** `C:\Users\Manana\Z2B\Z2B-v21\includes\MarketplaceCommissionDistributor.php`

**Functionality:**
- ✅ Triggered when order status = 'completed'
- ✅ Pays seller their desired income
- ✅ Distributes ISP to buyer's sponsor
- ✅ Distributes QPB if applicable
- ✅ Distributes TSC across 10 generations
- ✅ Collects platform fee for Z2B
- ✅ Updates member wallet balances
- ✅ Logs every commission in database
- ✅ Integrates with existing MLMCalculator.php

**Commission Types Supported:**
- `SELLER_PAYOUT` - Product creator's earnings
- `ISP` - Individual Sales Profit
- `QPB` - Quick Pathfinder Bonus
- `TSC` - Team Sales Commission (10 generations)
- `TPB` - Team Performance Bonus (quarterly)
- `TLI` - Team Leadership Incentive (quarterly)
- `CEO` - CEO Awards (annual)
- `PLATFORM_FEE` - Z2B's platform earnings

---

## 🎮 HOW MEMBERS USE IT

### To Sell a Product:

1. **Navigate to Marketplace**
   - Go to `app/sell-product.html` or click "Sell Product" button in dashboard

2. **Choose Product Type**
   - Digital: eBooks, courses, software, templates
   - Physical: Tangible goods requiring shipping
   - Service: Consulting, coaching, freelance work

3. **Fill Out Details**
   - Product name
   - Category
   - Description
   - Upload images/files

4. **Set Desired Income**
   - Enter how much YOU want to earn per sale
   - System shows buyer's final price automatically
   - Example: You want R100 → Buyer pays R215

5. **Submit for Review**
   - Product goes to admin approval queue
   - Usually approved within 24 hours
   - Seller receives notification

6. **Start Earning**
   - Product appears in marketplace
   - Every sale triggers automatic payouts
   - View earnings in "My Sales" dashboard

---

## 💼 HOW ADMINS MANAGE IT

### Admin Dashboard: `admin/marketplace-products.html`

1. **View All Products**
   - Filter by type (digital/physical/service)
   - Filter by seller (admin/member)
   - Filter by status (active/pending/draft)
   - Search by name or SKU

2. **Review Member Submissions**
   - See products "Pending Review"
   - Approve with one click
   - Reject with reason
   - Edit if needed before approval

3. **Add Z2B Official Products**
   - Create admin products (like Zyroniq)
   - Set Z2B's desired income
   - System calculates pricing
   - Mark as "Featured" for homepage

4. **Monitor Sales**
   - View top-selling products
   - Track total marketplace revenue
   - See commission distribution
   - Export reports to CSV

---

## 📊 REVENUE STREAMS

### For Z2B (Platform):
- **Platform Fee:** 7.5% on every transaction
- **Admin Product Sales:** 100% of "Member Desired Income" when selling own products

### For Member Sellers:
- **Direct Income:** Their set amount per sale
- **Passive Income:** When downline members buy from their products
- **MLM Commissions:** Earn from upline when they make purchases

### For Member Buyers' Sponsors:
- **ISP:** 25-32% of MLM pool
- **QPB:** 7.5-10% of MLM pool
- **TSC:** Up to 10% of MLM pool (if Gen 1)

---

## 🎯 EXAMPLE SCENARIOS

### Scenario 1: Member Sells eBook

**Product:** "MLM Success Blueprint" by John Doe
**Member Wants:** R100 per sale
**Final Price:** R215

**When Sarah (buyer) purchases:**

1. **John (seller) receives:** R100 immediately
2. **Sarah's sponsor (Mike) receives:**
   - ISP: R28 (if Gold tier)
   - QPB: R7.50 (if Sarah is among first 3 referrals)
   - TSC Gen 1: R10
   - **Total: R45.50**
3. **Mike's sponsor (Gen 2) receives:** R5 TSC
4. **Gen 3-10 receive:** R3, R2, R1, R1, R1, R1, R1, R1
5. **Z2B receives:** R15 platform fee

**Total Distributed:** R100 (seller) + R100 (MLM) + R15 (platform) = **R215**

---

### Scenario 2: Z2B Sells Zyroniq

**Product:** Zyroniq White-Label License
**Z2B Wants:** R10,000/month
**Final Price:** R21,500/month

**When a member purchases:**

1. **Z2B receives:** R10,000 (product income) + R1,500 (platform fee) = **R11,500**
2. **Buyer's upline network shares:** R10,000 (MLM pool)
   - Sponsor ISP: ~R3,000
   - Sponsor QPB: ~R1,000
   - TSC across 10 generations: ~R4,200
   - Rest contributes to TPB/TLI pools

---

## 🚀 BENEFITS

### For Members:
✅ **Turn Skills into Income** - Sell what you know/create
✅ **No Upfront Costs** - List products for free
✅ **Automatic Pricing** - No math needed
✅ **Instant Payouts** - Earnings in wallet immediately
✅ **Leverage Network** - Your downline's purchases earn you commissions
✅ **Multiple Income Streams** - Seller income + MLM commissions

### For Z2B:
✅ **Platform Revenue** - 7.5% on every transaction
✅ **Increased Activity** - More reasons for members to engage
✅ **Product Diversity** - Marketplace grows with member contributions
✅ **Network Effect** - Sellers recruit buyers, buyers become sellers
✅ **Data Insights** - Track trending products and categories

---

## 🔧 TECHNICAL INTEGRATION

### Database Setup:
```bash
# Run the schema file
mysql -u username -p z2b_database < database/marketplace-schema.sql
```

### Commission Distribution (Automated):
```php
// In your order processing script
require_once 'includes/MarketplaceCommissionDistributor.php';

$db = new PDO("mysql:host=localhost;dbname=z2b", "user", "pass");
$distributor = new MarketplaceCommissionDistributor($db);

// When order payment is confirmed:
if ($order['payment_status'] === 'paid') {
    // Update order status
    updateOrderStatus($orderId, 'completed');

    // Distribute commissions automatically
    $results = $distributor->distributeOrderCommissions($orderId);

    // Log results
    logCommissionDistribution($results);

    // Send notifications to earners
    notifyCommissionRecipients($results);
}
```

### Frontend Integration:
```html
<!-- Add "Sell Product" button to member dashboard -->
<a href="sell-product.html" class="btn btn-primary">
    <i class="fas fa-store"></i> Sell Your Product
</a>

<!-- Add "Manage Products" to admin menu -->
<a href="../admin/marketplace-products.html">
    <i class="fas fa-boxes"></i> Marketplace Products
</a>
```

---

## 📈 METRICS & REPORTING

### Member Dashboard Metrics:
- Total products listed
- Active listings
- Total sales
- Total earnings (seller income)
- Commissions earned from marketplace sales
- Top-selling products

### Admin Dashboard Metrics:
- Total marketplace volume
- Platform fees collected
- Products pending review
- Top sellers (by revenue)
- Top products (by sales count)
- Category performance
- Member vs admin product split

---

## 🎓 TRAINING MATERIALS NEEDED

### For Members:
1. **"How to Sell on Z2B Marketplace"** video (10 min)
   - Product creation walkthrough
   - Pricing strategy tips
   - How to write compelling descriptions
   - Upload and submission process

2. **"Understanding Marketplace Commissions"** guide (PDF)
   - Pricing formula breakdown
   - Where money goes (seller, upline, platform)
   - How to earn more by recruiting buyers
   - Examples and scenarios

3. **"Product Photography Tips"** guide
   - How to take professional product photos
   - Image size and format requirements
   - Tools for image editing

### For Admins:
1. **"Product Review Guidelines"** document
   - Quality standards
   - Content policy
   - Prohibited items
   - Approval/rejection criteria

2. **"Admin Panel Training"** video (15 min)
   - How to add Z2B official products
   - Managing member submissions
   - Running reports
   - Handling disputes

---

## ⚠️ REMAINING TASKS

### Core Features (In Progress):
- [ ] **Checkout & Payment Flow** - Shopping cart, payment processing
- [ ] **Digital Delivery System** - Automated download links, license keys
- [ ] **Shipping Integration** - Tracking, courier integration
- [ ] **Service Booking** - Calendar integration, appointment scheduling

### Nice-to-Have Features:
- [ ] Product variations (sizes, colors)
- [ ] Bulk discounts
- [ ] Coupon codes
- [ ] Affiliate links (unique URLs for members to share)
- [ ] Wishlists
- [ ] Product bundles
- [ ] Subscription products (recurring)
- [ ] Member storefronts (dedicated pages)
- [ ] Mobile app for sellers

---

## 📞 SUPPORT & DOCUMENTATION

### For Sellers:
- **Email:** marketplace@z2blegacybuilders.co.za
- **Help Center:** (to be created)
- **Video Tutorials:** (to be recorded)
- **FAQ Page:** (to be written)

### For Buyers:
- **Order Issues:** support@z2blegacybuilders.co.za
- **Refund Policy:** (to be defined)
- **Product Disputes:** (escalation process needed)

---

## 🎉 SUCCESS MILESTONES

### Launch Goals:

**Month 1:**
- 50 member-created products listed
- 100 marketplace sales
- R50,000 total volume
- R3,750 platform fees collected

**Month 3:**
- 200 member products
- 500 marketplace sales
- R250,000 total volume
- R18,750 platform fees

**Month 6:**
- 500 member products
- 2,000 marketplace sales
- R1,000,000 total volume
- R75,000 platform fees

**Year 1:**
- 1,000+ member products
- 10,000+ marketplace sales
- R5,000,000+ total volume
- R375,000+ platform fees

---

## 💡 MARKETING STRATEGIES

### To Encourage Member Sellers:

1. **"Top Seller of the Month"** Recognition
   - Feature on homepage
   - Special badge on profile
   - Bonus reward (R1,000)

2. **"First 100 Sellers"** Promotion
   - Waive platform fee for first month
   - Free product promotion
   - Priority listing

3. **Seller Training Webinars**
   - Weekly training sessions
   - Success stories
   - Q&A with top sellers

4. **Referral Bonuses**
   - Earn R50 for referring a seller
   - Earn commission when referred seller makes sales

---

## 🏆 COMPETITIVE ADVANTAGE

vs. Traditional MLM:
- ✅ **Product Diversity** - Not limited to company products
- ✅ **Member Creativity** - Unleash entrepreneurial potential
- ✅ **Multiple Income Streams** - Sell + recruit + earn commissions
- ✅ **Lower Barrier** - No inventory investment needed

vs. Other Marketplaces (Etsy, Gumroad):
- ✅ **Built-in Buyers** - Your downline network
- ✅ **MLM Commissions** - Upline earns on your sales
- ✅ **Transparent Pricing** - See exactly where money goes
- ✅ **Community Support** - Network helps each other sell

---

## 🚀 READY TO LAUNCH!

### What's Complete:
✅ Database schema with 10+ tables
✅ Admin product management panel
✅ Member product creation interface
✅ Dynamic pricing calculator
✅ Automated commission distribution engine
✅ Integration with existing MLM system
✅ Support for 3 product types
✅ Real-time pricing breakdown

### What's Next:
- Complete checkout flow
- Digital delivery automation
- Shipping integrations
- Service booking calendar
- Launch training materials
- Onboard first 10 member sellers

---

**Built with 💜 by the Z2B Development Team**
*Transforming Employees to Entrepreneurs*

© 2026 Z2B Legacy Builders | All Rights Reserved
