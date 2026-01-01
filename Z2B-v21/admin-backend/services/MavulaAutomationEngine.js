const MavulaProspect = require('../models/MavulaProspect');
const MavulaConversation = require('../models/MavulaConversation');
const MavulaUserSettings = require('../models/MavulaUserSettings');
const MavulaDailyActivity = require('../models/MavulaDailyActivity');
const MavulaAutomationJob = require('../models/MavulaAutomationJob');
const MavulaAIService = require('./MavulaAIService');
const MavulaWhatsAppService = require('./MavulaWhatsAppService');
const User = require('../models/User');

class MavulaAutomationEngine {
    constructor() {
        this.isProcessing = false;
        this.processingStartTime = null;
    }

    // ===================================================================
    // DAILY JOB SCHEDULING
    // ===================================================================

    /**
     * Schedule daily automation jobs for a user
     * Called every morning at 06:00 SAST
     */
    async scheduleDailyJobs(userId) {
        try {
            console.log(`[MAVULA] Scheduling daily jobs for user ${userId}`);

            // Get user settings
            const settings = await MavulaUserSettings.findOne({ userId });

            if (!settings || !settings.automationEnabled) {
                console.log(`[MAVULA] Automation disabled for user ${userId}`);
                return { success: false, message: 'Automation disabled' };
            }

            // Get today's activity
            const todayActivity = await MavulaDailyActivity.getTodayActivity(userId);
            const dailyTarget = settings.dailyProspectTarget || 10;

            // Identify prospects needing contact
            const prospects = await this.identifyProspectsNeedingContact(userId);

            console.log(`[MAVULA] Found ${prospects.length} prospects needing contact`);

            let jobsScheduled = 0;
            const now = new Date();

            for (const prospect of prospects) {
                // Skip if already reached daily target
                if (jobsScheduled >= dailyTarget) {
                    console.log(`[MAVULA] Daily target reached (${dailyTarget})`);
                    break;
                }

                // Skip if prospect has automation disabled
                if (!prospect.automationEnabled) {
                    continue;
                }

                // Skip if prospect opted out
                if (prospect.hasOptedOut) {
                    continue;
                }

                // Determine job type based on conversation stage
                let jobType;
                let scheduledFor = new Date(now);
                let priority = 5;

                if (prospect.conversationStage === 'INITIAL_CONTACT') {
                    jobType = 'INITIAL_OUTREACH';
                    // Schedule within first 2 hours
                    scheduledFor.setMinutes(scheduledFor.getMinutes() + Math.floor(Math.random() * 120));
                    priority = 7;
                } else if (prospect.conversationStage === 'DORMANT') {
                    jobType = 'DORMANT_REACTIVATION';
                    // Schedule later in the day
                    scheduledFor.setHours(scheduledFor.getHours() + 4);
                    priority = 4;
                } else if (prospect.conversationStage === 'CLOSING') {
                    jobType = 'CONVERSION_ATTEMPT';
                    // Schedule during peak hours (10am-2pm)
                    scheduledFor.setHours(10 + Math.floor(Math.random() * 4));
                    priority = 9; // Highest priority
                } else {
                    jobType = 'FOLLOW_UP';
                    // Stagger throughout the day
                    scheduledFor.setMinutes(scheduledFor.getMinutes() + (jobsScheduled * 30));
                    priority = 6;
                }

                // Check if within active hours
                if (settings.activeHours?.enabled) {
                    const isWithinActiveHours = await settings.isWithinActiveHours();
                    if (!isWithinActiveHours) {
                        // Schedule for start of next active period
                        scheduledFor = this._getNextActiveTime(settings.activeHours);
                    }
                }

                // Create job
                await MavulaAutomationJob.createJob({
                    userId,
                    prospectId: prospect._id,
                    jobType,
                    scheduledFor,
                    priority,
                    contextData: {
                        prospectName: prospect.prospectName,
                        conversationStage: prospect.conversationStage,
                        leadScore: prospect.leadScore,
                        leadTemperature: prospect.leadTemperature
                    }
                });

                jobsScheduled++;
            }

            console.log(`[MAVULA] Scheduled ${jobsScheduled} jobs for user ${userId}`);

            return {
                success: true,
                jobsScheduled,
                prospectsEvaluated: prospects.length
            };
        } catch (error) {
            console.error('[MAVULA] Error scheduling daily jobs:', error);
            throw error;
        }
    }

