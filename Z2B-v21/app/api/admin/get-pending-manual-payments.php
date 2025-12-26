<?php
/**
 * Get Pending Manual Payments API (Admin)
 * Returns all manual payments awaiting verification
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// TODO: Add admin authentication check here
// $adminId = verifyAdminAuth();
// if (!$adminId) { return 401; }

// Database connection
require_once __DIR__ . '/../../config/database.php';

// Get status filter (default: pending)
$status = isset($_GET['status']) ? $_GET['status'] : 'pending';

try {
    // Get all manual payments with member details
    $stmt = $pdo->prepare("
        SELECT
            mpq.id as queue_id,
            mpq.tier_upgrade_id,
            mpq.member_id,
            mpq.payment_method,
            mpq.submitted_reference,
            mpq.submitted_amount,
            mpq.proof_of_payment_url,
            mpq.user_notes,
            mpq.status,
            mpq.submitted_at,
            mpq.verified_at,
            mpq.verified_by_admin,
            mpq.rejection_reason,
            m.first_name as member_first_name,
            m.last_name as member_last_name,
            m.email as member_email,
            m.phone as member_phone,
            tu.from_tier,
            tu.to_tier,
            tu.upgrade_cost
        FROM manual_payment_queue mpq
        JOIN members m ON mpq.member_id = m.id
        JOIN tier_upgrades tu ON mpq.tier_upgrade_id = tu.id
        WHERE mpq.status = ?
        ORDER BY mpq.submitted_at ASC
    ");
    $stmt->execute([$status]);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format response
    $formattedPayments = array_map(function($payment) {
        return [
            'queue_id' => intval($payment['queue_id']),
            'tier_upgrade_id' => intval($payment['tier_upgrade_id']),
            'member_id' => intval($payment['member_id']),
            'member_name' => $payment['member_first_name'] . ' ' . $payment['member_last_name'],
            'member_email' => $payment['member_email'],
            'member_phone' => $payment['member_phone'],
            'from_tier' => $payment['from_tier'],
            'to_tier' => $payment['to_tier'],
            'upgrade_cost' => floatval($payment['upgrade_cost']),
            'payment_method' => $payment['payment_method'],
            'submitted_amount' => floatval($payment['submitted_amount']),
            'submitted_reference' => $payment['submitted_reference'],
            'proof_url' => $payment['proof_of_payment_url'],
            'user_notes' => $payment['user_notes'],
            'status' => $payment['status'],
            'submitted_at' => $payment['submitted_at'],
            'verified_at' => $payment['verified_at'],
            'verified_by_admin' => $payment['verified_by_admin'],
            'rejection_reason' => $payment['rejection_reason']
        ];
    }, $payments);

    // Get counts by status
    $stmt = $pdo->query("
        SELECT status, COUNT(*) as count
        FROM manual_payment_queue
        GROUP BY status
    ");
    $statusCounts = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    echo json_encode([
        'success' => true,
        'pending_count' => isset($statusCounts['pending']) ? intval($statusCounts['pending']) : 0,
        'verified_count' => isset($statusCounts['verified']) ? intval($statusCounts['verified']) : 0,
        'rejected_count' => isset($statusCounts['rejected']) ? intval($statusCounts['rejected']) : 0,
        'payments' => $formattedPayments
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'details' => $e->getMessage()
    ]);
}
