<?php
/**
 * ZYRONIQ - MLM Commission Calculator Engine
 * White-Label Network Marketing Intelligence
 *
 * Calculates all 6 income streams:
 * 1. ISP - Individual Sales Profit
 * 2. QPB - Quick Pathfinder Bonus
 * 3. TSC - Team Sales Commission
 * 4. TPB - Team Performance Bonus
 * 5. TLI - Team Leadership Incentive
 * 6. CEO - CEO Awards & Competitions
 */

require_once __DIR__ . '/../config/whitelabel-config.php';

class ZyroniqCalculator {
    private $config;

    public function __construct() {
        global $ZYRONIQ_CONFIG;
        $this->config = $ZYRONIQ_CONFIG;
    }

    // ==================== ISP CALCULATION ====================

    /**
     * Calculate Individual Sales Profit (Direct Commission)
     *
     * @param int $sponsorTierId The tier ID of the sponsor
     * @param float $saleAmount The amount of the sale
     * @return array Commission details
     */
    public function calculateISP($sponsorTierId, $saleAmount) {
        $ispPercentage = $this->config['commissions']['isp']["tier_$sponsorTierId"] ?? 25;
        $commission = ($saleAmount * $ispPercentage) / 100;

        return [
            'amount' => $commission,
            'percentage' => $ispPercentage,
            'sale_amount' => $saleAmount,
            'type' => 'ISP'
        ];
    }

    // ==================== QPB CALCULATION ====================

    /**
     * Calculate Quick Pathfinder Bonus
     *
     * @param int $sponsorId The sponsor's member ID
     * @param int $recruitCount Current recruit count for sponsor
     * @param float $saleAmount The sale amount
     * @return array Commission details
     */
    public function calculateQPB($sponsorId, $recruitCount, $saleAmount) {
        $qpbConfig = $this->config['commissions']['qpb'];

        // First 3 recruits get lower percentage
        if ($recruitCount <= 3) {
            $percentage = $qpbConfig['first_three'];
            $tier = 'First 3';
        } else {
            $percentage = $qpbConfig['subsequent'];
            $tier = 'Subsequent';
        }

        $commission = ($saleAmount * $percentage) / 100;

        return [
            'amount' => $commission,
            'percentage' => $percentage,
            'recruit_number' => $recruitCount,
            'tier' => $tier,
            'sale_amount' => $saleAmount,
            'type' => 'QPB'
        ];
    }

    // ==================== TSC CALCULATION ====================

    /**
     * Calculate Team Sales Commission (Multi-Generation)
     *
     * @param array $uplineChain Array of upline members with tier info
     * @param float $saleAmount The PV value of the sale
     * @return array Array of commissions for each generation
     */
    public function calculateTSC($uplineChain, $saleAmount) {
        $generations = $this->config['commissions']['tsc_generations'];
        $commissions = [];

        foreach ($uplineChain as $index => $member) {
            // Check if we've exceeded generations
            if ($index >= count($generations)) {
                break;
            }

            // Check if member's tier allows this generation
            $tierInfo = $this->getTierById($member['tier_id']);
            if (!$tierInfo || $tierInfo['tsc_generations'] < ($index + 1)) {
                continue; // Skip - tier doesn't qualify for this generation
            }

            // Check if member is active
            if (!$member['is_active']) {
                continue; // Skip inactive members
            }

            $percentage = $generations[$index];
            $commission = ($saleAmount * $percentage) / 100;

            $commissions[] = [
                'member_id' => $member['id'],
                'member_name' => $member['name'],
                'generation' => $index + 1,
                'amount' => $commission,
                'percentage' => $percentage,
                'tier' => $tierInfo['name'],
                'type' => 'TSC'
            ];
        }

        return $commissions;
    }

    // ==================== TPB CALCULATION ====================

    /**
     * Calculate Team Performance Bonus
     *
     * @param int $memberId Member's ID
     * @param int $activeBuilders Number of active builders in team
     * @param float $teamVolume Team's monthly volume
     * @return array Commission details
     */
    public function calculateTPB($memberId, $activeBuilders, $teamVolume) {
        $memberTier = $this->getMemberTier($memberId);
        if (!$memberTier) {
            return ['amount' => 0, 'qualified' => false];
        }

        // Check if member has enough active builders
        $requiredBuilders = $memberTier['tpb_required'];
        if ($activeBuilders < $requiredBuilders) {
            return [
                'amount' => 0,
                'qualified' => false,
                'reason' => "Need $requiredBuilders active builders (have $activeBuilders)",
                'required' => $requiredBuilders,
                'current' => $activeBuilders
            ];
        }

        // Calculate TPB
        $percentage = $this->config['commissions']['tpb_percentage'];
        $bonus = ($teamVolume * $percentage) / 100;

        return [
            'amount' => $bonus,
            'qualified' => true,
            'percentage' => $percentage,
            'team_volume' => $teamVolume,
            'active_builders' => $activeBuilders,
            'type' => 'TPB'
        ];
    }

