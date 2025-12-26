<?php
/**
 * Get Smart Savings Progress API
 * Retrieves current savings progress for a member
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed',
        'details' => 'Only GET requests are accepted'
    ]);
    exit;
}

// Include database configuration
require_once __DIR__ . '/../config/database.php';

// Get member_id from query parameter
$memberId = isset($_GET['member_id']) ? $_GET['member_id'] : null;

if (!$memberId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing member_id',
        'details' => 'member_id parameter is required'
    ]);
    exit;
}

try {
    // Check if tier_upgrade_savings table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'tier_upgrade_savings'");
    if ($tableCheck->rowCount() == 0) {
        http_response_code(503);
        echo json_encode([
            'success' => false,
            'error' => 'Database not initialized',
            'details' => 'The tier_upgrade_savings table does not exist. Please run the database migration.'
        ]);
        exit;
    }

    // Fetch active savings plan
    $planStmt = $pdo->prepare("
        SELECT
            id,
            member_id,
            current_tier,
            target_tier,
            total_cost,
            amount_saved,
            deduction_percentage,
            status,
            started_at,
            completed_at,
            upgraded_at
        FROM tier_upgrade_savings
        WHERE member_id = ? AND status = 'active'
        LIMIT 1
    ");
    $planStmt->execute([$memberId]);
    $plan = $planStmt->fetch(PDO::FETCH_ASSOC);

    // If no active plan, return empty state
    if (!$plan) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'has_active_plan' => false,
            'message' => 'No active savings plan found'
        ]);
        exit;
    }

    // Calculate progress
    $totalCost = floatval($plan['total_cost']);
    $amountSaved = floatval($plan['amount_saved']);
    $amountRemaining = $totalCost - $amountSaved;
    $progressPercentage = $totalCost > 0 ? round(($amountSaved / $totalCost) * 100, 2) : 0;

    // Fetch deduction history
    $historyStmt = $pdo->prepare("
        SELECT
            id,
            commission_transaction_id,
            commission_type,
            original_commission_amount,
            deduction_percentage,
            deduction_amount,
            amount_paid_to_user,
            deducted_at
        FROM savings_deduction_log
        WHERE savings_plan_id = ?
        ORDER BY deducted_at DESC
        LIMIT 10
    ");
    $historyStmt->execute([$plan['id']]);
    $deductionHistory = $historyStmt->fetchAll(PDO::FETCH_ASSOC);

    // Format deduction history
    $formattedHistory = array_map(function($deduction) {
        return [
            'id' => $deduction['id'],
            'commission_type' => $deduction['commission_type'],
            'original_amount' => floatval($deduction['original_commission_amount']),
            'deduction_percentage' => floatval($deduction['deduction_percentage']),
            'amount_deducted' => floatval($deduction['deduction_amount']),
            'amount_received' => floatval($deduction['amount_paid_to_user']),
            'deducted_at' => $deduction['deducted_at']
        ];
    }, $deductionHistory);

    // Calculate total deductions count
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) as total_deductions, SUM(deduction_amount) as total_deducted
        FROM savings_deduction_log
        WHERE savings_plan_id = ?
    ");
    $countStmt->execute([$plan['id']]);
    $stats = $countStmt->fetch(PDO::FETCH_ASSOC);

    // Calculate estimated completion
    $totalDeductions = intval($stats['total_deductions']);
    $averageDeduction = $totalDeductions > 0 ? $amountSaved / $totalDeductions : 0;

    $estimatedRemainingDeductions = $averageDeduction > 0 ? ceil($amountRemaining / $averageDeduction) : 0;

    // Estimate based on average 1 commission per week
    $estimatedWeeks = $estimatedRemainingDeductions;
    $estimatedMonths = $estimatedWeeks > 0 ? ceil($estimatedWeeks / 4) : 0;

    // Calculate days since start
    $startDate = new DateTime($plan['started_at']);
    $now = new DateTime();
    $daysSinceStart = $startDate->diff($now)->days;

    // Return comprehensive progress data
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'has_active_plan' => true,
        'savings_plan' => [
            'id' => $plan['id'],
            'current_tier' => $plan['current_tier'],
            'target_tier' => $plan['target_tier'],
            'status' => $plan['status'],
            'deduction_percentage' => floatval($plan['deduction_percentage'])
        ],
        'progress' => [
            'total_cost' => $totalCost,
            'amount_saved' => $amountSaved,
            'amount_remaining' => $amountRemaining,
            'progress_percentage' => $progressPercentage,
            'is_completed' => $progressPercentage >= 100
        ],
        'statistics' => [
            'total_deductions' => $totalDeductions,
            'total_amount_deducted' => floatval($stats['total_deducted']),
            'average_deduction_amount' => round($averageDeduction, 2),
            'days_since_start' => $daysSinceStart,
            'started_at' => $plan['started_at']
        ],
        'estimates' => [
            'estimated_remaining_deductions' => $estimatedRemainingDeductions,
            'estimated_weeks' => $estimatedWeeks,
            'estimated_months' => $estimatedMonths,
            'estimated_completion_date' => $estimatedWeeks > 0
                ? date('Y-m-d', strtotime("+{$estimatedWeeks} weeks"))
                : date('Y-m-d'),
            'note' => 'Estimates based on your actual earning history. May vary based on future commissions.'
        ],
        'recent_deductions' => $formattedHistory,
        'messages' => [
            'savings_message' => "You've saved R{$amountSaved} of R{$totalCost} ({$progressPercentage}%)",
            'remaining_message' => "R{$amountRemaining} remaining to unlock {$plan['target_tier']} tier",
            'deduction_message' => "{$plan['deduction_percentage']}% deducted from each commission, you receive " . (100 - floatval($plan['deduction_percentage'])) . "%"
        ]
    ]);

} catch (PDOException $e) {
    error_log("Database error in get-savings-progress.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'details' => 'Failed to retrieve savings progress. Please try again later.'
    ]);
}
?>
