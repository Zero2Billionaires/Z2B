<?php
/**
 * Database Migration Runner
 * Purpose: Execute SQL migration files
 * Usage: php database/run-migration.php create_coach_activity_responses.sql
 */

// Load database configuration
require_once __DIR__ . '/../config/database.php';

echo "\n========================================\n";
echo "Z2B Database Migration Runner\n";
echo "========================================\n\n";

// Get migration file from command line argument
$migration_file = $argv[1] ?? null;

if (!$migration_file) {
    echo "❌ ERROR: Please specify a migration file\n";
    echo "Usage: php database/run-migration.php migration_file.sql\n\n";
    echo "Available migrations:\n";

    $migrations = glob(__DIR__ . '/migrations/*.sql');
    foreach ($migrations as $file) {
        echo "  - " . basename($file) . "\n";
    }
    exit(1);
}

// Build full path to migration file
$migration_path = __DIR__ . '/migrations/' . $migration_file;

if (!file_exists($migration_path)) {
    echo "❌ ERROR: Migration file not found: $migration_path\n";
    exit(1);
}

echo "📄 Loading migration: $migration_file\n";

// Read SQL file
$sql = file_get_contents($migration_path);

if (!$sql) {
    echo "❌ ERROR: Failed to read migration file\n";
    exit(1);
}

echo "📊 Executing SQL statements...\n\n";

try {
    // Split SQL by delimiter and execute each statement
    $statements = explode(';', $sql);
    $executed = 0;
    $skipped = 0;

    foreach ($statements as $statement) {
        $statement = trim($statement);

        // Skip empty statements and comments
        if (empty($statement) || preg_match('/^--/', $statement)) {
            $skipped++;
            continue;
        }

        // Execute statement
        try {
            $db->exec($statement);
            $executed++;

            // Show progress for CREATE statements
            if (preg_match('/CREATE (TABLE|VIEW|PROCEDURE)/i', $statement, $matches)) {
                $type = strtoupper($matches[1]);
                if (preg_match('/`(\w+)`/', $statement, $name_matches)) {
                    echo "  ✅ Created {$type}: {$name_matches[1]}\n";
                }
            }
        } catch (PDOException $e) {
            // Check if error is "already exists" - that's OK
            if (strpos($e->getMessage(), 'already exists') !== false) {
                if (preg_match('/table (\w+) already exists/i', $e->getMessage(), $matches)) {
                    echo "  ⚠️  Table/View already exists: {$matches[1]} (skipping)\n";
                }
                continue;
            } else {
                throw $e;
            }
        }
    }

    echo "\n========================================\n";
    echo "✅ Migration completed successfully!\n";
    echo "========================================\n";
    echo "Executed: $executed statements\n";
    echo "Skipped: $skipped statements\n\n";

    // If this is the coach activity migration, show next steps
    if (strpos($migration_file, 'coach_activity') !== false) {
        echo "📝 Next Steps:\n";
        echo "1. Test activity submission in Coach Manlaw\n";
        echo "2. Check database for responses: SELECT * FROM coach_activity_responses;\n";
        echo "3. Verify views work: SELECT * FROM coach_recent_responses;\n";
        echo "4. Monitor AI feedback generation\n\n";
    }

} catch (PDOException $e) {
    echo "\n========================================\n";
    echo "❌ Migration FAILED!\n";
    echo "========================================\n";
    echo "Error: " . $e->getMessage() . "\n\n";

    if (DEBUG_MODE) {
        echo "Stack trace:\n";
        echo $e->getTraceAsString() . "\n\n";
    }

    exit(1);
}

echo "Database: " . DB_NAME . "\n";
echo "Host: " . DB_HOST . "\n";
echo "Time: " . date('Y-m-d H:i:s') . "\n\n";