    // ==================== TLI CALCULATION ====================

    /**
     * Calculate Team Leadership Incentive (Quarterly)
     *
     * @param array $members Array of all qualified members
     * @param float $totalTeamPV Total company TeamPV for quarter
     * @return array Array of TLI distributions
     */
    public function calculateTLI($members, $totalTeamPV) {
        $poolPercentage = $this->config['commissions']['tli_pool_percentage'];
        $tliPool = ($totalTeamPV * $poolPercentage) / 100;
        $tliLevels = $this->config['tli_levels'];
        $distributions = [];

        foreach ($members as $member) {
            // Check tier eligibility
            $tierInfo = $this->getTierById($member['tier_id']);
            if (!$tierInfo || $tierInfo['tli_max_level'] == 0) {
                continue; // Not eligible for TLI
            }

            // Check consecutive monthly PV (600 PV × 3 months)
            if (!$this->checkConsecutiveMonthlyPV($member, 3, 600)) {
                continue;
            }

            // Calculate average monthly TeamPV
            $avgMonthlyTeamPV = $member['avg_monthly_team_pv'];

            // Check team composition
            if (!$this->checkTeamComposition($member)) {
                continue;
            }

            // Find highest qualifying level
            $qualifiedLevel = null;
            foreach (array_reverse($tliLevels) as $level) {
                // Check tier max level
                if ($level['level'] > $tierInfo['tli_max_level']) {
                    continue;
                }

                // Check TeamPV requirement
                if ($avgMonthlyTeamPV >= $level['monthly_team_pv']) {
                    // Check leader requirement
                    if ($level['leader_requirement'] > 0) {
                        if ($member['qualified_leaders'] < $level['leader_requirement']) {
                            continue;
                        }
                    }

                    $qualifiedLevel = $level;
                    break;
                }
            }

            if ($qualifiedLevel) {
                $reward = min($qualifiedLevel['reward'], $tliPool * 0.1); // Cap at 10%

                $distributions[] = [
                    'member_id' => $member['id'],
                    'member_name' => $member['name'],
                    'tier' => $tierInfo['name'],
                    'level' => $qualifiedLevel['level'],
                    'level_name' => $qualifiedLevel['name'],
                    'reward' => $reward,
                    'monthly_team_pv' => $avgMonthlyTeamPV,
                    'qualified_leaders' => $member['qualified_leaders'],
                    'type' => 'TLI'
                ];
            }
        }

        return [
            'pool_total' => $tliPool,
            'pool_percentage' => $poolPercentage,
            'total_team_pv' => $totalTeamPV,
            'distributions' => $distributions,
            'total_distributed' => array_sum(array_column($distributions, 'reward'))
        ];
    }

    // ==================== CEO AWARDS ====================

    /**
     * Calculate CEO Award Distribution
     *
     * @param float $totalPrize Total prize pool
     * @param array $winners Array of winner IDs [1st, 2nd, 3rd]
     * @return array Award distribution
     */
    public function calculateCEOAwards($totalPrize, $winners) {
        $distribution = [
            1 => 0.50, // 50% for 1st
            2 => 0.30, // 30% for 2nd
            3 => 0.20  // 20% for 3rd
        ];

        $awards = [];
        foreach ($winners as $position => $memberId) {
            $amount = $totalPrize * ($distribution[$position] ?? 0);
            $awards[] = [
                'member_id' => $memberId,
                'position' => $position,
                'amount' => $amount,
                'percentage' => ($distribution[$position] ?? 0) * 100,
                'type' => 'CEO_AWARD'
            ];
        }

        return $awards;
    }

    // ==================== EARNINGS CALCULATOR ====================

