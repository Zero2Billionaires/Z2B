<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Usage Dashboard - Z2B Admin</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #F9FAFB;
            color: #1F2937;
            line-height: 1.6;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 32px;
            border-radius: 12px;
            margin-bottom: 32px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        header h1 {
            font-size: 32px;
            margin-bottom: 8px;
        }

        header p {
            opacity: 0.9;
            font-size: 16px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }

        .stat-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }

        .stat-card h3 {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-card .value {
            font-size: 32px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 4px;
        }

        .stat-card .label {
            font-size: 14px;
            color: #9CA3AF;
        }

        .section {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }

        .section h2 {
            font-size: 20px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
        }

        th {
            background: #F9FAFB;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        tr:hover {
            background: #F9FAFB;
        }

        .tier-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .tier-FAM { background: #E5E7EB; color: #374151; }
        .tier-BLB { background: #FEE2E2; color: #991B1B; }
        .tier-CLB { background: #FED7AA; color: #9A3412; }
        .tier-SLB { background: #E0E7FF; color: #3730A3; }
        .tier-GLB { background: #FEF3C7; color: #92400E; }
        .tier-PLB { background: #E0F2FE; color: #075985; }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-ok { background: #D1FAE5; color: #065F46; }
        .status-warning { background: #FEF3C7; color: #92400E; }
        .status-critical { background: #FEE2E2; color: #991B1B; }
        .status-limit { background: #F3F4F6; color: #374151; }

        .progress-bar {
            background: #E5E7EB;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 4px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
        }

        .progress-fill.warning {
            background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%);
        }

        .progress-fill.critical {
            background: linear-gradient(90deg, #EF4444 0%, #DC2626 100%);
        }

        .refresh-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .refresh-btn:hover {
            opacity: 0.9;
        }

        .chart-container {
            margin-top: 20px;
            height: 300px;
        }

        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }

            table {
                font-size: 14px;
            }

            th, td {
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <?php
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../includes/Auth.php';
    require_once __DIR__ . '/../includes/RateLimiter.php';

    // Check authentication and admin access
    $database = new Database();
    $db = $database->getConnection();
    $auth = new Auth($db);

    if (!$auth->isLoggedIn() || $_SESSION['user_type'] !== 'admin') {
        header('Location: /login.php');
        exit;
    }

    // Get analytics data
    $analytics = RateLimiter::getAdminAnalytics($db, 30);
    $tier_summary = $analytics['tier_summary'];
    $recent_requests = $analytics['recent_requests'];
    $members_at_risk = $analytics['members_at_risk'];

    // Calculate overall stats
    $total_members = 0;
    $total_requests_today = 0;
    $members_at_limit = 0;
    $members_near_limit = 0;

    foreach ($tier_summary as $tier) {
        $total_members += $tier['active_members'];
        $total_requests_today += $tier['avg_daily_usage'] * $tier['active_members'];
        $members_at_limit += $tier['members_at_limit'];
        $members_near_limit += $tier['members_near_limit'];
    }

    // Get request rate (requests per hour in last 24 hours)
    $stmt = $db->query("
        SELECT COUNT(*) as count
        FROM request_usage_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ");
    $requests_24h = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    $requests_per_hour = round($requests_24h / 24, 1);
    ?>

    <div class="container">
        <header>
            <h1>📊 API Usage Dashboard</h1>
            <p>Monitor request limits, tier usage, and member activity across the Z2B platform</p>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Active Members</h3>
                <div class="value"><?php echo number_format($total_members); ?></div>
                <div class="label">Across all tiers</div>
            </div>

            <div class="stat-card" style="border-left-color: #10B981;">
                <h3>Requests (24h)</h3>
                <div class="value"><?php echo number_format($requests_24h); ?></div>
                <div class="label"><?php echo $requests_per_hour; ?> per hour</div>
            </div>

            <div class="stat-card" style="border-left-color: #F59E0B;">
                <h3>Near Limit</h3>
                <div class="value"><?php echo $members_near_limit; ?></div>
                <div class="label">Members at 95%+</div>
            </div>

            <div class="stat-card" style="border-left-color: #EF4444;">
                <h3>At Limit</h3>
                <div class="value"><?php echo $members_at_limit; ?></div>
                <div class="label">Members blocked</div>
            </div>
        </div>

        <!-- Tier Usage Summary -->
        <div class="section">
            <h2>📈 Usage by Tier</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tier</th>
                        <th>Members</th>
                        <th>Avg Daily</th>
                        <th>Avg Monthly</th>
                        <th>Max Daily</th>
                        <th>Rollover</th>
                        <th>At Limit</th>
                        <th>Near Limit</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($tier_summary as $tier): ?>
                    <tr>
                        <td>
                            <span class="tier-badge tier-<?php echo $tier['tier_code']; ?>">
                                <?php echo $tier['tier_name']; ?>
                            </span>
                        </td>
                        <td><?php echo number_format($tier['active_members']); ?></td>
                        <td><?php echo number_format($tier['avg_daily_usage'], 1); ?></td>
                        <td><?php echo number_format($tier['avg_monthly_usage'], 0); ?></td>
                        <td><?php echo number_format($tier['max_daily_usage']); ?></td>
                        <td><?php echo number_format($tier['total_rollover']); ?></td>
                        <td>
                            <?php if ($tier['members_at_limit'] > 0): ?>
                                <span class="status-badge status-limit">
                                    <?php echo $tier['members_at_limit']; ?>
                                </span>
                            <?php else: ?>
                                -
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php if ($tier['members_near_limit'] > 0): ?>
                                <span class="status-badge status-critical">
                                    <?php echo $tier['members_near_limit']; ?>
                                </span>
                            <?php else: ?>
                                -
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- Members at Risk -->
        <?php if (count($members_at_risk) > 0): ?>
        <div class="section">
            <h2>⚠️ Members Near/At Limit</h2>
            <table>
                <thead>
                    <tr>
                        <th>Member</th>
                        <th>Tier</th>
                        <th>Daily Usage</th>
                        <th>Available</th>
                        <th>Status</th>
                        <th>Last Reset</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach (array_slice($members_at_risk, 0, 20) as $member): ?>
                    <tr>
                        <td>
                            <strong><?php echo htmlspecialchars($member['username']); ?></strong><br>
                            <small style="color: #6B7280;"><?php echo htmlspecialchars($member['email']); ?></small>
                        </td>
                        <td>
                            <span class="tier-badge tier-<?php echo $member['tier_code']; ?>">
                                <?php echo $member['tier_code']; ?>
                            </span>
                        </td>
                        <td>
                            <div>
                                <strong><?php echo $member['requests_used_today']; ?></strong> / <?php echo $member['daily_limit']; ?>
                                <span style="color: #6B7280; font-size: 14px;">
                                    (<?php echo number_format($member['daily_usage_percent'], 1); ?>%)
                                </span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill <?php
                                    echo $member['daily_usage_percent'] >= 95 ? 'critical' :
                                         ($member['daily_usage_percent'] >= 80 ? 'warning' : '');
                                ?>" style="width: <?php echo min($member['daily_usage_percent'], 100); ?>%;"></div>
                            </div>
                        </td>
                        <td>
                            <strong><?php echo $member['requests_available']; ?></strong>
                            <?php if ($member['rollover_balance'] > 0): ?>
                                <br><small style="color: #F59E0B;">+<?php echo $member['rollover_balance']; ?> rollover</small>
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php
                            $status_class = [
                                'OK' => 'status-ok',
                                'WARNING_80' => 'status-warning',
                                'WARNING_95' => 'status-critical',
                                'LIMIT_REACHED' => 'status-limit'
                            ];
                            $status_labels = [
                                'OK' => 'OK',
                                'WARNING_80' => '80% Used',
                                'WARNING_95' => '95% Used',
                                'LIMIT_REACHED' => 'Limit Reached'
                            ];
                            ?>
                            <span class="status-badge <?php echo $status_class[$member['status']]; ?>">
                                <?php echo $status_labels[$member['status']]; ?>
                            </span>
                        </td>
                        <td>
                            <?php echo date('M d, Y', strtotime($member['last_daily_reset'])); ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php endif; ?>

        <!-- Recent Requests -->
        <div class="section">
            <h2>🔄 Recent API Requests</h2>
            <button class="refresh-btn" onclick="location.reload()">Refresh</button>
            <table style="margin-top: 16px;">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Member</th>
                        <th>Tier</th>
                        <th>Endpoint</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Response Time</th>
                        <th>Before/After</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach (array_slice($recent_requests, 0, 50) as $request): ?>
                    <tr>
                        <td style="font-size: 12px; color: #6B7280;">
                            <?php echo date('H:i:s', strtotime($request['created_at'])); ?>
                        </td>
                        <td>ID: <?php echo $request['member_id']; ?></td>
                        <td>
                            <span class="tier-badge tier-<?php echo $request['tier_code']; ?>">
                                <?php echo $request['tier_code']; ?>
                            </span>
                        </td>
                        <td>
                            <code style="font-size: 12px; background: #F3F4F6; padding: 2px 6px; border-radius: 4px;">
                                <?php echo htmlspecialchars($request['endpoint']); ?>
                            </code>
                        </td>
                        <td><?php echo htmlspecialchars($request['request_type']); ?></td>
                        <td>
                            <?php
                            $status_colors = [
                                'success' => '#10B981',
                                'rate_limited' => '#EF4444',
                                'error' => '#F59E0B'
                            ];
                            ?>
                            <span style="color: <?php echo $status_colors[$request['status']] ?? '#6B7280'; ?>; font-weight: 600;">
                                <?php echo $request['status']; ?>
                            </span>
                        </td>
                        <td>
                            <?php if ($request['response_time_ms']): ?>
                                <?php echo $request['response_time_ms']; ?>ms
                            <?php else: ?>
                                -
                            <?php endif; ?>
                        </td>
                        <td style="font-size: 12px; color: #6B7280;">
                            <?php echo $request['requests_before']; ?> → <?php echo $request['requests_after']; ?>
                            <?php if ($request['rollover_used']): ?>
                                <span style="color: #F59E0B;">📦</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <div style="text-align: center; padding: 32px; color: #9CA3AF; font-size: 14px;">
            Z2B Legacy Builders | API Usage Dashboard | Last updated: <?php echo date('Y-m-d H:i:s'); ?>
        </div>
    </div>

    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => {
            location.reload();
        }, 30000);

        // Add keyboard shortcut for manual refresh
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                location.reload();
            }
        });
    </script>
</body>
</html>
