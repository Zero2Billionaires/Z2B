<?php
/**
 * Z2B Legacy Builders Platform - Main Configuration
 * Version: 21
 * Created: 2025-09-30
 */

// Load environment variables
$env_file = __DIR__ . '/../.env';
if (file_exists($env_file)) {
    $env_lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($env_lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

// Application Settings
define('APP_NAME', 'Z2B Legacy Builders');
define('APP_VERSION', '21.0.0');
define('APP_URL', $_ENV['APP_URL'] ?? 'https://z2blegacybuilders.co.za');
define('APP_ENV', $_ENV['APP_ENV'] ?? 'production');
define('DEBUG_MODE', ($_ENV['DEBUG_MODE'] ?? 'false') === 'true'); // PRODUCTION: Set to false
define('TIMEZONE', 'Africa/Johannesburg');

// Security Settings
define('SESSION_NAME', 'z2b_session');
define('CSRF_TOKEN_NAME', 'z2b_csrf_token');
define('ENCRYPTION_KEY', $_ENV['ENCRYPTION_KEY'] ?? 'CHANGE_THIS_KEY_IN_ENV_FILE');
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? 'CHANGE_THIS_SECRET_IN_ENV_FILE');

// MLM Tier Configuration
$TIER_CONFIG = [
    'BLB' => [
        'name' => 'Bronze Legacy Builder',
        'price' => 480,
        'pv' => 100,
        'isp' => 25,
        'tsc' => 3,
        'tpb' => 2,
        'ai_credits' => 50,
        'color' => '#CD7F32'
    ],
    'CLB' => [
        'name' => 'Copper Legacy Builder',
        'price' => 980,
        'pv' => 200,
        'isp' => 28,
        'tsc' => 5,
        'tpb' => 3,
        'ai_credits' => 75,
        'color' => '#B87333'
    ],
    'SLB' => [
        'name' => 'Silver Legacy Builder',
        'price' => 1480,
        'pv' => 300,
        'isp' => 30,
        'tsc' => 7,
        'tpb' => 4,
        'ai_credits' => 100,
        'color' => '#C0C0C0'
    ],
    'GLB' => [
        'name' => 'Gold Legacy Builder',
        'price' => 2980,
        'pv' => 600,
        'isp' => 35,
        'tsc' => 9,
        'tpb' => 6,
        'ai_credits' => 200,
        'color' => '#FFD700'
    ],
    'PLB' => [
        'name' => 'Platinum Legacy Builder',
        'price' => 4980,
        'pv' => 1000,
        'isp' => 40,
        'tsc' => 12,
        'tpb' => 8,
        'ai_credits' => 500,
        'color' => '#E5E4E2'
    ],
    'DLB' => [
        'name' => 'Diamond Legacy Builder',
        'price' => 11980,
        'pv' => 1200,
        'isp' => 50,
        'tsc' => 15,
        'tpb' => 9,
        'ai_credits' => 1000,
        'color' => '#B9F2FF',
        // Premium tier - Special access restrictions
        'restricted' => true,
        'min_current_tier' => 'PLB', // Must be at least Platinum
        'min_silver_tenure_months' => 6, // Must have been Silver+ for 6 months
        'min_tli_level' => 8 // Must have achieved TLI Level 8 (Capital Visionary)
    ]
];

// Commission Structure
define('QPB_FIRST_THREE', 7.5); // Quick Pathfinder Bonus for first 3
define('QPB_SUBSEQUENT', 10); // QPB for subsequent sets
define('TSC_GENERATIONS', [10, 5, 3, 2, 1, 1, 1, 1, 1, 1]); // 10 generation percentages
define('TLI_POOL_PERCENTAGE', 10); // Team Leadership Incentive pool - 10% of Total TeamPV
define('MARKETPLACE_FEE', 5); // Z2B marketplace fee percentage

// Coach Manlaw Configuration
define('AI_COACH_PERSONALITIES', [
    'humor' => 10,           // Engaging & motivational style
    'emotional' => 20,       // People-centered principles
    'leadership' => 35,      // Faith-based leadership
    'strategy' => 35         // Results-focused tactics
]);

// TLI Recognition Levels
// Updated: January 2026 - New achievement-based progression system
$TLI_LEVELS = [
    [
        'name' => 'Ignite Pathfinder 🔥',
        'level' => 1,
        'pv' => 50,
        'reward' => 600,
        'reward_type' => 'cash',
        'required_invites' => 2,
        'required_invite_level' => 'active', // 2 personally invited must be active
        'min_tier' => null,
        'team_silver_percentage' => 0
    ],
    [
        'name' => 'Guardian of Growth 🌱',
        'level' => 2,
        'pv' => 150,
        'reward' => 1500,
        'reward_type' => 'cash',
        'required_invites' => 2,
        'required_invite_level' => 1, // 2 must be Ignite Pathfinder
        'min_tier' => null,
        'team_silver_percentage' => 0
    ],
    [
        'name' => 'Cash Catalyst 💰',
        'level' => 3,
        'pv' => 300,
        'reward' => 3000,
        'reward_type' => 'cash',
        'required_invites' => 2,
        'required_invite_level' => 2, // 2 must be Guardian of Growth
        'min_tier' => null,
        'team_silver_percentage' => 0
    ],
    [
        'name' => 'Freedom Architect 🏛️',
        'level' => 4,
        'pv' => 1500,
        'reward' => 15000,
        'reward_type' => 'cash',
        'required_invites' => 2,
        'required_invite_level' => 3, // 2 must be Cash Catalyst
        'min_tier' => null,
        'team_silver_percentage' => 0
    ],
    [
        'name' => 'Lifestyle Ambassador ✈️',
        'level' => 5,
        'pv' => 3000,
        'reward' => 30000,
        'reward_type' => 'business_holiday',
        'required_invites' => 2,
        'required_invite_level' => 4, // 2 must be Freedom Architect
        'min_tier' => 'SLB', // Must be Silver Legacy or above
        'team_silver_percentage' => 0
    ],
    [
        'name' => 'Mama I Made It 🚗',
        'level' => 6,
        'pv' => 15000,
        'reward' => 150000,
        'reward_type' => 'car_incentive',
        'required_invites' => 3,
        'required_invite_level' => 5, // 3 must be Lifestyle Ambassador
        'min_tier' => 'SLB', // Must be Silver Legacy or above
        'team_silver_percentage' => 10 // 10% Team must be Silver Legacy or above
    ],
    [
        'name' => 'Estate Pioneer 🏠',
        'level' => 7,
        'pv' => 40000,
        'reward' => 375000,
        'reward_type' => 'luxury_car_incentive',
        'required_invites' => 3,
        'required_invite_level' => 6, // 3 must be Mama I Made It
        'min_tier' => 'SLB', // Must be Silver Legacy or above
        'team_silver_percentage' => 15 // 15% Team must be Silver Legacy or above
    ],
    [
        'name' => 'Capital Visionary 💼',
        'level' => 8,
        'pv' => 80000,
        'reward' => 600000,
        'reward_type' => 'house_incentive',
        'required_invites' => 3,
        'required_invite_level' => 7, // 3 must be Estate Pioneer
        'min_tier' => 'SLB', // Must be Silver Legacy or above
        'team_silver_percentage' => 20 // 20% Team must be Silver Legacy or above
    ],
    [
        'name' => 'Mega Estate Builder 🏰',
        'level' => 9,
        'pv' => 100000,
        'reward' => 750000,
        'reward_type' => 'second_house_incentive',
        'required_invites' => 3,
        'required_invite_level' => 8, // 3 must be Capital Visionary
        'min_tier' => 'SLB', // Must be Silver Legacy or above
        'team_silver_percentage' => 30 // 30% Team must be Silver Legacy or above
    ],
    [
        'name' => 'Titan Capitalist 💎',
        'level' => 10,
        'pv' => 200000,
        'reward' => 1500000,
        'reward_type' => 'dream_business_capital',
        'required_invites' => 3,
        'required_invite_level' => 9, // 3 must be Mega Estate Builder
        'min_tier' => 'SLB', // Must be Silver Legacy or above
        'team_silver_percentage' => 30 // 30% Team must be Silver Legacy or above
    ]
];

// TLI Tier Eligibility - Maximum level each tier can achieve
// Levels 1-4: All tiers eligible
// Levels 5-10: Silver Legacy or above required
define('TLI_TIER_MAX_LEVELS', [
    'FAM' => 4,  // Family - Up to Freedom Architect
    'BLB' => 4,  // Bronze - Up to Freedom Architect
    'CLB' => 4,  // Copper - Up to Freedom Architect
    'SLB' => 10, // Silver - All levels (Titan Capitalist)
    'GLB' => 10, // Gold - All levels (Titan Capitalist)
    'PLB' => 10, // Platinum - All levels (Titan Capitalist)
    'DLB' => 10  // Diamond - All levels (Titan Capitalist)
]);

// File Upload Settings
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 10485760); // 10MB
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
define('ALLOWED_DOC_TYPES', ['pdf', 'doc', 'docx', 'xls', 'xlsx']);

