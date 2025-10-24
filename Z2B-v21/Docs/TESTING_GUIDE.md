# Z2B Legacy Builders - Testing Guide

## Overview
This guide provides comprehensive testing scenarios for all Z2B platform features, with special focus on the new AI Fuel top-up system and payment integration.

---

## 1. AI Fuel Top-Up System Testing

### 1.1 Purchase Flow Testing

#### Test Case 1.1.1: 100 Fuel Package Purchase
**Prerequisites:**
- User logged in with valid session
- User has active tier membership
- Internet connection available

**Steps:**
1. Navigate to `app/ai-refuel.html`
2. Click "Purchase Now" on 100 Fuel package (R125)
3. Verify redirect to Yoco payment page
4. Enter test card: `4242 4242 4242 4242`
5. Enter any future expiry date and 3-digit CVV
6. Complete payment

**Expected Results:**
- ✅ Redirected to `payment-success.html`
- ✅ Purchase ID displayed
- ✅ Fuel amount shows "100 Fuel"
- ✅ Amount paid shows "R125"
- ✅ Expiry date is 3 months from purchase date
- ✅ Commission message displayed

**Database Verification:**
```sql
-- Check purchase record
SELECT * FROM ai_fuel_purchases
WHERE user_id = [USER_ID]
ORDER BY purchase_date DESC LIMIT 1;

-- Expected: status='completed', fuel_amount=100, price=125.00

-- Check fuel balance
SELECT * FROM ai_fuel_balance
WHERE user_id = [USER_ID]
ORDER BY created_at DESC LIMIT 1;

-- Expected: fuel_amount=100, remaining_fuel=100

-- Check user's total fuel
SELECT ai_fuel, last_fuel_topup FROM users WHERE id = [USER_ID];

-- Expected: ai_fuel increased by 100
```

#### Test Case 1.1.2: 500 Fuel Package Purchase
**Steps:**
1. Navigate to `app/ai-refuel.html`
2. Click "Purchase Now" on 500 Fuel package (R625)
3. Complete Yoco payment with test card
4. Verify success page

**Expected Results:**
- ✅ Fuel amount: 500
- ✅ Amount paid: R625
- ✅ 20% bonus badge displayed (100 extra fuel)
- ✅ Total fuel received: 600 (500 + 100 bonus)

#### Test Case 1.1.3: 1000 Fuel Package Purchase
**Steps:**
1. Navigate to `app/ai-refuel.html`
2. Click "Purchase Now" on 1000 Fuel package (R1,250)
3. Complete payment
4. Verify success page

**Expected Results:**
- ✅ Fuel amount: 1000
- ✅ Amount paid: R1,250
- ✅ 50% bonus badge displayed (500 extra fuel)
- ✅ Total fuel received: 1500 (1000 + 500 bonus)

### 1.2 Failed Payment Testing

#### Test Case 1.2.1: Declined Card
**Steps:**
1. Start purchase flow
2. Use test card: `4000 0000 0000 0002`
3. Complete payment attempt

**Expected Results:**
- ✅ Redirected to `payment-failed.html`
- ✅ Error message displayed
- ✅ "Try Again" button works
- ✅ No fuel added to account
- ✅ No database record created

### 1.3 Commission System Testing

#### Test Case 1.3.1: Bronze Tier Commission (10%)
**Prerequisites:**
- Buyer is Bronze tier
- Buyer has a referrer (upline)

**Steps:**
1. Bronze member purchases 500 fuel (R625)
2. Complete payment

**Expected Results:**
```sql
-- Check commission record
SELECT * FROM commissions
WHERE user_id = [REFERRER_ID]
AND type = 'ai_fuel_topup'
ORDER BY created_at DESC LIMIT 1;

-- Expected:
-- amount = 62.50 (10% of R625)
-- from_user_id = [BUYER_ID]
-- description = 'AI Fuel Top-up Commission - Bronze Tier'
```

#### Test Case 1.3.2: Diamond Tier Commission (35%)
**Prerequisites:**
- Buyer is Diamond tier
- Buyer has referrer

**Steps:**
1. Diamond member purchases 1000 fuel (R1,250)
2. Complete payment

**Expected Results:**
- Commission amount: R437.50 (35% of R1,250)
- Commission tier: Diamond

### 1.4 Fuel Expiry Testing

#### Test Case 1.4.1: Verify 3-Month Validity
**Steps:**
1. Purchase any fuel package
2. Check expiry date on success page
3. Verify database expiry_date

**Expected Results:**
```sql
SELECT
    purchase_date,
    expiry_date,
    TIMESTAMPDIFF(MONTH, purchase_date, expiry_date) as months_valid
FROM ai_fuel_purchases
WHERE id = [PURCHASE_ID];

-- Expected: months_valid = 3
```

---

## 2. Dashboard Integration Testing

