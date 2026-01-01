-- =====================================================
-- Z2B Tier Upgrade Payment System - Database Migration
-- Created: 2025-12-26
-- Purpose: Add commission balance tracking and multiple payment methods for tier upgrades
-- =====================================================

-- Table 1: Commission Balances
-- Tracks each member's commission earnings, withdrawals, and usage for upgrades
-- Note: member_id is VARCHAR to support both MongoDB ObjectIds and MySQL integers
CREATE TABLE IF NOT EXISTS commission_balances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id VARCHAR(50) NOT NULL UNIQUE,
    total_earned DECIMAL(10,2) DEFAULT 0.00,
    total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
    total_used_for_upgrades DECIMAL(10,2) DEFAULT 0.00,
    available_balance DECIMAL(10,2) GENERATED ALWAYS AS (total_earned - total_withdrawn - total_used_for_upgrades) STORED,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_member_id (member_id),
    INDEX idx_available_balance (available_balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Commission balance tracking compatible with MongoDB user IDs';

-- Table 2: Tier Upgrades
-- Records all tier upgrade transactions with payment details
CREATE TABLE IF NOT EXISTS tier_upgrades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id VARCHAR(50) NOT NULL,
    from_tier VARCHAR(20) NOT NULL,
    to_tier VARCHAR(20) NOT NULL,
    upgrade_cost DECIMAL(10,2) NOT NULL,
    payment_method ENUM('online', 'eft', 'crypto', 'cash', 'commission_balance', 'scheduled_commission', 'partial_commission') NOT NULL,
    commission_amount_used DECIMAL(10,2) DEFAULT 0.00,
    online_payment_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_reference VARCHAR(255),
    yoco_checkout_id VARCHAR(255),
    proof_of_payment_url VARCHAR(255),
    processed_by_admin INT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    activated_at TIMESTAMP NULL,
    INDEX idx_member_id (member_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_method (payment_method),
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: Scheduled Commission Payments
-- Tracks "buy now, pay later" tier upgrades with automatic commission deductions
CREATE TABLE IF NOT EXISTS scheduled_commission_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id VARCHAR(50) NOT NULL,
    tier_upgrade_id INT NOT NULL,
    from_tier VARCHAR(20) NOT NULL,
    to_tier VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    deduction_percentage DECIMAL(5,2) NOT NULL CHECK (deduction_percentage BETWEEN 1.00 AND 100.00),
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    amount_remaining DECIMAL(10,2) NOT NULL,
    status ENUM('pending_approval', 'active', 'paused', 'completed', 'cancelled') DEFAULT 'active',
    authorized_by_user BOOLEAN DEFAULT TRUE,
    authorization_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    authorization_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (tier_upgrade_id) REFERENCES tier_upgrades(id) ON DELETE CASCADE,
    INDEX idx_member_status (member_id, status),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 4: Commission Deduction Log
-- Detailed log of each commission deduction for scheduled payments
CREATE TABLE IF NOT EXISTS commission_deduction_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    scheduled_payment_id INT NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    commission_transaction_id INT NOT NULL,
    commission_type ENUM('ISP', 'TSC', 'QPB', 'TPB', 'TLI', 'marketplace', 'refuel'),
    original_commission_amount DECIMAL(10,2) NOT NULL,
    deduction_percentage DECIMAL(5,2) NOT NULL,
    deduction_amount DECIMAL(10,2) NOT NULL,
    amount_paid_to_user DECIMAL(10,2) NOT NULL,
    deducted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scheduled_payment_id) REFERENCES scheduled_commission_payments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_transaction_deduction (commission_transaction_id),
    INDEX idx_scheduled_payment_id (scheduled_payment_id),
    INDEX idx_member_id (member_id),
    INDEX idx_deducted_at (deducted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 5: Manual Payment Queue
-- Queue for admin verification of EFT/Cash deposit payments
CREATE TABLE IF NOT EXISTS manual_payment_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tier_upgrade_id INT NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    payment_method ENUM('eft', 'cash') NOT NULL,
    submitted_reference VARCHAR(100),
    submitted_amount DECIMAL(10,2) NOT NULL,
    proof_of_payment_url VARCHAR(255),
    user_notes TEXT,
    status ENUM('pending', 'under_review', 'verified', 'rejected') DEFAULT 'pending',
    verified_by_admin INT NULL,
    verified_at TIMESTAMP NULL,
    rejection_reason TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tier_upgrade_id) REFERENCES tier_upgrades(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_member_id (member_id),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Initial Data Population (Optional - commented out)
-- NOTE: This section assumes a MySQL members table with integer IDs
-- If using MongoDB for users, commission balances will be created on-demand via API
-- =====================================================

/*
-- Uncomment if you have a MySQL members table to populate initial balances:

INSERT INTO commission_balances (member_id, total_earned, total_withdrawn, total_used_for_upgrades)
SELECT
    m.id,
    COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_withdrawn,
    0 as total_used_for_upgrades
FROM members m
LEFT JOIN transactions t ON m.id = t.member_id
LEFT JOIN payouts p ON m.id = p.member_id
GROUP BY m.id
ON DUPLICATE KEY UPDATE
    total_earned = VALUES(total_earned),
    total_withdrawn = VALUES(total_withdrawn);
*/

-- =====================================================
-- Success Message
-- =====================================================
SELECT 'Tier Upgrade Payment System tables created successfully!' as Status;
SELECT 'Note: member_id columns use VARCHAR(50) to support MongoDB ObjectIds' as Info;
