# 💎 DIAMOND TIER - PREMIUM ACCESS RESTRICTIONS

## Overview

The **Diamond Legacy Builder** tier (R11,980) is a **premium upgrade tier** with special eligibility requirements. This tier is designed exclusively for high-achieving, committed members who have demonstrated sustained success in the Z2B platform.

---

## 🔒 Access Requirements

To purchase the Diamond tier, members must meet **ALL THREE** criteria:

### 1. **Current Tier Requirement**
- **Minimum Tier:** Platinum Legacy Builder (PLB) or higher
- **Why:** Members must have already invested in and experienced the full Z2B ecosystem
- **Status:** Must be an active, logged-in member

### 2. **Silver Tenure Requirement**
- **Minimum Duration:** 6 months at Silver tier or above
- **Calculation:** From the date member first reached Silver tier
- **Purpose:** Ensures member has sustained commitment and understands the platform
- **Tracking:** Automatically tracked via `user_tier_history` table

### 3. **TLI Achievement Requirement**
- **Minimum Level:** Level 8 - Capital Visionary 💼
- **Requirements:** Total Team PV of 80,000
- **Why:** Demonstrates proven leadership and team-building capability
- **Details:** See TLI Level 8 requirements in config/app.php

---

## ✅ Diamond Tier Qualification Summary

| Requirement | Criteria | How to Qualify |
|-------------|----------|----------------|
| **Current Tier** | Platinum or Diamond | Upgrade to Platinum (R4,980) first |
| **Silver Tenure** | 6+ months as Silver+ | Join as Silver+ and wait 6 months |
| **TLI Achievement** | Level 8 (Capital Visionary) | Build team to 80,000 PV |

**All three must be met simultaneously!**

---

## 📊 TLI Level 8 Requirements

**Capital Visionary 💼**
- Total Team PV: 80,000
- Reward: R600,000 (House Incentive)
- Required Invites: 3 members at TLI Level 7 (Estate Pioneer)
- Minimum Tier: Silver Legacy or above
- Team Composition: 20% of team must be Silver+ members

---

## 🚫 What Happens if Requirements Not Met

### For New/Public Visitors
- Diamond tier button will show "Members Only" badge
- Clicking triggers message: "This is a premium upgrade tier - please start with Bronze, Copper, Silver, Gold, or Platinum"
- Redirected to tier selection

### For Logged-In Members (Not Qualified)
- System checks eligibility before payment
- Shows detailed feedback on which requirements are missing:
  - ❌ Current tier too low → "Upgrade to Platinum first"
  - ❌ Insufficient Silver tenure → "X more months required"
  - ❌ TLI level not achieved → "Achieve Capital Visionary (Level 8)"
- Payment blocked until qualified

### For Qualified Members
- ✅ All checks pass
- Payment proceeds normally
- Diamond tier benefits activated

---

## 🔧 Technical Implementation

### Config File (config/app.php)
```php
'DLB' => [
    'name' => 'Diamond Legacy Builder',
    'price' => 11980,
    'pv' => 1200,
    'isp' => 50,
    'tsc' => 15,
    'tpb' => 9,
    'ai_credits' => 1000,
    'color' => '#B9F2FF',
    // Premium tier - Special access restrictions
    'restricted' => true,
    'min_current_tier' => 'PLB', // Must be at least Platinum
    'min_silver_tenure_months' => 6, // Must have been Silver+ for 6 months
    'min_tli_level' => 8 // Must have achieved TLI Level 8 (Capital Visionary)
]
```

### Validation Class
- **File:** `includes/TierEligibilityValidator.php`
- **Method:** `checkEligibility($userId, 'DLB')`
- **Returns:** Array with eligibility status and detailed reasons

### API Integration
Payment endpoint (`api/create-tier-checkout.php`) should validate before creating checkout:
```php
require_once __DIR__ . '/../includes/TierEligibilityValidator.php';

$validator = new TierEligibilityValidator();
$result = $validator->checkEligibility($userId, 'DLB');

if (!$result['eligible']) {
    // Block payment and return error
    echo json_encode([
        'success' => false,
        'error' => $result['reason'],
        'details' => $result['details']
    ]);
    exit;
}
```

---

## 📅 Timeline Example

**Member Journey to Diamond Tier:**

### Month 0: Join as Platinum
- Purchase: Platinum Legacy Builder (R4,980)
- Status: ❌ Diamond not available (need 6 months Silver tenure)

### Months 1-6: Build Team
- Work toward TLI Level 8
- Build team to 80,000 PV
- Invite and develop 3 Estate Pioneer leaders

