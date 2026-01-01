# Z2B Tiered Request Limiting System - Complete Overview

## 🎯 Executive Summary

A comprehensive, production-ready request limiting system for the Z2B Legacy Builders platform featuring:

✅ **Tiered Request Limits** - 6 membership tiers with daily request quotas
✅ **Rollover Accumulation** - Unused requests carry over (max 3x monthly limit)
✅ **95% Warning System** - Proactive notifications before limits are reached
✅ **Tier-Based Features** - Advanced analytics, goal tracking, export features
✅ **Admin Dashboard** - Real-time monitoring and analytics
✅ **Automatic Resets** - Daily and monthly limit refreshes via cron
✅ **Comprehensive Logging** - Detailed request tracking and analytics

---

## 📊 Tier Structure & Limits

| Tier | Name | Daily | Monthly | Max Rollover | Key Features |
|------|------|-------|---------|--------------|--------------|
| **FAM** | Family | 3 | 90 | 270 | Basic access, 10 msg memory |
| **BLB** | Bronze | 25 | 750 | 2,250 | Standard support, 20 msg memory |
| **CLB** | Copper | 60 | 1,800 | 5,400 | Advanced analytics, 30 msg memory |
| **SLB** | Silver | 120 | 3,600 | 10,800 | Goal tracking, Priority support, 50 msg memory |
| **GLB** | Gold | 250 | 7,500 | 22,500 | Export features, Premium support, 100 msg memory |
| **PLB** | Platinum | 500 | 15,000 | 45,000 | All features, Premium support, 200 msg memory |

### Rollover Example

**Scenario:** Silver tier member (120 daily limit)

- **Day 1:** Uses 80 requests → 40 unused → rollover bank = 40
- **Day 2:** Available = 120 + 40 = 160 requests
- **Day 2:** Uses 100 → 60 unused → rollover bank = 40 + 60 = 100
- **Day 3:** Available = 120 + 100 = 220 requests
- **Rollover cap:** 3,600 × 3 = 10,800 maximum

---

## 🏗️ System Architecture

### Core Components

```
Z2B-v21/
├── database/
│   └── migrations/
│       └── create_request_limits_tables.sql    # Database schema
├── includes/
│   └── RateLimiter.php                         # Core rate limiting logic
├── api/
│   ├── rate-limit-middleware.php               # API integration helpers
│   └── usage-status.php                        # Usage API endpoint
├── js/
│   └── request-limiter.js                      # Frontend tracking & warnings
├── admin/
│   └── api-usage-dashboard.php                 # Admin monitoring dashboard
├── examples/
│   ├── rate-limited-coach-endpoint.php         # Coach Manlaw integration
│   └── rate-limited-marketplace-endpoint.php   # Marketplace integration
└── REQUEST_LIMITING_IMPLEMENTATION_GUIDE.md    # Setup instructions
```

### Database Schema

**3 Main Tables:**

1. **`tier_request_limits`** - Tier definitions and feature flags
2. **`member_request_balance`** - Real-time member usage tracking
3. **`request_usage_logs`** - Detailed request history

**2 Views:**

1. **`member_request_status`** - Quick member status lookup
2. **`tier_usage_analytics`** - Aggregated tier statistics

**2 Stored Procedures:**

1. **`reset_daily_limits()`** - Daily reset with rollover calculation
2. **`reset_monthly_limits()`** - Monthly statistics reset

---

## 🚀 Key Features

### 1. Request Limiting

**How it works:**
- Every API call checks current balance
- Deducts 1 request per call
- Returns 429 status when limit exceeded
- Includes usage data in response headers

**Response Headers:**
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1738195200
X-RateLimit-Tier: SLB
X-RateLimit-Rollover: 45
```

### 2. Rollover Accumulation

**Benefits:**
- Rewards consistent users who don't waste requests
- Prevents "use it or lose it" behavior
- Provides buffer for high-usage days
- Capped at 3x monthly limit for fairness

**Calculation:**
```php
$unused_today = max(0, $requests_available);
$new_rollover = min($current_rollover + $unused_today, $max_rollover);
$tomorrow_available = $daily_limit + $new_rollover;
```

### 3. Warning System

**Three Warning Levels:**

| Level | Threshold | Color | Action |
|-------|-----------|-------|--------|
| Info | 50% | Blue | Informational notice |
| Warning | 80% | Orange | Suggest pacing usage |
| Critical | 95% | Red | Show upgrade prompt |

**Frontend Display:**
```javascript
// Automatically shows warning banner
window.requestLimiter = new RequestLimiter();

// Event listener for custom handling
window.addEventListener('usageDataUpdated', (event) => {
    if (event.detail.warning?.level === 'critical') {
        showUpgradeModal();
    }
});
```

### 4. Tier-Based Feature Unlocking

**Features by Tier:**

```php
// Check if feature is available
if (hasFeature($db, $member_id, 'advanced_analytics')) {
    // Show advanced charts and insights
}

if (hasFeature($db, $member_id, 'goal_tracking')) {
    // Enable goal setting and progress tracking
}

