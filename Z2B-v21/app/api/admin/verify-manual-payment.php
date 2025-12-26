<?php
/**
 * Verify Manual Payment API (Admin)
 * Allows admin to verify or reject manual payment proofs
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

// TODO: Add admin authentication check here
// $authenticatedAdminId = verifyAdminAuth();
// if (!$authenticatedAdminId) { return 401; }

// Database connection
require_once __DIR__ . '/../../config/database.php';

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
$queueId = isset($data['queue_id']) ? intval($data['queue_id']) : null;
$action = isset($data['action']) ? $data['action'] : null;
$adminId = isset($data['admin_id']) ? intval($data['admin_id']) : 1; // TODO: Get from auth
$adminNotes = isset($data['admin_notes']) ? $data['admin_notes'] : null;
$rejectionReason = isset($data['rejection_reason']) ? $data['rejection_reason'] : null;

if (!$queueId || !$action) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Validate action
if (!in_array($action, ['verify', 'reject'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid action. Must be verify or reject']);
    exit;
}

// Reject requires reason
if ($action === 'reject' && !$rejectionReason) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Rejection reason is required']);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Get manual payment details
    $stmt = $pdo->prepare("
        SELECT mpq.*, tu.from_tier, tu.to_tier, tu.member_id
        FROM manual_payment_queue mpq
        JOIN tier_upgrades tu ON mpq.tier_upgrade_id = tu.id
        WHERE mpq.id = ?
    ");
    $stmt->execute([$queueId]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$payment) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Payment not found']);
        exit;
    }

    if ($payment['status'] !== 'pending' && $payment['status'] !== 'under_review') {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Payment already processed']);
        exit;
    }

    if ($action === 'verify') {
        // VERIFY PAYMENT
        // Update manual payment queue
        $stmt = $pdo->prepare("
            UPDATE manual_payment_queue
            SET status = 'verified',
                verified_by_admin = ?,
                verified_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$adminId, $queueId]);

        // Update tier upgrade status
        $stmt = $pdo->prepare("
            UPDATE tier_upgrades
            SET payment_status = 'completed',
                paid_at = NOW(),
                processed_by_admin = ?
            WHERE id = ?
        ");
        $stmt->execute([$adminId, $payment['tier_upgrade_id']]);

        // Member tier is already upgraded (instant free access)
        // No need to upgrade again

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'action' => 'verified',
            'tier_upgrade_status' => 'completed',
            'member_notified' => false, // TODO: Implement notification
            'message' => 'Payment verified successfully. Tier upgrade confirmed.'
        ]);

    } else {
        // REJECT PAYMENT
        // Update manual payment queue
        $stmt = $pdo->prepare("
            UPDATE manual_payment_queue
            SET status = 'rejected',
                verified_by_admin = ?,
                verified_at = NOW(),
                rejection_reason = ?
            WHERE id = ?
        ");
        $stmt->execute([$adminId, $rejectionReason, $queueId]);

        // Update tier upgrade status
        $stmt = $pdo->prepare("
            UPDATE tier_upgrades
            SET payment_status = 'failed',
                processed_by_admin = ?
            WHERE id = ?
        ");
        $stmt->execute([$adminId, $payment['tier_upgrade_id']]);

        // DOWNGRADE MEMBER BACK TO ORIGINAL TIER
        $stmt = $pdo->prepare("
            UPDATE members
            SET tier = ?
            WHERE id = ?
        ");
        $stmt->execute([$payment['from_tier'], $payment['member_id']]);

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'action' => 'rejected',
            'tier_downgraded_to' => $payment['from_tier'],
            'member_notified' => false, // TODO: Implement notification
            'message' => 'Payment rejected. Member downgraded back to ' . $payment['from_tier']
        ]);
    }

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