### Month 6: Achieve TLI Level 8
- Status: ✅ Current tier: Platinum
- Status: ✅ Silver tenure: 6 months (Platinum counts as Silver+)
- Status: ✅ TLI Level: 8 (Capital Visionary)

### Month 6+: Diamond Eligible!
- **Upgrade Available:** Diamond Legacy Builder (R11,980)
- All requirements met
- Diamond tier unlocked

**Total Investment Timeline:** Minimum 6 months from first reaching Platinum/Silver tier

---

## 🗄️ Database Requirements

### Required Tables

#### 1. users table (already exists)
```sql
-- Fields needed:
- id
- tier_code (current tier)
- created_at
```

#### 2. user_tier_history table (NEW - create this)
```sql
CREATE TABLE IF NOT EXISTS user_tier_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tier_code VARCHAR(10) NOT NULL,
  changed_from VARCHAR(10),
  changed_to VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_tier (user_id, tier_code),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 3. user_tli_achievements table (NEW - create this)
```sql
CREATE TABLE IF NOT EXISTS user_tli_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  level INT NOT NULL,
  level_name VARCHAR(100),
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_level (user_id, level),
  INDEX idx_user_id (user_id),
  INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 📝 Administrative Notes

### For Platform Admins

**Manually Grant Diamond Access:**
If you need to manually grant Diamond tier access to a member (e.g., special case, early adopter), you must:

1. Update their tier history:
```sql
INSERT INTO user_tier_history (user_id, tier_code, changed_from, changed_to, created_at)
VALUES (123, 'SLB', NULL, 'SLB', DATE_SUB(NOW(), INTERVAL 6 MONTH));
```

2. Grant TLI Level 8:
```sql
INSERT INTO user_tli_achievements (user_id, level, level_name)
VALUES (123, 8, 'Capital Visionary 💼');
```

3. Update current tier to Platinum:
```sql
UPDATE users SET tier_code = 'PLB' WHERE id = 123;
```

Now member will pass all eligibility checks.

---

## 🎯 Benefits of Diamond Tier

Why members should strive for Diamond access:

### Enhanced Benefits
- **AI Credits:** 1,000 credits/month (2x Platinum)
- **ISP Percentage:** 50% (highest tier)
- **TSC Levels:** 15 generations (deepest reach)
- **Team Performance Bonus:** 9% pool share
- **White Label Capability:** Brand the platform as your own
- **Priority Support:** Dedicated account manager
- **Exclusive Training:** Diamond-only masterclasses
- **Annual Summit:** All-expenses-paid leadership retreat

### Status & Recognition
- Diamond badge on profile
- Leaderboard prominence
- Featured success stories
- Speaking opportunities at Z2B events

---

## 🔄 Upgrade Path

**Recommended Path to Diamond:**

1. **Start:** Bronze (R480) or Copper (R980)
2. **Build:** Team and qualify for TLI levels
3. **Upgrade:** Silver (R1,480) → Lock in 6-month timer
4. **Grow:** Continue building to Level 8
5. **Advance:** Platinum (R4,980) if not already Silver+
6. **Wait:** Complete 6 months at Silver+ tier
7. **Achieve:** TLI Level 8 (Capital Visionary)
8. **Unlock:** Diamond (R11,980) - FULL ACCESS!

---

## ❓ FAQs

**Q: I'm Platinum now. Do I have to wait 6 more months for Diamond?**
A: No! The 6-month timer starts when you first reached Silver tier or above. Platinum counts as Silver+, so if you've been Platinum for 6+ months, that requirement is already met.

**Q: Can I skip Platinum and go straight to Diamond if I meet the TLI requirement?**
A: No. You must currently BE a Platinum member to purchase Diamond. The system checks your current tier.

**Q: What if I downgrade from Silver back to Bronze - does my 6-month timer reset?**
A: No. The timer tracks when you FIRST reached Silver or above, not how long you've continuously maintained it. However, you must be Platinum at the time of Diamond purchase.

**Q: Can new members join directly at Diamond tier?**
A: No. Diamond is an upgrade-only tier. New members must start at Bronze, Copper, Silver, Gold, or Platinum, build their requirements, then upgrade to Diamond.

**Q: I achieved Level 8 but then my team shrank. Can I still buy Diamond?**
A: Yes! Once you've achieved Level 8, it's recorded permanently in your achievements. You don't need to maintain that team size indefinitely.

---

## 📞 Support

For questions about Diamond tier eligibility:
- Check your eligibility: Dashboard → Tier Upgrades → Diamond Tier
- Contact support: support@z2blegacybuilders.co.za
- View your TLI progress: Dashboard → Achievements

---

**Document Version:** 1.0
**Last Updated:** 2025-10-22
**Status:** Active - Diamond tier restrictions in effect
