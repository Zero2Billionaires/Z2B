<?php
/**
 * Schedule Commission Payment API
 * Allows users to upgrade tier immediately and pay from future commissions
 * "Buy Now, Pay Later" model with automatic commission deductions
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Database connection
require_once __DIR__ . '/../config/database.php';

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
$memberId = isset($data['member_id']) ? intval($data['member_id']) : null;
$fromTier = isset($data['from_tier']) ? $data['from_tier'] : null;
$toTier = isset($data['to_tier']) ? $data['to_tier'] : null;
$upgradeCost = isset($data['upgrade_cost']) ? floatval($data['upgrade_cost']) : null;
$deductionPercentage = isset($data['deduction_percentage']) ? floatval($data['deduction_percentage']) : null;
$userAuthorized = isset($data['user_authorized']) ? $data['user_authorized'] : false;
$authorizationIp = isset($data['authorization_ip']) ? $data['authorization_ip'] : null;

if (!$memberId || !$fromTier || !$toTier || !$upgradeCost || !$deductionPercentage) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Validate deduction percentage (1-100%)
if ($deductionPercentage < 1 || $deductionPercentage > 100) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Deduction percentage must be between 1% and 100%']);
    exit;
}

// Validate user authorization
if (!$userAuthorized) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'User authorization is required']);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Check if user already has an active scheduled payment
    $stmt = $pdo->prepare("
        SELECT id FROM scheduled_commission_payments
        WHERE member_id = ? AND status = 'active'
    ");
    $stmt->execute([$memberId]);
    $existingSchedule = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingSchedule) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'You already have an active scheduled payment. Complete it before creating a new one.'
        ]);
        exit;
    }

    // Create tier upgrade record
    $stmt = $pdo->prepare("
        INSERT INTO tier_upgrades (
            member_id,
            from_tier,
            to_tier,
            upgrade_cost,
            payment_method,
            payment_status,
            requested_at,
            activated_at
        ) VALUES (?, ?, ?, ?, 'scheduled_commission', 'pending', NOW(), NOW())
    ");

    $stmt->execute([
        $memberId,
        $fromTier,
        $toTier,
        $upgradeCost
    ]);

    $tierUpgradeId = $pdo->lastInsertId();

    // Create scheduled commission payment record
    $stmt = $pdo->prepare("
        INSERT INTO scheduled_commission_payments (
            member_id,
            tier_upgrade_id,
            from_tier,
            to_tier,
            total_amount,
            deduction_percentage,
            amount_paid,
            amount_remaining,
            status,
            authorized_by_user,
            authorization_timestamp,
            authorization_ip,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, 'active', ?, NOW(), ?, NOW())
    ");

    $stmt->execute([
        $memberId,
        $tierUpgradeId,
        $fromTier,
        $toTier,
        $upgradeCost,
        $deductionPercentage,
        $upgradeCost, // amount_remaining initially equals total_amount
        $userAuthorized ? 1 : 0,
        $authorizationIp
    ]);

    $scheduledPaymentId = $pdo->lastInsertId();

    // IMMEDIATELY UPGRADE MEMBER TIER (instant free access)
    $stmt = $pdo->prepare("UPDATE members SET tier = ? WHERE id = ?");
    $stmt->execute([$toTier, $memberId]);

    $pdo->commit();

    // Get estimated number of payments based on user's average commission
    $stmt = $pdo->prepare("
        SELECT AVG(amount) as avg_commission
        FROM transactions
        WHERE member_id = ? AND status = 'completed' AND created_at > DATE_SUB(NOW(), INTERVAL 3 MONTH)
    ");
    $stmt->execute([$memberId]);
    $avgData = $stmt->fetch(PDO::FETCH_ASSOC);

    $estimatedPayments = 'N/A';
    if ($avgData && $avgData['avg_commission'] > 0) {
        $avgCommission = floatval($avgData['avg_commission']);
        $deductionPerCommission = $avgCommission * ($deductionPercentage / 100);
        if ($deductionPerCommission > 0) {
            $estimatedCount = ceil($upgradeCost / $deductionPerCommission);
            $estimatedPayments = "Approx $estimatedCount commissions based on your history";
        }
    }

    echo json_encode([
        'success' => true,
        'tier_upgraded_to' => $toTier,
        'instant_access' => true,
        'deduction_percentage' => $deductionPercentage,
        'total_amount_to_pay' => $upgradeCost,
        'amount_paid' => 0.00,
        'amount_remaining' => $upgradeCost,
        'estimated_payments' => $estimatedPayments,
        'tier_upgrade_id' => $tierUpgradeId,
        'scheduled_payment_id' => $scheduledPaymentId,
        'message' => "Congratulations! You've been upgraded to $toTier tier with instant access. $deductionPercentage% of your future commissions will be automatically deducted until the R" . number_format($upgradeCost, 2) . " is fully paid."
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'details' => $e->getMessage()
    ]);
}
