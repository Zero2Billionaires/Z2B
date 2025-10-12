<?php
/**
 * Z2B Legacy Builders - MLM Commission Calculator
 * Handles all 6 income streams and commission calculations
 */

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/Database.php';

class MLMCalculator {
    private $db;
    private $tierConfig;

    public function __construct() {
        $this->db = Database::getInstance();
        global $TIER_CONFIG;
        $this->tierConfig = $TIER_CONFIG;
    }

    /**
     * Calculate ISP (Individual Sales Profit)
     * Direct commission from personal sales based on tier
     */
    public function calculateISP($sponsorId, $newMemberId, $tierCode) {
        // Get sponsor's tier for ISP percentage
        $sponsor = $this->getMemberDetails($sponsorId);
        if (!$sponsor) return 0;

        $tierData = $this->tierConfig[$tierCode] ?? null;
        if (!$tierData) return 0;

        // Calculate ISP commission
        $saleAmount = $tierData['price'];
        $ispPercentage = $this->tierConfig[$sponsor['tier_code']]['isp'] ?? 25;
        $commission = ($saleAmount * $ispPercentage) / 100;

        // Record the commission
        $this->recordCommission($sponsorId, $newMemberId, 'ISP', $commission,
            "ISP commission from {$tierData['name']} sale");

        return $commission;
    }

    /**
     * Calculate QPB (Quick Pathfinder Bonus)
     * Bonus for first 3 recruits (7.5%) then 10% for subsequent sets
     */
    public function calculateQPB($sponsorId, $newMemberId, $tierCode) {
        // Count direct recruits
        $recruitCount = $this->db->count('members', 'sponsor_id = :sponsor_id',
            ['sponsor_id' => $sponsorId]);

        $tierData = $this->tierConfig[$tierCode] ?? null;
        if (!$tierData) return 0;

        $saleAmount = $tierData['price'];

        // First 3 recruits get 7.5%, subsequent get 10%
        if ($recruitCount <= 3) {
            $qpbPercentage = QPB_FIRST_THREE;
            $description = "QPB (First 3) from {$tierData['name']} sale";
        } else {
            $qpbPercentage = QPB_SUBSEQUENT;
            $description = "QPB (Subsequent) from {$tierData['name']} sale";
        }

        $commission = ($saleAmount * $qpbPercentage) / 100;

        // Record the commission
        $this->recordCommission($sponsorId, $newMemberId, 'QPB', $commission, $description);

        return $commission;
    }

    /**
     * Calculate TSC (Team Sales Commission)
     * 10-generation deep commission structure
     */
    public function calculateTSC($newMemberId, $tierCode) {
        $tierData = $this->tierConfig[$tierCode] ?? null;
        if (!$tierData) return [];

        $saleAmount = $tierData['pv']; // Use PV for team commissions
        $commissions = [];
        $currentMemberId = $newMemberId;
        $generation = 0;

        // Traverse up to 10 generations
        while ($generation < 10 && $currentMemberId) {
            // Get sponsor of current member
            $member = $this->getMemberDetails($currentMemberId);
            if (!$member || !$member['sponsor_id']) break;

            $sponsorId = $member['sponsor_id'];
            $sponsor = $this->getMemberDetails($sponsorId);

            if (!$sponsor || !$this->isMemberActive($sponsorId)) {
                $currentMemberId = $sponsorId;
                continue; // Skip inactive sponsors
            }

            // Check if sponsor's tier qualifies for this generation
            $sponsorTier = $this->tierConfig[$sponsor['tier_code']] ?? null;
            if (!$sponsorTier || $sponsorTier['tsc'] <= $generation) {
                $currentMemberId = $sponsorId;
                continue; // Sponsor's tier doesn't qualify for this generation
            }

            // Calculate commission for this generation
            $percentage = TSC_GENERATIONS[$generation];
            $commission = ($saleAmount * $percentage) / 100;

            // Record the commission
            $this->recordCommission($sponsorId, $newMemberId, 'TSC', $commission,
                "TSC Generation " . ($generation + 1) . " from {$tierData['name']} sale");

            $commissions[] = [
                'member_id' => $sponsorId,
                'generation' => $generation + 1,
                'commission' => $commission
            ];

            $currentMemberId = $sponsorId;
            $generation++;
        }

        return $commissions;
    }

