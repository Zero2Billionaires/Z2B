<?php
/**
 * Monthly Limit Reset Script
 *
 * Run this script on the 1st of each month via cron job to reset monthly counters
 *
 * Cron: 0 0 1 * * php /path/to/z2b/scripts/reset_monthly_limits.php
 *
 * @package Z2B
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

// Log file
$log_file = __DIR__ . '/../logs/monthly_reset.log';

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
    logMessage("=== Monthly Limit Reset Started ===");

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get previous month stats before reset
    $stmt = $db->query("
        SELECT
            COUNT(*) as total_members,
            SUM(requests_used_month) as total_monthly_requests,
            AVG(requests_used_month) as avg_monthly_requests,
            MAX(requests_used_month) as max_monthly_requests
        FROM member_request_balance
    ");
    $prev_month = $stmt->fetch(PDO::FETCH_ASSOC);

    logMessage("Previous Month Statistics:");
    logMessage("  - Total members: " . $prev_month['total_members']);
    logMessage("  - Total requests: " . number_format($prev_month['total_monthly_requests']));
    logMessage("  - Average per member: " . number_format($prev_month['avg_monthly_requests'], 2));
    logMessage("  - Max by single member: " . number_format($prev_month['max_monthly_requests']));

    // Get tier breakdown
    $stmt = $db->query("
        SELECT
            mrb.tier_code,
            trl.tier_name,
            COUNT(*) as member_count,
            SUM(mrb.requests_used_month) as total_requests,
            AVG(mrb.requests_used_month) as avg_requests
        FROM member_request_balance mrb
        JOIN tier_request_limits trl ON mrb.tier_code = trl.tier_code
        GROUP BY mrb.tier_code, trl.tier_name
        ORDER BY trl.priority_level
    ");
    $tier_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    logMessage("\nUsage by Tier:");
    foreach ($tier_stats as $tier) {
        logMessage(sprintf(
            "  - %s: %d members, %s total requests, %.2f avg",
            $tier['tier_name'],
            $tier['member_count'],
            number_format($tier['total_requests']),
            $tier['avg_requests']
        ));
    }

    // Call the stored procedure
    $stmt = $db->query("CALL reset_monthly_limits()");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    logMessage("\n" . ($result['result'] ?? 'Reset completed'));

    // Archive last month's data (optional)
    $archive_month = date('Y-m', strtotime('last month'));
    logMessage("\nArchiving data for: $archive_month");

    $stmt = $db->prepare("
        INSERT INTO monthly_usage_archive
        (archive_month, tier_code, member_count, total_requests, avg_requests, created_at)
        SELECT
            ?,
            mrb.tier_code,
            COUNT(*) as member_count,
            SUM(mrb.requests_used_month) as total_requests,
            AVG(mrb.requests_used_month) as avg_requests,
            NOW()
        FROM member_request_balance mrb
        GROUP BY mrb.tier_code
        ON DUPLICATE KEY UPDATE
            member_count = VALUES(member_count),
            total_requests = VALUES(total_requests),
            avg_requests = VALUES(avg_requests)
    ");

    // Create archive table if it doesn't exist
    $db->query("
        CREATE TABLE IF NOT EXISTS monthly_usage_archive (
            id INT AUTO_INCREMENT PRIMARY KEY,
            archive_month VARCHAR(7) NOT NULL,
            tier_code VARCHAR(10) NOT NULL,
            member_count INT NOT NULL,
            total_requests BIGINT NOT NULL,
            avg_requests DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_month_tier (archive_month, tier_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $stmt->execute([$archive_month]);
    logMessage("Archive created for: $archive_month");

    // Check for high-usage members (potential upgrade candidates)
    $stmt = $db->query("
        SELECT
            m.id,
            m.username,
            m.email,
            mrb.tier_code,
            mrb.average_daily_usage,
            trl.daily_limit
        FROM member_request_balance mrb
        JOIN members m ON mrb.member_id = m.id
        JOIN tier_request_limits trl ON mrb.tier_code = trl.tier_code
        WHERE mrb.average_daily_usage >= trl.daily_limit * 0.80
        ORDER BY mrb.average_daily_usage DESC
        LIMIT 10
    ");
    $upgrade_candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($upgrade_candidates)) {
        logMessage("\nUpgrade Candidates (using >80% of daily limit):");
        foreach ($upgrade_candidates as $candidate) {
            logMessage(sprintf(
                "  - %s (%s): %.1f avg daily usage on %s tier (limit: %d)",
                $candidate['username'],
                $candidate['email'],
                $candidate['average_daily_usage'],
                $candidate['tier_code'],
                $candidate['daily_limit']
            ));
        }
    }

    logMessage("\n=== Monthly Limit Reset Completed Successfully ===\n");

    exit(0);

} catch (Exception $e) {
    logMessage("ERROR: " . $e->getMessage());
    logMessage("Stack trace: " . $e->getTraceAsString());
    logMessage("=== Monthly Limit Reset Failed ===\n");

    // Send alert email (optional)
    if (function_exists('mail')) {
        $admin_email = 'admin@z2blegacybuilders.co.za';
        $subject = 'Z2B Monthly Reset Failed';
        $message = "Monthly limit reset failed at " . date('Y-m-d H:i:s') . "\n\n";
        $message .= "Error: " . $e->getMessage();

        mail($admin_email, $subject, $message);
    }

    exit(1);
}
