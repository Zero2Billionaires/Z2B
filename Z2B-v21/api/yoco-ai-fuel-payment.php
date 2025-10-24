<?php
/**
 * Yoco Payment Integration for AI Fuel Top-Up
 * Handles Yoco payment processing and webhook callbacks
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Yoco API Configuration
define('YOCO_SECRET_KEY', 'sk_test_960bfde0VBrLlpK098e4ffeb53e1'); // Your test key
define('YOCO_PUBLIC_KEY', 'pk_test_ed3c54a6gOol69qa7f45'); // Your public key
define('YOCO_API_URL', 'https://payments.yoco.com/api/checkouts');

// Database configuration
$db_host = 'localhost';
$db_name = 'z2b_legacy';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed'
    ]);
    exit();
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Get input
$input = json_decode(file_get_contents('php://input'), true);

// Get authorization
$headers = getallheaders();
$authToken = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

// Authenticate user
function authenticateUser($pdo, $token) {
    if (!$token) return null;
    $stmt = $pdo->prepare("SELECT * FROM users WHERE auth_token = ? AND token_expires > NOW()");
    $stmt->execute([$token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Create Yoco checkout
if ($method === 'POST' && strpos($request_uri, '/create-checkout') !== false) {
    $user = authenticateUser($pdo, $authToken);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $fuelAmount = $input['fuelAmount'] ?? 0;
    $price = $input['price'] ?? 0;

    // Validate package
    $validPackages = [
        100 => 125,
        500 => 625,
        1000 => 1250
    ];

    if (!isset($validPackages[$fuelAmount]) || $validPackages[$fuelAmount] != $price) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid package']);
        exit();
    }

    try {
        // Create payment record
        $stmt = $pdo->prepare("
            INSERT INTO ai_fuel_purchases
            (user_id, fuel_amount, price, validity_months, expiry_date, purchase_date, status)
            VALUES (?, ?, ?, 3, DATE_ADD(NOW(), INTERVAL 3 MONTH), NOW(), 'pending')
        ");
        $stmt->execute([$user['id'], $fuelAmount, $price]);
        $purchaseId = $pdo->lastInsertId();

        // Create Yoco checkout
        $checkout_data = [
            'amount' => $price * 100, // Convert to cents
            'currency' => 'ZAR',
            'successUrl' => 'http://localhost:8000/Z2B-v21/app/payment-success.html?purchase=' . $purchaseId,
            'cancelUrl' => 'http://localhost:8000/Z2B-v21/app/ai-refuel.html?cancelled=true',
            'failureUrl' => 'http://localhost:8000/Z2B-v21/app/payment-failed.html',
            'metadata' => [
                'userId' => $user['id'],
                'purchaseId' => $purchaseId,
                'fuelAmount' => $fuelAmount,
                'type' => 'ai_fuel_topup'
            ]
        ];

        $ch = curl_init(YOCO_API_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($checkout_data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . YOCO_SECRET_KEY
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 201) {
            $yoco_response = json_decode($response, true);

            // Update purchase with Yoco reference
            $stmt = $pdo->prepare("
                UPDATE ai_fuel_purchases
                SET payment_reference = ?
                WHERE id = ?
            ");
            $stmt->execute([$yoco_response['id'], $purchaseId]);

            echo json_encode([
                'success' => true,
                'checkoutUrl' => $yoco_response['redirectUrl'],
                'purchaseId' => $purchaseId
            ]);
        } else {
            throw new Exception('Yoco API error: ' . $response);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Checkout creation failed: ' . $e->getMessage()
        ]);
    }
}

// Yoco webhook handler
elseif ($method === 'POST' && strpos($request_uri, '/webhook') !== false) {
    // Get raw POST data
    $payload = file_get_contents('php://input');
    $event = json_decode($payload, true);

    // Log webhook event
    error_log('Yoco Webhook: ' . $payload);

    try {
        if ($event['type'] === 'payment.succeeded') {
            $checkoutId = $event['payload']['id'];
            $metadata = $event['payload']['metadata'];

            $purchaseId = $metadata['purchaseId'];
            $userId = $metadata['userId'];
            $fuelAmount = $metadata['fuelAmount'];

            // Update purchase status
            $stmt = $pdo->prepare("
                UPDATE ai_fuel_purchases
                SET status = 'completed', payment_reference = ?
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$checkoutId, $purchaseId, $userId]);

            // Add fuel to user's account
            $expiryDate = date('Y-m-d H:i:s', strtotime('+3 months'));

            $stmt = $pdo->prepare("
                INSERT INTO ai_fuel_balance
                (user_id, fuel_amount, expiry_date, source, source_id, created_at)
                VALUES (?, ?, ?, 'topup', ?, NOW())
            ");
            $stmt->execute([$userId, $fuelAmount, $expiryDate, $purchaseId]);

            // Update user's total fuel
            $stmt = $pdo->prepare("
                UPDATE users
                SET ai_fuel = ai_fuel + ?, last_fuel_topup = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$fuelAmount, $userId]);

            // Get user's referrer for commission
            $stmt = $pdo->prepare("SELECT referred_by, tier_code FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($userData['referred_by']) {
                // Find referrer user ID
                $stmt = $pdo->prepare("SELECT id FROM users WHERE referral_code = ?");
                $stmt->execute([$userData['referred_by']]);
                $referrer = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($referrer) {
                    // Calculate commission
                    $stmt = $pdo->prepare("SELECT price FROM ai_fuel_purchases WHERE id = ?");
                    $stmt->execute([$purchaseId]);
                    $purchase = $stmt->fetch(PDO::FETCH_ASSOC);
                    $price = $purchase['price'];

                    $commissionRates = [
                        'STARTER' => 0.10,
                        'PRO' => 0.15,
                        'SILVER' => 0.20,
                        'GOLD' => 0.25,
                        'PLATINUM' => 0.30,
                        'LIFETIME' => 0.35
                    ];

                    $commissionRate = $commissionRates[$userData['tier_code']] ?? 0.10;
                    $commissionAmount = $price * $commissionRate;

                    // Create commission record
                    $stmt = $pdo->prepare("
                        INSERT INTO commissions
                        (user_id, source_user_id, type, amount, description, purchase_id, commission_rate, created_at, status)
                        VALUES (?, ?, 'ai_fuel_topup', ?, ?, ?, ?, NOW(), 'pending')
                    ");
                    $stmt->execute([
                        $referrer['id'],
                        $userId,
                        $commissionAmount,
                        "AI Fuel Top-Up Commission: {$fuelAmount} fuel @ R{$price}",
                        $purchaseId,
                        $commissionRate
                    ]);

                    // Update referrer's pending commission
                    $stmt = $pdo->prepare("
                        UPDATE users
                        SET pending_commission = pending_commission + ?
                        WHERE id = ?
                    ");
                    $stmt->execute([$commissionAmount, $referrer['id']]);
                }
            }

            echo json_encode(['success' => true, 'message' => 'Payment processed']);
        }
        elseif ($event['type'] === 'payment.failed') {
            $metadata = $event['payload']['metadata'];
            $purchaseId = $metadata['purchaseId'];

            // Update purchase status
            $stmt = $pdo->prepare("UPDATE ai_fuel_purchases SET status = 'failed' WHERE id = ?");
            $stmt->execute([$purchaseId]);

            echo json_encode(['success' => true, 'message' => 'Payment failed recorded']);
        }

    } catch (Exception $e) {
        error_log('Webhook processing error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Verify payment status
elseif ($method === 'GET' && strpos($request_uri, '/verify') !== false) {
    $purchaseId = $_GET['purchaseId'] ?? null;

    if (!$purchaseId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing purchaseId']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            SELECT id, user_id, fuel_amount, price, status, payment_reference, purchase_date
            FROM ai_fuel_purchases
            WHERE id = ?
        ");
        $stmt->execute([$purchaseId]);
        $purchase = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$purchase) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Purchase not found']);
            exit();
        }

        echo json_encode([
            'success' => true,
            'purchase' => $purchase
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Verification failed: ' . $e->getMessage()
        ]);
    }
}

else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Endpoint not found']);
}
?>
