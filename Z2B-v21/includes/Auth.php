<?php
/**
 * Z2B Legacy Builders - Authentication System
 * Handles member and admin authentication with security features
 */

require_once __DIR__ . '/Database.php';

class Auth {
    private $db;
    private $sessionTimeout = 3600; // 1 hour
    private $maxLoginAttempts = 5;
    private $lockoutTime = 900; // 15 minutes

    public function __construct() {
        $this->db = Database::getInstance();

        // Start session if not started
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        // Check session timeout
        if (isset($_SESSION['last_activity']) &&
            (time() - $_SESSION['last_activity'] > $this->sessionTimeout)) {
            $this->logout();
        }
        $_SESSION['last_activity'] = time();
    }

    /**
     * Member login
     */
    public function login($username, $password) {
        // Check rate limiting
        if (!$this->checkLoginAttempts($username)) {
            return [
                'success' => false,
                'message' => 'Account temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.'
            ];
        }

        // Validate input
        if (empty($username) || empty($password)) {
            return [
                'success' => false,
                'message' => 'Username and password are required.'
            ];
        }

        // Get member from database
        $sql = "SELECT m.*, t.name as tier_name, t.monthly_cost, t.benefits,
                       t.commission_percentage, t.color_code
                FROM members m
                LEFT JOIN tiers t ON m.tier_id = t.id
                WHERE m.username = :username OR m.email = :username
                AND m.is_active = 1";

        $member = $this->db->fetchOne($sql, ['username' => $username]);

        if (!$member || !password_verify($password, $member['password_hash'])) {
            $this->recordFailedAttempt($username);
            return [
                'success' => false,
                'message' => 'Invalid credentials.'
            ];
        }

        // Clear login attempts
        $this->clearLoginAttempts($username);

        // Update last login
        $this->db->update('members',
            ['last_login' => date('Y-m-d H:i:s')],
            'id = :id',
            ['id' => $member['id']]
        );

        // Set session
        $_SESSION['member_id'] = $member['id'];
        $_SESSION['member_data'] = [
            'id' => $member['id'],
            'username' => $member['username'],
            'email' => $member['email'],
            'first_name' => $member['first_name'],
            'last_name' => $member['last_name'],
            'tier_id' => $member['tier_id'],
            'tier_name' => $member['tier_name'],
            'tier_color' => $member['color_code'],
            'referral_code' => $member['referral_code'],
            'is_founder' => $member['is_founder_member'],
            'profile_image' => $member['profile_image']
        ];
        $_SESSION['user_type'] = 'member';

        // Generate CSRF token
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

        // Log activity
        $this->logActivity($member['id'], 'member', 'login', 'Successful login');

        return [
            'success' => true,
            'message' => 'Login successful.',
            'redirect' => '/dashboard'
        ];
    }

    /**
     * Admin login (hidden)
     */
    public function adminLogin($username, $password) {
        // Check if it's from the hidden admin link
        if (!isset($_SESSION['admin_access_attempt'])) {
            return [
                'success' => false,
                'message' => 'Access denied.'
            ];
        }

        // Check rate limiting
        if (!$this->checkLoginAttempts($username, 'admin')) {
            return [
                'success' => false,
                'message' => 'Too many failed attempts. Try again later.'
            ];
        }

        // Check admin credentials
        $sql = "SELECT * FROM admin_users
                WHERE username = :username
                AND is_active = 1";

        $admin = $this->db->fetchOne($sql, ['username' => $username]);

        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            $this->recordFailedAttempt($username, 'admin');
            return [
                'success' => false,
                'message' => 'Invalid admin credentials.'
            ];
        }

        // Clear login attempts
        $this->clearLoginAttempts($username, 'admin');

        // Update last login
        $this->db->update('admin_users',
            ['last_login' => date('Y-m-d H:i:s')],
            'id = :id',
            ['id' => $admin['id']]
        );

