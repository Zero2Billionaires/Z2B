# Z2B Admin Panel - Complete Guide

## 🎯 Starting Fresh for Your First 100 Beta Testers

### YES! You Can Reset Everything and Start with Real Data

---

## ✅ What You Can Do in the Admin Panel

### 1. **Reset Statistics** (Statistics Section)

**What it does:**
- Resets ALL statistics counters to zero
- Clears: Total users count, revenue, commissions, PV points, tier distribution
- Keeps reset history for audit trail
- **DOES NOT delete actual users** - only resets the numbers

**How to use:**
1. Login to admin panel
2. Click **"Statistics"** in sidebar
3. Scroll to bottom
4. Click red **"Reset Statistics"** button
5. Confirm action

**When to use:**
- After clearing demo users
- When starting fresh with real data
- Monthly/quarterly resets

---

### 2. **Clear All Demo Users** (NEW - Users Section)

**What it does:**
- **DELETES ALL USERS** from the database permanently
- Removes demo/test accounts completely
- Prepares database for first 100 real beta testers
- Shows progress indicator during deletion
- **CANNOT BE UNDONE**

**How to use:**
1. Login to admin panel
2. Click **"Users"** in sidebar
3. Click red **"Clear All Demo Users"** button
4. Type exactly: `DELETE ALL USERS` to confirm
5. Click OK on second confirmation
6. Wait for deletion to complete (shows progress)

**Safety features:**
- Double confirmation required
- Must type exact phrase to proceed
- Shows deletion progress
- Reports success/failure count

**When to use:**
- Before launching to real beta testers
- Clearing test data after development
- Starting fresh after demo period

**⚠️ WARNING:** This deletes EVERYTHING including admin users. You'll need to recreate accounts after.

---

### 3. **Create New Users** (Users Section)

**What it does:**
- Admin registration (no payment needed)
- Assign any tier (FAM, Bronze, Copper, Silver, Gold, Platinum)
- Mark as beta tester (50% discount locked forever)
- Grant manual access for cash/in-kind payments
- Set initial password

**How to use:**
1. Click **"Create New User"** button
2. Fill in:
   - Full Name
   - Email Address
   - Phone Number
   - Membership Tier
   - Password
   - Check "Grant Manual Access" if paid cash
   - Check "Beta Tester" if within first 100
3. Click **"Create User"**

**Perfect for:**
- Registering beta testers who pay cash
- Manual registrations (in-person signups)
- Adding team members
- Testing different tiers

---

### 4. **Grant Manual Access** (Users Section)

**What it does:**
- Give free access to users who paid cash/in-kind
- Unlock all apps for specific tier
- Mark payment as "MANUAL" in database

**When to use:**
- User paid cash at event
- In-kind/barter payment received
- Bank transfer confirmed manually
- Cash deposit confirmed

---

### 5. **Update Tier Prices** (Tiers Section)

**What it does:**
- Change tier prices instantly
- Update PV points
- Modify ISP commission percentages
- Changes reflect immediately on website

**How to use:**
1. Go to **Tiers** section
2. Edit any tier's:
   - Price (R)
   - PV Points
   - ISP Commission %
   - Daily AI Fuel credits
3. Click **"Save Tier Settings"**

---

### 6. **Manage Compensation Plan** (Compensation Section)

**What it does:**
- Configure all 7 income streams
- Update commission percentages
- Change beta tester limit (default: 100)
- Modify payment rules

**Configurable:**
- ISP (Individual Sales Profit): 20%-45%
- QPB (Quick Pathfinder Bonus): 7.5% / 10%
- TSC (Team Sales Commission): G1-G10 percentages
- TPB (Team Performance Bonus): Qualification rules
- TLI (Team Leadership Incentive): Pool ranges
- CEO (Awards): Enable/disable
- MKT (Marketplace): Seller/platform split

---

### 7. **View All Users** (Users Section)

**Features:**
- Search by name, email, ID
- Filter by tier
- Sort by date, tier, status
- View user details
- Edit user information
- Delete individual users
- Grant/revoke access

**User details shown:**
- Name, email, phone
- Tier and status
- PV points
- AI Fuel balance
- Registration date
- Referral code
- Sponsor information

---

## 🎯 Recommended Workflow: Starting Fresh

