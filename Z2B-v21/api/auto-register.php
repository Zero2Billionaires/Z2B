<?php
/**
 * Z2B Legacy Builders - Automatic User Registration After Payment
 * Creates user account automatically when payment is confirmed
 */

header('Content-Type: application/json');

require_once '../config/database.php';
require_once '../config/app.php';
require_once '../includes/EmailService.php';

class AutoRegistration {
    private $db;
    private $emailService;

    public function __construct($database) {
        $this->db = $database;
        $this->emailService = new EmailService();
    }

    /**
     * Create user account from payment session
     */
    public function registerFromPayment($reference, $email, $fullName = null) {
        try {
            // Get payment session details
            $sql = "SELECT * FROM payment_sessions WHERE reference = ? LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$reference]);
            $payment = $stmt->fetch();

            if (!$payment) {
                throw new Exception('Payment session not found');
            }

            // Check if user already exists
            $checkSql = "SELECT id FROM users WHERE email = ? LIMIT 1";
            $checkStmt = $this->db->prepare($checkSql);
            $checkStmt->execute([$email]);
            if ($checkStmt->fetch()) {
                throw new Exception('User already registered with this email');
            }

            // Generate username and password
            $username = $this->generateUsername($email, $fullName);
            $password = $this->generatePassword();
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);

            // Generate referral code for new user
            $referralCode = $this->generateReferralCode($username);

            // Get tier information
            global $TIER_CONFIG;
            $tierInfo = $TIER_CONFIG[$payment['tier_code']] ?? [];

            // Create user account
            $insertSql = "INSERT INTO users
                (username, email, password, full_name, tier_code, referral_code, referred_by, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())";

            $insertStmt = $this->db->prepare($insertSql);
            $insertStmt->execute([
                $username,
                $email,
                $passwordHash,
                $fullName,
                $payment['tier_code'],
                $referralCode,
                $payment['referral_code']
            ]);

            $userId = $this->db->lastInsertId();

            // Create referral link
            $referralLink = $this->getBaseUrl() . '/app/landing-page.html?ref=' . $referralCode;

            // Send welcome email
            $emailData = [
                'username' => $username,
                'password' => $password,
                'tier_name' => $tierInfo['name'] ?? 'Legacy Builder',
                'referral_link' => $referralLink
            ];

            $this->emailService->sendRegistrationEmail($email, $emailData);

            // If this user was referred, notify the referrer
            if (!empty($payment['referral_code'])) {
                $this->notifyReferrer($payment['referral_code'], $tierInfo, $email);
            }

            // Update payment session with user_id
            $updateSql = "UPDATE payment_sessions SET user_id = ?, status = 'completed' WHERE reference = ?";
            $updateStmt = $this->db->prepare($updateSql);
            $updateStmt->execute([$userId, $reference]);

            return [
                'success' => true,
                'user_id' => $userId,
                'username' => $username,
                'password' => $password, // Return for display
                'referral_code' => $referralCode,
                'referral_link' => $referralLink,
                'message' => 'Account created successfully'
            ];

        } catch (Exception $e) {
            error_log("Auto-registration error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Generate unique username
     */
    private function generateUsername($email, $fullName = null) {
        if ($fullName) {
            // Use first name + random number
            $parts = explode(' ', $fullName);
            $base = strtolower(preg_replace('/[^a-z0-9]/i', '', $parts[0]));
        } else {
            // Use part of email
            $base = strtolower(explode('@', $email)[0]);
            $base = preg_replace('/[^a-z0-9]/i', '', $base);
        }

        // Add random suffix to ensure uniqueness
        $username = $base . rand(1000, 9999);

        // Check if exists and regenerate if needed
        $sql = "SELECT id FROM users WHERE username = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$username]);

        if ($stmt->fetch()) {
            // Try again with different number
            $username = $base . rand(10000, 99999);
        }

        return $username;
    }

    /**
     * Generate secure random password
     */
    private function generatePassword($length = 12) {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
        $password = '';
        $charLength = strlen($chars);

        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[rand(0, $charLength - 1)];
        }

        return $password;
    }

    /**
     * Generate unique referral code
     */
    private function generateReferralCode($username) {
        $base = strtoupper(substr($username, 0, 4));
        $code = $base . '-' . strtoupper(substr(uniqid(), -6));

        // Ensure uniqueness
        $sql = "SELECT id FROM users WHERE referral_code = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$code]);

        if ($stmt->fetch()) {
            // Try again
            $code = $base . '-' . strtoupper(substr(uniqid(), -6));
        }

        return $code;
    }

    /**
     * Notify referrer of new signup
     */
    private function notifyReferrer($referralCode, $tierInfo, $newMemberEmail) {
        try {
            // Find referrer
            $sql = "SELECT email, username FROM users WHERE referral_code = ? LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$referralCode]);
            $referrer = $stmt->fetch();

            if ($referrer) {
                // Calculate commission (20% of first month)
                $price = $tierInfo['price'] ?? 0;
                $commission = $price * 0.20;

                $emailData = [
                    'referrer_name' => $referrer['username'],
                    'new_member_name' => $newMemberEmail,
                    'tier_name' => $tierInfo['name'] ?? 'a tier',
                    'commission' => number_format($commission, 2)
                ];

                $this->emailService->sendReferralNotification($referrer['email'], $emailData);
            }
        } catch (Exception $e) {
            error_log("Failed to notify referrer: " . $e->getMessage());
        }
    }

    private function getBaseUrl() {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return $protocol . '://' . $host;
    }
}

// Handle API requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $reference = $input['reference'] ?? '';
    $email = $input['email'] ?? '';
    $fullName = $input['full_name'] ?? null;

    if (empty($reference) || empty($email)) {
        echo json_encode(['success' => false, 'error' => 'Reference and email are required']);
        exit;
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Invalid email address']);
        exit;
    }

    $autoReg = new AutoRegistration($db);
    $result = $autoReg->registerFromPayment($reference, $email, $fullName);

    echo json_encode($result);
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}