        // Set admin session
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_data'] = [
            'id' => $admin['id'],
            'username' => $admin['username'],
            'email' => $admin['email'],
            'full_name' => $admin['full_name'],
            'role' => $admin['role']
        ];
        $_SESSION['user_type'] = 'admin';
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

        // Remove admin access attempt flag
        unset($_SESSION['admin_access_attempt']);

        // Log admin activity
        $this->logActivity($admin['id'], 'admin', 'login', 'Admin login successful');

        return [
            'success' => true,
            'message' => 'Admin login successful.',
            'redirect' => '/admin/dashboard'
        ];
    }

    /**
     * Register new member
     */
    public function register($data) {
        try {
            // Validate required fields
            $required = ['username', 'email', 'password', 'first_name', 'last_name', 'tier'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    return [
                        'success' => false,
                        'message' => ucfirst($field) . ' is required.'
                    ];
                }
            }

            // Check if username exists
            if ($this->db->exists('members', 'username = :username', ['username' => $data['username']])) {
                return [
                    'success' => false,
                    'message' => 'Username already exists.'
                ];
            }

            // Check if email exists
            if ($this->db->exists('members', 'email = :email', ['email' => $data['email']])) {
                return [
                    'success' => false,
                    'message' => 'Email already registered.'
                ];
            }

            // Validate email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                return [
                    'success' => false,
                    'message' => 'Invalid email address.'
                ];
            }

            // Validate password strength
            if (strlen($data['password']) < 8) {
                return [
                    'success' => false,
                    'message' => 'Password must be at least 8 characters.'
                ];
            }

            // Begin transaction
            $this->db->beginTransaction();

            // Generate referral code
            $referralCode = $this->generateUniqueReferralCode();

            // Get sponsor ID if provided
            $sponsorId = null;
            if (!empty($data['sponsor_code'])) {
                $sponsor = $this->db->fetchOne(
                    "SELECT id FROM members WHERE referral_code = :code",
                    ['code' => $data['sponsor_code']]
                );
                if ($sponsor) {
                    $sponsorId = $sponsor['id'];
                }
            }

            // Get tier ID
            global $TIER_CONFIG;
            $tierMap = ['BLB' => 1, 'CLB' => 2, 'SLB' => 3, 'GLB' => 4, 'PLB' => 5, 'DLB' => 6];
            $tierId = $tierMap[$data['tier']] ?? 1;

            // Insert member
            $memberId = $this->db->insert('members', [
                'username' => $data['username'],
                'email' => $data['email'],
                'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'phone' => $data['phone'] ?? null,
                'whatsapp_number' => $data['whatsapp'] ?? null,
                'tier_id' => $tierId,
                'sponsor_id' => $sponsorId,
                'referral_code' => $referralCode,
                'country' => $data['country'] ?? 'South Africa',
                'city' => $data['city'] ?? null,
                'is_active' => 1
            ]);

            // Create referral relationship
            if ($sponsorId) {
                $this->db->insert('referrals', [
                    'sponsor_id' => $sponsorId,
                    'member_id' => $memberId,
                    'level' => 1,
                    'placement_type' => 'manual'
                ]);

                // Send notification to sponsor
                $this->sendNotification($sponsorId, 'new_referral',
                    'New Team Member!',
                    $data['first_name'] . ' ' . $data['last_name'] . ' has joined your team!'
                );
            }

            // Initialize AI credits based on tier
            $aiCredits = $TIER_CONFIG[$data['tier']]['ai_credits'];
            $this->db->insert('ai_credits_balance', [
                'member_id' => $memberId,
                'credits_balance' => $aiCredits,
                'total_earned' => $aiCredits,
                'last_refuel' => date('Y-m-d H:i:s')
            ]);

            // Create welcome notification
            $this->sendNotification($memberId, 'welcome',
                'Welcome to Z2B Legacy Builders!',
                'Your journey to financial freedom starts now. Check out your dashboard to get started.'
            );

            // Commit transaction
            $this->db->commit();

            // Log registration
            $this->logActivity($memberId, 'member', 'registration', 'New member registration');

            return [
                'success' => true,
                'message' => 'Registration successful! Please login.',
                'member_id' => $memberId,
                'referral_code' => $referralCode
            ];

        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Registration error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Registration failed. Please try again.'
            ];
        }
    }

    /**
     * Logout
     */
    public function logout() {
        $userId = $_SESSION['member_id'] ?? $_SESSION['admin_id'] ?? null;
        $userType = $_SESSION['user_type'] ?? 'guest';

        if ($userId) {
            $this->logActivity($userId, $userType, 'logout', 'User logged out');
        }

        // Destroy session
        session_destroy();
        $_SESSION = [];

        return [
            'success' => true,
            'message' => 'Logged out successfully.',
            'redirect' => '/'
        ];
    }

    /**
     * Check if user is logged in
     */
    public function isLoggedIn() {
        return isset($_SESSION['member_id']) || isset($_SESSION['admin_id']);
    }

    /**
     * Check if admin is logged in
     */
    public function isAdmin() {
        return isset($_SESSION['admin_id']) && $_SESSION['user_type'] === 'admin';
    }

    /**
     * Get current user data
     */
    public function getCurrentUser() {
        if (isset($_SESSION['member_data'])) {
            return $_SESSION['member_data'];
        }
        if (isset($_SESSION['admin_data'])) {
            return $_SESSION['admin_data'];
        }
        return null;
    }

    /**
     * Generate unique referral code
     */
    private function generateUniqueReferralCode() {
        do {
            $code = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
        } while ($this->db->exists('members', 'referral_code = :code', ['code' => $code]));

        return $code;
    }

    /**
     * Check login attempts
     */
    private function checkLoginAttempts($identifier, $type = 'member') {
        $sql = "SELECT COUNT(*) as attempts FROM login_attempts
                WHERE identifier = :identifier
                AND type = :type
                AND attempted_at > DATE_SUB(NOW(), INTERVAL :lockout SECOND)";

        $result = $this->db->fetchOne($sql, [
            'identifier' => $identifier,
            'type' => $type,
            'lockout' => $this->lockoutTime
        ]);

        return $result['attempts'] < $this->maxLoginAttempts;
    }

    /**
     * Record failed login attempt
     */
    private function recordFailedAttempt($identifier, $type = 'member') {
        $this->db->insert('login_attempts', [
            'identifier' => $identifier,
            'type' => $type,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'attempted_at' => date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Clear login attempts
     */
    private function clearLoginAttempts($identifier, $type = 'member') {
        $this->db->delete('login_attempts',
            'identifier = :identifier AND type = :type',
            ['identifier' => $identifier, 'type' => $type]
        );
    }

    /**
     * Log activity
     */
    private function logActivity($userId, $userType, $action, $description) {
        $this->db->insert('activity_logs', [
            'user_id' => $userId,
            'user_type' => $userType,
            'action' => $action,
            'description' => $description,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    }

    /**
     * Send notification
     */
    private function sendNotification($memberId, $type, $title, $message) {
        $this->db->insert('notifications', [
            'member_id' => $memberId,
            'type' => $type,
            'title' => $title,
            'message' => $message
        ]);
    }
}