### Step-by-Step Process for First 100 Beta Testers:

#### **PHASE 1: Clean Slate**

1. **Deploy Backend** (if not done yet)
   - Follow BACKEND_DEPLOYMENT_GUIDE.md
   - Setup MongoDB Atlas
   - Deploy to Railway
   - Update admin.html API URL

2. **Access Admin Panel**
   - Visit: `https://z2blegacybuilders.co.za/admin.html`
   - Click "Z2B Legacy Builders" title 5 times
   - Login: `admin` / `Admin@Z2B2024!`

3. **Clear All Demo Data**
   - Go to **Users** section
   - Click **"Clear All Demo Users"** button
   - Type: `DELETE ALL USERS`
   - Confirm deletion
   - Wait for completion

4. **Reset Statistics**
   - Go to **Statistics** section
   - Click **"Reset Statistics"** button
   - Confirm reset

**Result:** Fresh, empty database ready for real users!

---

#### **PHASE 2: Configure Settings**

5. **Set Beta Tester Limit**
   - Go to **Compensation** section
   - Find "Beta Tester Limit"
   - Set to: `100`
   - Set "Beta Tester Discount": `50` (50% off forever)
   - Click **"Save Settings"**

6. **Review Tier Pricing**
   - Go to **Tiers** section
   - Verify all prices are correct:
     - FAM: R0 (FREE)
     - Bronze: R960 → Beta: R480
     - Copper: R1,980 → Beta: R990
     - Silver: R2,980 → Beta: R1,490
     - Gold: R4,980 → Beta: R2,490
     - Platinum: R6,980 → Beta: R3,490
   - Click **"Save Tier Settings"** if changes made

7. **Configure Payment Gateways**
   - Go to **Payment Gateways** section
   - Add Payfast credentials
   - Add CoinPayments API keys
   - Enable bank transfer
   - Test each gateway

---

#### **PHASE 3: Register First 100 Beta Testers**

8. **Manual Registration Method**

   **For each beta tester:**

   a. Click **"Create New User"** button

   b. Fill in details:
      - Full Name: `[User's name]`
      - Email: `[User's email]`
      - Phone: `[User's phone]`
      - Tier: `[Choose their tier]`
      - Password: `[Set temp password]`
      - ✅ Check **"Grant Manual Access"** if they paid cash
      - ✅ Check **"Beta Tester"** (first 100 get 50% off locked forever)

   c. Click **"Create User"**

   d. Send welcome email with:
      - Login URL: https://z2blegacybuilders.co.za/dashboard.html
      - Username: Their email
      - Temporary password
      - Builder ID/Referral code

9. **Track Progress**
   - Go to **Statistics** section
   - Click **"Refresh"** to see live counts
   - Monitor:
     - Total Users (should be ≤ 100 for beta)
     - Beta Testers count
     - Tier distribution
     - Active users

10. **After Beta Tester Slots Fill Up**
    - System automatically stops giving 50% discount
    - User 101+ pays full price
    - Beta testers keep 50% discount FOREVER
    - Their discount locked in database permanently

---

## 💾 All Data is Saved in Real-Time

### MongoDB Atlas Cloud Database:

✅ **Permanent Storage**
- Every user registration saved instantly
- All payments recorded in real-time
- Commission calculations stored
- Statistics updated automatically
- Data backed up by MongoDB Atlas

✅ **Real-Time Updates**
- User creates account → Saved immediately
- Payment processed → Database updated instantly
- Referral made → Commission calculated and stored
- No delay, no data loss

✅ **Professional Database**
- Cloud-hosted (always accessible)
- Automatic backups (MongoDB Atlas)
- 99.9% uptime guarantee
- Scalable to millions of users
- Professional-grade security

---

## 📊 Statistics You Can Track

### Dashboard Overview:
- **Total Users**: All registered members
- **Beta Testers**: First 100 (with 50% discount)
- **Active Users**: Currently using platform
- **Tier Distribution**: How many in each tier
- **Total Revenue**: All payments received
- **Total PV Generated**: Platform-wide points
- **Commission Paid**: Total commissions distributed
- **Monthly Growth**: New signups per month

### All statistics:
- Update in real-time
- Can be reset without deleting users
- Exportable (future feature)
- Viewable in charts (future feature)

