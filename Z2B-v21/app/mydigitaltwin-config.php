<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'Z2B_mydigitaltwin');
define('DB_USER', 'YOUR_DATABASE_USERNAME');
define('DB_PASS', 'YOUR_DATABASE_PASSWORD');

// HeyGen API (same as VIDZIE)
define('HEYGEN_API_KEY', getenv('HEYGEN_API_KEY') ?: 'YOUR_HEYGEN_API_KEY');
define('HEYGEN_API_URL', 'https://api.heygen.com/v2');

// MyDigitalTwin Tiered Pricing
define('PRICE_TWIN_STARTER', 600.00);
define('PRICE_TWIN_PRO', 1900.00);
define('PRICE_TWIN_UNLIMITED', 3000.00);

// Legacy single-tier pricing (deprecated)
define('PRICE_STANDARD', 299.00);
define('PRICE_Z2B_MEMBER', 254.15);
define('PV_POINTS_STANDARD', 14.95);

define('SITE_URL', 'https://z2blegacybuilders.co.za/mydigitaltwin');
define('SITE_EMAIL', 'support@z2blegacybuilders.co.za');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Database connection failed");
        }
    }
    return $pdo;
}
?>
