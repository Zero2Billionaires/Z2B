<?php
/**
 * Create Manual Tier Upgrade API
 * Creates tier upgrade for EFT/Cash payments and grants INSTANT FREE ACCESS
 * Admin verification happens later
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
$paymentMethod = isset($data['payment_method']) ? $data['payment_method'] : null;
$reference = isset($data['reference']) ? $data['reference'] : null;

if (!$memberId || !$fromTier || !$toTier || !$upgradeCost || !$paymentMethod) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Validate payment method
if (!in_array($paymentMethod, ['eft', 'cash'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid payment method. Must be eft or cash']);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Create tier upgrade record
    $stmt = $pdo->prepare("
        INSERT INTO tier_upgrades (
            member_id,
            from_tier,
            to_tier,
            upgrade_cost,
            payment_method,
            payment_status,
            payment_reference,
            requested_at,
            activated_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW())
    ");

    $stmt->execute([
        $memberId,
        $fromTier,
        $toTier,
        $upgradeCost,
        $paymentMethod,
        $reference
    ]);

    $tierUpgradeId = $pdo->lastInsertId();

    // IMMEDIATELY UPGRADE MEMBER TIER (instant free access)
    $stmt = $pdo->prepare("UPDATE members SET tier = ? WHERE id = ?");
    $stmt->execute([$toTier, $memberId]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'tier_upgrade_id' => $tierUpgradeId,
        'tier_upgraded_to' => $toTier,
        'instant_access' => true,
        'payment_method' => $paymentMethod,
        'next_step' => 'upload_proof',
        'message' => "Tier upgraded to $toTier successfully! You now have instant access. Please upload your proof of payment for admin verification."
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
