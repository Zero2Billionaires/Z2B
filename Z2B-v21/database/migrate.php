<?php
/**
 * Web-Based Database Migration Tool
 * Access via: http://localhost:8000/database/migrate.php
 */

require_once __DIR__ . '/../config/database.php';

// Security: Only allow from localhost
if (!in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1'])) {
    die('Access denied. This tool can only be accessed from localhost.');
}

$message = '';
$messageType = '';

// Handle migration execution
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['execute'])) {
    $migration_file = $_POST['migration_file'] ?? '';
    $migration_path = __DIR__ . '/migrations/' . $migration_file;

    if (file_exists($migration_path)) {
        try {
            $sql = file_get_contents($migration_path);
            $statements = explode(';', $sql);
            $executed = 0;

            foreach ($statements as $statement) {
                $statement = trim($statement);
                if (empty($statement) || preg_match('/^--/', $statement) || preg_match('/^\/\*/', $statement)) {
                    continue;
                }

                try {
                    $db->exec($statement);
                    $executed++;
                } catch (PDOException $e) {
                    if (strpos($e->getMessage(), 'already exists') === false) {
                        throw $e;
                    }
                }
            }

            $message = "✅ Migration completed successfully! Executed $executed SQL statements.";
            $messageType = 'success';

        } catch (PDOException $e) {
            $message = "❌ Migration failed: " . $e->getMessage();
            $messageType = 'error';
        }
    } else {
        $message = "❌ Migration file not found: $migration_file";
        $messageType = 'error';
    }
}

// Get list of available migrations
$migrations = glob(__DIR__ . '/migrations/*.sql');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Z2B Database Migration Tool</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 14px;
        }

        .content {
            padding: 30px;
        }

        .alert {
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 500;
        }

        .alert.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .alert.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .alert.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }

        .db-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #667eea;
        }

        .db-info h3 {
            color: #333;
            margin-bottom: 10px;
            font-size: 16px;
        }

        .db-info p {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }

        .migration-list {
            margin-bottom: 30px;
        }

        .migration-list h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 18px;
        }

        .migration-item {
            background: #f8f9fa;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 2px solid #e9ecef;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .migration-item:hover {
            border-color: #667eea;
            background: #f0f3ff;
        }

        .migration-item.selected {
            border-color: #667eea;
            background: #e8ecff;
        }

        .migration-item input[type="radio"] {
            margin-right: 10px;
        }

        .migration-item label {
            cursor: pointer;
            font-weight: 500;
            color: #333;
            display: flex;
            align-items: center;
        }

        .migration-desc {
            color: #666;
            font-size: 13px;
            margin-left: 28px;
            margin-top: 5px;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            display: inline-block;
            width: 100%;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .instructions {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }

        .instructions h4 {
            color: #856404;
            margin-bottom: 10px;
        }

        .instructions ol {
            margin-left: 20px;
            color: #856404;
        }

        .instructions li {
            margin: 8px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗄️ Z2B Database Migration Tool</h1>
            <p>Execute database migrations with one click</p>
        </div>

        <div class="content">
            <?php if ($message): ?>
                <div class="alert <?php echo $messageType; ?>">
                    <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>

            <div class="db-info">
                <h3>📊 Database Connection</h3>
                <p><strong>Host:</strong> <?php echo DB_HOST; ?></p>
                <p><strong>Database:</strong> <?php echo DB_NAME; ?></p>
                <p><strong>Status:</strong> ✅ Connected</p>
            </div>

            <?php if (count($migrations) > 0): ?>
                <form method="POST">
                    <div class="migration-list">
                        <h3>📋 Available Migrations</h3>

                        <?php foreach ($migrations as $index => $migration): ?>
                            <?php
                            $filename = basename($migration);
                            $description = '';

                            // Get description from migration file
                            if ($filename === 'create_coach_activity_responses.sql') {
                                $description = 'Creates table for Coach Manlaw activity/assignment submissions with AI feedback support';
                            } elseif ($filename === 'create_request_limits_tables.sql') {
                                $description = 'Creates tiered request limiting system (FAM, Bronze, Copper, Silver, Gold, Platinum)';
                            }
                            ?>
                            <div class="migration-item" onclick="selectMigration(<?php echo $index; ?>)">
                                <label>
                                    <input type="radio"
                                           name="migration_file"
                                           value="<?php echo htmlspecialchars($filename); ?>"
                                           id="migration_<?php echo $index; ?>"
                                           required>
                                    <?php echo htmlspecialchars($filename); ?>
                                </label>
                                <?php if ($description): ?>
                                    <div class="migration-desc"><?php echo htmlspecialchars($description); ?></div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <button type="submit" name="execute" value="1" class="btn">
                        🚀 Execute Selected Migration
                    </button>
                </form>

                <div class="instructions">
                    <h4>📝 Instructions</h4>
                    <ol>
                        <li>Select a migration file from the list above</li>
                        <li>Click "Execute Selected Migration"</li>
                        <li>Wait for confirmation message</li>
                        <li>Close this page when done</li>
                    </ol>
                    <p style="margin-top: 15px; font-size: 13px; color: #856404;">
                        <strong>Note:</strong> For the Coach Manlaw activity submission fix, select
                        <code>create_coach_activity_responses.sql</code>
                    </p>
                </div>

            <?php else: ?>
                <div class="alert info">
                    ℹ️ No migration files found in <code>database/migrations/</code>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <script>
        function selectMigration(index) {
            // Remove all selected classes
            document.querySelectorAll('.migration-item').forEach(item => {
                item.classList.remove('selected');
            });

            // Add selected class to clicked item
            event.currentTarget.classList.add('selected');

            // Check the radio button
            document.getElementById('migration_' + index).checked = true;
        }
    </script>
</body>
</html>
