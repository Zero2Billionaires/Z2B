<?php
/**
 * Z2B Legacy Builders - PRODUCTION Database Configuration
 *
 * IMPORTANT: Rename this file to database.php on your production server
 * UPDATE the credentials below with your actual hosting database details
 */

// Production Database Settings
// Get these from your hosting control panel (cPanel → MySQL Databases)
define('DB_HOST', 'localhost');           // Usually 'localhost' on shared hosting
define('DB_NAME', 'your_db_name');        // e.g., username_z2blegacy
define('DB_USER', 'your_db_username');    // e.g., username_z2buser
define('DB_PASS', 'your_db_password');    // Your secure database password
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
    // Log error securely (don't expose to users)
    error_log("Database connection failed: " . $e->getMessage());

    // Show user-friendly message
    http_response_code(500);
    die("We're experiencing technical difficulties. Please try again later.");
}
?>