    /**
     * Calculate TPB (Team Performance Bonus)
     * Requires 2+ active builders monthly
     */
    public function calculateTPB($memberId) {
        // Get member details
        $member = $this->getMemberDetails($memberId);
        if (!$member) return 0;

        $tierData = $this->tierConfig[$member['tier_code']] ?? null;
        if (!$tierData) return 0;

        // Count active builders in team (direct recruits who are active)
        $sql = "SELECT COUNT(*) as active_builders
                FROM members m
                INNER JOIN ai_credits_balance acb ON m.id = acb.member_id
                WHERE m.sponsor_id = :member_id
                AND m.is_active = 1
                AND acb.last_refuel >= DATE_SUB(NOW(), INTERVAL 30 DAY)";

        $result = $this->db->fetchOne($sql, ['member_id' => $memberId]);
        $activeBuilders = $result['active_builders'] ?? 0;

        // Check if member qualifies for TPB
        $requiredBuilders = $tierData['tpb'];
        if ($activeBuilders < $requiredBuilders) {
            return 0;
        }

        // Calculate TPB bonus based on team volume
        $teamVolume = $this->calculateTeamVolume($memberId);
        $tpbBonus = $teamVolume * 0.05; // 5% of team volume

        // Record TPB qualification
        $this->db->insert('member_qualifications', [
            'member_id' => $memberId,
            'qualification_type' => 'TPB',
            'qualified' => 1,
            'qualification_period' => date('Y-m'),
            'active_builders' => $activeBuilders,
            'team_volume' => $teamVolume
        ]);

        // Record the commission
        $this->recordCommission($memberId, null, 'TPB', $tpbBonus,
            "TPB qualification with {$activeBuilders} active builders");

        return $tpbBonus;
    }

    /**
     * Calculate TLI (Team Leadership Incentive)
     * Updated: January 2026 - New qualification requirements
     * Quarterly pool distribution based on team performance, leadership, and tier eligibility
     * Pool Source: 10% of Total Member TeamPV for the quarter
     */
    public function calculateTLI() {
        global $TLI_LEVELS;

        // Calculate total pool for the quarter - 10% of all members' TeamPV
        // Sum all team transactions (ISP, TSC, QPB) from all members for the quarter
        $sql = "SELECT SUM(amount) as total_team_pv
                FROM transactions
                WHERE transaction_type IN ('ISP', 'TSC', 'QPB')
                AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";

        $result = $this->db->fetchOne($sql);
        $totalTeamPV = $result['total_team_pv'] ?? 0;
        $tliPool = ($totalTeamPV * TLI_POOL_PERCENTAGE) / 100;

        // Get all eligible members (Silver-tier and above)
        $sql = "SELECT m.id, m.first_name, m.last_name, m.tier_id,
                       CASE
                           WHEN m.tier_id = 1 THEN 'BLB'
                           WHEN m.tier_id = 2 THEN 'CLB'
                           WHEN m.tier_id = 3 THEN 'SLB'
                           WHEN m.tier_id = 4 THEN 'GLB'
                           WHEN m.tier_id = 5 THEN 'PLB'
                           WHEN m.tier_id = 6 THEN 'DLB'
                       END as tier_code
                FROM members m
                WHERE m.tier_id >= 3
                AND m.is_active = 1";

        $eligibleMembers = $this->db->fetchAll($sql);
        $distributions = [];
        $maxLevels = TLI_TIER_MAX_LEVELS;

        foreach ($eligibleMembers as $member) {
            $memberId = $member['id'];
            $tierCode = $member['tier_code'];
            $maxLevel = $maxLevels[$tierCode] ?? 0;

            if ($maxLevel == 0) continue; // Skip if tier not eligible

            // Check 3-month consecutive PV requirement
            if (!$this->checkConsecutiveMonthlyPV($memberId, TLI_MONTHLY_PV_REQUIREMENT, TLI_CONSECUTIVE_MONTHS)) {
                continue;
            }

            // Calculate average monthly TeamPV for the quarter
            $avgMonthlyTeamPV = $this->calculateAverageMonthlyTeamPV($memberId, 3);

            // Check team composition requirement
            if (!$this->checkTeamComposition($memberId, $tierCode)) {
                continue;
            }

            // Find highest qualifying TLI level
            $qualifiedLevel = null;
            foreach (array_reverse($TLI_LEVELS) as $level) {
                // Check if level is within tier's maximum
                if ($level['level'] > $maxLevel) continue;

                // Check if member meets monthly TeamPV requirement
                if ($avgMonthlyTeamPV >= $level['monthly_team_pv']) {
                    // Check leader requirement
                    if ($level['leader_requirement'] > 0) {
                        $qualifiedLeaders = $this->countQualifiedLeaders($memberId, $level['level']);
                        if ($qualifiedLeaders < $level['leader_requirement']) {
                            continue; // Not enough qualified leaders
                        }
                    }

                    // Member qualifies for this level
                    $qualifiedLevel = $level;
                    break;
                }
            }

            // If member qualified for a level, add to distributions
            if ($qualifiedLevel) {
                $reward = min($qualifiedLevel['reward'], $tliPool * 0.1); // Cap at 10% of pool

                $distributions[] = [
                    'member_id' => $memberId,
                    'member_name' => $member['first_name'] . ' ' . $member['last_name'],
                    'tier_code' => $tierCode,
                    'level' => $qualifiedLevel['level'],
                    'level_name' => $qualifiedLevel['name'],
                    'monthly_team_pv' => round($avgMonthlyTeamPV, 2),
                    'reward' => $reward
                ];

                // Record TLI payment
                $this->recordCommission($memberId, null, 'TLI', $reward,
                    "TLI {$qualifiedLevel['name']} (Level {$qualifiedLevel['level']}) quarterly reward");
            }
        }

        return $distributions;
    }