### Test Case 2.1: AI Fuel Display
**Steps:**
1. Login to dashboard
2. Locate AI Fuel stat card

**Expected Results:**
- ✅ Current fuel balance displayed
- ✅ "Top-Up Now" button visible
- ✅ Fuel icon animates on hover
- ✅ Click opens ai-refuel.html

### Test Case 2.2: Sidebar Navigation
**Steps:**
1. Check sidebar menu

**Expected Results:**
- ✅ "⚡ AI Fuel Top-Up" item present
- ✅ Gold background highlight visible
- ✅ Gas pump icon displayed
- ✅ Click navigates to ai-refuel.html

### Test Case 2.3: Quick Actions
**Steps:**
1. Scroll to Quick Actions section

**Expected Results:**
- ✅ "AI Fuel Top-Up" card present
- ✅ Lightning bolt icon visible
- ✅ Click opens ai-refuel.html

---

## 3. Tier Access Control Testing

### Test Case 3.1: Copper Tier Access (2 Apps)
**Prerequisites:**
- User upgraded to Copper tier

**Steps:**
1. Navigate to dashboard
2. Check available apps

**Expected Results:**
- ✅ Coach Manlaw: Accessible
- ✅ Glowie: Accessible
- ✅ Benown: Locked
- ✅ Zyra: Locked
- ✅ Vidzie: Locked
- ✅ Zyro: Locked
- ✅ Zynect: Locked

### Test Case 3.2: Silver Tier Access (4 Apps)
**Expected Results:**
- ✅ Coach Manlaw: Accessible
- ✅ Glowie: Accessible
- ✅ Benown: Accessible
- ✅ Zyra: Accessible
- ✅ Vidzie: Locked
- ✅ Zyro: Locked
- ✅ Zynect: Locked

### Test Case 3.3: Gold/Platinum/Diamond Tier Access (7 Apps)
**Expected Results:**
- ✅ All 7 apps accessible
- ✅ No locked apps
- ✅ Full feature access

---

## 4. Coach Manlaw Feature Testing

### Test Case 4.1: BTSS Assessment Submission
**Steps:**
1. Navigate to `coach-manlaw.html`
2. Click "Complete Assessment" button
3. Adjust all 4 sliders (Mindset, Money, Legacy, Movement)
4. Click "Submit Assessment" button

**Expected Results:**
- ✅ Modal closes immediately
- ✅ Scores saved to localStorage
- ✅ Coach message appears with assessment results
- ✅ Console logs show: "=== SUBMIT BUTTON CLICKED ==="
- ✅ Overall score calculated correctly
- ✅ Weakest leg identified
- ✅ No JavaScript errors in console

**Database Verification:**
```javascript
// Check localStorage
const scores = JSON.parse(localStorage.getItem('coach_btss_scores'));
console.log(scores);

// Expected structure:
{
    mindset: 75,
    money: 60,
    legacy: 80,
    movement: 70,
    date: "2025-01-23T...",
    day: 1
}
```

### Test Case 4.2: Activity Center
**Steps:**
1. Click "Activity Center" button in sidebar
2. Modal opens
3. Enter response text
4. Click "Submit Response"

**Expected Results:**
- ✅ Modal opens smoothly
- ✅ Today's activity displayed
- ✅ Response textarea available
- ✅ Submit button functional
- ✅ Response saved to localStorage
- ✅ Modal closes after submission

---

## 5. Marketplace Testing

### Test Case 5.1: Individual App Listings
**Steps:**
1. Navigate to `marketplace.html`
2. Scroll through product listings

**Expected Results:**
- ✅ 7 Z2B apps listed individually
- ✅ Correct pricing:
  - Coach Manlaw: R499/month
  - Glowie: R799/month
  - Benown: R599/month
  - Zyra: R699/month
  - Vidzie: R899/month
  - Zyro: R399/month
  - Zynect: R999/month
- ✅ "Purchase" buttons visible
- ✅ App descriptions accurate

---

## 6. Payment Integration Testing

### Test Case 6.1: Yoco Checkout Creation
**API Endpoint:** `POST /api/yoco-ai-fuel-payment.php/create-checkout`

**Request:**
```json
{
  "fuelAmount": 500,
  "price": 625
}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [AUTH_TOKEN]
```