    /**
     * Identify prospects that need contact today
     */
    async identifyProspectsNeedingContact(userId) {
        try {
            const now = new Date();
            const prospects = [];

            // Get all active prospects for user
            const allProspects = await MavulaProspect.find({
                userId,
                automationEnabled: true,
                hasOptedOut: false,
                isConverted: false
            });

            for (const prospect of allProspects) {
                let needsContact = false;

                // New prospects (never contacted)
                if (!prospect.lastContactDate) {
                    needsContact = true;
                }
                // Prospects with scheduled follow-up
                else if (prospect.nextFollowUpDate && prospect.nextFollowUpDate <= now) {
                    needsContact = true;
                }
                // Dormant prospects (7+ days no contact)
                else if (prospect.lastContactDate) {
                    const daysSinceContact = (now - prospect.lastContactDate) / (1000 * 60 * 60 * 24);
                    if (daysSinceContact >= 7 && prospect.conversationStage !== 'DORMANT') {
                        needsContact = true;
                        // Update stage to dormant
                        prospect.conversationStage = 'DORMANT';
                        await prospect.save();
                    }
                }

                if (needsContact) {
                    prospects.push(prospect);
                }
            }

            // Sort by lead score (highest first)
            prospects.sort((a, b) => b.leadScore - a.leadScore);

            return prospects;
        } catch (error) {
            console.error('[MAVULA] Error identifying prospects:', error);
            throw error;
        }
    }

    // ===================================================================
    // JOB QUEUE PROCESSING
    // ===================================================================

    /**
     * Process pending jobs in the queue
     * Called every 15 minutes by cron
     */
    async processJobQueue() {
        // Prevent concurrent processing
        if (this.isProcessing) {
            console.log('[MAVULA] Job queue already processing, skipping...');
            return { success: false, message: 'Already processing' };
        }

        this.isProcessing = true;
        this.processingStartTime = new Date();

        try {
            console.log('[MAVULA] Starting job queue processing...');

            // Get pending jobs (max 50 at a time)
            const jobs = await MavulaAutomationJob.getPendingJobs(50);

            console.log(`[MAVULA] Found ${jobs.length} pending jobs`);

            const results = {
                processed: 0,
                completed: 0,
                failed: 0,
                retried: 0
            };

            for (const job of jobs) {
                try {
                    // Mark as processing
                    await job.markProcessing();

                    // Execute job
                    const result = await this.executeJob(job);

                    if (result.success) {
                        await job.markCompleted(result);
                        results.completed++;
                    } else {
                        // Retry if applicable
                        if (job.retryCount < job.maxRetries) {
                            await job.retry(15); // Retry in 15 minutes
                            results.retried++;
                        } else {
                            await job.markFailed(result.error || 'Max retries exceeded');
                            results.failed++;
                        }
                    }

                    results.processed++;

                    // Delay between jobs (30 seconds)
                    await this._delay(30000);
                } catch (jobError) {
                    console.error(`[MAVULA] Error processing job ${job._id}:`, jobError);
                    await job.markFailed(jobError.message);
                    results.failed++;
                }
            }

            const duration = (new Date() - this.processingStartTime) / 1000;
            console.log(`[MAVULA] Job queue processing complete in ${duration}s:`, results);

            return {
                success: true,
                ...results,
                duration
            };
        } catch (error) {
            console.error('[MAVULA] Error processing job queue:', error);
            throw error;
        } finally {
            this.isProcessing = false;
            this.processingStartTime = null;
        }
    }