    /**
     * Check if member maintained required personal PV for consecutive months
     */
    private function checkConsecutiveMonthlyPV($memberId, $requiredPV, $months) {
        for ($i = 0; $i < $months; $i++) {
            $startDate = date('Y-m-d', strtotime("-" . ($i + 1) . " month"));
            $endDate = date('Y-m-d', strtotime("-" . $i . " month"));

            $sql = "SELECT SUM(t.amount) as monthly_pv
                    FROM transactions t
                    WHERE t.member_id = :member_id
                    AND t.transaction_type IN ('ISP', 'TSC')
                    AND DATE(t.created_at) >= :start_date
                    AND DATE(t.created_at) < :end_date";

            $result = $this->db->fetchOne($sql, [
                'member_id' => $memberId,
                'start_date' => $startDate,
                'end_date' => $endDate
            ]);

            $monthlyPV = $result['monthly_pv'] ?? 0;
            if ($monthlyPV < $requiredPV) {
                return false; // Failed to meet requirement for this month
            }
        }

        return true; // Met requirement for all consecutive months
    }

    /**
     * Calculate average monthly Team PV over specified months
     */
    private function calculateAverageMonthlyTeamPV($memberId, $months) {
        $totalTeamPV = 0;

        for ($i = 0; $i < $months; $i++) {
            $startDate = date('Y-m-d', strtotime("-" . ($i + 1) . " month"));
            $endDate = date('Y-m-d', strtotime("-" . $i . " month"));

            // Get team PV for this month (all team members' PV)
            $sql = "SELECT SUM(t.amount) as team_pv
                    FROM transactions t
                    INNER JOIN members m ON t.member_id = m.id
                    WHERE m.sponsor_id = :member_id
                    AND t.transaction_type IN ('ISP', 'TSC', 'QPB')
                    AND DATE(t.created_at) >= :start_date
                    AND DATE(t.created_at) < :end_date";

            $result = $this->db->fetchOne($sql, [
                'member_id' => $memberId,
                'start_date' => $startDate,
                'end_date' => $endDate
            ]);

            $totalTeamPV += $result['team_pv'] ?? 0;
        }

        return $totalTeamPV / $months; // Return average
    }

    /**
     * Check if team composition meets tier requirements
     */
    private function checkTeamComposition($memberId, $tierCode) {
        $requiredPercentages = TLI_SILVER_TEAM_PERCENTAGE;
        $requiredPercentage = $requiredPercentages[$tierCode] ?? 0;

        if ($requiredPercentage == 0) return true; // No requirement

        // Count total team members
        $sql = "SELECT COUNT(*) as total_team
                FROM members
                WHERE sponsor_id = :member_id";
        $result = $this->db->fetchOne($sql, ['member_id' => $memberId]);
        $totalTeam = $result['total_team'] ?? 0;

        if ($totalTeam == 0) return false;

        // Count Silver-tier and above members
        $sql = "SELECT COUNT(*) as silver_plus
                FROM members
                WHERE sponsor_id = :member_id
                AND tier_id >= 3";
        $result = $this->db->fetchOne($sql, ['member_id' => $memberId]);
        $silverPlus = $result['silver_plus'] ?? 0;

        $actualPercentage = ($silverPlus / $totalTeam) * 100;
        return $actualPercentage >= $requiredPercentage;
    }

