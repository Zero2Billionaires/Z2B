# Payment Gateway Integration Guide

## Supported Payment Gateways

Z2B Legacy Builders supports 4 payment gateways, all suitable for Network Marketing businesses:

1. **Yoco** - South African card payments (Primary)
2. **Payfast** - South African multi-payment gateway
3. **CoinPayments** - Cryptocurrency payments (2000+ coins)
4. **Bank Transfer** - Manual bank deposits

---

## 1. Yoco (Default - Already Configured)

**Status:** ✅ Already set up
**Best For:** South African credit/debit card payments
**Website:** https://www.yoco.com

### Features:
- ✅ South African market leader
- ✅ No setup fees
- ✅ Transaction fee: 2.95% per transaction
- ✅ Fast settlement (2-3 business days)

### Already Configured:
- Public Key: `pk_live_your_production_public_key_here`
- Payment URL: https://pay.yoco.com/zero2billionaires-amavulandlela

---

## 2. Payfast (NWM Friendly - Recommended)

**Status:** 🔧 Ready to configure
**Best For:** South African payments - cards, EFT, instant EFT, SnapScan, Zapper
**Website:** https://www.payfast.co.za

### Why Payfast for MLM?
- ✅ **MLM/NWM Friendly** - No restrictions on network marketing
- ✅ Accepts South African cards, EFT, Instant EFT
- ✅ Mobile payment integrations (SnapScan, Zapper)
- ✅ Subscription/recurring billing support
- ✅ Competitive rates: 2.9% + R2 per transaction
- ✅ No setup fees, no monthly fees
- ✅ Fast payouts (2-3 business days)

### How to Set Up:

#### Step 1: Create Payfast Account
1. Go to https://www.payfast.co.za
2. Click "Sign Up" → Choose "Business Account"
3. Complete registration and verify your business
4. FICA verification (bank statement, ID, proof of address)
5. Wait for account approval (1-3 business days)

#### Step 2: Get API Credentials
1. Login to Payfast Dashboard
2. Go to **Settings** → **Integration**
3. Copy these values:
   - **Merchant ID** (e.g., 10012345)
   - **Merchant Key** (e.g., abcd1234efgh5678)
4. Generate a **Passphrase** (Settings → Security)
   - Create a strong random passphrase
   - Save it securely

#### Step 3: Configure in Admin Panel
1. Open Admin Panel (click copyright 5 times on dashboard)
2. Go to **Payment Gateways** section
3. Select **Payfast**
4. Enter:
   - Merchant ID: `[from Step 2]`
   - Merchant Key: `[from Step 2]`
   - Passphrase: `[from Step 2]`
   - Mode: `sandbox` (for testing) or `live` (for production)
5. Click **Save**

#### Step 4: Test Payment
1. Set Mode to `sandbox`
2. Use test card: 4000 0000 0000 0002
3. Complete a test transaction
4. Verify in Payfast sandbox dashboard
5. Switch to `live` mode when ready

### Payfast Test Cards:
```
Successful Payment:
Card Number: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date

Declined Payment:
Card Number: 4000 0000 0000 0101
```

---

## 3. CoinPayments (Crypto Gateway - NWM Friendly)

**Status:** 🔧 Ready to configure
**Best For:** Cryptocurrency payments (Bitcoin, Ethereum, USDT, etc.)
**Website:** https://www.coinpayments.net

### Why CoinPayments for MLM?
- ✅ **MLM/NWM Friendly** - Specifically supports network marketing
- ✅ Accepts 2000+ cryptocurrencies
- ✅ Global payments - no borders
- ✅ Low fees: 0.5% per transaction
- ✅ Instant settlement in crypto
- ✅ Auto-conversion to fiat (optional)
- ✅ Multi-currency support
- ✅ Subscription/recurring payments

### Supported Cryptocurrencies:
```
Major Coins (Default):
- Bitcoin (BTC)
- Ethereum (ETH)
- Tether (USDT)
- USD Coin (USDC)
- Litecoin (LTC)
- Binance Coin (BNB)
- Ripple (XRP)
- Dogecoin (DOGE)
- Cardano (ADA)
- Solana (SOL)

Plus 2000+ other altcoins!
```

### How to Set Up:

#### Step 1: Create CoinPayments Account
1. Go to https://www.coinpayments.net
2. Click "Sign Up" → Choose "Merchant Account"
3. Complete registration
4. Verify email address
5. Enable 2FA (Google Authenticator)

#### Step 2: Get API Credentials
1. Login to CoinPayments
2. Go to **My Account** → **Account Settings**
3. Click **API Keys** tab
4. Click **Generate New Key**
5. Permissions: Select "All"
6. Click **Generate**
7. Copy and save securely:
   - **Public Key** (starts with `pub...`)
   - **Private Key** (starts with `priv...`)
   - **Merchant ID** (your CoinPayments merchant ID)
   - **IPN Secret** (for webhook verification)

#### Step 3: Configure IPN (Instant Payment Notification)
1. Go to **My Account** → **Account Settings** → **Merchant Settings**
2. Set IPN URL: `https://z2blegacybuilders.co.za/api/coinpayments/webhook`
3. Generate IPN Secret
4. Save settings

