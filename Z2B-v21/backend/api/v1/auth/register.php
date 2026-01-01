<?php
/**
 * Register Endpoint
 * Creates new member account
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/JWTHandler.php';

if ($requestMethod !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Get request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $required = ['username', 'email', 'password', 'first_name', 'last_name', 'tier'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ucfirst(str_replace('_', ' ', $field)) . ' is required'
            ]);
            exit;
        }
    }

    $username = $input['username'];
    $email = $input['email'];
    $password = $input['password'];
    $firstName = $input['first_name'];
    $lastName = $input['last_name'];
    $tier = $input['tier'];
    $phone = $input['phone'] ?? null;
    $sponsorCode = $input['sponsor_code'] ?? null;

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid email address'
        ]);
        exit;
    }

    // Check if username exists
    $stmt = $db->prepare("SELECT id FROM members WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'error' => 'Username already exists'
        ]);
        exit;
    }

    // Check if email exists
    $stmt = $db->prepare("SELECT id FROM members WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'error' => 'Email already exists'
        ]);
        exit;
    }

    // Validate sponsor code if provided
    $sponsorId = null;
    if ($sponsorCode) {
        $stmt = $db->prepare("SELECT id FROM members WHERE referral_code = ?");
        $stmt->execute([$sponsorCode]);
        $sponsor = $stmt->fetch();

        if (!$sponsor) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid sponsor code'
            ]);
            exit;
        }
        $sponsorId = $sponsor['id'];
    }

    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Generate unique referral code
    function generateReferralCode($db) {
        do {
            $code = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
            $stmt = $db->prepare("SELECT id FROM members WHERE referral_code = ?");
            $stmt->execute([$code]);
        } while ($stmt->fetch());
        return $code;
    }

    $referralCode = generateReferralCode($db);

    // Get tier ID from tier code
    $tierMap = [
        'FAM' => 1, 'BLB' => 2, 'CLB' => 3,
        'SLB' => 4, 'GLB' => 5, 'PLB' => 6, 'DLB' => 7
    ];
    $tierId = $tierMap[$tier] ?? 1;

    // Insert member
    $stmt = $db->prepare("
        INSERT INTO members (
            username, email, password_hash, first_name, last_name,
            phone, tier_id, sponsor_id, referral_code, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ");

    $stmt->execute([
        $username, $email, $passwordHash, $firstName, $lastName,
        $phone, $tierId, $sponsorId, $referralCode
    ]);

    $memberId = $db->lastInsertId();

    // Create referral entry if sponsor exists
    if ($sponsorId) {
        $stmt = $db->prepare("
            INSERT INTO referrals (sponsor_id, member_id, level, placement_type)
            VALUES (?, ?, 1, 'forced')
        ");
        $stmt->execute([$sponsorId, $memberId]);
    }

    // Generate JWT tokens
    $jwt = new JWTHandler();
    $token = $jwt->generateToken($memberId, 'member', [
        'username' => $username,
        'email' => $email,
        'firstName' => $firstName,
        'lastName' => $lastName,
        'tierId' => $tierId
    ]);
    $refreshToken = $jwt->generateRefreshToken($memberId, 'member');

    // Log activity
    try {
        $logStmt = $db->prepare("
            INSERT INTO activity_logs (user_id, user_type, action, ip_address, user_agent)
            VALUES (?, 'member', 'register', ?, ?)
        ");
        $logStmt->execute([
            $memberId,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    } catch (Exception $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful',
        'data' => [
            'token' => $token,
            'refreshToken' => $refreshToken,
            'expiresIn' => $jwt->getExpiry(),
            'user' => [
                'id' => $memberId,
                'username' => $username,
                'email' => $email,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'tierId' => $tierId,
                'referralCode' => $referralCode
            ]
        ]
    ]);

} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'An error occurred during registration'
    ]);
}