    /**
     * Count personally invited leaders who qualified for TLI at one level lower
     */
    private function countQualifiedLeaders($memberId, $targetLevel) {
        global $TLI_LEVELS;

        // Get direct recruits
        $sql = "SELECT id FROM members WHERE sponsor_id = :member_id AND is_active = 1";
        $recruits = $this->db->fetchAll($sql, ['member_id' => $memberId]);

        $qualifiedCount = 0;
        $requiredLevel = $targetLevel - 1; // One level lower

        foreach ($recruits as $recruit) {
            $recruitId = $recruit['id'];

            // Check if this recruit qualified for at least the required level
            $avgMonthlyTeamPV = $this->calculateAverageMonthlyTeamPV($recruitId, 3);

            foreach ($TLI_LEVELS as $level) {
                if ($level['level'] >= $requiredLevel && $avgMonthlyTeamPV >= $level['monthly_team_pv']) {
                    $qualifiedCount++;
                    break;
                }
            }
        }

        return $qualifiedCount;
    }

    /**
     * Process CEO Competition Awards
     */
    public function processCEOAward($competitionId, $winners) {
        $sql = "SELECT * FROM ceo_competitions WHERE id = :id";
        $competition = $this->db->fetchOne($sql, ['id' => $competitionId]);

        if (!$competition) return false;

        foreach ($winners as $position => $winnerId) {
            $prize = $this->calculatePrizeAmount($competition['prize_amount'], $position);

            // Record award
            $this->db->insert('ceo_awards', [
                'competition_id' => $competitionId,
                'member_id' => $winnerId,
                'position' => $position,
                'prize_amount' => $prize,
                'awarded_at' => date('Y-m-d H:i:s')
            ]);

            // Create transaction
            $this->recordCommission($winnerId, null, 'CEO_AWARD', $prize,
                "{$competition['competition_name']} - Position {$position}");
        }

        return true;
    }

    /**
     * Calculate total earnings for a member
     */
    public function getMemberEarnings($memberId, $period = 'all') {
        $whereClause = "member_id = :member_id";
        $params = ['member_id' => $memberId];

        switch ($period) {
            case 'today':
                $whereClause .= " AND DATE(created_at) = CURDATE()";
                break;
            case 'week':
                $whereClause .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                break;
            case 'month':
                $whereClause .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                break;
            case 'year':
                $whereClause .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
                break;
        }

        $sql = "SELECT
                    transaction_type,
                    COUNT(*) as count,
                    SUM(amount) as total
                FROM transactions
                WHERE {$whereClause}
                AND status = 'completed'
                GROUP BY transaction_type";

        $earnings = $this->db->fetchAll($sql, $params);

        $summary = [
            'total' => 0,
            'breakdown' => []
        ];

        foreach ($earnings as $earning) {
            $summary['breakdown'][$earning['transaction_type']] = [
                'count' => $earning['count'],
                'amount' => $earning['total']
            ];
            $summary['total'] += $earning['total'];
        }

        return $summary;
    }

    /**
     * Get member's genealogy tree
     */
    public function getGenealogyTree($memberId, $depth = 3) {
        $tree = [];
        $this->buildTree($memberId, $tree, 0, $depth);
        return $tree;
    }

    /**
     * Build genealogy tree recursively
     */
    private function buildTree($memberId, &$tree, $currentDepth, $maxDepth) {
        if ($currentDepth >= $maxDepth) return;

        $sql = "SELECT m.id, m.username, m.first_name, m.last_name,
                       m.tier_id, m.is_active, t.name as tier_name,
                       t.color_code, acb.credits_balance
                FROM members m
                LEFT JOIN tiers t ON m.tier_id = t.id
                LEFT JOIN ai_credits_balance acb ON m.id = acb.member_id
                WHERE m.sponsor_id = :sponsor_id";

        $children = $this->db->fetchAll($sql, ['sponsor_id' => $memberId]);

        foreach ($children as $child) {
            $childNode = [
                'id' => $child['id'],
                'name' => $child['first_name'] . ' ' . $child['last_name'],
                'username' => $child['username'],
                'tier' => $child['tier_name'],
                'tier_color' => $child['color_code'],
                'active' => $child['is_active'],
                'credits' => $child['credits_balance'],
                'children' => []
            ];

            $this->buildTree($child['id'], $childNode['children'], $currentDepth + 1, $maxDepth);
            $tree[] = $childNode;
        }
    }