// Email Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'noreply@z2blegacybuilders.co.za');
define('SMTP_PASS', ''); // Add password
define('SMTP_FROM_NAME', 'Z2B Legacy Builders');
define('SMTP_FROM_EMAIL', 'noreply@z2blegacybuilders.co.za');

// Admin Credentials (Temporary - change after first login)
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', '$2y$10$' . password_hash('Admin123', PASSWORD_DEFAULT));

// Feature Flags
define('ENABLE_AI_COACH', true);
define('ENABLE_MARKETPLACE', true);
define('ENABLE_VIDEO_CREATOR', false); // Coming soon
define('ENABLE_RECRUITING_FUNNEL', true);
define('ENABLE_NOTIFICATIONS', true);
define('MAINTENANCE_MODE', false);

// API Rate Limiting
define('API_RATE_LIMIT', 100); // Requests per minute
define('API_RATE_WINDOW', 60); // Window in seconds

// Cache Settings
define('CACHE_ENABLED', true);
define('CACHE_TTL', 3600); // 1 hour default TTL

// Set timezone
date_default_timezone_set(TIMEZONE);

// Error reporting
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Session configuration
ini_set('session.name', SESSION_NAME);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', APP_ENV === 'production' ? 1 : 0);
ini_set('session.cookie_samesite', 'Strict');