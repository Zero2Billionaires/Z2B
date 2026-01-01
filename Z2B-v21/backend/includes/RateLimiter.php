<?php
/**
 * Z2B Request Rate Limiter
 *
 * Implements tiered request limiting with:
 * - Daily request limits per tier
 * - Rollover accumulation (max 3x monthly limit)
 * - 95% warning threshold
 * - Detailed usage tracking
 *
 * @package Z2B
 * @version 1.0.0
 */

class RateLimiter {

    private $db;
    private $member_id;
    private $tier_code;
    private $balance_data;
    private $tier_limits;

    // Warning thresholds
    const WARNING_THRESHOLD_95 = 0.95;
    const WARNING_THRESHOLD_80 = 0.80;
    const WARNING_THRESHOLD_50 = 0.50;

    /**
     * Constructor
     *
     * @param PDO $db Database connection
     * @param int $member_id Member ID
     */
    public function __construct($db, $member_id) {
        $this->db = $db;
        $this->member_id = $member_id;

        // Initialize member data
        $this->loadMemberBalance();
        $this->loadTierLimits();

        // Check if daily reset is needed
        $this->checkAndResetDaily();
    }

    /**
     * Load member's current request balance
     */
    private function loadMemberBalance() {
        $stmt = $this->db->prepare("
            SELECT * FROM member_request_balance
            WHERE member_id = ?
        ");
        $stmt->execute([$this->member_id]);
        $this->balance_data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($this->balance_data) {
            $this->tier_code = $this->balance_data['tier_code'];
        } else {
            // Initialize balance if not exists
            $this->initializeBalance();
        }
    }

    /**
     * Load tier limits and features
     */
    private function loadTierLimits() {
        $stmt = $this->db->prepare("
            SELECT * FROM tier_request_limits
            WHERE tier_code = ?
        ");
        $stmt->execute([$this->tier_code]);
        $this->tier_limits = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Initialize member balance from member's tier
     */
    private function initializeBalance() {
        // Get member's tier from members table
        $stmt = $this->db->prepare("
            SELECT t.tier_code
            FROM members m
            LEFT JOIN tiers t ON m.tier_id = t.id
            WHERE m.id = ?
        ");
        $stmt->execute([$this->member_id]);
        $member = $stmt->fetch(PDO::FETCH_ASSOC);

        $tier_code = $member['tier_code'] ?? 'FAM'; // Default to FAM tier

        // Call stored procedure to initialize
        $this->db->query("CALL initialize_member_balance({$this->member_id}, '{$tier_code}')");

        // Reload balance data
        $this->loadMemberBalance();
    }

    /**
     * Check if daily reset is needed and perform it
     */
    private function checkAndResetDaily() {
        if (!$this->balance_data) return;

        $last_reset = $this->balance_data['last_daily_reset'];
        $today = date('Y-m-d');

        if ($last_reset < $today) {
            $this->performDailyReset();
        }
    }

    /**
     * Perform daily reset with rollover calculation
     */
    private function performDailyReset() {
        $daily_limit = $this->tier_limits['daily_limit'];
        $max_rollover = $this->tier_limits['max_rollover'];
        $current_available = $this->balance_data['requests_available'];
        $current_rollover = $this->balance_data['rollover_balance'];

        // Calculate unused requests (only positive values roll over)
        $unused_requests = max(0, $current_available);

        // Add to rollover, capped at 3x monthly limit
        $new_rollover = min($current_rollover + $unused_requests, $max_rollover);

        // Reset with new daily allowance plus rollover
        $stmt = $this->db->prepare("
            UPDATE member_request_balance SET
                requests_available = ?,
                requests_used_today = 0,
                rollover_balance = ?,
                last_daily_reset = CURDATE(),
                warning_95_shown = FALSE,
                warning_95_timestamp = NULL
            WHERE member_id = ?
        ");
        $stmt->execute([
            $daily_limit + $new_rollover,
            $new_rollover,
            $this->member_id
        ]);

        // Reload balance data
        $this->loadMemberBalance();
    }

    /**
     * Check if request is allowed
     *
     * @param string $endpoint Endpoint being accessed
     * @param string $request_type Type of request (ai_coach, marketplace, etc)
     * @return array ['allowed' => bool, 'message' => string, 'data' => array]
     */
    public function checkLimit($endpoint = 'general', $request_type = 'api') {
        $available = $this->balance_data['requests_available'];
        $used_today = $this->balance_data['requests_used_today'];
        $daily_limit = $this->tier_limits['daily_limit'];

        // Check if requests available
        if ($available <= 0) {
            return [
                'allowed' => false,
                'message' => 'Daily request limit reached. Limit resets at midnight or upgrade your tier.',
                'data' => $this->getUsageData(),
                'upgrade_recommended' => $this->getUpgradeRecommendation()
            ];
        }

        // Check for warning thresholds
        $usage_percent = $used_today / $daily_limit;
        $warning = $this->checkWarningThreshold($usage_percent);

        return [
            'allowed' => true,
            'message' => 'Request allowed',
            'warning' => $warning,
            'data' => $this->getUsageData()
        ];
    }

    /**
     * Record a request usage
     *
     * @param string $endpoint Endpoint accessed
     * @param string $request_type Type of request
     * @param string $http_method HTTP method
     * @param string $status Status (success, rate_limited, error)
     * @param int $response_code HTTP response code
     * @param int $response_time Response time in milliseconds
     * @return bool Success
     */
    public function recordRequest($endpoint, $request_type, $http_method = 'POST',
                                   $status = 'success', $response_code = 200,
                                   $response_time = 0) {

        $requests_before = $this->balance_data['requests_available'];

        // Deduct one request
        $requests_after = $requests_before - 1;
        $rollover_used = $requests_after < $this->tier_limits['daily_limit'];

        // Update balance
        $stmt = $this->db->prepare("
            UPDATE member_request_balance SET
                requests_available = ?,
                requests_used_today = requests_used_today + 1,
                requests_used_month = requests_used_month + 1,
                total_lifetime_requests = total_lifetime_requests + 1,
                peak_usage_day = GREATEST(peak_usage_day, requests_used_today + 1)
            WHERE member_id = ?
        ");
        $stmt->execute([$requests_after, $this->member_id]);

        // Log the request
        $stmt = $this->db->prepare("
            INSERT INTO request_usage_logs
            (member_id, tier_code, endpoint, request_type, http_method,
             requests_before, requests_after, rollover_used, status,
             response_code, response_time_ms, ip_address, user_agent, session_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $this->member_id,
            $this->tier_code,
            $endpoint,
            $request_type,
            $http_method,
            $requests_before,
            $requests_after,
            $rollover_used ? 1 : 0,
            $status,
            $response_code,
            $response_time,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null,
            session_id()
        ]);

        // Reload balance
        $this->loadMemberBalance();

        return true;
    }

    /**
     * Check warning threshold and return warning message
     *
     * @param float $usage_percent Usage percentage (0-1)
     * @return array|null Warning data or null
     */
    private function checkWarningThreshold($usage_percent) {
        $daily_limit = $this->tier_limits['daily_limit'];
        $used = $this->balance_data['requests_used_today'];
        $available = $this->balance_data['requests_available'];

        // 95% threshold - Critical warning
        if ($usage_percent >= self::WARNING_THRESHOLD_95) {
            // Mark warning as shown if not already
            if (!$this->balance_data['warning_95_shown']) {
                $stmt = $this->db->prepare("
                    UPDATE member_request_balance SET
                        warning_95_shown = TRUE,
                        warning_95_timestamp = NOW()
                    WHERE member_id = ?
                ");
                $stmt->execute([$this->member_id]);
            }

            return [
                'level' => 'critical',
                'threshold' => 95,
                'message' => "You're at 95% of your daily limit! Only {$available} requests remaining.",
                'recommendation' => 'Consider upgrading to ' . $this->getNextTier() . ' for higher limits.',
                'color' => '#DC2626',
                'show_upgrade_button' => true
            ];
        }

        // 80% threshold - Warning
        if ($usage_percent >= self::WARNING_THRESHOLD_80) {
            return [
                'level' => 'warning',
                'threshold' => 80,
                'message' => "You've used 80% of your daily requests. {$available} remaining.",
                'recommendation' => 'Pace your usage or upgrade for more requests.',
                'color' => '#F59E0B',
                'show_upgrade_button' => false
            ];
        }

        // 50% threshold - Info
        if ($usage_percent >= self::WARNING_THRESHOLD_50) {
            return [
                'level' => 'info',
                'threshold' => 50,
                'message' => "You've used half of your daily requests. {$available} remaining.",
                'recommendation' => null,
                'color' => '#3B82F6',
                'show_upgrade_button' => false
            ];
        }

        return null;
    }

    /**
     * Get current usage data
     *
     * @return array Usage statistics
     */
    public function getUsageData() {
        $daily_limit = $this->tier_limits['daily_limit'];
        $monthly_limit = $this->tier_limits['monthly_limit'];
        $used_today = $this->balance_data['requests_used_today'];
        $used_month = $this->balance_data['requests_used_month'];
        $available = $this->balance_data['requests_available'];
        $rollover = $this->balance_data['rollover_balance'];

        return [
            'tier' => [
                'code' => $this->tier_code,
                'name' => $this->tier_limits['tier_name'],
                'daily_limit' => $daily_limit,
                'monthly_limit' => $monthly_limit
            ],
            'today' => [
                'used' => $used_today,
                'available' => $available,
                'limit' => $daily_limit,
                'percentage' => round(($used_today / $daily_limit) * 100, 1),
                'rollover_included' => $rollover > 0
            ],
            'month' => [
                'used' => $used_month,
                'limit' => $monthly_limit,
                'percentage' => round(($used_month / $monthly_limit) * 100, 1)
            ],
            'rollover' => [
                'current' => $rollover,
                'max' => $this->balance_data['max_rollover_limit'],
                'percentage' => round(($rollover / $this->balance_data['max_rollover_limit']) * 100, 1)
            ],
            'analytics' => [
                'average_daily' => round($this->balance_data['average_daily_usage'], 1),
                'peak_day' => $this->balance_data['peak_usage_day'],
                'lifetime_total' => $this->balance_data['total_lifetime_requests']
            ],
            'resets' => [
                'next_daily_reset' => date('Y-m-d 00:00:00', strtotime('tomorrow')),
                'next_monthly_reset' => date('Y-m-01 00:00:00', strtotime('first day of next month'))
            ]
        ];
    }

    /**
     * Get tier features
     *
     * @return array Tier features
     */
    public function getTierFeatures() {
        return [
            'advanced_analytics' => (bool)$this->tier_limits['advanced_analytics'],
            'goal_tracking' => (bool)$this->tier_limits['goal_tracking'],
            'export_features' => (bool)$this->tier_limits['export_features'],
            'extended_memory' => (int)$this->tier_limits['extended_memory'],
            'support_priority' => $this->tier_limits['support_priority'],
            'priority_level' => (int)$this->tier_limits['priority_level']
        ];
    }

    /**
     * Check if feature is available for current tier
     *
     * @param string $feature Feature name
     * @return bool Available
     */
    public function hasFeature($feature) {
        $features = $this->getTierFeatures();
        return $features[$feature] ?? false;
    }

    /**
     * Get upgrade recommendation based on usage
     *
     * @return array|null Upgrade recommendation
     */
    private function getUpgradeRecommendation() {
        $avg_usage = $this->balance_data['average_daily_usage'];
        $daily_limit = $this->tier_limits['daily_limit'];

        // If average usage is near limit, recommend upgrade
        if ($avg_usage >= $daily_limit * 0.80) {
            $next_tier = $this->getNextTier();
            if ($next_tier) {
                return [
                    'recommended' => true,
                    'reason' => 'Your average usage is high for your current tier',
                    'current_tier' => $this->tier_limits['tier_name'],
                    'recommended_tier' => $next_tier['name'],
                    'benefits' => [
                        'Daily limit: ' . $next_tier['daily_limit'] . ' requests',
                        'Monthly limit: ' . $next_tier['monthly_limit'] . ' requests',
                        'Max rollover: ' . $next_tier['max_rollover'] . ' requests'
                    ]
                ];
            }
        }

        return null;
    }

    /**
     * Get next tier information
     *
     * @return array|null Next tier data
     */
    private function getNextTier() {
        $current_priority = $this->tier_limits['priority_level'];

        $stmt = $this->db->prepare("
            SELECT * FROM tier_request_limits
            WHERE priority_level > ?
            ORDER BY priority_level ASC
            LIMIT 1
        ");
        $stmt->execute([$current_priority]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Get all available tiers
     *
     * @return array All tiers
     */
    public static function getAllTiers($db) {
        $stmt = $db->query("
            SELECT * FROM tier_request_limits
            ORDER BY priority_level ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get rate limit headers for HTTP response
     *
     * @return array Headers
     */
    public function getRateLimitHeaders() {
        $daily_limit = $this->tier_limits['daily_limit'];
        $remaining = $this->balance_data['requests_available'];
        $reset_time = strtotime('tomorrow midnight');

        return [
            'X-RateLimit-Limit' => $daily_limit,
            'X-RateLimit-Remaining' => $remaining,
            'X-RateLimit-Reset' => $reset_time,
            'X-RateLimit-Tier' => $this->tier_code,
            'X-RateLimit-Rollover' => $this->balance_data['rollover_balance']
        ];
    }

    /**
     * Send rate limit headers
     */
    public function sendRateLimitHeaders() {
        foreach ($this->getRateLimitHeaders() as $header => $value) {
            header("$header: $value");
        }
    }

    /**
     * Get analytics for admin dashboard
     *
     * @param PDO $db Database connection
     * @param int $days Days to analyze
     * @return array Analytics data
     */
    public static function getAdminAnalytics($db, $days = 30) {
        // Tier usage summary
        $stmt = $db->query("SELECT * FROM tier_usage_analytics");
        $tier_summary = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Recent request logs
        $stmt = $db->prepare("
            SELECT * FROM request_usage_logs
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY created_at DESC
            LIMIT 100
        ");
        $stmt->execute([$days]);
        $recent_requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Members near limit
        $stmt = $db->query("
            SELECT * FROM member_request_status
            WHERE status IN ('WARNING_95', 'LIMIT_REACHED')
            ORDER BY daily_usage_percent DESC
        ");
        $members_at_risk = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'tier_summary' => $tier_summary,
            'recent_requests' => $recent_requests,
            'members_at_risk' => $members_at_risk
        ];
    }
}