    /**
     * Calculate team volume
     */
    private function calculateTeamVolume($memberId) {
        $sql = "SELECT SUM(t.amount) as volume
                FROM transactions t
                INNER JOIN referrals r ON t.member_id = r.member_id
                WHERE r.sponsor_id = :member_id
                AND t.transaction_type IN ('ISP', 'TSC', 'QPB')
                AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";

        $result = $this->db->fetchOne($sql, ['member_id' => $memberId]);
        return $result['volume'] ?? 0;
    }

    /**
     * Get member details with tier info
     */
    private function getMemberDetails($memberId) {
        $sql = "SELECT m.*, t.name as tier_name,
                       CASE
                           WHEN m.tier_id = 1 THEN 'BLB'
                           WHEN m.tier_id = 2 THEN 'CLB'
                           WHEN m.tier_id = 3 THEN 'SLB'
                           WHEN m.tier_id = 4 THEN 'GLB'
                           WHEN m.tier_id = 5 THEN 'PLB'
                           WHEN m.tier_id = 6 THEN 'DLB'
                       END as tier_code
                FROM members m
                LEFT JOIN tiers t ON m.tier_id = t.id
                WHERE m.id = :member_id";

        return $this->db->fetchOne($sql, ['member_id' => $memberId]);
    }

    /**
     * Check if member is active (has refueled in last 30 days)
     */
    private function isMemberActive($memberId) {
        $sql = "SELECT COUNT(*) as is_active
                FROM ai_credits_balance
                WHERE member_id = :member_id
                AND last_refuel >= DATE_SUB(NOW(), INTERVAL 30 DAY)";

        $result = $this->db->fetchOne($sql, ['member_id' => $memberId]);
        return $result['is_active'] > 0;
    }

    /**
     * Record commission transaction
     */
    private function recordCommission($memberId, $referenceId, $type, $amount, $description) {
        return $this->db->insert('transactions', [
            'member_id' => $memberId,
            'transaction_type' => $type,
            'amount' => $amount,
            'description' => $description,
            'reference_id' => $referenceId,
            'status' => 'completed',
            'payment_method' => 'system'
        ]);
    }

    /**
     * Calculate prize amount based on position
     */
    private function calculatePrizeAmount($totalPrize, $position) {
        $distribution = [
            1 => 0.50, // 50% for 1st place
            2 => 0.30, // 30% for 2nd place
            3 => 0.20  // 20% for 3rd place
        ];

        return $totalPrize * ($distribution[$position] ?? 0);
    }

    /**
     * Get member's rank and statistics
     */
    public function getMemberStats($memberId) {
        $stats = [
            'direct_recruits' => 0,
            'team_size' => 0,
            'active_members' => 0,
            'total_volume' => 0,
            'current_rank' => '',
            'next_rank' => '',
            'progress_to_next' => 0
        ];

        // Direct recruits
        $stats['direct_recruits'] = $this->db->count('members',
            'sponsor_id = :member_id', ['member_id' => $memberId]);

        // Team size (all levels)
        $sql = "SELECT COUNT(*) as team_size
                FROM referrals
                WHERE sponsor_id IN (
                    SELECT member_id FROM referrals WHERE sponsor_id = :member_id
                    UNION SELECT :member_id
                )";
        $result = $this->db->fetchOne($sql, ['member_id' => $memberId]);
        $stats['team_size'] = $result['team_size'] ?? 0;

        // Active members in team
        $sql = "SELECT COUNT(DISTINCT m.id) as active_count
                FROM members m
                INNER JOIN ai_credits_balance acb ON m.id = acb.member_id
                INNER JOIN referrals r ON m.id = r.member_id
                WHERE r.sponsor_id = :member_id
                AND acb.last_refuel >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        $result = $this->db->fetchOne($sql, ['member_id' => $memberId]);
        $stats['active_members'] = $result['active_count'] ?? 0;

        // Total volume
        $stats['total_volume'] = $this->calculateTeamVolume($memberId);

        // Current rank based on PV
        global $TLI_LEVELS;
        foreach ($TLI_LEVELS as $index => $level) {
            if ($stats['total_volume'] >= $level['pv']) {
                $stats['current_rank'] = $level['name'];
                if (isset($TLI_LEVELS[$index + 1])) {
                    $stats['next_rank'] = $TLI_LEVELS[$index + 1]['name'];
                    $stats['progress_to_next'] =
                        ($stats['total_volume'] / $TLI_LEVELS[$index + 1]['pv']) * 100;
                }
            }
        }

        return $stats;
    }
}