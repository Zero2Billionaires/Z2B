const cron = require('node-cron');
const MavulaAutomationEngine = require('../services/MavulaAutomationEngine');
const MavulaUserSettings = require('../models/MavulaUserSettings');
const MavulaDailyActivity = require('../models/MavulaDailyActivity');
const MavulaAutomationJob = require('../models/MavulaAutomationJob');

console.log('[MAVULA SCHEDULER] Initializing cron jobs...');

// ===================================================================
// EVERY 15 MINUTES: Process Job Queue
// ===================================================================
// Processes pending automation jobs (send messages, generate responses)
// High frequency to ensure timely responses to prospects

cron.schedule('*/15 * * * *', async () => {
    try {
        console.log('[MAVULA SCHEDULER] Running job queue processor...');
        const result = await MavulaAutomationEngine.processJobQueue();
        console.log('[MAVULA SCHEDULER] Job queue processing result:', result);
    } catch (error) {
        console.error('[MAVULA SCHEDULER] Error in job queue processor:', error);
    }
}, {
    timezone: 'Africa/Johannesburg'
});

// ===================================================================
// EVERY HOUR: Check for Follow-up Opportunities
// ===================================================================
// Identifies prospects that need follow-up and schedules jobs

cron.schedule('0 * * * *', async () => {
    try {
        console.log('[MAVULA SCHEDULER] Checking for follow-up opportunities...');

        // Get all active users with automation enabled
        const activeUsers = await MavulaUserSettings.find({
            automationEnabled: true
        });

        let totalJobsScheduled = 0;

        for (const userSettings of activeUsers) {
            const userId = userSettings.userId;

            // Schedule daily jobs for this user
            const result = await MavulaAutomationEngine.scheduleDailyJobs(userId);

            if (result.success) {
                totalJobsScheduled += result.jobsScheduled || 0;
            }
        }

        console.log(`[MAVULA SCHEDULER] Scheduled ${totalJobsScheduled} follow-up jobs across ${activeUsers.length} users`);
    } catch (error) {
        console.error('[MAVULA SCHEDULER] Error checking follow-ups:', error);
    }
}, {
    timezone: 'Africa/Johannesburg'
});

// ===================================================================
// DAILY AT 06:00 SAST: Morning Initialization
// ===================================================================
// Reset daily targets and schedule today's outreach

cron.schedule('0 6 * * *', async () => {
    try {
        console.log('[MAVULA SCHEDULER] Running morning initialization...');

        // Get all active users
        const activeUsers = await MavulaUserSettings.find({
            automationEnabled: true
        });

        for (const userSettings of activeUsers) {
            const userId = userSettings.userId;

            // Create/reset today's activity tracker
            const todayActivity = await MavulaDailyActivity.getTodayActivity(userId);
            console.log(`[MAVULA SCHEDULER] Initialized daily activity for user ${userId}`);

            // Schedule daily jobs
            const result = await MavulaAutomationEngine.scheduleDailyJobs(userId);
            console.log(`[MAVULA SCHEDULER] Scheduled ${result.jobsScheduled || 0} jobs for user ${userId}`);

            // Check targets from yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            const yesterdayActivity = await MavulaDailyActivity.findOne({
                userId,
                date: yesterday
            });

            if (yesterdayActivity) {
                const targetsMet = yesterdayActivity.targetProgress?.overallProgress >= 100;
                console.log(`[MAVULA SCHEDULER] User ${userId} yesterday: ${targetsMet ? 'TARGETS MET ✓' : 'TARGETS MISSED ✗'}`);
            }
        }

        console.log(`[MAVULA SCHEDULER] Morning initialization complete for ${activeUsers.length} users`);
    } catch (error) {
        console.error('[MAVULA SCHEDULER] Error in morning initialization:', error);
    }
}, {
    timezone: 'Africa/Johannesburg'
});

// ===================================================================
// DAILY AT 02:00 SAST: Dormant Prospect Detection
// ===================================================================
// Finds prospects with 7+ days no response and marks them as dormant

cron.schedule('0 2 * * *', async () => {
    try {
        console.log('[MAVULA SCHEDULER] Running dormant prospect detection...');

        // Get all active users
        const activeUsers = await MavulaUserSettings.find({
            automationEnabled: true
        });

        let totalDormant = 0;

        for (const userSettings of activeUsers) {
            const userId = userSettings.userId;

            const result = await MavulaAutomationEngine.detectDormantProspects(userId);

            if (result.success) {
                totalDormant += result.dormantCount || 0;
            }
        }

        console.log(`[MAVULA SCHEDULER] Detected ${totalDormant} dormant prospects across ${activeUsers.length} users`);
    } catch (error) {
        console.error('[MAVULA SCHEDULER] Error detecting dormant prospects:', error);
    }
}, {
    timezone: 'Africa/Johannesburg'
});

// ===================================================================
// DAILY AT 18:00 SAST: End of Day Summary
// ===================================================================
// Calculate daily achievements and check targets