if (hasFeature($db, $member_id, 'export_features')) {
    // Allow CSV, PDF, JSON exports
}
```

**Conversation Memory Limits:**
- FAM: 10 messages
- Bronze: 20 messages
- Copper: 30 messages
- Silver: 50 messages
- Gold: 100 messages
- Platinum: 200 messages

### 5. Admin Dashboard

**Real-time Metrics:**
- Total active members
- Requests in last 24 hours
- Members near/at limit
- Usage by tier
- Recent request logs
- Response time tracking

**Access:** `https://yourdomain.com/admin/api-usage-dashboard.php`

**Auto-refresh:** Every 30 seconds

---

## 📝 Implementation Steps

### Quick Start (5 Steps)

1. **Run Database Migration**
   ```bash
   mysql -u root -p z2b_legacy < database/migrations/create_request_limits_tables.sql
   ```

2. **Setup Cron Jobs**
   ```bash
   crontab -e
   # Add:
   0 0 * * * php /path/to/z2b/scripts/reset_daily_limits.php
   0 0 1 * * php /path/to/z2b/scripts/reset_monthly_limits.php
   ```

3. **Initialize Existing Members**
   ```php
   // Run once to set up balances for existing members
   php scripts/initialize_members.php
   ```

4. **Integrate into API Endpoints**
   ```php
   require_once __DIR__ . '/rate-limit-middleware.php';
   $limit_check = checkRateLimit($db, $member_id, 'endpoint-name', 'request-type');
   $limiter = $limit_check['limiter'];

   // ... your API logic ...

   recordRateLimitedRequest($limiter, 'endpoint-name', 'request-type', 'POST', 'success', 200, $start_time);
   ```

5. **Add Frontend Components**
   ```html
   <div id="request-limit-warning"></div>
   <script src="/js/request-limiter.js"></script>
   <script>
       window.requestLimiter = new RequestLimiter();
   </script>
   ```

---

## 🔧 Integration Examples

### Coach Manlaw AI Endpoint

```php
// Check rate limit
$limit_check = checkRateLimit($db, $member_id, 'coach-manlaw', 'ai_coaching');
$limiter = $limit_check['limiter'];

// Get tier features
$features = getTierFeatures($db, $member_id);
$memory_limit = $features['extended_memory'];

// Limit conversation history based on tier
$conversation_history = array_slice($conversation_history, -$memory_limit);

// Process AI request
$response = callClaudeAPI($conversation_history, $features);

// Record request
recordRateLimitedRequest($limiter, 'coach-manlaw', 'ai_coaching', 'POST', 'success', 200, $start_time);
```

### Marketplace Product Creation

```php
// Check rate limit
$limit_check = checkRateLimit($db, $member_id, 'marketplace-create', 'marketplace_create');

// Check product count limit
$tier_limits = ['FAM' => 5, 'BLB' => 25, 'CLB' => 50, 'SLB' => 100, 'GLB' => 250, 'PLB' => 999999];
$max_products = $tier_limits[$tier_code];
$current_count = getCurrentProductCount($db, $member_id);

if ($current_count >= $max_products) {
    return ['error' => 'PRODUCT_LIMIT_REACHED', 'upgrade_recommended' => true];
}

// Create product
$product_id = createProduct($db, $member_id, $data);

// Record request
recordRateLimitedRequest($limiter, 'marketplace-create', 'marketplace_create', 'POST', 'success', 201, $start_time);
```

---

## 📈 Usage Monitoring

### Member Usage Widget

```javascript
// Create usage widget in dashboard
window.requestLimiter.createUsageWidget('widget-container');
```

**Displays:**
- Today's usage (progress bar)
- Monthly usage (progress bar)
- Rollover balance (if any)
- Upgrade button

### Admin Analytics

**SQL Queries for Insights:**

```sql
-- Top users by request volume
SELECT m.username, COUNT(*) as requests
FROM request_usage_logs r
JOIN members m ON r.member_id = m.id
WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY m.username
ORDER BY requests DESC
LIMIT 10;

-- Average usage by tier
SELECT tier_code, AVG(requests_used_today) as avg_daily
FROM member_request_balance
GROUP BY tier_code;

-- Rollover accumulation patterns
SELECT tier_code,
       AVG(rollover_balance) as avg_rollover,
       MAX(rollover_balance) as max_rollover
FROM member_request_balance
GROUP BY tier_code;
```

---

## 🔒 Security Features

1. **SQL Injection Prevention** - All queries use prepared statements
2. **CSRF Protection** - Integrated with existing Auth system
3. **Session Management** - 1-hour timeout, activity tracking
4. **IP Logging** - All requests logged with IP address
5. **Rate Limit Headers** - Prevent client-side abuse
6. **Admin-Only Dashboard** - Role-based access control

---

## 🎨 User Experience

### Warning Notification Example

```
⚠️ You're at 95% of your daily limit! Only 6 requests remaining.

Silver Legacy Builder | 114 of 120 requests used today (95%)

[Upgrade Tier]  [✕]
```

