# Z2B Marketplace - Vendor Payment System

## Overview
The Z2B Marketplace allows members to sell Digital Products, Physical Products, and Services. The system uses a dynamic pricing model that ensures vendors get paid their desired income while funding the MLM commission pool and platform operations.

---

## 📊 Pricing Formula

### How Retail Price is Calculated

```
Final Retail Price = Member Income + MLM Pool + Platform Fee
```

Where:
- **Member Income** = The amount YOU want to earn per sale
- **MLM Commission Pool** = 100% of Member Income (goes to your upline)
- **Platform Fee** = 7.5% of (Member Income + MLM Pool)

### Example Calculation

If you want to earn **R100** per sale:

```
Member Income:        R 100.00
MLM Commission Pool:  R 100.00  (100% markup)
Platform Fee:         R  15.00  (7.5% of R200)
--------------------------------
Final Retail Price:   R 215.00
```

**What this means:**
- Customer pays: **R215**
- You receive: **R100**
- Your upline receives: **R100** (distributed via MLM plan)
- Platform receives: **R15** (covers hosting, payment processing, support)

---

## 💰 How Vendors Get Paid

### 1. Product Sale Process

```
Customer Purchase → Payment Processing → Commission Distribution → Vendor Payout
```

### 2. Payment Breakdown

When a customer buys your R215 product:

| Recipient | Amount | Percentage | When Paid |
|-----------|--------|------------|-----------|
| **You (Vendor)** | R100 | 46.5% | After delivery confirmation |
| **MLM Commissions** | R100 | 46.5% | Distributed to upline immediately |
| **Platform Fee** | R15 | 7.0% | Deducted at sale |

### 3. Vendor Payment Timeline

#### For Digital Products:
- Payment released **immediately** after successful download
- Funds available in your Z2B wallet within **24 hours**
- No delivery confirmation needed

#### For Physical Products:
- Payment held in escrow until delivery
- Vendor must confirm shipment with tracking number
- Payment released **7 days after delivery confirmation**
- Or immediately if customer confirms receipt early

#### For Services:
- Payment held in escrow until service completion
- Vendor marks service as "Completed"
- Customer has **3 days** to dispute
- Payment released after dispute period (if no issues)

---

## 🏦 Payment Methods for Vendors

### How You Receive Your Money

1. **Z2B Wallet** (Instant)
   - Earnings accumulate in your Z2B wallet
   - Minimum withdrawal: **R50**
   - Withdraw to bank account within 1-3 business days

2. **Direct Bank Transfer**
   - Available for payouts over R500
   - Processed every Monday and Thursday
   - No transfer fees for amounts over R1,000

3. **Reinvest in Z2B**
   - Use earnings to upgrade your membership tier
   - Purchase products from marketplace
   - Pay for Z2B services (no fees)

---

## 📦 Product Type Specific Rules