    /**
     * Execute a single automation job
     */
    async executeJob(job) {
        try {
            console.log(`[MAVULA] Executing job ${job._id} (${job.jobType})`);

            // Get prospect
            const prospect = await MavulaProspect.findById(job.prospectId);
            if (!prospect) {
                return { success: false, error: 'Prospect not found' };
            }

            // Get user
            const user = await User.findById(job.userId);
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            // Check fuel credits
            if (!user.fuelCredits || user.fuelCredits < 1) {
                return { success: false, error: 'Insufficient fuel credits' };
            }

            // Get conversation history
            const conversation = await MavulaConversation.findOne({ prospectId: job.prospectId });
            const conversationHistory = conversation ? conversation.getFormattedHistory(10) : [];

            // Generate AI message based on job type
            let aiResult;

            switch (job.jobType) {
                case 'INITIAL_OUTREACH':
                    aiResult = await MavulaAIService.generateOpener(job.prospectId, job.userId);
                    break;

                case 'FOLLOW_UP':
                    const daysSinceLastContact = prospect.lastContactDate
                        ? Math.floor((Date.now() - prospect.lastContactDate) / (1000 * 60 * 60 * 24))
                        : 0;
                    aiResult = await MavulaAIService.generateFollowUp(
                        job.prospectId,
                        job.userId,
                        daysSinceLastContact
                    );
                    break;

                case 'RESPONSE_REQUIRED':
                    aiResult = await MavulaAIService.generateResponse(
                        job.prospectId,
                        job.userId,
                        conversationHistory
                    );
                    break;

                case 'DORMANT_REACTIVATION':
                    aiResult = await MavulaAIService.generateFollowUp(
                        job.prospectId,
                        job.userId,
                        7 // 7+ days since last contact
                    );
                    break;

                case 'CONVERSION_ATTEMPT':
                    aiResult = await MavulaAIService.generateClosingMessage(
                        job.prospectId,
                        job.userId,
                        conversationHistory
                    );
                    break;

                case 'STAGE_ADVANCEMENT':
                    // Advance stage and generate appropriate message
                    await this.advanceConversationStage(job.prospectId);
                    const updatedProspect = await MavulaProspect.findById(job.prospectId);

                    if (updatedProspect.conversationStage === 'CLOSING') {
                        aiResult = await MavulaAIService.generateClosingMessage(
                            job.prospectId,
                            job.userId,
                            conversationHistory
                        );
                    } else {
                        aiResult = await MavulaAIService.generateResponse(
                            job.prospectId,
                            job.userId,
                            conversationHistory
                        );
                    }
                    break;

                default:
                    return { success: false, error: `Unknown job type: ${job.jobType}` };
            }

            if (!aiResult.success) {
                return { success: false, error: aiResult.message };
            }

            // Send WhatsApp message
            const whatsappResult = await MavulaWhatsAppService.sendAIMessage(
                job.prospectId,
                aiResult.message,
                job.userId
            );

            if (!whatsappResult.success) {
                return { success: false, error: whatsappResult.message };
            }

            // Deduct fuel credits
            user.fuelCredits -= 1;
            await user.save();

            // Recalculate lead score
            await this.recalculateLeadScore(job.prospectId);

            return {
                success: true,
                messageId: whatsappResult.messageId,
                whatsappMessageId: whatsappResult.messageId,
                aiProvider: 'CLAUDE',
                tokensUsed: aiResult.tokensUsed,
                generatedMessage: aiResult.message
            };
        } catch (error) {
            console.error(`[MAVULA] Error executing job ${job._id}:`, error);
            return { success: false, error: error.message };
        }
    }

    // ===================================================================
    // CONVERSATION STAGE MANAGEMENT
    // ===================================================================

    /**
     * Advance prospect to next conversation stage
     * Uses AI to determine if prospect is ready
     */
    async advanceConversationStage(prospectId) {
        try {
            const prospect = await MavulaProspect.findById(prospectId);
            if (!prospect) {
                return { success: false, message: 'Prospect not found' };
            }

            const conversation = await MavulaConversation.findOne({ prospectId });
            const conversationHistory = conversation ? conversation.getFormattedHistory(20) : [];

            // Use AI to suggest next action (includes stage advancement recommendation)
            const suggestion = await MavulaAIService.suggestNextAction(
                prospectId,
                conversationHistory
            );

            if (!suggestion.success) {
                return suggestion;
            }

            // Define stage progression
            const stageProgression = {
                'INITIAL_CONTACT': 'TRUST_BUILDING',
                'TRUST_BUILDING': 'NEEDS_DISCOVERY',
                'NEEDS_DISCOVERY': 'VALUE_PRESENTATION',
                'VALUE_PRESENTATION': 'OBJECTION_HANDLING',
                'OBJECTION_HANDLING': 'CLOSING',
                'CLOSING': 'FOLLOW_UP',
                'FOLLOW_UP': 'CLOSING',
                'DORMANT': 'TRUST_BUILDING'
            };

            const currentStage = prospect.conversationStage;
            const nextStage = stageProgression[currentStage];

            if (nextStage && suggestion.shouldAdvanceStage) {
                prospect.conversationStage = nextStage;
                await prospect.save();

                console.log(`[MAVULA] Advanced prospect ${prospectId} from ${currentStage} to ${nextStage}`);

                return {
                    success: true,
                    previousStage: currentStage,
                    newStage: nextStage
                };
            }

            return {
                success: true,
                message: 'No stage advancement needed',
                currentStage
            };
        } catch (error) {
            console.error('[MAVULA] Error advancing conversation stage:', error);
            throw error;
        }
    }