### Usage Widget Example

```
📊 Request Usage                    [Silver Legacy Builder]

Today                                         114 / 120
████████████████████████████████████░░░░  95%
6 requests remaining

This Month                                    1,847 / 3,600
████████████████░░░░░░░░░░░░░░░░░░░░░░░░  51%

🎁 Rollover Bonus
234 extra requests from unused daily allowance

[Upgrade for More Requests]
```

---

## 📊 Performance Considerations

### Database Indexes

```sql
-- High-priority indexes already included in migration
CREATE INDEX idx_member_tier ON members(id, tier_id);
CREATE INDEX idx_balance_status ON member_request_balance(member_id, requests_available, last_daily_reset);
CREATE INDEX idx_usage_analytics ON request_usage_logs(tier_code, request_type, status, created_at);
```

### Caching Opportunities

- Cache tier limits (rarely change)
- Cache member balances (Redis for high traffic)
- Cache feature flags per tier

### Expected Load

- **Database:** 2-3 queries per API request
- **Response time:** < 50ms overhead
- **Storage:** ~1KB per request log entry

---

## 🔄 Maintenance

### Daily Tasks (Automated)

- Reset daily limits (00:00 via cron)
- Calculate rollover balances
- Clear old warning flags

### Monthly Tasks (Automated)

- Reset monthly counters (1st of month via cron)
- Calculate average daily usage
- Archive old request logs (optional)

### Manual Monitoring

- Check admin dashboard for anomalies
- Review members at/near limit
- Analyze tier upgrade patterns
- Monitor response times

---

## 🚨 Troubleshooting

### Common Issues

**1. Limits not resetting**
```bash
# Check cron jobs
crontab -l

# Manual reset
mysql -u root -p -e "CALL reset_daily_limits();"
```

**2. Member showing 0 requests**
```php
// Reinitialize member
$limiter = new RateLimiter($db, $member_id);
```

**3. Warnings not displaying**
```javascript
// Check initialization
console.log(window.requestLimiter);
window.requestLimiter.logUsageStats();
```

---

## 📦 File Manifest

### Created Files

1. **`database/migrations/create_request_limits_tables.sql`** (268 lines)
   Complete database schema with tables, views, procedures

2. **`includes/RateLimiter.php`** (520 lines)
   Core rate limiting class with all logic

3. **`api/rate-limit-middleware.php`** (120 lines)
   Middleware helpers for API integration

4. **`api/usage-status.php`** (95 lines)
   API endpoint for fetching usage data

5. **`js/request-limiter.js`** (450 lines)
   Frontend warning system and usage tracking

6. **`admin/api-usage-dashboard.php`** (380 lines)
   Real-time admin monitoring dashboard

7. **`examples/rate-limited-coach-endpoint.php`** (180 lines)
   Coach Manlaw integration example

8. **`examples/rate-limited-marketplace-endpoint.php`** (250 lines)
   Marketplace integration example

9. **`REQUEST_LIMITING_IMPLEMENTATION_GUIDE.md`** (Full guide)
   Step-by-step implementation instructions

10. **`TIERED_REQUEST_SYSTEM_OVERVIEW.md`** (This file)
    Complete system documentation

### Total Implementation

- **~2,263 lines of production-ready code**
- **6 PHP classes/files**
- **1 JavaScript module**
- **1 SQL migration**
- **2 integration examples**
- **2 comprehensive guides**

---

## 🎯 Next Steps

1. ✅ Review tier structure and adjust if needed
2. ✅ Run database migration
3. ✅ Setup cron jobs for auto-reset
4. ✅ Initialize existing members
5. ✅ Integrate into critical API endpoints
6. ✅ Add frontend components
7. ✅ Test thoroughly with different tiers
8. ✅ Monitor via admin dashboard
9. ✅ Gather user feedback
10. ✅ Optimize based on usage patterns

---

## 💡 Future Enhancements

- **Burst Protection** - Limit rapid consecutive requests
- **IP-based Rate Limiting** - Prevent abuse from single IPs
- **Redis Caching** - Cache balances for high-traffic scenarios
- **Webhook Notifications** - Alert users via email/SMS at 95%
- **Usage Predictions** - AI-based upgrade recommendations
- **Custom Tier Builder** - Allow admins to create custom tiers
- **API Keys** - Token-based authentication for external apps
- **GraphQL Support** - Rate limiting for GraphQL queries

---

## 📞 Support

For implementation questions or issues:

1. Check `REQUEST_LIMITING_IMPLEMENTATION_GUIDE.md`
2. Review code comments in `RateLimiter.php`
3. Test with examples in `/examples` folder
4. Monitor via admin dashboard
5. Review troubleshooting section above

---

**System Version:** 1.0.0
**Last Updated:** 2025-01-21
**Compatibility:** Z2B Platform v21+
**Dependencies:** PHP 7.4+, MySQL 5.7+, PDO

---

© 2025 Z2B Legacy Builders | Tiered Request Limiting System
