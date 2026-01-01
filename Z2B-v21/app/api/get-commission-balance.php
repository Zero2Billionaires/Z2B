<?php
/**
 * Get Commission Balance API
 * Returns user's commission balance, active scheduled payments, and recent transactions
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

// Database connection (adjust path as needed)
require_once __DIR__ . '/../config/database.php';

// Get member_id from query parameter (can be MongoDB ObjectId string or integer)
$memberId = isset($_GET['member_id']) ? $_GET['member_id'] : null;

if (!$memberId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'member_id is required']);
    exit;
}

// Handle MongoDB ObjectId (string) or MySQL integer
$memberIdForQuery = $memberId;

try {
    // Check if commission_balances table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'commission_balances'");
    if ($tableCheck->rowCount() == 0) {
        http_response_code(503);
        echo json_encode([
            'success' => false,
            'error' => 'Database not initialized',
            'details' => 'The commission_balances table does not exist. Please run the database migration: database/tier-upgrade-payment-system.sql'
        ]);
        exit;
    }

    // Get commission balance
    $stmt = $pdo->prepare("
        SELECT
            total_earned,
            total_withdrawn,
            total_used_for_upgrades,
            available_balance,
            last_updated
        FROM commission_balances
        WHERE member_id = ?
    ");
    $stmt->execute([$memberIdForQuery]);
    $balance = $stmt->fetch(PDO::FETCH_ASSOC);

    // If no balance record exists, create one
    if (!$balance) {
        $stmt = $pdo->prepare("
            INSERT INTO commission_balances (member_id, total_earned, total_withdrawn, total_used_for_upgrades)
            VALUES (?, 0.00, 0.00, 0.00)
        ");
        $stmt->execute([$memberIdForQuery]);

        $balance = [
            'total_earned' => 0.00,
            'total_withdrawn' => 0.00,
            'total_used_for_upgrades' => 0.00,
            'available_balance' => 0.00,
            'last_updated' => date('Y-m-d H:i:s')
        ];
    }

    // Get active scheduled payment (if any)
    $stmt = $pdo->prepare("
        SELECT
            sp.id,
            sp.to_tier as tier_upgrade_to,
            sp.deduction_percentage,
            sp.amount_paid,
            sp.amount_remaining,
            sp.total_amount,
            sp.created_at,
            sp.status
        FROM scheduled_commission_payments sp
        WHERE sp.member_id = ? AND sp.status = 'active'
        ORDER BY sp.created_at DESC
        LIMIT 1
    ");
    $stmt->execute([$memberIdForQuery]);
    $activeScheduledPayment = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get recent commission transactions (last 10) - if transactions table exists
    $recentTransactions = [];
    try {
        $stmt = $pdo->prepare("
            SELECT
                t.id,
                t.transaction_type,
                t.amount,
                t.description,
                t.status,
                t.created_at,
                CASE
                    WHEN cdl.id IS NOT NULL THEN cdl.deduction_amount
                    ELSE 0.00
                END as deduction_amount,
                CASE
                    WHEN cdl.id IS NOT NULL THEN cdl.amount_paid_to_user
                    ELSE t.amount
                END as net_amount
            FROM transactions t
            LEFT JOIN commission_deduction_log cdl ON t.id = cdl.commission_transaction_id
            WHERE t.member_id = ? AND t.status = 'completed'
            ORDER BY t.created_at DESC
            LIMIT 10
        ");
        $stmt->execute([$memberIdForQuery]);
        $recentTransactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Transactions table might not exist or have different structure
        $recentTransactions = [];
    }

    // Get payout history (last 5) - if payouts table exists
    $recentPayouts = [];
    try {
        $stmt = $pdo->prepare("
            SELECT
                id,
                amount,
                payment_method,
                status,
                requested_at,
                processed_at
            FROM payouts
            WHERE member_id = ?
            ORDER BY requested_at DESC
            LIMIT 5
        ");
        $stmt->execute([$memberIdForQuery]);
        $recentPayouts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Payouts table might not exist or have different structure
        $recentPayouts = [];
    }

    // Prepare response
    $response = [
        'success' => true,
        'balance' => [
            'total_earned' => floatval($balance['total_earned']),
            'total_withdrawn' => floatval($balance['total_withdrawn']),
            'total_used_for_upgrades' => floatval($balance['total_used_for_upgrades']),
            'available_balance' => floatval($balance['available_balance']),
            'last_updated' => $balance['last_updated']
        ],
        'recent_transactions' => $recentTransactions,
        'recent_payouts' => $recentPayouts
    ];

    // Add active scheduled payment if exists
    if ($activeScheduledPayment) {
        $response['active_scheduled_payment'] = [
            'id' => intval($activeScheduledPayment['id']),
            'tier_upgrade_to' => $activeScheduledPayment['tier_upgrade_to'],
            'deduction_percentage' => floatval($activeScheduledPayment['deduction_percentage']),
            'amount_paid' => floatval($activeScheduledPayment['amount_paid']),
            'amount_remaining' => floatval($activeScheduledPayment['amount_remaining']),
            'total_amount' => floatval($activeScheduledPayment['total_amount']),
            'progress_percentage' => floatval($activeScheduledPayment['total_amount']) > 0
                ? round((floatval($activeScheduledPayment['amount_paid']) / floatval($activeScheduledPayment['total_amount'])) * 100, 2)
                : 0,
            'created_at' => $activeScheduledPayment['created_at'],
            'status' => $activeScheduledPayment['status']
        ];
    } else {
        $response['active_scheduled_payment'] = null;
    }

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'details' => $e->getMessage()
    ]);
}