### Digital Products
- **Upload Requirements**: Files up to 100MB
- **Delivery**: Automatic download link sent to buyer
- **Payment Release**: Immediate after successful download
- **Refund Period**: 7 days (if product doesn't match description)
- **Your Responsibility**:
  - Ensure files are not corrupted
  - Provide clear product description
  - Offer basic support for 30 days

### Physical Products
- **Stock Management**: You manage your inventory
- **Shipping**: You handle shipping and provide tracking
- **Payment Release**: 7 days after delivery confirmation
- **Returns**: Accept returns within 14 days (deducted from earnings)
- **Your Responsibility**:
  - Ship within 3 business days
  - Provide tracking information
  - Package items securely
  - Handle customer service issues

### Services
- **Booking System**: Integrated scheduling tool
- **Delivery**: You deliver the service directly to customer
- **Payment Release**: After service completion + 3-day dispute period
- **Refunds**: Case-by-case basis (admin reviews disputes)
- **Your Responsibility**:
  - Deliver quality service as described
  - Communicate clearly with customers
  - Complete service within agreed timeframe
  - Maintain professional standards

---

## 📈 Vendor Dashboard & Payment Tracking

### Your Earnings Overview

Access your vendor dashboard at: `http://localhost:5000/app/vendor-dashboard.html`

You can track:
- **Pending Earnings**: Sales awaiting delivery/completion
- **Available Balance**: Ready to withdraw
- **Total Lifetime Earnings**: All-time revenue
- **Product Performance**: Best sellers, ratings, reviews

### Payment Statuses

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| **Pending** | Sale made, awaiting delivery | Ship product / deliver service |
| **In Escrow** | Payment held, awaiting confirmation | Confirm delivery / completion |
| **Processing** | Payment approved, being transferred | None - wait 1-3 days |
| **Completed** | Money in your Z2B wallet | Withdraw or use |
| **Disputed** | Customer raised issue | Respond to dispute within 48 hours |

---

## ⚠️ Important Vendor Rules

### To Receive Payments, You Must:
1. ✅ Complete your vendor profile with valid bank details
2. ✅ Verify your identity (once per account)
3. ✅ Maintain a seller rating of 3.5+ stars
4. ✅ Respond to customer inquiries within 24 hours
5. ✅ Honor refund/return policies

### Payment Holds
Your payments may be held if:
- ❌ Multiple customer complaints
- ❌ Suspicious activity detected
- ❌ Violation of marketplace policies
- ❌ Unverified bank account

### Prohibited Products
You will NOT be paid (and may be banned) for selling:
- 🚫 Illegal items or services
- 🚫 Counterfeit goods
- 🚫 Copyrighted material without permission
- 🚫 Products that violate Z2B terms of service

---

## 🔄 Complete Transaction Flow Example

### Scenario: You sell a Digital eBook for R215

**Step 1: Customer Purchase**
- Customer pays R215 via credit card
- Payment processor charges 2.9% + R2 = **R8.24 fee** (platform absorbs this)

**Step 2: Instant Commission Distribution**
- MLM Pool (R100) distributed to your upline immediately:
  - Sponsor: R40 (40%)
  - Level 2: R24 (24%)
  - Level 3: R16 (16%)
  - Level 4: R12 (12%)
  - Level 5: R8 (8%)

**Step 3: Product Delivery**
- Customer receives automatic download link
- System confirms successful download

**Step 4: Vendor Payout** (24 hours later)
- R100 deposited to your Z2B wallet
- Email notification sent
- Available for withdrawal (minimum R50)

**Step 5: Withdrawal** (when you request)
- You request bank transfer
- Funds sent within 1-3 business days
- No fees for amounts over R1,000

---

## 💡 Maximizing Your Vendor Earnings

### Tips to Increase Sales:
1. **Price Smart**: Research similar products, stay competitive
2. **Quality Images**: Use professional product photos
3. **Detailed Descriptions**: Clear, honest, benefit-focused copy
4. **Customer Service**: Respond quickly, handle issues professionally
5. **Leverage Your Network**: Share products with your Z2B team
6. **Bundle Products**: Create package deals for higher value
7. **Seasonal Promotions**: Offer limited-time discounts

### Building Your Vendor Reputation:
- Ship fast (physical products)
- Deliver on time (services)
- Over-communicate with customers
- Request reviews from satisfied buyers
- Update products based on feedback

---

## 📞 Support for Vendors

### Need Help?
- **Vendor Support**: vendor-support@z2b.com
- **Payment Issues**: payments@z2b.com
- **Technical Help**: support@z2b.com
- **Live Chat**: Available 9am-5pm SAST

### Resources:
- Vendor Training Videos: `/app/vendor-training.html`
- Marketplace Policies: `/legal/marketplace-terms.html`
- Pricing Calculator: Available in product creation form

---

## 🎯 Quick Reference

### Pricing Formula
```
Retail Price = Your Income + (Your Income × 100%) + ((Your Income × 2) × 7.5%)
Simplified: Retail Price = Your Income × 2.15
```

### Quick Calculation
| Your Income | MLM Pool | Platform Fee | Retail Price |
|-------------|----------|--------------|--------------|
| R50 | R50 | R7.50 | R107.50 |
| R100 | R100 | R15.00 | R215.00 |
| R500 | R500 | R75.00 | R1,075.00 |
| R1,000 | R1,000 | R150.00 | R2,150.00 |
| R5,000 | R5,000 | R750.00 | R10,750.00 |

### Payment Timeline
- **Digital Products**: Paid within 24 hours
- **Physical Products**: Paid 7 days after delivery
- **Services**: Paid 3 days after completion
- **Bank Transfers**: Processed Monday & Thursday
- **Minimum Withdrawal**: R50

---

**Last Updated**: October 2025
**Version**: 2.0
