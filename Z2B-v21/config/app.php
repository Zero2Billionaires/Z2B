<?php
/**
 * Z2B Legacy Builders Platform - Main Configuration
 * Version: 21
 * Created: 2025-09-30
 */

// Application Settings
define('APP_NAME', 'Z2B Legacy Builders');
define('APP_VERSION', '21.0.0');
define('APP_URL', 'https://z2blegacybuilders.co.za');
define('APP_ENV', 'development'); // Change to 'production' for live
define('DEBUG_MODE', true); // Set to false in production
define('TIMEZONE', 'Africa/Johannesburg');

// Security Settings
define('SESSION_NAME', 'z2b_session');
define('CSRF_TOKEN_NAME', 'z2b_csrf_token');
define('ENCRYPTION_KEY', 'Z2B_32_CHARACTER_SECURE_KEY_HERE'); // Change this!
define('JWT_SECRET', 'Z2B_JWT_SECRET_KEY_CHANGE_THIS'); // Change this!

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
        'price' => 5980,
        'pv' => 1200,
        'isp' => 50,
        'tsc' => 15,
        'tpb' => 9,
        'ai_credits' => 1000,
        'color' => '#B9F2FF'
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
// Updated: January 2026 - TeamPV is MONTHLY requirement, member must maintain for 3 consecutive months
$TLI_LEVELS = [
    ['name' => 'Bronze Achiever', 'level' => 1, 'monthly_team_pv' => 500, 'reward' => 2500, 'leader_requirement' => 0],
    ['name' => 'Silver Performer', 'level' => 2, 'monthly_team_pv' => 1000, 'reward' => 7500, 'leader_requirement' => 0],
    ['name' => 'Gold Leader', 'level' => 3, 'monthly_team_pv' => 2000, 'reward' => 20000, 'leader_requirement' => 0],
    ['name' => 'Platinum Executive', 'level' => 4, 'monthly_team_pv' => 5000, 'reward' => 62500, 'leader_requirement' => 2],
    ['name' => 'Diamond Director', 'level' => 5, 'monthly_team_pv' => 10000, 'reward' => 150000, 'leader_requirement' => 2],
    ['name' => 'Ruby Ambassador', 'level' => 6, 'monthly_team_pv' => 20000, 'reward' => 350000, 'leader_requirement' => 2],
    ['name' => 'Emerald Elite', 'level' => 7, 'monthly_team_pv' => 50000, 'reward' => 1000000, 'leader_requirement' => 2],
    ['name' => 'Sapphire Master', 'level' => 8, 'monthly_team_pv' => 100000, 'reward' => 2250000, 'leader_requirement' => 2],
    ['name' => 'Crown Royal', 'level' => 9, 'monthly_team_pv' => 150000, 'reward' => 3625000, 'leader_requirement' => 3],
    ['name' => 'Infinite Legacy', 'level' => 10, 'monthly_team_pv' => 200000, 'reward' => 5000000, 'leader_requirement' => 3]
];

// TLI Tier Eligibility - Maximum level each tier can achieve
define('TLI_TIER_MAX_LEVELS', [
    'BLB' => 0,  // Bronze - Not eligible
    'CLB' => 0,  // Copper - Not eligible
    'SLB' => 6,  // Silver - Up to Ruby Ambassador
    'GLB' => 8,  // Gold - Up to Sapphire Master
    'PLB' => 10, // Platinum - All levels
    'DLB' => 10  // Diamond - All levels
]);

// TLI Requirements
define('TLI_MONTHLY_PV_REQUIREMENT', 600); // Personal monthly PV required
define('TLI_CONSECUTIVE_MONTHS', 3); // Must maintain for 3 months
define('TLI_SILVER_TEAM_PERCENTAGE', [
    'SLB' => 0,   // Silver - No minimum
    'GLB' => 20,  // Gold - 20% of team must be Silver+
    'PLB' => 40   // Platinum - 40% of team must be Silver+
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