**Expected Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://payments.yoco.com/checkout/...",
  "purchaseId": 123
}
```

### Test Case 6.2: Webhook Handler
**API Endpoint:** `POST /api/yoco-ai-fuel-payment.php/webhook`

**Simulated Payload:**
```json
{
  "type": "payment.succeeded",
  "payload": {
    "id": "ch_test123",
    "status": "succeeded",
    "metadata": {
      "userId": "45",
      "purchaseId": "123",
      "fuelAmount": "500"
    }
  }
}
```

**Expected Results:**
- ✅ Purchase status updated to 'completed'
- ✅ Fuel added to user account
- ✅ Commission calculated and credited
- ✅ HTTP 200 response returned

### Test Case 6.3: Payment Verification
**API Endpoint:** `GET /api/yoco-ai-fuel-payment.php/verify?purchaseId=123`

**Expected Response:**
```json
{
  "success": true,
  "purchase": {
    "id": 123,
    "user_id": 45,
    "fuel_amount": 500,
    "price": 625.00,
    "status": "completed",
    "purchase_date": "2025-01-23 14:30:00"
  }
}
```

---

## 7. Database Views Testing

### Test Case 7.1: Active Fuel Balance View
```sql
SELECT * FROM v_active_fuel_balance WHERE user_id = [USER_ID];
```

**Expected Columns:**
- user_id
- username
- total_fuel_purchased
- total_fuel_used
- current_balance
- active_fuel_packages

### Test Case 7.2: Purchase Stats View
```sql
SELECT * FROM v_fuel_purchase_stats;
```

**Expected Data:**
- Total purchases per user
- Total revenue per user
- Average purchase value
- Most recent purchase date

### Test Case 7.3: Commission Earnings View
```sql
SELECT * FROM v_fuel_commission_earnings WHERE user_id = [USER_ID];
```

**Expected Data:**
- Total commissions earned
- Commission count
- Recent commissions

---

## 8. Security Testing

### Test Case 8.1: Unauthorized Access
**Steps:**
1. Logout or clear session
2. Attempt to access ai-refuel.html
3. Attempt API call without auth token

**Expected Results:**
- ✅ Redirected to login page
- ✅ API returns 401 Unauthorized
- ✅ No sensitive data exposed

### Test Case 8.2: SQL Injection Prevention
**Steps:**
1. Attempt purchase with malicious payload:
```json
{
  "fuelAmount": "500; DROP TABLE users;--",
  "price": 625
}
```

**Expected Results:**
- ✅ Request rejected
- ✅ No database modification
- ✅ Error logged

### Test Case 8.3: XSS Prevention
**Steps:**
1. Enter script tags in form fields
2. Submit data

**Expected Results:**
- ✅ Scripts escaped/sanitized
- ✅ No script execution
- ✅ Data stored safely

---

## 9. Performance Testing

### Test Case 9.1: Page Load Times
**Metrics:**
- Dashboard: < 2 seconds
- AI Refuel page: < 1.5 seconds
- Payment redirect: < 3 seconds

### Test Case 9.2: API Response Times
**Metrics:**
- Create checkout: < 2 seconds
- Verify payment: < 500ms
- Webhook processing: < 1 second

---

## 10. Mobile Responsiveness Testing

### Test Case 10.1: AI Refuel Mobile View
**Devices to Test:**
- iPhone 12/13/14
- Samsung Galaxy S21/S22
- iPad

**Expected Results:**
- ✅ Fuel packages stack vertically
- ✅ Buttons remain clickable
- ✅ Text readable without zooming
- ✅ Payment flow works smoothly

---

## 11. Browser Compatibility Testing

### Test Case 11.1: Cross-Browser Testing
**Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Features to Test:**
- AI Fuel purchase flow
- Assessment submission
- Activity Center
- Payment processing

---

## Test Execution Checklist

### Pre-Launch Testing
- [ ] All 11 test sections completed
- [ ] All critical bugs fixed
- [ ] Performance metrics met
- [ ] Security tests passed
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility confirmed

### Production Smoke Test (After Deployment)
- [ ] Purchase 100 fuel package with real card (R1 test)
- [ ] Verify fuel added to account
- [ ] Verify commission credited
- [ ] Check all database records
- [ ] Test payment failure scenario
- [ ] Verify email notifications (if applicable)

---

## Bug Reporting Template

```markdown
**Bug ID:** BUG-001
**Severity:** Critical / High / Medium / Low
**Module:** AI Fuel / Dashboard / Coach Manlaw / etc.

**Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
[Attach if applicable]

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- User Tier: Gold
- User ID: 45

**Console Errors:**
```
Error messages here
```

**Database State:**
```sql
SELECT * FROM table WHERE condition;
```
```

---

## Test Results Log

### Test Session: [DATE]
**Tester:** [NAME]
**Environment:** Local / Staging / Production

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1.1 | ✅ Pass | Fuel added correctly |
| 1.1.2 | ✅ Pass | Bonus calculated |
| 1.1.3 | ⚠️ Warning | Slow redirect |
| 1.2.1 | ✅ Pass | Error handled |
| ... | ... | ... |

**Summary:**
- Total Tests: 50
- Passed: 48
- Failed: 0
- Warnings: 2

**Action Items:**
1. Optimize payment redirect speed
2. Add loading spinner for better UX

---

**Last Updated:** January 24, 2025
**Version:** 1.0
**Next Review:** February 1, 2025
