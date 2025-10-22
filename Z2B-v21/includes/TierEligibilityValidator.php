<?php
/**
 * Z2B Legacy Builders - Tier Eligibility Validator
 *
 * Validates user eligibility for premium tier purchases
 * Specifically handles Diamond tier special requirements
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/app.php';

class TierEligibilityValidator {
    private $db;

    public function __construct($database = null) {
        global $db;
        $this->db = $database ?? $db;
    }

    /**
     * Check if user is eligible to purchase a specific tier
     *
     * @param int $userId User ID (0 for new users/public)
     * @param string $tierCode Tier code (e.g., 'DLB', 'PLB')
     * @return array ['eligible' => bool, 'reason' => string, 'details' => array]
     */
    public function checkEligibility($userId, $tierCode) {
        global $TIER_CONFIG;

        // Validate tier exists
        if (!isset($TIER_CONFIG[$tierCode])) {
            return [
                'eligible' => false,
                'reason' => 'Invalid tier code',
                'details' => []
            ];
        }

        $tier = $TIER_CONFIG[$tierCode];

        // Check if tier has restrictions
        if (!isset($tier['restricted']) || !$tier['restricted']) {
            // No restrictions - anyone can purchase
            return [
                'eligible' => true,
                'reason' => 'No restrictions on this tier',
                'details' => []
            ];
        }

        // New users (not logged in) cannot purchase restricted tiers
        if ($userId === 0 || $userId === null) {
            return [
                'eligible' => false,
                'reason' => 'This is a premium upgrade tier - you must be an existing member to purchase',
                'details' => [
                    'action_required' => 'Please log in to your account or start with a lower tier',
                    'min_tier' => $tier['min_current_tier'] ?? null,
                    'min_tli_level' => $tier['min_tli_level'] ?? null
                ]
            ];
        }

        // Get user details
        $user = $this->getUserDetails($userId);

        if (!$user) {
            return [
                'eligible' => false,
                'reason' => 'User not found',
                'details' => []
            ];
        }

        // Check all restriction criteria
        $checks = [
            'current_tier' => $this->checkCurrentTier($user, $tier),
            'silver_tenure' => $this->checkSilverTenure($user, $tier),
            'tli_level' => $this->checkTLILevel($user, $tier)
        ];

        // Collect all failures
        $failures = array_filter($checks, fn($check) => !$check['passed']);

        if (empty($failures)) {
            return [
                'eligible' => true,
                'reason' => 'All requirements met',
                'details' => $checks
            ];
        }

        // Build detailed failure message
        $reasons = array_map(fn($check) => $check['message'], $failures);

        return [
            'eligible' => false,
            'reason' => 'Requirements not met: ' . implode('; ', $reasons),
            'details' => $checks
        ];
    }

    /**
     * Get user details from database
     */
    private function getUserDetails($userId) {
        $stmt = $this->db->prepare("
            SELECT
                u.*,
                (SELECT MAX(level) FROM user_tli_achievements WHERE user_id = u.id) as max_tli_level,
                (SELECT MIN(created_at) FROM user_tier_history
                 WHERE user_id = u.id AND tier_code IN ('SLB', 'GLB', 'PLB', 'DLB')) as silver_plus_since
            FROM users u
            WHERE u.id = ?
        ");

        $stmt->execute([$userId]);
        return $stmt->fetch();
    }

    /**
     * Check if user's current tier meets minimum requirement
     */
    private function checkCurrentTier($user, $tier) {
        global $TIER_CONFIG;

        if (!isset($tier['min_current_tier'])) {
            return ['passed' => true, 'message' => 'No minimum tier requirement'];
        }

        $minTier = $tier['min_current_tier'];
        $currentTier = $user['tier_code'];

        // Tier hierarchy for comparison
        $tierHierarchy = ['BLB' => 1, 'CLB' => 2, 'SLB' => 3, 'GLB' => 4, 'PLB' => 5, 'DLB' => 6];

        $currentLevel = $tierHierarchy[$currentTier] ?? 0;
        $requiredLevel = $tierHierarchy[$minTier] ?? 0;

        $passed = $currentLevel >= $requiredLevel;

        return [
            'passed' => $passed,
            'message' => $passed
                ? "Current tier ({$TIER_CONFIG[$currentTier]['name']}) meets requirement"
                : "Must be at least {$TIER_CONFIG[$minTier]['name']} (currently {$TIER_CONFIG[$currentTier]['name']})",
            'current_tier' => $currentTier,
            'required_tier' => $minTier
        ];
    }

    /**
     * Check if user has been Silver+ for required months
     */
    private function checkSilverTenure($user, $tier) {
        if (!isset($tier['min_silver_tenure_months'])) {
            return ['passed' => true, 'message' => 'No tenure requirement'];
        }

        $requiredMonths = $tier['min_silver_tenure_months'];

        if (empty($user['silver_plus_since'])) {
            return [
                'passed' => false,
                'message' => "Must have been Silver tier or above for at least {$requiredMonths} months (no Silver+ history found)",
                'months_completed' => 0,
                'months_required' => $requiredMonths
            ];
        }

        $silverSince = new DateTime($user['silver_plus_since']);
        $now = new DateTime();
        $interval = $silverSince->diff($now);

        $monthsCompleted = ($interval->y * 12) + $interval->m;
        $passed = $monthsCompleted >= $requiredMonths;

        return [
            'passed' => $passed,
            'message' => $passed
                ? "Silver+ tenure requirement met ({$monthsCompleted} months)"
                : "Must have been Silver+ for {$requiredMonths} months (currently {$monthsCompleted} months)",
            'months_completed' => $monthsCompleted,
            'months_required' => $requiredMonths,
            'silver_since' => $user['silver_plus_since']
        ];
    }

    /**
     * Check if user has achieved required TLI level
     */
    private function checkTLILevel($user, $tier) {
        global $TLI_LEVELS;

        if (!isset($tier['min_tli_level'])) {
            return ['passed' => true, 'message' => 'No TLI level requirement'];
        }

        $requiredLevel = $tier['min_tli_level'];
        $currentLevel = $user['max_tli_level'] ?? 0;

        $passed = $currentLevel >= $requiredLevel;

        // Get TLI level name
        $requiredLevelName = $TLI_LEVELS[$requiredLevel - 1]['name'] ?? "Level {$requiredLevel}";
        $currentLevelName = $currentLevel > 0
            ? ($TLI_LEVELS[$currentLevel - 1]['name'] ?? "Level {$currentLevel}")
            : "No TLI achievements";

        return [
            'passed' => $passed,
            'message' => $passed
                ? "TLI requirement met ({$currentLevelName})"
                : "Must achieve TLI {$requiredLevelName} (currently: {$currentLevelName})",
            'current_level' => $currentLevel,
            'required_level' => $requiredLevel,
            'current_level_name' => $currentLevelName,
            'required_level_name' => $requiredLevelName
        ];
    }

    /**
     * Get user-friendly eligibility message for display
     */
    public function getEligibilityMessage($userId, $tierCode) {
        $result = $this->checkEligibility($userId, $tierCode);

        if ($result['eligible']) {
            return "✅ You are eligible to purchase this tier!";
        }

        $message = "❌ " . $result['reason'];

        if (!empty($result['details'])) {
            $message .= "\n\nRequirements:";
            foreach ($result['details'] as $check) {
                if (isset($check['message'])) {
                    $icon = $check['passed'] ? '✅' : '❌';
                    $message .= "\n{$icon} {$check['message']}";
                }
            }
        }

        return $message;
    }
}
?>
