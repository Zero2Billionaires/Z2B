<?php
/**
 * Submit Manual Payment Proof API
 * Submits proof of payment to manual payment queue for admin verification
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
$tierUpgradeId = isset($data['tier_upgrade_id']) ? intval($data['tier_upgrade_id']) : null;
$memberId = isset($data['member_id']) ? intval($data['member_id']) : null;
$paymentMethod = isset($data['payment_method']) ? $data['payment_method'] : null;
$submittedReference = isset($data['submitted_reference']) ? $data['submitted_reference'] : null;
$submittedAmount = isset($data['submitted_amount']) ? floatval($data['submitted_amount']) : null;
$proofUrl = isset($data['proof_of_payment_url']) ? $data['proof_of_payment_url'] : null;
$userNotes = isset($data['user_notes']) ? $data['user_notes'] : null;

if (!$tierUpgradeId || !$memberId || !$paymentMethod || !$submittedAmount || !$proofUrl) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Validate payment method
if (!in_array($paymentMethod, ['eft', 'cash'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid payment method']);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Verify tier upgrade exists
    $stmt = $pdo->prepare("SELECT id FROM tier_upgrades WHERE id = ? AND member_id = ?");
    $stmt->execute([$tierUpgradeId, $memberId]);
    if (!$stmt->fetch()) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Tier upgrade not found']);
        exit;
    }

    // Check if proof already submitted for this upgrade
    $stmt = $pdo->prepare("SELECT id FROM manual_payment_queue WHERE tier_upgrade_id = ?");
    $stmt->execute([$tierUpgradeId]);
    if ($stmt->fetch()) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Proof already submitted for this upgrade']);
        exit;
    }

    // Update tier upgrade with proof URL
    $stmt = $pdo->prepare("
        UPDATE tier_upgrades
        SET proof_of_payment_url = ?
        WHERE id = ?
    ");
    $stmt->execute([$proofUrl, $tierUpgradeId]);

    // Insert into manual payment queue
    $stmt = $pdo->prepare("
        INSERT INTO manual_payment_queue (
            tier_upgrade_id,
            member_id,
            payment_method,
            submitted_reference,
            submitted_amount,
            proof_of_payment_url,
            user_notes,
            status,
            submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    ");

    $stmt->execute([
        $tierUpgradeId,
        $memberId,
        $paymentMethod,
        $submittedReference,
        $submittedAmount,
        $proofUrl,
        $userNotes
    ]);

    $queueId = $pdo->lastInsertId();

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'queue_id' => $queueId,
        'status' => 'pending',
        'estimated_verification' => '1-24 hours',
        'admin_whatsapp' => '077 490 1639',
        'message' => 'Tier upgraded! Your proof has been submitted for admin verification. You will be notified within 1-24 hours.'
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
