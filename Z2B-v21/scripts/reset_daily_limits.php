<?php
/**
 * Daily Limit Reset Script
 *
 * Run this script daily at midnight via cron job to reset daily limits
 * and calculate rollover balances
 *
 * Cron: 0 0 * * * php /path/to/z2b/scripts/reset_daily_limits.php
 *
 * @package Z2B
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

// Log file
$log_file = __DIR__ . '/../logs/daily_reset.log';

// Ensure logs directory exists
if (!file_exists(__DIR__ . '/../logs')) {
    mkdir(__DIR__ . '/../logs', 0755, true);
}

function logMessage($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND);
    echo "[$timestamp] $message\n";
}

try {
    logMessage("=== Daily Limit Reset Started ===");

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Call the stored procedure
    $stmt = $db->query("CALL reset_daily_limits()");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    logMessage($result['result'] ?? 'Reset completed');

    // Get statistics
    $stmt = $db->query("
        SELECT
            COUNT(*) as total_members,
            SUM(rollover_balance) as total_rollover,
            AVG(rollover_balance) as avg_rollover,
            MAX(rollover_balance) as max_rollover
        FROM member_request_balance
    ");
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    logMessage("Statistics:");
    logMessage("  - Total members: " . $stats['total_members']);
    logMessage("  - Total rollover: " . number_format($stats['total_rollover']));
    logMessage("  - Average rollover: " . number_format($stats['avg_rollover'], 2));
    logMessage("  - Max rollover: " . number_format($stats['max_rollover']));

    // Check for members at limit (might need attention)
    $stmt = $db->query("
        SELECT COUNT(*) as count
        FROM member_request_balance
        WHERE requests_available <= 0
    ");
    $at_limit = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    if ($at_limit > 0) {
        logMessage("  - Members at limit: $at_limit (after reset - unusual)");
    }

    logMessage("=== Daily Limit Reset Completed Successfully ===\n");

    exit(0);

} catch (Exception $e) {
    logMessage("ERROR: " . $e->getMessage());
    logMessage("Stack trace: " . $e->getTraceAsString());
    logMessage("=== Daily Limit Reset Failed ===\n");

    // Send alert email (optional)
    if (function_exists('mail')) {
        $admin_email = 'admin@z2blegacybuilders.co.za';
        $subject = 'Z2B Daily Reset Failed';
        $message = "Daily limit reset failed at " . date('Y-m-d H:i:s') . "\n\n";
        $message .= "Error: " . $e->getMessage();

        mail($admin_email, $subject, $message);
    }

    exit(1);
}
