<?php
/**
 * Process Scheduled Commission Deductions (CRON Job)
 * Runs hourly or when new commissions are added
 * Automatically deducts percentage from new commissions for scheduled payments
 */

// Prevent web access - only allow CLI or authorized cron
if (php_sapi_name() !== 'cli' && !isset($_SERVER['HTTP_X_CRON_SECRET'])) {
    http_response_code(403);
    die('Access forbidden. This script can only be run via cron.');
}

// Database connection
require_once __DIR__ . '/../../config/database.php';

// Logging
$logFile = __DIR__ . '/../../logs/scheduled-deductions.log';
function logMessage($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $logDir = dirname($logFile);
    if (!file_exists($logDir)) {
        mkdir($logDir, 0755, true);
    }
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
    echo "[$timestamp] $message\n";
}

logMessage("=== Starting Scheduled Deductions Processing ===");

try {
    // Get all active scheduled payments
    $stmt = $pdo->query("
        SELECT
            sp.id,
            sp.member_id,
            sp.tier_upgrade_id,
            sp.total_amount,
            sp.deduction_percentage,
            sp.amount_paid,
            sp.amount_remaining
        FROM scheduled_commission_payments sp
        WHERE sp.status = 'active'
    ");
    $scheduledPayments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    logMessage("Found " . count($scheduledPayments) . " active scheduled payments");

    if (empty($scheduledPayments)) {
        logMessage("No active scheduled payments to process");
        exit(0);
    }

    $totalDeductions = 0;
    $totalCommissionsProcessed = 0;

    foreach ($scheduledPayments as $payment) {
        $memberId = $payment['member_id'];
        $scheduledPaymentId = $payment['id'];
        $deductionPercentage = floatval($payment['deduction_percentage']);
        $amountRemaining = floatval($payment['amount_remaining']);

        logMessage("Processing member ID $memberId, scheduled payment ID $scheduledPaymentId");

        // Get new transactions since last deduction
        $stmt = $pdo->prepare("
            SELECT t.id, t.transaction_type, t.amount, t.created_at
            FROM transactions t
            LEFT JOIN commission_deduction_log cdl ON t.id = cdl.commission_transaction_id
            WHERE t.member_id = ?
                AND t.status = 'completed'
                AND cdl.id IS NULL
            ORDER BY t.created_at ASC
        ");
        $stmt->execute([$memberId]);
        $newTransactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($newTransactions)) {
            logMessage("No new transactions for member ID $memberId");
            continue;
        }

        logMessage("Found " . count($newTransactions) . " new transactions for member ID $memberId");

        // Start transaction for this member
        $pdo->beginTransaction();

        try {
            foreach ($newTransactions as $transaction) {
                $transactionId = $transaction['id'];
                $originalAmount = floatval($transaction['amount']);

                // Calculate deduction
                $deductionAmount = $originalAmount * ($deductionPercentage / 100);
                $amountToUser = $originalAmount - $deductionAmount;

                // Don't deduct more than remaining amount
                if ($deductionAmount > $amountRemaining) {
                    $deductionAmount = $amountRemaining;
                    $amountToUser = $originalAmount - $deductionAmount;
                }

                logMessage("Transaction ID $transactionId: R$originalAmount → Deduct R$deductionAmount → Pay R$amountToUser");

                // Insert deduction log
                $stmt = $pdo->prepare("
                    INSERT INTO commission_deduction_log (
                        scheduled_payment_id,
                        member_id,
                        commission_transaction_id,
                        commission_type,
                        original_commission_amount,
                        deduction_percentage,
                        deduction_amount,
                        amount_paid_to_user,
                        deducted_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ");
                $stmt->execute([
                    $scheduledPaymentId,
                    $memberId,
                    $transactionId,
                    $transaction['transaction_type'],
                    $originalAmount,
                    $deductionPercentage,
                    $deductionAmount,
                    $amountToUser
                ]);

                // Update scheduled payment amounts
                $stmt = $pdo->prepare("
                    UPDATE scheduled_commission_payments
                    SET amount_paid = amount_paid + ?,
                        amount_remaining = amount_remaining - ?
                    WHERE id = ?
                ");
                $stmt->execute([$deductionAmount, $deductionAmount, $scheduledPaymentId]);

                // Update commission balance (add only the net amount to user)
                $stmt = $pdo->prepare("
                    UPDATE commission_balances
                    SET total_earned = total_earned + ?
                    WHERE member_id = ?
                ");
                $stmt->execute([$amountToUser, $memberId]);

                $amountRemaining -= $deductionAmount;
                $totalDeductions += $deductionAmount;
                $totalCommissionsProcessed++;

                // Check if fully paid
                if ($amountRemaining <= 0.01) { // Small threshold for floating point
                    logMessage("Scheduled payment ID $scheduledPaymentId COMPLETED!");

                    // Mark as completed
                    $stmt = $pdo->prepare("
                        UPDATE scheduled_commission_payments
                        SET status = 'completed',
                            completed_at = NOW()
                        WHERE id = ?
                    ");
                    $stmt->execute([$scheduledPaymentId]);

                    // Mark tier upgrade as completed
                    $stmt = $pdo->prepare("
                        UPDATE tier_upgrades
                        SET payment_status = 'completed',
                            paid_at = NOW()
                        WHERE id = ?
                    ");
                    $stmt->execute([$payment['tier_upgrade_id']]);

                    // TODO: Send notification to user about completion

                    break; // Stop processing more transactions for this payment
                }
            }

            $pdo->commit();
            logMessage("Successfully processed member ID $memberId");

        } catch (Exception $e) {
            $pdo->rollBack();
            logMessage("ERROR processing member ID $memberId: " . $e->getMessage());
        }
    }

    logMessage("=== Processing Complete ===");
    logMessage("Total deductions: R$totalDeductions");
    logMessage("Total commissions processed: $totalCommissionsProcessed");

} catch (PDOException $e) {
    logMessage("CRITICAL ERROR: " . $e->getMessage());
    exit(1);
}

exit(0);
