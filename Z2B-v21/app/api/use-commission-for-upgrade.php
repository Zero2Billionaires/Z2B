<?php
/**
 * Use Commission for Upgrade API
 * Allows users to pay for tier upgrades using their commission balance (full or partial)
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
$commissionToUse = isset($data['commission_amount_to_use']) ? floatval($data['commission_amount_to_use']) : null;
$remainingMethod = isset($data['remaining_payment_method']) ? $data['remaining_payment_method'] : null;

if (!$memberId || !$fromTier || !$toTier || !$upgradeCost || !$commissionToUse) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Validate commission amount
if ($commissionToUse <= 0 || $commissionToUse > $upgradeCost) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid commission amount']);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Get current commission balance with row lock
    $stmt = $pdo->prepare("
        SELECT available_balance
        FROM commission_balances
        WHERE member_id = ?
        FOR UPDATE
    ");
    $stmt->execute([$memberId]);
    $balance = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$balance) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Commission balance not found']);
        exit;
    }

    $availableBalance = floatval($balance['available_balance']);

    // Validate sufficient balance
    if ($availableBalance < $commissionToUse) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Insufficient commission balance',
            'available' => $availableBalance,
            'requested' => $commissionToUse
        ]);
        exit;
    }

    // Calculate remaining amount
    $remainingAmount = $upgradeCost - $commissionToUse;
    $paymentMethod = $remainingAmount > 0 ? 'partial_commission' : 'commission_balance';

    // Create tier upgrade record
    $stmt = $pdo->prepare("
        INSERT INTO tier_upgrades (
            member_id,
            from_tier,
            to_tier,
            upgrade_cost,
            payment_method,
            commission_amount_used,
            online_payment_amount,
            payment_status,
            requested_at,
            activated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    ");

    $stmt->execute([
        $memberId,
        $fromTier,
        $toTier,
        $upgradeCost,
        $paymentMethod,
        $commissionToUse,
        $remainingAmount,
        $remainingAmount > 0 ? 'pending' : 'completed',
        $remainingAmount > 0 ? null : date('Y-m-d H:i:s')
    ]);

    $tierUpgradeId = $pdo->lastInsertId();

    // Update commission balance
    $stmt = $pdo->prepare("
        UPDATE commission_balances
        SET total_used_for_upgrades = total_used_for_upgrades + ?
        WHERE member_id = ?
    ");
    $stmt->execute([$commissionToUse, $memberId]);

    // If full payment (no remaining amount), upgrade tier immediately
    if ($remainingAmount == 0) {
        $stmt = $pdo->prepare("UPDATE members SET tier = ? WHERE id = ?");
        $stmt->execute([$toTier, $memberId]);

        $pdo->commit();

        // Get new balance
        $stmt = $pdo->prepare("SELECT available_balance FROM commission_balances WHERE member_id = ?");
        $stmt->execute([$memberId]);
        $newBalance = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'tier_upgraded' => true,
            'commission_deducted' => $commissionToUse,
            'new_balance' => floatval($newBalance['available_balance']),
            'remaining_amount' => 0,
            'tier_upgrade_id' => $tierUpgradeId,
            'message' => "Tier upgraded to $toTier successfully!"
        ]);
        exit;
    }

    // Partial payment - need to handle remaining amount
    if ($remainingMethod === 'online') {
        // Call Yoco API for remaining amount
        $yocoSecretKey = 'sk_test_960bfde0VBrLlpK098e4ffeb53e1';
        $yocoApiUrl = 'https://payments.yoco.com/api/checkouts';

        // Get base URL
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $baseUrl = $protocol . '://' . $host;

        // Generate reference
        $reference = 'TIER-PARTIAL-' . $tierUpgradeId . '-' . time();

        // Prepare Yoco checkout payload
        $yocoPayload = [
            'amount' => intval($remainingAmount * 100), // Convert to cents
            'currency' => 'ZAR',
            'successUrl' => $baseUrl . '/payment-success-register.html?ref=' . $reference . '&tier=' . $toTier . '&upgrade=true&partial=true',
            'cancelUrl' => $baseUrl . '/tiers.html',
            'failureUrl' => $baseUrl . '/payment-failed.html?ref=' . $reference,
            'metadata' => [
                'tier_upgrade_id' => $tierUpgradeId,
                'partial_payment' => 'true',
                'commission_used' => number_format($commissionToUse, 2),
                'remaining_amount' => number_format($remainingAmount, 2),
                'from_tier' => $fromTier,
                'to_tier' => $toTier,
                'reference' => $reference
            ]
        ];

        // Make request to Yoco
        $ch = curl_init($yocoApiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($yocoPayload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $yocoSecretKey,
            'Content-Type: application/json'
        ]);

        $yocoResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 201 && $httpCode !== 200) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create Yoco checkout',
                'details' => json_decode($yocoResponse, true)
            ]);
            exit;
        }

        $yocoData = json_decode($yocoResponse, true);

        if (!isset($yocoData['redirectUrl'])) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'No Yoco redirect URL received']);
            exit;
        }

        // Update tier upgrade with Yoco checkout ID
        $stmt = $pdo->prepare("
            UPDATE tier_upgrades
            SET yoco_checkout_id = ?, payment_reference = ?
            WHERE id = ?
        ");
        $stmt->execute([$yocoData['id'], $reference, $tierUpgradeId]);

        $pdo->commit();

        // Get new balance
        $stmt = $pdo->prepare("SELECT available_balance FROM commission_balances WHERE member_id = ?");
        $stmt->execute([$memberId]);
        $newBalance = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'partial_payment' => true,
            'commission_deducted' => $commissionToUse,
            'new_balance' => floatval($newBalance['available_balance']),
            'remaining_amount' => $remainingAmount,
            'payment_method' => 'online',
            'yoco_redirect_url' => $yocoData['redirectUrl'],
            'yoco_checkout_id' => $yocoData['id'],
            'tier_upgrade_id' => $tierUpgradeId,
            'reference' => $reference
        ]);
    } else {
        // For manual payment methods (EFT/Cash), just return instructions
        $pdo->commit();

        // Get new balance
        $stmt = $pdo->prepare("SELECT available_balance FROM commission_balances WHERE member_id = ?");
        $stmt->execute([$memberId]);
        $newBalance = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'partial_payment' => true,
            'commission_deducted' => $commissionToUse,
            'new_balance' => floatval($newBalance['available_balance']),
            'remaining_amount' => $remainingAmount,
            'payment_method' => $remainingMethod,
            'tier_upgrade_id' => $tierUpgradeId,
            'next_step' => 'manual_payment_proof'
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
