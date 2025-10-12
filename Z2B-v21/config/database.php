<?php
/**
 * Z2B Legacy Builders - Database Configuration
 * Version 21
 */

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'z2b_legacy');
define('DB_USER', 'root');  // Change for production
define('DB_PASS', '');      // Change for production
define('DB_CHARSET', 'utf8mb4');

// Create database connection
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];

    $db = new PDO($dsn, DB_USER, DB_PASS, $options);

} catch (PDOException $e) {
    // Log error for debugging (don't expose in production)
    error_log("Database connection failed: " . $e->getMessage());

    // User-friendly error message
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        die("Database connection failed: " . $e->getMessage());
    } else {
        die("We're experiencing technical difficulties. Please try again later.");
    }
}

// Session configuration
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Set timezone
date_default_timezone_set('Africa/Johannesburg');

// Application constants
define('APP_NAME', 'Z2B Legacy Builders');
define('APP_VERSION', '21.0');
define('APP_URL', 'https://z2blegacybuilders.co.za');
define('APP_EMAIL', 'support@z2blegacybuilders.co.za');

// Security constants
define('ENCRYPTION_KEY', 'YOUR_32_CHARACTER_ENCRYPTION_KEY'); // Change this!
define('SESSION_TIMEOUT', 3600); // 1 hour
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes

// File upload settings
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
define('UPLOAD_PATH', '../uploads/');

// Pagination settings
define('ITEMS_PER_PAGE', 20);

// Commission settings
define('MIN_PAYOUT_AMOUNT', 500); // R500 minimum payout

// Debug mode (set to false in production)
define('DEBUG_MODE', true);

// Error reporting (disable in production)
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Helper functions
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function generateReferralCode($length = 8) {
    return strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, $length));
}

function formatCurrency($amount) {
    return 'R' . number_format($amount, 2, '.', ',');
}

function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

function isAjaxRequest() {
    return isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function logActivity($db, $userId, $userType, $action, $description = null) {
    try {
        $sql = "INSERT INTO activity_logs (user_id, user_type, action, description, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?)";

        $stmt = $db->prepare($sql);
        $stmt->execute([
            $userId,
            $userType,
            $action,
            $description,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    } catch (Exception $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }
}

function sendNotification($db, $memberId, $type, $title, $message, $actionUrl = null) {
    try {
        $sql = "INSERT INTO notifications (member_id, type, title, message, action_url)
                VALUES (?, ?, ?, ?, ?)";

        $stmt = $db->prepare($sql);
        $stmt->execute([$memberId, $type, $title, $message, $actionUrl]);
    } catch (Exception $e) {
        error_log("Failed to send notification: " . $e->getMessage());
    }
}

// CSRF token functions
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = generateToken();
    }
    return $_SESSION['csrf_token'];
}

function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Rate limiting function
function checkRateLimit($db, $identifier, $action, $maxAttempts = 5, $timeWindow = 300) {
    $sql = "SELECT COUNT(*) as attempts FROM activity_logs
            WHERE ip_address = ? AND action = ?
            AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)";

    $stmt = $db->prepare($sql);
    $stmt->execute([$identifier, $action, $timeWindow]);
    $result = $stmt->fetch();

    return $result['attempts'] < $maxAttempts;
}