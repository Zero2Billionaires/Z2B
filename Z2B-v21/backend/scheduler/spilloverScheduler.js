const axios = require('axios');

// Spillover Scheduler - Runs daily at 2 AM to process expired FAM members
class SpilloverScheduler {
    constructor(serverUrl = 'http://localhost:5000') {
        this.serverUrl = serverUrl;
        this.isRunning = false;
        this.intervalId = null;
    }

    // Start the scheduler (runs every 24 hours at 2 AM)
    start() {
        if (this.isRunning) {
            console.log('⚠️  Spillover scheduler is already running');
            return;
        }

        console.log('🔄 Spillover Scheduler Started');
        console.log('📅 Will run daily at 2:00 AM to process expired FAM members');

        // Calculate milliseconds until next 2 AM
        const now = new Date();
        const next2AM = new Date();
        next2AM.setHours(2, 0, 0, 0);

        if (now > next2AM) {
            // If it's past 2 AM today, schedule for tomorrow
            next2AM.setDate(next2AM.getDate() + 1);
        }

        const msUntilNext2AM = next2AM - now;
        console.log(`⏰ Next spillover processing in ${Math.round(msUntilNext2AM / 1000 / 60 / 60)} hours`);

        // Initial delay until 2 AM, then repeat every 24 hours
        setTimeout(() => {
            this.processSpillovers(); // Run immediately at 2 AM
            this.intervalId = setInterval(() => {
                this.processSpillovers();
            }, 24 * 60 * 60 * 1000); // 24 hours
        }, msUntilNext2AM);

        this.isRunning = true;
    }

    // Stop the scheduler
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('🛑 Spillover Scheduler Stopped');
    }

    // Process spillovers (call the API endpoint)
    async processSpillovers() {
        try {
            console.log('\n🔄 ===== AUTOMATED SPILLOVER PROCESSING STARTED =====');
            console.log(`📅 Timestamp: ${new Date().toISOString()}`);

            const response = await axios.post(`${this.serverUrl}/api/spillover/process-spillovers`, {}, {
                headers: {
                    'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'scheduler'}`, // Use admin token
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                console.log('✅ Spillover processing completed successfully');
                console.log(`📊 Expired FAM accounts: ${response.data.expiredFAMs || 0}`);
                console.log(`📦 Distributions made: ${response.data.distributions || 0}`);

                if (response.data.details && response.data.details.length > 0) {
                    console.log('\n📋 Distribution Details:');
                    response.data.details.forEach((dist, index) => {
                        console.log(`  ${index + 1}. ${dist.teamMember} (from ${dist.fromFAM}) → ${dist.toBuilder}`);
                    });
                }
            } else {
                console.log('⚠️  Spillover processing completed with warnings');
                console.log(`   Message: ${response.data.message}`);
            }

            console.log('===== AUTOMATED SPILLOVER PROCESSING COMPLETED =====\n');
        } catch (error) {
            console.error('❌ Error during automated spillover processing:', error.message);
            if (error.response) {
                console.error('   Response:', error.response.data);
            }
        }
    }

    // Manual trigger (for testing or admin override)
    async triggerManual() {
        console.log('🔧 Manual spillover trigger initiated');
        await this.processSpillovers();
    }
}

// Create singleton instance
const spilloverScheduler = new SpilloverScheduler();

module.exports = spilloverScheduler;