    /**
     * Calculate total potential earnings for a member
     *
     * @param array $memberData Member information
     * @param array $teamData Team statistics
     * @return array Comprehensive earnings breakdown
     */
    public function calculateTotalEarnings($memberData, $teamData) {
        $earnings = [
            'isp' => 0,
            'qpb' => 0,
            'tsc' => 0,
            'tpb' => 0,
            'tli' => 0,
            'ceo' => 0,
            'total' => 0
        ];

        // ISP - from personal sales
        if (isset($memberData['personal_sales'])) {
            $isp = $this->calculateISP(
                $memberData['tier_id'],
                $memberData['personal_sales']
            );
            $earnings['isp'] = $isp['amount'];
        }

        // QPB - from recruits
        if (isset($memberData['recruit_count']) && isset($memberData['recruit_sales'])) {
            $qpb = $this->calculateQPB(
                $memberData['id'],
                $memberData['recruit_count'],
                $memberData['recruit_sales']
            );
            $earnings['qpb'] = $qpb['amount'];
        }

        // TSC - from team
        if (isset($teamData['upline_chain']) && isset($teamData['team_sales'])) {
            $tscCommissions = $this->calculateTSC(
                $teamData['upline_chain'],
                $teamData['team_sales']
            );
            $earnings['tsc'] = array_sum(array_column($tscCommissions, 'amount'));
        }

        // TPB - team performance
        if (isset($teamData['active_builders']) && isset($teamData['team_volume'])) {
            $tpb = $this->calculateTPB(
                $memberData['id'],
                $teamData['active_builders'],
                $teamData['team_volume']
            );
            $earnings['tpb'] = $tpb['amount'];
        }

        // Calculate total
        $earnings['total'] = array_sum([
            $earnings['isp'],
            $earnings['qpb'],
            $earnings['tsc'],
            $earnings['tpb'],
            $earnings['tli'],
            $earnings['ceo']
        ]);

        return $earnings;
    }

    // ==================== HELPER FUNCTIONS ====================

    /**
     * Get tier information by ID
     */
    private function getTierById($tierId) {
        foreach ($this->config['tiers'] as $tier) {
            if ($tier['id'] == $tierId) {
                return $tier;
            }
        }
        return null;
    }

    /**
     * Get member's tier info
     */
    private function getMemberTier($memberId) {
        // In production, this would query the database
        // For now, return null as placeholder
        return null;
    }

    /**
     * Check consecutive monthly PV requirement
     */
    private function checkConsecutiveMonthlyPV($member, $months, $requiredPV) {
        // In production, this would query transaction history
        // For white-label demo, we'll use member data if available
        return isset($member['meets_pv_requirement']) ? $member['meets_pv_requirement'] : false;
    }

    /**
     * Check team composition requirements
     */
    private function checkTeamComposition($member) {
        $tierInfo = $this->getTierById($member['tier_id']);
        if (!$tierInfo) return false;

        $requiredPercentage = $this->config['tli_requirements']['tier_team_composition'][$tierInfo['code']] ?? 0;

        if ($requiredPercentage == 0) return true;

        $actualPercentage = isset($member['silver_plus_percentage']) ? $member['silver_plus_percentage'] : 0;

        return $actualPercentage >= $requiredPercentage;
    }

    /**
     * Format currency
     */
    public function formatCurrency($amount) {
        $symbol = $this->config['payments']['currency_symbol'];
        return $symbol . number_format($amount, 2);
    }

    /**
     * Get all commission structure info
     */
    public function getCommissionStructure() {
        return [
            'isp' => $this->config['commissions']['isp'],
            'qpb' => $this->config['commissions']['qpb'],
            'tsc_generations' => $this->config['commissions']['tsc_generations'],
            'tpb_percentage' => $this->config['commissions']['tpb_percentage'],
            'tli_pool_percentage' => $this->config['commissions']['tli_pool_percentage'],
            'tiers' => $this->config['tiers'],
            'tli_levels' => $this->config['tli_levels']
        ];
    }

    /**
     * Simulate earnings for demo/preview
     */
    public function simulateEarnings($tierId, $personalSales, $teamSize, $teamSales) {
        $tierInfo = $this->getTierById($tierId);
        if (!$tierInfo) return null;

        // Simulate ISP
        $isp = ($personalSales * $tierInfo['isp']) / 100;

        // Simulate QPB (assume 5 recruits)
        $qpb = ($personalSales * 0.5 * 10) / 100; // Rough estimate

        // Simulate TSC (based on team sales and generations)
        $tscPercentage = array_sum(array_slice($this->config['commissions']['tsc_generations'], 0, $tierInfo['tsc_generations']));
        $tsc = ($teamSales * $tscPercentage) / 100;

        // Simulate TPB (5% of team volume)
        $tpb = ($teamSales * 5) / 100;

        // Simulate TLI (if eligible)
        $tli = 0;
        if ($tierInfo['tli_max_level'] > 0 && $teamSales >= 10000) {
            $tli = 5000; // Rough estimate
        }

        return [
            'isp' => $isp,
            'qpb' => $qpb,
            'tsc' => $tsc,
            'tpb' => $tpb,
            'tli' => $tli,
            'total' => $isp + $qpb + $tsc + $tpb + $tli,
            'tier' => $tierInfo['name'],
            'currency' => $this->config['payments']['currency_symbol']
        ];
    }
}