#### Step 4: Configure in Admin Panel
1. Open Admin Panel
2. Go to **Payment Gateways** → **CoinPayments**
3. Enter:
   - Merchant ID: `[from Step 2]`
   - Public Key: `[from Step 2]`
   - Private Key: `[from Step 2]`
   - IPN Secret: `[from Step 3]`
   - Mode: `test` or `live`
   - Accepted Coins: Select which cryptos to accept
5. Click **Save**

#### Step 5: Test Crypto Payment
1. Create test wallet on CoinPayments
2. Fund with test crypto (use faucets)
3. Make test payment
4. Verify in CoinPayments dashboard
5. Go live when ready

### CoinPayments Fees:
```
Transaction Fee: 0.5%
Withdrawal Fee: Varies by coin
  - Bitcoin: ~0.0005 BTC
  - Ethereum: ~0.005 ETH
  - USDT: ~1 USDT
```

---

## 4. Bank Transfer (Manual)

**Status:** ✅ Already configured
**Best For:** Direct bank deposits, EFT

### How to Configure:
1. Admin Panel → **Payment Gateways** → **Bank Transfer**
2. Enter your bank details:
   - Bank Name: (e.g., FNB, Standard Bank, etc.)
   - Account Name: Z2B Legacy Builders
   - Account Number: Your business account number
   - Branch Code: Your branch code
   - Account Type: Business Cheque/Savings
   - Reference: "Use your Referral Code"
3. Click **Save**

Users will see these details on the payment page for manual transfer.

---

## Payment Gateway Comparison

| Feature | Yoco | Payfast | CoinPayments | Bank Transfer |
|---------|------|---------|--------------|---------------|
| **MLM Friendly** | ✅ | ✅ | ✅ | ✅ |
| **Accepts Crypto** | ❌ | ❌ | ✅ | ❌ |
| **SA Cards** | ✅ | ✅ | ❌ | ❌ |
| **International** | ❌ | Limited | ✅ | Limited |
| **Auto-Approve** | ✅ | ✅ | ✅ | ❌ Manual |
| **Fees** | 2.95% | 2.9% + R2 | 0.5% | Free |
| **Settlement** | 2-3 days | 2-3 days | Instant | 1-3 days |
| **Recurring** | Limited | ✅ | ✅ | ❌ |
| **Setup Time** | 1 day | 1-3 days | Instant | Instant |

---

## Recommended Setup Strategy

### Phase 1: Start Simple (Week 1)
```
1. Yoco (Already set up) - Primary
2. Bank Transfer - Backup
```

### Phase 2: Add South African Alternative (Week 2-3)
```
1. Yoco - Primary cards
2. Payfast - EFT, SnapScan, Zapper
3. Bank Transfer - Manual backup
```

### Phase 3: Go Global with Crypto (Month 2+)
```
1. Yoco - SA card payments
2. Payfast - SA EFT/mobile payments
3. CoinPayments - International + crypto
4. Bank Transfer - Manual backup
```

---

## Switching Between Gateways

You can switch the active payment gateway anytime from the Admin Panel:

1. Admin Panel → **Payment Gateways**
2. Configure the gateway you want to use
3. Click **Set as Active Gateway**
4. Users will immediately see the new payment option

You can also enable multiple gateways and let users choose.

---

## Network Marketing Compliance

### Why These Gateways?

All selected gateways are **MLM/NWM friendly**:

✅ **Payfast**
- South African company, understands local MLM market
- No restrictions on commission payouts
- Supports recurring billing for subscriptions
- Used by many SA MLM companies

✅ **CoinPayments**
- Specifically markets to MLM/cryptocurrency projects
- Designed for commission structures
- Global reach for international teams
- Anonymous/pseudonymous transactions

✅ **Yoco**
- General South African payment gateway
- No specific MLM restrictions
- Widely accepted

✅ **Bank Transfer**
- No restrictions
- Direct control

### Avoid These:
❌ **PayPal** - Notorious for freezing MLM accounts
❌ **Stripe** - Terms prohibit pyramid/MLM structures
❌ **Square** - Similar restrictions to Stripe

---

## Getting Help

### Payfast Support:
- Email: support@payfast.co.za
- Phone: +27 21 469 6429
- Hours: 08:00 - 17:00 SAST (Mon-Fri)

### CoinPayments Support:
- Email: support@coinpayments.net
- Ticket System: https://www.coinpayments.net/help
- Response: 24-48 hours

### Yoco Support:
- Email: hello@yoco.com
- Phone: 087 550 0060
- Hours: 24/7 for transactions

---

## Security Best Practices

1. **Never share API keys publicly**
2. **Use test/sandbox mode first**
3. **Keep IPN secrets secure**
4. **Enable 2FA on all accounts**
5. **Monitor transactions daily**
6. **Set up webhook notifications**
7. **Regular security audits**

---

## Next Steps

1. ✅ Yoco already configured
2. 🔧 Set up Payfast (recommended next)
3. 🔧 Set up CoinPayments for crypto
4. ✅ Bank Transfer ready

You're all set for payment processing! 🎉
