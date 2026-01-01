<?php
/**
 * AI Fuel Top-Up API
 * Handles AI Fuel purchases, commission tracking, and fuel management
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
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Parse request
$input = json_decode(file_get_contents('php://input'), true);

// Get authorization token
$headers = getallheaders();
$authToken = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

// Authenticate user
function authenticateUser($pdo, $token) {
    if (!$token) {
        return null;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE auth_token = ? AND token_expires > NOW()");
    $stmt->execute([$token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Routes
if ($method === 'POST' && strpos($request_uri, '/purchase') !== false) {
    // Purchase AI Fuel
    $user = authenticateUser($pdo, $authToken);

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized'
        ]);
        exit();
    }

    $fuelAmount = $input['fuelAmount'] ?? 0;
    $price = $input['price'] ?? 0;
    $validityMonths = $input['validityMonths'] ?? 3;

    // Validate input
    if ($fuelAmount <= 0 || $price <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid fuel amount or price'
        ]);
        exit();
    }

    // Validate package pricing
    $validPackages = [
        100 => 125,
        500 => 625,
        1000 => 1250
    ];

    if (!isset($validPackages[$fuelAmount]) || $validPackages[$fuelAmount] != $price) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid package selection'
        ]);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // Calculate expiry date (3 months from now)
        $expiryDate = date('Y-m-d H:i:s', strtotime("+{$validityMonths} months"));

        // Insert fuel purchase record
        $stmt = $pdo->prepare("
            INSERT INTO ai_fuel_purchases
            (user_id, fuel_amount, price, validity_months, expiry_date, purchase_date, status)
            VALUES (?, ?, ?, ?, ?, NOW(), 'completed')
        ");
        $stmt->execute([
            $user['id'],
            $fuelAmount,
            $price,
            $validityMonths,
            $expiryDate
        ]);

        $purchaseId = $pdo->lastInsertId();

        // Add fuel to user's account
        $stmt = $pdo->prepare("
            INSERT INTO ai_fuel_balance
            (user_id, fuel_amount, expiry_date, source, source_id, created_at)
            VALUES (?, ?, ?, 'topup', ?, NOW())
        ");
        $stmt->execute([
            $user['id'],
            $fuelAmount,
            $expiryDate,
            $purchaseId
        ]);

        // Get user's upline (referrer)
        $stmt = $pdo->prepare("SELECT referrer_id, tier_code FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        // Calculate and credit commission to upline
        if ($userData['referrer_id']) {
            // Get tier-based commission rate
            $commissionRates = [
                'STARTER' => 0.10,  // 10% for Bronze
                'PRO' => 0.15,      // 15% for Copper
                'SILVER' => 0.20,   // 20% for Silver
                'GOLD' => 0.25,     // 25% for Gold
                'PLATINUM' => 0.30, // 30% for Platinum
                'LIFETIME' => 0.35  // 35% for Diamond
            ];

            $commissionRate = $commissionRates[$userData['tier_code']] ?? 0.10;
            $commissionAmount = $price * $commissionRate;

            // Insert commission record
            $stmt = $pdo->prepare("
                INSERT INTO commissions
                (user_id, source_user_id, type, amount, description, purchase_id, commission_rate, created_at, status)
                VALUES (?, ?, 'ai_fuel_topup', ?, ?, ?, ?, NOW(), 'pending')
            ");
            $stmt->execute([
                $userData['referrer_id'],
                $user['id'],
                $commissionAmount,
                "AI Fuel Top-Up Commission: {$fuelAmount} fuel @ R{$price}",
                $purchaseId,
                $commissionRate
            ]);

            // Update upline's pending commission balance
            $stmt = $pdo->prepare("
                UPDATE users
                SET pending_commission = pending_commission + ?
                WHERE id = ?
            ");
            $stmt->execute([$commissionAmount, $userData['referrer_id']]);
        }

        // Update user's total AI fuel
        $stmt = $pdo->prepare("
            UPDATE users
            SET ai_fuel = ai_fuel + ?,
                last_fuel_topup = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$fuelAmount, $user['id']]);

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'AI Fuel purchased successfully',
            'purchaseId' => $purchaseId,
            'fuelAdded' => $fuelAmount,
            'expiryDate' => $expiryDate,
            'totalFuel' => $user['ai_fuel'] + $fuelAmount,
            'commissionCredited' => isset($commissionAmount) ? $commissionAmount : 0
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Purchase failed: ' . $e->getMessage()
        ]);
    }

} elseif ($method === 'GET' && strpos($request_uri, '/balance') !== false) {
    // Get user's AI Fuel balance
    $user = authenticateUser($pdo, $authToken);

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized'
        ]);
        exit();
    }

    try {
        // Get total fuel balance (excluding expired)
        $stmt = $pdo->prepare("
            SELECT
                SUM(fuel_amount) as total_fuel
            FROM ai_fuel_balance
            WHERE user_id = ? AND expiry_date > NOW() AND fuel_amount > 0
        ");
        $stmt->execute([$user['id']]);
        $balance = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get fuel by source
        $stmt = $pdo->prepare("
            SELECT
                source,
                SUM(fuel_amount) as amount,
                MIN(expiry_date) as earliest_expiry
            FROM ai_fuel_balance
            WHERE user_id = ? AND expiry_date > NOW() AND fuel_amount > 0
            GROUP BY source
        ");
        $stmt->execute([$user['id']]);
        $fuelBySou rce = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'totalFuel' => $balance['total_fuel'] ?? 0,
            'fuelBySource' => $fuelBySource
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch balance: ' . $e->getMessage()
        ]);
    }

} elseif ($method === 'GET' && strpos($request_uri, '/history') !== false) {
    // Get AI Fuel purchase history
    $user = authenticateUser($pdo, $authToken);

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized'
        ]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            SELECT
                id,
                fuel_amount,
                price,
                validity_months,
                expiry_date,
                purchase_date,
                status
            FROM ai_fuel_purchases
            WHERE user_id = ?
            ORDER BY purchase_date DESC
            LIMIT 50
        ");
        $stmt->execute([$user['id']]);
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'history' => $history
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch history: ' . $e->getMessage()
        ]);
    }

} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Endpoint not found'
    ]);
}
?>
