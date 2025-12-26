<?php
/**
 * Create Smart Savings Plan API
 * Allows builders to save from commissions for tier upgrades
 * Save first, upgrade when fully paid - NO CREDIT
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed',
        'details' => 'Only POST requests are accepted'
    ]);
    exit;
}

// Include database configuration
require_once __DIR__ . '/../config/database.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['member_id', 'current_tier', 'target_tier', 'deduction_percentage'];
foreach ($requiredFields as $field) {
    if (!isset($input[$field]) || empty($input[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Missing required field',
            'details' => "The field '$field' is required"
        ]);
        exit;
    }
}

$memberId = $input['member_id'];
$currentTier = strtoupper(trim($input['current_tier']));
$targetTier = strtoupper(trim($input['target_tier']));
$deductionPercentage = floatval($input['deduction_percentage']);

// Tier configuration
$TIER_ORDER = ['BRONZE', 'COPPER', 'SILVER', 'GOLD', 'PLATINUM'];
$TIER_COSTS = [
    'BRONZE' => 480,
    'COPPER' => 980,
    'SILVER' => 1480,
    'GOLD' => 2980,
    'PLATINUM' => 4980
];

// Validate tiers exist
if (!in_array($currentTier, $TIER_ORDER)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid current tier',
        'details' => "Current tier must be one of: " . implode(', ', $TIER_ORDER)
    ]);
    exit;
}

if (!in_array($targetTier, $TIER_ORDER)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid target tier',
        'details' => "Target tier must be one of: " . implode(', ', $TIER_ORDER)
    ]);
    exit;
}

// Calculate tier jump
$currentIndex = array_search($currentTier, $TIER_ORDER);
$targetIndex = array_search($targetTier, $TIER_ORDER);
$tierJump = $targetIndex - $currentIndex;

// Validate tier jump (must be 1 or 2 tiers up)
if ($tierJump <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid tier upgrade',
        'details' => "Target tier must be higher than current tier. You are already at {$currentTier}."
    ]);
    exit;
}

if ($tierJump > 2) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Tier jump limit exceeded',
        'details' => "Smart Savings allows maximum 2 tier jump. You are trying to jump {$tierJump} tiers from {$currentTier} to {$targetTier}."
    ]);
    exit;
}

// Validate deduction percentage (30-70%)
if ($deductionPercentage < 30 || $deductionPercentage > 70) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid deduction percentage',
        'details' => 'Deduction percentage must be between 30% and 70%'
    ]);
    exit;
}

// Calculate total cost
$totalCost = $TIER_COSTS[$targetTier];

try {
    // Check for existing active savings plan
    $checkStmt = $pdo->prepare("
        SELECT id, target_tier, amount_saved, total_cost, deduction_percentage
        FROM tier_upgrade_savings
        WHERE member_id = ? AND status = 'active'
        LIMIT 1
    ");
    $checkStmt->execute([$memberId]);
    $existingPlan = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existingPlan) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'error' => 'Active savings plan exists',
            'details' => "You already have an active savings plan for {$existingPlan['target_tier']} tier. Complete or cancel it before starting a new plan.",
            'existing_plan' => [
                'id' => $existingPlan['id'],
                'target_tier' => $existingPlan['target_tier'],
                'total_cost' => floatval($existingPlan['total_cost']),
                'amount_saved' => floatval($existingPlan['amount_saved']),
                'amount_remaining' => floatval($existingPlan['total_cost']) - floatval($existingPlan['amount_saved']),
                'deduction_percentage' => floatval($existingPlan['deduction_percentage']),
                'progress_percentage' => round((floatval($existingPlan['amount_saved']) / floatval($existingPlan['total_cost'])) * 100, 2)
            ]
        ]);
        exit;
    }

    // Create new savings plan
    $insertStmt = $pdo->prepare("
        INSERT INTO tier_upgrade_savings (
            member_id,
            current_tier,
            target_tier,
            total_cost,
            amount_saved,
            deduction_percentage,
            status,
            authorized_by_user,
            authorization_timestamp,
            started_at
        ) VALUES (?, ?, ?, ?, 0.00, ?, 'active', TRUE, NOW(), NOW())
    ");

    $insertStmt->execute([
        $memberId,
        $currentTier,
        $targetTier,
        $totalCost,
        $deductionPercentage
    ]);

    $savingsPlanId = $pdo->lastInsertId();

    // Calculate estimated completion (rough estimate based on average commission)
    // Assuming average commission of R500 per week
    $averageCommissionPerWeek = 500;
    $averageDeductionPerWeek = ($averageCommissionPerWeek * $deductionPercentage) / 100;
    $estimatedWeeks = ceil($totalCost / $averageDeductionPerWeek);
    $estimatedMonths = ceil($estimatedWeeks / 4);

    // Return success response
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Smart Savings plan created successfully!',
        'savings_plan' => [
            'id' => $savingsPlanId,
            'member_id' => $memberId,
            'current_tier' => $currentTier,
            'target_tier' => $targetTier,
            'total_cost' => $totalCost,
            'amount_saved' => 0.00,
            'amount_remaining' => $totalCost,
            'deduction_percentage' => $deductionPercentage,
            'status' => 'active',
            'progress_percentage' => 0,
            'tier_jump' => $tierJump,
            'started_at' => date('Y-m-d H:i:s')
        ],
        'estimates' => [
            'average_commission_assumption' => $averageCommissionPerWeek,
            'average_weekly_deduction' => round($averageDeductionPerWeek, 2),
            'estimated_weeks' => $estimatedWeeks,
            'estimated_months' => $estimatedMonths,
            'note' => 'Estimates based on R500 average weekly commissions. Actual time may vary based on your earnings.'
        ],
        'next_steps' => [
            'You will remain at ' . $currentTier . ' tier until savings goal is reached',
            $deductionPercentage . '% will be deducted from each commission',
            'You will receive ' . (100 - $deductionPercentage) . '% of each commission immediately',
            'Automatic upgrade to ' . $targetTier . ' when R' . $totalCost . ' is saved',
            'Cancel anytime and get full refund of saved amount'
        ]
    ]);

} catch (PDOException $e) {
    error_log("Database error in create-savings-plan.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'details' => 'Failed to create savings plan. Please try again later.'
    ]);
}
?>
