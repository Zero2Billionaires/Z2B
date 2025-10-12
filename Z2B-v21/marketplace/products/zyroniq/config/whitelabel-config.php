<?php
/**
 * ZYRONIQ - The Futuristic Pay Intelligence Engine
 * White Label Configuration File
 *
 * This file contains all customizable settings for white-label deployment
 * Licensees can modify these settings to match their brand identity
 */

// ==================== BRAND IDENTITY ====================

$ZYRONIQ_CONFIG = [
    'brand' => [
        'app_name' => 'Zyroniq',
        'company_name' => 'Z2B Legacy Builders',
        'tagline' => 'Intelligence that Calculates Your Legacy',
        'logo_url' => '../assets/logo.png',
        'favicon_url' => '../assets/favicon.ico',
        'support_email' => 'support@zyroniq.com',
        'support_phone' => '+27 XX XXX XXXX',
        'website_url' => 'https://zyroniq.com',
        'app_version' => '1.0.0',
        'launch_date' => '2026-01-04'
    ],

    // ==================== DESIGN SYSTEM ====================

    'design' => [
        'primary_color' => '#00FFF0',      // Electric Cyan
        'secondary_color' => '#0C0C1C',    // Deep Space Black
        'accent_color' => '#6C63FF',       // Quantum Purple
        'neon_silver' => '#C0C0C0',        // Neon Silver
        'luminous_blue' => '#3AEFFF',      // Luminous Blue
        'success_color' => '#00FF88',
        'warning_color' => '#FFB800',
        'danger_color' => '#FF3366',
        'primary_font' => 'Orbitron',      // Futuristic font
        'secondary_font' => 'Inter',       // Readable font
        'dark_mode' => true,               // Default dark theme
        'animations_enabled' => true
    ],

    // ==================== MLM COMMISSION STRUCTURE ====================

    'commissions' => [
        // Individual Sales Profit - Direct commission percentages by tier
        'isp' => [
            'tier_1' => 25,  // Tier 1 earns 25% ISP
            'tier_2' => 28,
            'tier_3' => 30,
            'tier_4' => 35,
            'tier_5' => 40,
            'tier_6' => 50
        ],

        // Quick Pathfinder Bonus
        'qpb' => [
            'first_three' => 7.5,   // First 3 recruits
            'subsequent' => 10      // Subsequent recruits
        ],

        // Team Sales Commission - Generation percentages
        'tsc_generations' => [10, 5, 3, 2, 1, 1, 1, 1, 1, 1],  // 10 generations

        // Team Performance Bonus
        'tpb_percentage' => 5,  // 5% of team volume

        // Team Leadership Incentive
        'tli_pool_percentage' => 10,  // 10% of total TeamPV

        // Marketplace Fee
        'marketplace_fee' => 5  // 5% transaction fee
    ],

    // ==================== MEMBERSHIP TIERS ====================

    'tiers' => [
        [
            'id' => 1,
            'code' => 'T1',
            'name' => 'Starter',
            'price' => 480,
            'pv' => 100,
            'isp' => 25,
            'tsc_generations' => 3,
            'tpb_required' => 2,
            'tli_max_level' => 0,
            'color' => '#CD7F32',
            'features' => ['Basic Dashboard', '3 TSC Generations', 'ISP 25%']
        ],
        [
            'id' => 2,
            'code' => 'T2',
            'name' => 'Builder',
            'price' => 980,
            'pv' => 200,
            'isp' => 28,
            'tsc_generations' => 5,
            'tpb_required' => 3,
            'tli_max_level' => 0,
            'color' => '#B87333',
            'features' => ['Advanced Dashboard', '5 TSC Generations', 'ISP 28%']
        ],
        [
            'id' => 3,
            'code' => 'T3',
            'name' => 'Professional',
            'price' => 1480,
            'pv' => 300,
            'isp' => 30,
            'tsc_generations' => 7,
            'tpb_required' => 4,
            'tli_max_level' => 6,
            'color' => '#C0C0C0',
            'features' => ['Pro Dashboard', '7 TSC Generations', 'TLI Access L1-L6']
        ],
        [
            'id' => 4,
            'code' => 'T4',
            'name' => 'Executive',
            'price' => 2980,
            'pv' => 600,
            'isp' => 35,
            'tsc_generations' => 9,
            'tpb_required' => 6,
            'tli_max_level' => 8,
            'color' => '#FFD700',
            'features' => ['Executive Suite', '9 TSC Generations', 'TLI Access L1-L8']
        ],
        [
            'id' => 5,
            'code' => 'T5',
            'name' => 'Elite',
            'price' => 4980,
            'pv' => 1000,
            'isp' => 40,
            'tsc_generations' => 10,
            'tpb_required' => 8,
            'tli_max_level' => 10,
            'color' => '#E5E4E2',
            'features' => ['Elite Dashboard', '10 TSC Generations', 'Full TLI Access']
        ],
        [
            'id' => 6,
            'code' => 'T6',
            'name' => 'Presidential',
            'price' => 5980,
            'pv' => 1200,
            'isp' => 50,
            'tsc_generations' => 10,
            'tpb_required' => 9,
            'tli_max_level' => 10,
            'color' => '#B9F2FF',
            'features' => ['Presidential Suite', '10 TSC Generations', 'Full TLI + Bonuses']
        ]
    ],

    // ==================== TLI RECOGNITION LEVELS ====================

    'tli_levels' => [
        ['level' => 1, 'name' => 'Bronze Achiever', 'monthly_team_pv' => 500, 'reward' => 2500, 'leader_requirement' => 0],
        ['level' => 2, 'name' => 'Silver Performer', 'monthly_team_pv' => 1000, 'reward' => 7500, 'leader_requirement' => 0],
        ['level' => 3, 'name' => 'Gold Leader', 'monthly_team_pv' => 2000, 'reward' => 20000, 'leader_requirement' => 0],
        ['level' => 4, 'name' => 'Platinum Executive', 'monthly_team_pv' => 5000, 'reward' => 62500, 'leader_requirement' => 2],
        ['level' => 5, 'name' => 'Diamond Director', 'monthly_team_pv' => 10000, 'reward' => 150000, 'leader_requirement' => 2],
        ['level' => 6, 'name' => 'Ruby Ambassador', 'monthly_team_pv' => 20000, 'reward' => 350000, 'leader_requirement' => 2],
        ['level' => 7, 'name' => 'Emerald Elite', 'monthly_team_pv' => 50000, 'reward' => 1000000, 'leader_requirement' => 2],
        ['level' => 8, 'name' => 'Sapphire Master', 'monthly_team_pv' => 100000, 'reward' => 2250000, 'leader_requirement' => 2],
        ['level' => 9, 'name' => 'Crown Royal', 'monthly_team_pv' => 150000, 'reward' => 3625000, 'leader_requirement' => 3],
        ['level' => 10, 'name' => 'Infinite Legacy', 'monthly_team_pv' => 200000, 'reward' => 5000000, 'leader_requirement' => 3]
    ],

    // ==================== TLI REQUIREMENTS ====================

    'tli_requirements' => [
        'monthly_pv_required' => 600,
        'consecutive_months' => 3,
        'tier_team_composition' => [
            'T3' => 0,   // Professional - no minimum
            'T4' => 20,  // Executive - 20% of team must be T3+
            'T5' => 40   // Elite - 40% of team must be T3+
        ]
    ],

    // ==================== PAYMENT SETTINGS ====================

    'payments' => [
        'currency' => 'ZAR',
        'currency_symbol' => 'R',
        'payment_methods' => ['EFT', 'Card', 'Crypto', 'PayPal'],
        'payout_schedule' => 'monthly',  // monthly, weekly, bi-weekly
        'minimum_payout' => 100,
        'payout_day' => 5  // Day of month for payouts
    ],

    // ==================== SYSTEM SETTINGS ====================

    'system' => [
        'timezone' => 'Africa/Johannesburg',
        'date_format' => 'Y-m-d',
        'time_format' => 'H:i:s',
        'language' => 'en',
        'maintenance_mode' => false,
        'debug_mode' => false,
        'api_enabled' => true,
        'api_rate_limit' => 100,  // requests per minute
        'session_timeout' => 3600  // 1 hour
    ],

    // ==================== FEATURES ====================

    'features' => [
        'genealogy_tree' => true,
        'real_time_earnings' => true,
        'performance_analytics' => true,
        'team_leaderboard' => true,
        'achievement_badges' => true,
        'email_notifications' => true,
        'sms_notifications' => false,
        'mobile_app' => false,
        'marketplace' => true,
        'training_center' => true,
        'replicated_sites' => true
    ],

    // ==================== LICENSE INFORMATION ====================

    'license' => [
        'type' => 'white-label',  // white-label, franchise, single-company
        'license_key' => '',
        'licensee_name' => '',
        'licensee_email' => '',
        'activation_date' => '',
        'expiry_date' => '',
        'max_members' => 'unlimited',  // unlimited or integer
        'domains_allowed' => ['*']  // ['domain1.com', 'domain2.com'] or ['*'] for unlimited
    ]
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get configuration value by dot notation
 * Example: getConfig('brand.app_name') returns 'Zyroniq'
 */
function getZyroniqConfig($key, $default = null) {
    global $ZYRONIQ_CONFIG;

    $keys = explode('.', $key);
    $value = $ZYRONIQ_CONFIG;

    foreach ($keys as $k) {
        if (!isset($value[$k])) {
            return $default;
        }
        $value = $value[$k];
    }

    return $value;
}

/**
 * Update configuration value
 */
function updateZyroniqConfig($key, $value) {
    global $ZYRONIQ_CONFIG;

    $keys = explode('.', $key);
    $config = &$ZYRONIQ_CONFIG;

    foreach ($keys as $k) {
        if (!isset($config[$k])) {
            $config[$k] = [];
        }
        $config = &$config[$k];
    }

    $config = $value;

    // Save to file
    return saveZyroniqConfig();
}

/**
 * Save configuration to file
 */
function saveZyroniqConfig() {
    global $ZYRONIQ_CONFIG;

    $content = "<?php\n\n";
    $content .= "/**\n";
    $content .= " * ZYRONIQ - White Label Configuration\n";
    $content .= " * Auto-generated on " . date('Y-m-d H:i:s') . "\n";
    $content .= " */\n\n";
    $content .= "\$ZYRONIQ_CONFIG = " . var_export($ZYRONIQ_CONFIG, true) . ";\n";

    return file_put_contents(__FILE__, $content);
}
