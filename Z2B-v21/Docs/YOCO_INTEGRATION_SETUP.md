# Yoco Payment Integration Setup Guide

## Overview
This guide explains how to configure Yoco payment integration for AI Fuel top-ups in the Z2B Legacy Builders platform.

## Prerequisites
- Yoco merchant account
- Access to Yoco Developer Dashboard
- PHP server with cURL enabled
- MySQL database access

## Step 1: Get Your Yoco API Keys

1. Log in to your [Yoco Developer Dashboard](https://developer.yoco.com/)
2. Navigate to **API Keys** section
3. Copy your:
   - **Public Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

### Update API Keys in Code

Edit `api/yoco-ai-fuel-payment.php`:

```php
// Line 18-19
define('YOCO_SECRET_KEY', 'your_secret_key_here'); // Replace with your key
define('YOCO_PUBLIC_KEY', 'your_public_key_here'); // Replace with your key
```

## Step 2: Configure Webhooks

### Set Up Webhook Endpoint

1. In Yoco Developer Dashboard, go to **Webhooks**
2. Click **Add Webhook Endpoint**
3. Enter your webhook URL:
   ```
   https://yourdomain.com/Z2B-v21/api/yoco-ai-fuel-payment.php/webhook
   ```
4. Select events to listen for:
   - ✅ `payment.succeeded`
   - ✅ `payment.failed`

5. Save the webhook endpoint

### Test Webhook Locally (Development)

For local testing, use ngrok:

```bash
# Install ngrok
# Download from https://ngrok.com/download

# Start ngrok tunnel
ngrok http 8000

# Use the ngrok URL in Yoco webhook settings
https://your-ngrok-url.ngrok.io/Z2B-v21/api/yoco-ai-fuel-payment.php/webhook
```

## Step 3: Update Redirect URLs

Edit `api/yoco-ai-fuel-payment.php` (lines 65-67):

### For Production:
```php
'successUrl' => 'https://yourdomain.com/app/payment-success.html?purchase=' . $purchaseId,
'cancelUrl' => 'https://yourdomain.com/app/ai-refuel.html?cancelled=true',
'failureUrl' => 'https://yourdomain.com/app/payment-failed.html',
```

### For Local Development:
```php
'successUrl' => 'http://localhost:8000/Z2B-v21/app/payment-success.html?purchase=' . $purchaseId,
'cancelUrl' => 'http://localhost:8000/Z2B-v21/app/ai-refuel.html?cancelled=true',
'failureUrl' => 'http://localhost:8000/Z2B-v21/app/payment-failed.html',
```

## Step 4: Test the Integration

### Test Mode Payments

Use these Yoco test cards:

| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4242 4242 4242 4242 | Any future date | Any 3 digits | Success |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | Declined |

### Test Process:

1. Navigate to `http://localhost:8000/Z2B-v21/app/ai-refuel.html`
2. Select a fuel package (100, 500, or 1000)
3. Click "Purchase Now"
4. You'll be redirected to Yoco payment page
5. Enter test card details
6. Complete payment
7. Verify:
   - Redirected to success page
   - Fuel added to database
   - Commission credited to upline
   - Purchase record created

### Verify Database Records

```sql
-- Check purchase record
SELECT * FROM ai_fuel_purchases ORDER BY purchase_date DESC LIMIT 1;

-- Check fuel balance
SELECT * FROM ai_fuel_balance ORDER BY created_at DESC LIMIT 1;

-- Check commission
SELECT * FROM commissions ORDER BY created_at DESC LIMIT 1;

-- Check user's updated fuel
SELECT id, username, ai_fuel, last_fuel_topup FROM users WHERE id = ?;
```

## Step 5: Production Deployment

### Checklist:

- [ ] Replace test API keys with live keys
- [ ] Update all URLs to production domain
- [ ] Configure production webhook endpoint in Yoco dashboard
- [ ] Test with real small amount (R1)
- [ ] Enable HTTPS/SSL certificate
- [ ] Set up error logging and monitoring
- [ ] Configure backup payment method
- [ ] Test commission calculations
- [ ] Document payment flows
- [ ] Train support team

### Security Best Practices:

1. **Never commit API keys to version control**
   ```php
   // Use environment variables
   define('YOCO_SECRET_KEY', getenv('YOCO_SECRET_KEY'));
   ```

2. **Validate webhook signatures** (if provided by Yoco)

3. **Use HTTPS only** for production

4. **Log all transactions** for audit trail

5. **Implement rate limiting** to prevent abuse

## API Endpoints Reference

### 1. Create Checkout
```
POST /api/yoco-ai-fuel-payment.php/create-checkout
```

**Request:**
```json
{
  "fuelAmount": 500,
  "price": 625
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://payments.yoco.com/checkout/...",
  "purchaseId": 123
}
```

### 2. Webhook Handler
```
POST /api/yoco-ai-fuel-payment.php/webhook
```

Automatically called by Yoco when payment events occur.

### 3. Verify Payment
```
GET /api/yoco-ai-fuel-payment.php/verify?purchaseId=123
```

**Response:**
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

## Commission Structure

AI Fuel top-up commissions are based on buyer's tier:

| Tier | Commission Rate | Example (R625 purchase) |
|------|-----------------|-------------------------|
| Bronze | 10% | R62.50 |
| Copper | 15% | R93.75 |
| Silver | 20% | R125.00 |
| Gold | 25% | R156.25 |
| Platinum | 30% | R187.50 |
| Diamond | 35% | R218.75 |

## Troubleshooting

### Issue: Webhook not receiving events

**Solutions:**
- Check webhook URL is publicly accessible
- Verify webhook is configured in Yoco dashboard
- Check firewall/server settings
- Review webhook logs in Yoco dashboard

### Issue: Payment succeeds but fuel not added

**Solutions:**
- Check webhook handler is processing correctly
- Verify database tables exist
- Check error logs in `api/yoco-ai-fuel-payment.php`
- Ensure user ID exists in database

### Issue: Commission not credited

**Solutions:**
- Verify user has a referrer (`referred_by` field)
- Check referrer's user exists
- Verify tier code is valid
- Check commission calculation logic

## Monitoring & Maintenance

### Key Metrics to Monitor:

1. **Payment Success Rate**
   ```sql
   SELECT
       status,
       COUNT(*) as count,
       SUM(price) as total_revenue
   FROM ai_fuel_purchases
   GROUP BY status;
   ```

2. **Commission Payouts**
   ```sql
   SELECT
       SUM(amount) as total_commissions,
       COUNT(*) as total_transactions
   FROM commissions
   WHERE type = 'ai_fuel_topup';
   ```

3. **Popular Packages**
   ```sql
   SELECT
       fuel_amount,
       COUNT(*) as purchases,
       SUM(price) as revenue
   FROM ai_fuel_purchases
   WHERE status = 'completed'
   GROUP BY fuel_amount;
   ```

## Support

For Yoco-specific issues, contact:
- **Email:** support@yoco.com
- **Docs:** https://developer.yoco.com/docs
- **Status:** https://status.yoco.com

For Z2B platform issues:
- **Email:** support@z2blegacy.com
- **Internal Docs:** /docs/

---

**Last Updated:** January 23, 2025
**Version:** 1.0