---

## 🔐 Security & Access

### Admin Panel Access:
1. **Secret Trigger**: Click "Z2B Legacy Builders" title 5 times
2. **Login Required**: Username + Password
3. **JWT Authentication**: Secure token-based access
4. **Auto-Logout**: After 24 hours of inactivity

### Database Security:
- MongoDB Atlas encryption
- Environment variables for secrets
- Password hashing (bcrypt)
- JWT tokens for API access
- IP whitelisting available

---

## 🎯 Best Practices for First 100 Beta Testers

### Registration Tips:

1. **Verify Information**
   - Double-check email addresses
   - Confirm phone numbers
   - Verify payment before granting access

2. **Beta Tester Flag**
   - ALWAYS check "Beta Tester" for first 100
   - After 100, system auto-disables discount
   - Verify in Statistics: Total Beta Testers count

3. **Track Payments**
   - Use "Grant Manual Access" for cash payments
   - Note payment method in user notes
   - Keep external payment records

4. **Send Welcome Communications**
   - Email login credentials immediately
   - Include referral code/Builder ID
   - Provide support contact info
   - Share getting started guide

5. **Monitor System Health**
   - Check Statistics daily
   - Verify all users can login
   - Test payment gateways regularly
   - Review backend logs on Railway

---

## 📞 What If Something Goes Wrong?

### Common Issues:

**Issue: "Can't delete all users"**
- Check backend is running (visit /api/health)
- Verify admin token is valid (re-login)
- Check MongoDB connection
- View Railway/Render logs

**Issue: "Statistics not updating"**
- Click "Recalculate Statistics" button
- Refresh the page
- Check database connection
- May need to reset and recalculate

**Issue: "User creation fails"**
- Check if email already exists
- Verify all required fields filled
- Check MongoDB has space (free tier: 512MB)
- Review backend error logs

**Issue: "Lost admin access"**
- You can recreate admin user via MongoDB Atlas directly
- Or add admin route to backend to reset password
- Contact Railway support if backend down

---

## 🚀 Future Expansion (After First 100)

### Scaling Up:

**101-1000 Users:**
- Continue using free MongoDB tier
- Keep Railway free tier
- No changes needed!

**1000+ Users:**
- Upgrade Railway to Pro ($5/month)
- Still use free MongoDB (handles 10,000+ users)
- Better performance, always-on

**10,000+ Users:**
- Upgrade MongoDB to M2 ($9/month - 2GB)
- Railway Pro $5/month
- Total: $14/month for 10,000+ users!

**100,000+ Users:**
- Enterprise MongoDB Atlas
- Railway scale
- Multiple regions
- Professional support

---

## ✅ Summary: Your Admin Powers

Once backend is deployed, you can:

1. ✅ **Reset all statistics** to zero
2. ✅ **Delete ALL users** at once (clear demo data)
3. ✅ **Create new users** manually (no payment needed)
4. ✅ **Grant manual access** (cash/in-kind payments)
5. ✅ **Update tier pricing** instantly
6. ✅ **Configure all 7 income streams**
7. ✅ **View and manage all users**
8. ✅ **Track real-time statistics**
9. ✅ **Mark first 100 as beta testers** (50% off locked forever)
10. ✅ **All data saved permanently** in MongoDB cloud

**Perfect for starting fresh with your first 100 real beta testers!**

---

## 📋 Quick Action Checklist

Before registering first beta tester:

- [ ] Backend deployed to Railway/Render
- [ ] MongoDB Atlas setup and connected
- [ ] Admin panel accessible
- [ ] All demo users cleared
- [ ] Statistics reset
- [ ] Beta tester limit set to 100
- [ ] Tier prices verified
- [ ] Payment gateways configured
- [ ] Welcome email template ready
- [ ] Support channels setup

**Status: Ready to accept real users! 🎉**

---

**Questions?**
- Check BACKEND_DEPLOYMENT_GUIDE.md
- Check DEPLOYMENT_SUMMARY.md
- Review Railway/Render logs
- Test /api/health endpoint

---

**Created**: October 28, 2025
**For**: Z2B Legacy Builders Admin Panel
**Version**: 1.0 with Clear Demo Users Feature
