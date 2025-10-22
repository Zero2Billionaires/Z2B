-- ============================================
-- DIAMOND TIER RESTRICTION - ADDITIONAL TABLES
-- ============================================
-- These tables are required for Diamond tier eligibility validation
-- Run this AFTER running PRODUCTION_SETUP.sql
-- ============================================

-- ============================================
-- USER TIER HISTORY TABLE
-- ============================================
-- Tracks when users upgrade/downgrade tiers
-- Used to calculate Silver+ tenure for Diamond eligibility

CREATE TABLE IF NOT EXISTS user_tier_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tier_code VARCHAR(10) NOT NULL,
  changed_from VARCHAR(10) COMMENT 'Previous tier code',
  changed_to VARCHAR(10) COMMENT 'New tier code',
  price_paid DECIMAL(10,2) COMMENT 'Amount paid for this tier change',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  -- Indexes for performance
  INDEX idx_user_tier (user_id, tier_code),
  INDEX idx_user_id (user_id),
  INDEX idx_created (created_at),
  INDEX idx_tier_code (tier_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks user tier upgrade/downgrade history for Diamond eligibility';

-- ============================================
-- USER TLI ACHIEVEMENTS TABLE
-- ============================================
-- Tracks when users achieve TLI levels
-- Used to verify Level 8 requirement for Diamond tier

CREATE TABLE IF NOT EXISTS user_tli_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  level INT NOT NULL COMMENT 'TLI level (1-10)',
  level_name VARCHAR(100) COMMENT 'e.g., Capital Visionary 💼',
  team_pv_at_achievement INT COMMENT 'Total team PV when achieved',
  reward_amount DECIMAL(10,2) COMMENT 'Reward amount for this level',
  reward_type VARCHAR(50) COMMENT 'cash, car_incentive, house_incentive, etc.',
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  -- Unique constraint: user can only achieve each level once
  UNIQUE KEY unique_user_level (user_id, level),

  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_level (level),
  INDEX idx_achieved (achieved_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks TLI level achievements for Diamond tier eligibility';

-- ============================================
-- AUTOMATIC TIER HISTORY TRIGGER (Optional)
-- ============================================
-- Automatically logs tier changes when users.tier_code is updated
-- This ensures tier history is always captured

DELIMITER $$

CREATE TRIGGER after_user_tier_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  -- Only log if tier_code actually changed
  IF OLD.tier_code != NEW.tier_code THEN
    INSERT INTO user_tier_history (user_id, tier_code, changed_from, changed_to, created_at)
    VALUES (NEW.id, NEW.tier_code, OLD.tier_code, NEW.tier_code, NOW());
  END IF;
END$$

DELIMITER ;

-- ============================================
-- INITIAL TIER HISTORY FOR EXISTING USERS
-- ============================================
-- Backfill tier history for users who already exist
-- This creates a starting point for tenure calculation

INSERT INTO user_tier_history (user_id, tier_code, changed_from, changed_to, created_at)
SELECT
  id,
  tier_code,
  NULL as changed_from,
  tier_code as changed_to,
  created_at
FROM users
WHERE tier_code IS NOT NULL
ON DUPLICATE KEY UPDATE user_id=user_id; -- Prevent duplicates if run multiple times

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables created
SHOW TABLES LIKE 'user_%';

-- Verify trigger created
SHOW TRIGGERS WHERE `Trigger` = 'after_user_tier_update';

-- View tier history structure
DESCRIBE user_tier_history;

-- View TLI achievements structure
DESCRIBE user_tli_achievements;

-- ============================================
-- SAMPLE TEST DATA (for development/testing)
-- ============================================
-- Uncomment to add test data showing how Diamond eligibility works

/*
-- Create test user at Platinum tier (6 months ago)
INSERT INTO users (username, email, password, full_name, tier_code, referral_code, status, created_at)
VALUES ('testuser123', 'test@example.com', '$2y$10$hashedpassword', 'Test User', 'PLB', 'TEST123', 'active', DATE_SUB(NOW(), INTERVAL 6 MONTH));

SET @test_user_id = LAST_INSERT_ID();

-- Add tier history showing they reached Silver 6 months ago
INSERT INTO user_tier_history (user_id, tier_code, changed_from, changed_to, created_at)
VALUES (@test_user_id, 'SLB', 'BLB', 'SLB', DATE_SUB(NOW(), INTERVAL 6 MONTH));

-- Add TLI Level 8 achievement
INSERT INTO user_tli_achievements (user_id, level, level_name, team_pv_at_achievement, reward_amount, reward_type)
VALUES (@test_user_id, 8, 'Capital Visionary 💼', 80000, 600000, 'house_incentive');

-- Now this user should be eligible for Diamond tier!
*/

-- ============================================
-- ADMIN QUERIES - USEFUL FOR MANAGEMENT
-- ============================================

-- Find all Diamond-eligible users
-- (These users meet ALL requirements)
/*
SELECT
  u.id,
  u.username,
  u.email,
  u.tier_code,
  u.created_at,
  MIN(uth.created_at) as silver_plus_since,
  TIMESTAMPDIFF(MONTH, MIN(uth.created_at), NOW()) as silver_plus_months,
  MAX(uta.level) as max_tli_level
FROM users u
LEFT JOIN user_tier_history uth ON u.id = uth.user_id AND uth.tier_code IN ('SLB', 'GLB', 'PLB', 'DLB')
LEFT JOIN user_tli_achievements uta ON u.id = uta.user_id
WHERE u.tier_code IN ('PLB', 'DLB') -- Must be Platinum or Diamond
GROUP BY u.id
HAVING silver_plus_months >= 6 AND max_tli_level >= 8
ORDER BY u.created_at DESC;
*/

-- ============================================
-- DONE!
-- ============================================
-- Diamond tier restriction tables are now ready!
--
-- Next steps:
-- 1. Use TierEligibilityValidator.php to check eligibility
-- 2. Integrate validation into payment flow
-- 3. Log tier changes automatically via trigger
-- 4. Award TLI achievements as users progress
-- ============================================
