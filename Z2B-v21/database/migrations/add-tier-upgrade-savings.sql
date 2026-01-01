-- =====================================================
-- Z2B Smart Savings for Tier Upgrades
-- Created: 2025-12-26
-- Purpose: Allow builders to save from commissions for bigger tier upgrades
-- =====================================================

-- Table: Tier Upgrade Savings Plans
-- Tracks builder's savings progress toward tier upgrades
CREATE TABLE IF NOT EXISTS tier_upgrade_savings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id VARCHAR(50) NOT NULL,
    current_tier VARCHAR(20) NOT NULL,
    target_tier VARCHAR(20) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    amount_saved DECIMAL(10,2) DEFAULT 0.00,
    deduction_percentage DECIMAL(5,2) NOT NULL CHECK (deduction_percentage BETWEEN 30.00 AND 70.00),
    status ENUM('active', 'paused', 'completed', 'cancelled') DEFAULT 'active',
    authorized_by_user BOOLEAN DEFAULT TRUE,
    authorization_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    upgraded_at TIMESTAMP NULL,
    INDEX idx_member_status (member_id, status),
    INDEX idx_status (status),
    UNIQUE KEY unique_active_plan (member_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Smart savings plans for tier upgrades - save first, upgrade later';

-- Table: Savings Deduction Log
-- Tracks each deduction made from commissions toward savings
CREATE TABLE IF NOT EXISTS savings_deduction_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    savings_plan_id INT NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    commission_transaction_id INT NOT NULL,
    commission_type ENUM('ISP', 'TSC', 'QPB', 'TPB', 'TLI', 'marketplace', 'refuel'),
    original_commission_amount DECIMAL(10,2) NOT NULL,
    deduction_percentage DECIMAL(5,2) NOT NULL,
    deduction_amount DECIMAL(10,2) NOT NULL,
    amount_paid_to_user DECIMAL(10,2) NOT NULL,
    deducted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (savings_plan_id) REFERENCES tier_upgrade_savings(id) ON DELETE CASCADE,
    INDEX idx_savings_plan_id (savings_plan_id),
    INDEX idx_member_id (member_id),
    INDEX idx_deducted_at (deducted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Success Message
-- =====================================================
SELECT 'Smart Savings tables created successfully!' as Status;
