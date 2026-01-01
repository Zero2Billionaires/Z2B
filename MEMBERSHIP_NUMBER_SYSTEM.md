# Z2B Legacy Builders - Membership Number System

## Overview
Every member of Z2B Legacy Builders receives a unique membership number in the format: **Z2B** + **7 numerical digits**

## Format
- **Prefix:** Z2B (Zero to Billions)
- **Digits:** 7 numerical digits with leading zeros
- **Examples:**
  - First member: `Z2B0000001`
  - Second member: `Z2B0000002`
  - 100th member: `Z2B0000100`
  - 1,000th member: `Z2B0001000`
  - 1 millionth member: `Z2B1000000`

## Referral Links

Each member automatically gets a personalized referral link that includes their membership number:

### Format
```
https://z2blegacybuilders.co.za/join?ref=Z2B0000001
```

### Example Referral Links
- Member Z2B0000001: `https://z2blegacybuilders.co.za/join?ref=Z2B0000001`
- Member Z2B0000042: `https://z2blegacybuilders.co.za/join?ref=Z2B0000042`
- Member Z2B0123456: `https://z2blegacybuilders.co.za/join?ref=Z2B0123456`

## How It Works

### Automatic Generation
1. When a new user registers, the system automatically:
   - Finds the highest existing membership number
   - Increments it by 1
   - Formats it with leading zeros (7 digits)
   - Adds the Z2B prefix
   - Generates the referral link

2. The membership number is:
   - **Unique** - No two members can have the same number
   - **Sequential** - Numbers are issued in order
   - **Permanent** - Once assigned, it never changes
   - **Cross-validated** - Checks both Member and CoachUser collections to avoid duplicates

### Database Implementation

#### Member Model Fields
```javascript
{
  membershipNumber: "Z2B0000001",  // Primary membership number
  referralLink: "https://z2blegacybuilders.co.za/join?ref=Z2B0000001"
}
```

#### CoachUser Model Fields
```javascript
{
  membershipNumber: "Z2B0000001",  // Primary membership number
  referralLink: "https://z2blegacybuilders.co.za/join?ref=Z2B0000001",
  sponsorId: ObjectId("..."),      // Who referred this member
  tier: "Bronze"                   // Current membership tier
}
```

## Using the Referral System

### For Members
1. **Get Your Referral Link:**
   ```javascript
   const link = member.getReferralLink();
   // Returns: "https://z2blegacybuilders.co.za/join?ref=Z2B0000001"
   ```

2. **Get Your Membership Number:**
   ```javascript
   const code = member.getReferralCode();
   // Returns: "Z2B0000001"
   ```

3. **Share Your Link:**
   - Copy your referral link from your dashboard
   - Share via WhatsApp, email, social media
   - When someone clicks and joins, you get credit!

### For New Sign-ups
When someone clicks your referral link and registers:
1. The system captures the `ref` parameter (your membership number)
2. Stores it as their `sponsorId`
3. You earn commissions on their activity based on your tier

## Tracking Referrals

### View Your Team
```javascript
// Find all members you referred
const myReferrals = await Member.find({ sponsorId: myMemberId });

// Find all members in your downline (all generations)
const myDownline = await Member.find({
  referralPath: { $regex: new RegExp(myMembershipNumber) }
});
```

### Commission Calculation
Commissions are calculated based on:
- Your **tier level** (FAM, Bronze, Copper, Silver, Gold, Platinum, Diamond)
- Your **team depth** (up to 10 generations)
- The **6 income streams** (ISP, TSC, TPB, TLI, QPB, Marketplace Sales)

## API Endpoints

### Get Member Info
```
GET /api/members/me
Response: {
  membershipNumber: "Z2B0000001",
  referralLink: "https://z2blegacybuilders.co.za/join?ref=Z2B0000001",
  tier: "Gold",
  totalReferrals: 15
}
```

### Register with Referral
```
POST /api/auth/register
Body: {
  fullName: "John Doe",
  email: "john@example.com",
  password: "password123",
  referralCode: "Z2B0000001"  // Sponsor's membership number
}
```

## Benefits

### For Members
✅ **Professional Identity** - Easy to remember, professional-looking membership number
✅ **Personal Branding** - Use your number in marketing materials
✅ **Track Your Growth** - See your position in the Z2B Legacy community
✅ **Easy Sharing** - Simple, clean referral links

### For the Platform
✅ **Scalability** - Can support up to 9,999,999 members
✅ **Organization** - Easy to track member hierarchy
✅ **Security** - Unique identifiers for each member
✅ **Analytics** - Track referral patterns and growth

## Example Scenarios

### Scenario 1: First Member
```
Member joins → System assigns: Z2B0000001
Referral Link: https://z2blegacybuilders.co.za/join?ref=Z2B0000001
```

### Scenario 2: Referred Member
```
User clicks: https://z2blegacybuilders.co.za/join?ref=Z2B0000001
User registers → System assigns: Z2B0000002
System records: sponsorId = Z2B0000001's member ID
Member Z2B0000001 earns commissions on Z2B0000002's activity
```

### Scenario 3: Team Building
```
Z2B0000001 (You)
├── Z2B0000002 (Your direct referral - Generation 1)
│   ├── Z2B0000010 (Generation 2)
│   └── Z2B0000011 (Generation 2)
├── Z2B0000003 (Your direct referral - Generation 1)
│   ├── Z2B0000012 (Generation 2)
│   │   └── Z2B0000020 (Generation 3)
│   └── Z2B0000013 (Generation 2)
└── Z2B0000004 (Your direct referral - Generation 1)

You earn commissions from all 7 members based on your tier!
```

## Technical Notes

### Validation
- Format: `/^Z2B\d{7}$/`
- Minimum: `Z2B0000001`
- Maximum: `Z2B9999999`

### Unique Index
Both Member and CoachUser collections have unique indexes on `membershipNumber` to prevent duplicates.

### Auto-Increment Logic
The system uses a sophisticated counter that:
1. Queries both collections for the highest number
2. Takes the maximum of both
3. Increments by 1
4. Ensures no gaps or duplicates

## Support

If you have questions about your membership number or referral link:
- 📧 Email: support@z2blegacybuilders.co.za
- 💬 WhatsApp: 0774901639
- 🌐 Website: z2blegacybuilders.co.za

---

**Remember:** Your membership number is your unique identity in the Z2B Legacy Builders family. Protect it, share it wisely, and use it to build your billion-dollar legacy! 🚀