    /**
     * Detect dormant prospects (7+ days no response)
     */
    async detectDormantProspects(userId) {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const dormantProspects = await MavulaProspect.find({
                userId,
                lastContactDate: { $lte: sevenDaysAgo },
                conversationStage: { $ne: 'DORMANT' },
                conversationStage: { $ne: 'CONVERTED' },
                hasOptedOut: false,
                automationEnabled: true
            });

            for (const prospect of dormantProspects) {
                prospect.conversationStage = 'DORMANT';
                prospect.leadTemperature = 'COLD';
                await prospect.save();
            }

            console.log(`[MAVULA] Detected ${dormantProspects.length} dormant prospects for user ${userId}`);

            return {
                success: true,
                dormantCount: dormantProspects.length
            };
        } catch (error) {
            console.error('[MAVULA] Error detecting dormant prospects:', error);
            throw error;
        }
    }

    // ===================================================================
    // LEAD SCORING
    // ===================================================================

    /**
     * Recalculate lead score for a prospect
     */
    async recalculateLeadScore(prospectId) {
        try {
            const prospect = await MavulaProspect.findById(prospectId);
            if (!prospect) {
                return { success: false, message: 'Prospect not found' };
            }

            const conversation = await MavulaConversation.findOne({ prospectId });
            const conversationHistory = conversation ? conversation.getFormattedHistory(20) : [];

            // Use AI to calculate lead score
            const scoreResult = await MavulaAIService.calculateLeadScore(
                prospectId,
                conversationHistory
            );

            if (scoreResult.success) {
                const previousScore = prospect.leadScore;
                prospect.leadScore = scoreResult.score;

                // Update temperature based on score
                prospect.updateTemperature();

                await prospect.save();

                console.log(`[MAVULA] Updated lead score for ${prospectId}: ${previousScore} → ${scoreResult.score}`);

                return {
                    success: true,
                    previousScore,
                    newScore: scoreResult.score,
                    temperature: prospect.leadTemperature
                };
            }

            return scoreResult;
        } catch (error) {
            console.error('[MAVULA] Error recalculating lead score:', error);
            throw error;
        }
    }

    // ===================================================================
    // ANALYTICS & PROJECTIONS
    // ===================================================================

    /**
     * Check daily targets and update achievements
     */
    async checkDailyTargets(userId) {
        try {
            const todayActivity = await MavulaDailyActivity.getTodayActivity(userId);
            const settings = await MavulaUserSettings.findOne({ userId });

            const targets = {
                prospects: settings?.dailyProspectTarget || 10,
                conversions: settings?.dailyConversionTarget || 1
            };

            const achievements = todayActivity.achievements;

            const progress = {
                prospects: {
                    target: targets.prospects,
                    achieved: achievements.prospectsAdded,
                    percentage: Math.round((achievements.prospectsAdded / targets.prospects) * 100)
                },
                conversions: {
                    target: targets.conversions,
                    achieved: achievements.conversions,
                    percentage: Math.round((achievements.conversions / targets.conversions) * 100)
                }
            };

            console.log(`[MAVULA] Daily targets for user ${userId}:`, progress);

            return {
                success: true,
                progress,
                targetsMetToday: progress.prospects.percentage >= 100 && progress.conversions.percentage >= 100
            };
        } catch (error) {
            console.error('[MAVULA] Error checking daily targets:', error);
            throw error;
        }
    }

    /**
     * Calculate weekly income projection
     */
    async calculateWeeklyProjection(userId) {
        try {
            const projection = await MavulaDailyActivity.calculateWeeklyProjection(userId);

            console.log(`[MAVULA] Weekly projection for user ${userId}:`, projection);

            return {
                success: true,
                projection
            };
        } catch (error) {
            console.error('[MAVULA] Error calculating weekly projection:', error);
            throw error;
        }
    }

    // ===================================================================
    // HELPER METHODS
    // ===================================================================

    /**
     * Get next active time based on active hours settings
     */
    _getNextActiveTime(activeHours) {
        const now = new Date();
        const [startHour, startMinute] = activeHours.startTime.split(':').map(Number);

        const nextActive = new Date(now);
        nextActive.setHours(startHour, startMinute, 0, 0);

        // If already past start time today, schedule for tomorrow
        if (nextActive <= now) {
            nextActive.setDate(nextActive.getDate() + 1);
        }

        // Check if day is in active days
        while (!activeHours.daysOfWeek.includes(nextActive.getDay())) {
            nextActive.setDate(nextActive.getDate() + 1);
        }

        return nextActive;
    }

    /**
     * Delay helper for rate limiting
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new MavulaAutomationEngine();