cron.schedule('0 18 * * *', async () => {
    try {
        console.log('[MAVULA SCHEDULER] Running end-of-day summary...');

        // Get all active users
        const activeUsers = await MavulaUserSettings.find({
            automationEnabled: true
        });

        for (const userSettings of activeUsers) {
            const userId = userSettings.userId;

            // Check daily targets
            const targetsResult = await MavulaAutomationEngine.checkDailyTargets(userId);

            if (targetsResult.success) {
                const { progress, targetsMetToday } = targetsResult;

                console.log(`[MAVULA SCHEDULER] User ${userId} end-of-day:`);
                console.log(`  - Prospects: ${progress.prospects.achieved}/${progress.prospects.target} (${progress.prospects.percentage}%)`);
                console.log(`  - Conversions: ${progress.conversions.achieved}/${progress.conversions.target} (${progress.conversions.percentage}%)`);
                console.log(`  - Targets Met: ${targetsMetToday ? 'YES ✓' : 'NO ✗'}`);
            }
        }

        console.log(`[MAVULA SCHEDULER] End-of-day summary complete for ${activeUsers.length} users`);
    } catch (error) {
        console.error('[MAVULA SCHEDULER] Error in end-of-day summary:', error);
    }
}, {
    timezone: 'Africa/Johannesburg'
});

// ===================================================================
// EVERY SUNDAY AT 08:00 SAST: Weekly Projection
// ===================================================================
// Calculate projected income for the upcoming week

cron.schedule('0 8 * * 0', async () => {
    try {
        console.log('[MAVULA SCHEDULER] Calculating weekly projections...');

        // Get all active users
        const activeUsers = await MavulaUserSettings.find({
            automationEnabled: true
        });

        for (const userSettings of activeUsers) {
            const userId = userSettings.userId;

            const projectionResult = await MavulaAutomationEngine.calculateWeeklyProjection(userId);

            if (projectionResult.success) {
                const { projection } = projectionResult;

                console.log(`[MAVULA SCHEDULER] User ${userId} weekly projection:`);
                console.log(`  - Estimated Conversions: ${projection.estimatedConversions}`);
                console.log(`  - Estimated Revenue: R${projection.estimatedRevenue.toLocaleString()}`);
            }
        }

        console.log(`[MAVULA SCHEDULER] Weekly projections complete for ${activeUsers.length} users`);
    } catch (error) {
        console.error('[MAVULA SCHEDULER] Error calculating weekly projections:', error);
    }
}, {
    timezone: 'Africa/Johannesburg'
});

// ===================================================================
// EVERY 7 DAYS: Cleanup Old Jobs
// ===================================================================
// Delete completed/failed jobs older than 7 days

cron.schedule('0 3 * * 0', async () => {
    try {
        console.log('[MAVULA SCHEDULER] Running job cleanup...');

        const deletedCount = await MavulaAutomationJob.cleanupOldJobs(7);

        console.log(`[MAVULA SCHEDULER] Cleaned up ${deletedCount} old automation jobs`);
    } catch (error) {
        console.error('[MAVULA SCHEDULER] Error cleaning up jobs:', error);
    }
}, {
    timezone: 'Africa/Johannesburg'
});

// ===================================================================
// SCHEDULER STATUS
// ===================================================================

console.log('[MAVULA SCHEDULER] ✓ All cron jobs initialized successfully');
console.log('[MAVULA SCHEDULER] Timezone: Africa/Johannesburg (SAST)');
console.log('[MAVULA SCHEDULER] Active schedules:');
console.log('  - */15 * * * * : Process job queue (every 15 minutes)');
console.log('  - 0 * * * *    : Check follow-up opportunities (every hour)');
console.log('  - 0 6 * * *    : Morning initialization (daily 06:00)');
console.log('  - 0 2 * * *    : Dormant prospect detection (daily 02:00)');
console.log('  - 0 18 * * *   : End-of-day summary (daily 18:00)');
console.log('  - 0 8 * * 0    : Weekly projection (Sunday 08:00)');
console.log('  - 0 3 * * 0    : Job cleanup (Sunday 03:00)');

module.exports = {
    // Export status info for health checks
    isRunning: true,
    schedules: [
        { name: 'Job Queue Processor', cron: '*/15 * * * *', description: 'Process pending automation jobs' },
        { name: 'Follow-up Checker', cron: '0 * * * *', description: 'Check for follow-up opportunities' },
        { name: 'Morning Init', cron: '0 6 * * *', description: 'Initialize daily activities and schedule jobs' },
        { name: 'Dormant Detection', cron: '0 2 * * *', description: 'Detect dormant prospects' },
        { name: 'End-of-Day Summary', cron: '0 18 * * *', description: 'Daily achievement summary' },
        { name: 'Weekly Projection', cron: '0 8 * * 0', description: 'Calculate weekly income projection' },
        { name: 'Job Cleanup', cron: '0 3 * * 0', description: 'Delete old completed jobs' }
    ]
};
