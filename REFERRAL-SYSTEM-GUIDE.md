# 🤝 Z2B Referral System Guide

## Overview
The Z2B Legacy Builders platform now has an **automated referral system** that allows members to share referral links and automatically get credited for sales.

---

## How It Works

### For Members (Sponsors)

**Step 1: Create Your Referral Link**

Your referral link format:
```
https://www.z2blegacybuilders.co.za/tiers?ref=YOUR_MEMBER_ID
```

**Examples:**
- `https://www.z2blegacybuilders.co.za/tiers?ref=JOHN2024`
- `https://www.z2blegacybuilders.co.za/?ref=MARY123`
- `https://www.z2blegacybuilders.co.za/opportunity?ref=DAVID456`

**Alternative parameter (also works):**
```
https://www.z2blegacybuilders.co.za/tiers?referral=YOUR_MEMBER_ID
```

**Step 2: Share Your Link**

Share your referral link via:
- WhatsApp messages
- Email campaigns
- Social media posts
- Text messages
- Direct messages

**Step 3: Automatic Credit**

When your prospect:
1. Clicks your referral link
2. Browses the site (system saves your ID)
3. Signs up for membership
4. Your ID is automatically filled in the form
5. You get credited for the sale!

---

### For Prospects (New Sign-Ups)

**What Prospects See:**

1. **Click Referral Link**
   - Prospect clicks your link: `...?ref=JOHN2024`

2. **Browse the Site**
   - System captures and stores referral code
   - Works on ANY page (home, opportunity, tiers, etc.)

3. **Select Membership Tier**
   - Choose Bronze, Copper, Silver, Gold, or Platinum

4. **Sign-Up Form**
   - **Auto-filled referral section appears:**
   
   ```
   ┌─────────────────────────────────────────┐
   │ 🤝 Referred by: Legacy Builder Member  │
   │    Code: JOHN2024                    [X]│
   └─────────────────────────────────────────┘
   
   Sponsor ID (Auto-filled)
   [JOHN2024] 🔒 (locked)
   
   ✅ This member will be credited for your sale.
      Click X above to change.
   ```

5. **Complete Sign-Up**
   - Fill in personal info
   - Create password
   - Agree to terms
   - Continue to payment

6. **Referral Locked**
   - Field is locked to prevent accidental changes
   - Prospect can remove by clicking X (if needed)
   - Your credit is secure!

---

## URL Parameters

**Both parameters work:**
- `?ref=CODE`
- `?referral=CODE`

**Works on ALL pages:**
- Home: `/?ref=CODE`
- Opportunity: `/opportunity?ref=CODE`
- Ecosystem: `/ecosystem?ref=CODE`
- Tiers: `/tiers?ref=CODE`
- Any page on the site!

**How to append to existing URLs:**
```
Base URL: https://www.z2blegacybuilders.co.za/opportunity
Your Link: https://www.z2blegacybuilders.co.za/opportunity?ref=YOUR_ID
```

---

## Visual Indicators

### Referrer Badge (Green)
Shows when referral is captured:
- 🤝 Icon
- "Referred by: [Member Name]"
- "Code: [MEMBER_ID]"
- X button to remove

### Locked Input Field (Gold)
- Golden/yellow background
- Bold text
- Read-only (can't type)
- Shows "Auto-filled from referral link"

### Confirmation Message
- ✅ Green checkmark
- "This member will be credited for your sale"

---

## Member ID Examples

**Format:** Any alphanumeric code

**Good Examples:**
- `JOHN2024`
- `MARY_BUILDER`
- `COACH123`
- `LEGACY456`
- `TEAMLEADER99`

**Avoid:**
- Special characters: `JOHN@2024` ❌
- Spaces: `JOHN 2024` ❌
- Very long codes: `JOHNSMITHBUILDER20241231` ❌

**Recommended:** 
- 6-12 characters
- Letters + numbers
- Easy to remember
- Unique to you

---

## Preventing Referral Theft

**Security Features:**

1. **Auto-Lock Field**
   - Once filled, field is locked
   - Prevents accidental deletion
   - Requires intentional X click to remove

2. **Persistent Storage**
   - Saved in browser localStorage
   - Survives page refreshes
   - Stays until sign-up completes

3. **Visual Confirmation**
   - Clear green badge
   - Member name display
   - Prospect sees who referred them

4. **Removal Option**
   - Prospect can remove if needed
   - Click X button
   - Clears localStorage
   - Unlocks field for manual entry

---

## Marketing Tips

### Create Branded Links

**Option 1: URL Shorteners**
```
Original: https://www.z2blegacybuilders.co.za/tiers?ref=JOHN2024
Shortened: https://bit.ly/john-z2b-join
```

**Option 2: QR Codes**
Generate QR code with your referral link:
- Use qr-code-generator.com
- Print on business cards
- Add to social media posts

### Track Your Referrals

**Create Different Links for Different Channels:**
- WhatsApp: `?ref=JOHN_WA`
- Facebook: `?ref=JOHN_FB`
- Email: `?ref=JOHN_EMAIL`
- In-Person: `?ref=JOHN_EVENT`

(Note: You'll need admin/dashboard tracking to see which codes perform best)

---

## Common Questions

### Q: What if prospect manually enters a different code?
**A:** They can click the X button to remove your auto-filled code and enter another one manually. This is by design to prevent forced referrals.

### Q: Does the referral code expire?
**A:** The code stays in their browser until:
- They complete sign-up (then it's submitted)
- They click X to remove it
- They clear browser data

### Q: Can I use the same link for everyone?
**A:** Yes! One link works for unlimited prospects. Your member ID stays the same.

### Q: What if they click multiple referral links?
**A:** The LAST referral link wins. If they click:
1. Your link: `?ref=JOHN2024`
2. Someone else's: `?ref=MARY123`

Mary's code will overwrite yours.

### Q: Can I see who clicked my link?
**A:** (This requires backend tracking - not yet implemented)
Future features will include:
- Click tracking
- Conversion tracking
- Commission dashboard

---

## Technical Details

### For Developers

**How It Works:**

1. **URL Parameter Capture** (App.js)
```javascript
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref') || urlParams.get('referral');
if (refCode) {
  localStorage.setItem('referralCode', refCode);
}
```

2. **Auto-Fill on Sign-Up** (MembershipSignUp.jsx)
```javascript
const savedReferralCode = localStorage.getItem('referralCode');
if (savedReferralCode) {
  setFormData(prev => ({ ...prev, referralCode: savedReferralCode }));
  setIsReferralLocked(true);
}
```

3. **Submission** (PaymentProcessing.jsx)
```javascript
const membershipData = localStorage.getItem('pendingMembership');
// Contains referralCode field
// Submit to backend for commission tracking
```

---

## Next Steps (Future Features)

**Planned Enhancements:**

1. **API Integration**
   - Fetch referrer name from database
   - Show profile picture
   - Display referrer stats

2. **Commission Tracking**
   - Real-time commission dashboard
   - Earnings per referral
   - Payout history

3. **Multi-Level Tracking**
   - Track downline referrals
   - Team building metrics
   - Genealogy tree view

4. **Advanced Analytics**
   - Click-through rates
   - Conversion rates
   - Best performing channels
   - A/B testing support

---

## Support

**Questions about the referral system?**

Contact Z2B Support:
- Email: support@z2blegacybuilders.co.za
- WhatsApp: [Support Number]
- Dashboard: Member Support Ticket

---

**Happy Referring! Build Your Legacy Team! 🚀**
