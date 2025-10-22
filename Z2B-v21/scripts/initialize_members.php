<?php
/**
 * Initialize Member Balances Script
 *
 * Run this once to initialize request balances for all existing members
 *
 * Usage: php scripts/initialize_members.php
 *
 * @package Z2B
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/RateLimiter.php';

echo "==============================================\n";
echo "Z2B Member Balance Initialization\n";
echo "==============================================\n\n";

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get all active members
    $stmt = $db->query("
        SELECT m.id, m.username, m.email, t.tier_code
        FROM members m
        LEFT JOIN tiers t ON m.tier_id = t.id
        WHERE m.is_active = 1
        ORDER BY m.id
    ");
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Found " . count($members) . " active members\n\n";

    if (empty($members)) {
        echo "No members to initialize. Exiting.\n";
        exit(0);
    }

    // Ask for confirmation
    echo "This will initialize/reinitialize request balances for all members.\n";
    echo "Continue? (yes/no): ";
    $handle = fopen("php://stdin", "r");
    $confirmation = trim(fgets($handle));
    fclose($handle);

    if (strtolower($confirmation) !== 'yes') {
        echo "Initialization cancelled.\n";
        exit(0);
    }

    echo "\nInitializing...\n\n";

    $success_count = 0;
    $error_count = 0;
    $tier_counts = [];

    foreach ($members as $index => $member) {
        $member_id = $member['id'];
        $username = $member['username'];
        $tier_code = $member['tier_code'] ?? 'FAM'; // Default to FAM if no tier

        echo sprintf(
            "[%d/%d] Initializing: %s (ID: %d, Tier: %s)... ",
            $index + 1,
            count($members),
            $username,
            $member_id,
            $tier_code
        );

        try {
            // Initialize via RateLimiter (auto-initializes if not exists)
            $limiter = new RateLimiter($db, $member_id);

            // Get the created balance
            $usage = $limiter->getUsageData();

            echo "✓ Success\n";
            echo "    - Daily limit: {$usage['tier']['daily_limit']}\n";
            echo "    - Available: {$usage['today']['available']}\n";

            $success_count++;

            // Track tier counts
            if (!isset($tier_counts[$tier_code])) {
                $tier_counts[$tier_code] = 0;
            }
            $tier_counts[$tier_code]++;

        } catch (Exception $e) {
            echo "✗ Error: " . $e->getMessage() . "\n";
            $error_count++;
        }

        // Small delay to prevent overwhelming the database
        usleep(10000); // 10ms
    }

    echo "\n==============================================\n";
    echo "Initialization Complete\n";
    echo "==============================================\n\n";
    echo "Summary:\n";
    echo "  - Total members: " . count($members) . "\n";
    echo "  - Successfully initialized: $success_count\n";
    echo "  - Errors: $error_count\n\n";

    if (!empty($tier_counts)) {
        echo "Members per tier:\n";
        foreach ($tier_counts as $tier => $count) {
            echo "  - $tier: $count members\n";
        }
    }

    echo "\n";

    // Verify initialization
    echo "Verification:\n";
    $stmt = $db->query("
        SELECT COUNT(*) as count FROM member_request_balance
    ");
    $balance_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "  - Request balances in database: $balance_count\n";

    if ($balance_count >= $success_count) {
        echo "  ✓ All successful initializations verified\n";
    } else {
        echo "  ⚠ Warning: Balance count mismatch\n";
    }

    echo "\nDone!\n";
    exit(0);

} catch (Exception $e) {
    echo "\n\nFATAL ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
