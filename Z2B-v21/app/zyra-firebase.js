/**
 * ZYRA Firebase Integration Service
 * Handles all Firebase operations for lead management
 */

class ZyraFirebaseService {
    constructor(config) {
        this.config = config;
        this.db = null;
        this.initialized = false;
    }

    /**
     * Initialize Firebase
     */
    async init() {
        try {
            // Check if Firebase is already initialized
            if (typeof firebase === 'undefined') {
                console.error('Firebase SDK not loaded. Please include Firebase scripts.');
                return false;
            }

            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(this.config.FIREBASE);
            }

            this.db = firebase.firestore();
            this.initialized = true;
            console.log('✅ ZYRA Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            return false;
        }
    }

    /**
     * Add a new lead to Firebase
     */
    async addLead(leadData) {
        if (!this.initialized) {
            console.error('Firebase not initialized');
            return null;
        }

        try {
            const lead = {
                ...leadData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'new',
                score: 0,
                stage: 'intro',
                lastContact: null,
                conversations: [],
                metadata: {
                    source: leadData.source || 'unknown',
                    campaign: leadData.campaign || null,
                    referrer: leadData.referrer || null
                }
            };

            const docRef = await this.db.collection('leads').add(lead);
            console.log('✅ Lead added:', docRef.id);

            // Trigger automation
            await this.triggerLeadAutomation(docRef.id, lead);

            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding lead:', error);
            return null;
        }
    }

    /**
     * Get all leads with optional filtering
     */
    async getLeads(filters = {}) {
        if (!this.initialized) return [];

        try {
            let query = this.db.collection('leads');

            // Apply filters
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            if (filters.source) {
                query = query.where('metadata.source', '==', filters.source);
            }
            if (filters.minScore) {
                query = query.where('score', '>=', filters.minScore);
            }

            // Order by creation date
            query = query.orderBy('createdAt', 'desc');

            // Limit results
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const snapshot = await query.get();
            const leads = [];

            snapshot.forEach(doc => {
                leads.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return leads;
        } catch (error) {
            console.error('❌ Error getting leads:', error);
            return [];
        }
    }

    /**
     * Update lead information
     */
    async updateLead(leadId, updates) {
        if (!this.initialized) return false;

        try {
            await this.db.collection('leads').doc(leadId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Lead updated:', leadId);
            return true;
        } catch (error) {
            console.error('❌ Error updating lead:', error);
            return false;
        }
    }

    /**
     * Update lead score based on engagement
     */
    async updateLeadScore(leadId, action) {
        const scoreMap = this.config.LEAD_SCORING.engagement_points;
        const points = scoreMap[action] || 0;

        try {
            const leadRef = this.db.collection('leads').doc(leadId);
            await leadRef.update({
                score: firebase.firestore.FieldValue.increment(points),
                lastEngagement: action,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Get updated score and check qualification
            const leadDoc = await leadRef.get();
            const currentScore = leadDoc.data().score;

            await this.checkLeadQualification(leadId, currentScore);

            return currentScore;
        } catch (error) {
            console.error('❌ Error updating lead score:', error);
            return null;
        }
    }

    /**
     * Check and update lead qualification status
     */
    async checkLeadQualification(leadId, score) {
        const stages = this.config.LEAD_SCORING.qualification_stages;
        let newStage = 'cold';

        for (const [stage, range] of Object.entries(stages)) {
            if (score >= range.min && score <= range.max) {
                newStage = stage;
                break;
            }
        }

        await this.updateLead(leadId, {
            qualificationStage: newStage,
            qualified: score >= this.config.LEAD_SCORING.auto_qualify_threshold
        });

        // Trigger notification for hot leads
        if (newStage === 'hot' || newStage === 'ready') {
            await this.notifyHotLead(leadId);
        }
    }

    /**
     * Add conversation message to lead
     */
    async addConversationMessage(leadId, message) {
        if (!this.initialized) return false;

        try {
            const messageData = {
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                sender: message.sender, // 'ai' or 'lead'
                content: message.content,
                metadata: message.metadata || {}
            };

            await this.db.collection('leads').doc(leadId).update({
                conversations: firebase.firestore.FieldValue.arrayUnion(messageData),
                lastContact: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update engagement score
            if (message.sender === 'lead') {
                await this.updateLeadScore(leadId, 'replied');
            }

            return true;
        } catch (error) {
            console.error('❌ Error adding conversation:', error);
            return false;
        }
    }

    /**
     * Get lead conversations
     */
    async getConversations(leadId) {
        if (!this.initialized) return [];

        try {
            const doc = await this.db.collection('leads').doc(leadId).get();
            if (doc.exists) {
                return doc.data().conversations || [];
            }
            return [];
        } catch (error) {
            console.error('❌ Error getting conversations:', error);
            return [];
        }
    }

    /**
     * Get real-time analytics
     */
    async getAnalytics() {
        if (!this.initialized) return null;

        try {
            const leads = await this.getLeads();

            const analytics = {
                totalLeads: leads.length,
                newLeads: leads.filter(l => l.status === 'new').length,
                activeConversations: leads.filter(l =>
                    ['contacted', 'qualified', 'negotiating'].includes(l.status)
                ).length,
                closedDeals: leads.filter(l => l.status === 'closed').length,
                lostLeads: leads.filter(l => l.status === 'lost').length,
                totalRevenue: leads
                    .filter(l => l.status === 'closed')
                    .reduce((sum, l) => sum + (l.value || 0), 0),
                avgScore: leads.length > 0
                    ? leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length
                    : 0,
                conversionRate: leads.length > 0
                    ? (leads.filter(l => l.status === 'closed').length / leads.length * 100).toFixed(1)
                    : 0,
                sourceBreakdown: this.getSourceBreakdown(leads),
                stageBreakdown: this.getStageBreakdown(leads)
            };

            return analytics;
        } catch (error) {
            console.error('❌ Error getting analytics:', error);
            return null;
        }
    }

    /**
     * Helper: Get leads by source
     */
    getSourceBreakdown(leads) {
        const breakdown = {};
        leads.forEach(lead => {
            const source = lead.metadata?.source || 'unknown';
            breakdown[source] = (breakdown[source] || 0) + 1;
        });
        return breakdown;
    }

    /**
     * Helper: Get leads by stage
     */
    getStageBreakdown(leads) {
        const breakdown = {};
        leads.forEach(lead => {
            const stage = lead.qualificationStage || 'cold';
            breakdown[stage] = (breakdown[stage] || 0) + 1;
        });
        return breakdown;
    }

    /**
     * Trigger lead automation workflow
     */
    async triggerLeadAutomation(leadId, leadData) {
        console.log('🚀 Triggering automation for lead:', leadId);

        // This would typically call your backend webhook or cloud function
        // For now, we'll just log it

        if (this.config.PHASES.PHASE_2.status === 'ACTIVE') {
            // Trigger AI chat automation
            console.log('💬 Starting AI conversation for lead:', leadData.name);
        }
    }

    /**
     * Notify about hot lead
     */
    async notifyHotLead(leadId) {
        if (this.config.NOTIFICATIONS.notify_on_hot_lead) {
            console.log('🔥 HOT LEAD ALERT:', leadId);
            // Implement notification logic (email, SMS, dashboard alert)
        }
    }

    /**
     * Listen to real-time updates
     */
    listenToLeads(callback) {
        if (!this.initialized) return null;

        return this.db.collection('leads')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const leads = [];
                snapshot.forEach(doc => {
                    leads.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(leads);
            }, error => {
                console.error('❌ Error listening to leads:', error);
            });
    }

    /**
     * Save automation settings
     */
    async saveSettings(settings) {
        if (!this.initialized) return false;

        try {
            await this.db.collection('settings').doc('zyra').set({
                ...settings,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Settings saved');
            return true;
        } catch (error) {
            console.error('❌ Error saving settings:', error);
            return false;
        }
    }

    /**
     * Get automation settings
     */
    async getSettings() {
        if (!this.initialized) return null;

        try {
            const doc = await this.db.collection('settings').doc('zyra').get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('❌ Error getting settings:', error);
            return null;
        }
    }

    /**
     * Delete lead
     */
    async deleteLead(leadId) {
        if (!this.initialized) return false;

        try {
            await this.db.collection('leads').doc(leadId).delete();
            console.log('✅ Lead deleted:', leadId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting lead:', error);
            return false;
        }
    }

    /**
     * Sync data with Benown
     */
    async syncWithBenown() {
        if (!this.config.BENOWN_INTEGRATION.enabled) {
            console.log('ℹ️ Benown integration disabled');
            return false;
        }

        try {
            const analytics = await this.getAnalytics();
            const leads = await this.getLeads({ limit: 100 });

            // Extract insights for Benown
            const insights = {
                leadInterests: this.extractLeadInterests(leads),
                commonObjections: this.extractCommonObjections(leads),
                trendingPainPoints: this.extractPainPoints(leads),
                conversionTriggers: this.extractConversionTriggers(leads),
                timestamp: new Date().toISOString()
            };

            // Save to Benown collection
            await this.db.collection('benown_sync').add(insights);

            console.log('✅ Data synced with Benown');
            return true;
        } catch (error) {
            console.error('❌ Error syncing with Benown:', error);
            return false;
        }
    }

    /**
     * Extract lead interests from conversations
     */
    extractLeadInterests(leads) {
        const interests = {};
        leads.forEach(lead => {
            if (lead.conversations) {
                lead.conversations.forEach(msg => {
                    // Simple keyword extraction (in production, use NLP)
                    const keywords = ['money', 'income', 'freedom', 'business', 'side hustle'];
                    keywords.forEach(keyword => {
                        if (msg.content && msg.content.toLowerCase().includes(keyword)) {
                            interests[keyword] = (interests[keyword] || 0) + 1;
                        }
                    });
                });
            }
        });
        return interests;
    }

    /**
     * Extract common objections
     */
    extractCommonObjections(leads) {
        const objections = {
            no_time: 0,
            no_money: 0,
            skeptical: 0,
            need_to_think: 0
        };

        leads.forEach(lead => {
            if (lead.conversations) {
                lead.conversations.forEach(msg => {
                    if (msg.sender === 'lead') {
                        const content = msg.content?.toLowerCase() || '';
                        if (content.includes('time') || content.includes('busy')) {
                            objections.no_time++;
                        }
                        if (content.includes('money') || content.includes('afford')) {
                            objections.no_money++;
                        }
                        if (content.includes('scam') || content.includes('sure')) {
                            objections.skeptical++;
                        }
                        if (content.includes('think') || content.includes('later')) {
                            objections.need_to_think++;
                        }
                    }
                });
            }
        });

        return objections;
    }

    /**
     * Extract pain points
     */
    extractPainPoints(leads) {
        return this.config.TARGET_PERSONA.painPoints.map(pain => ({
            painPoint: pain,
            mentions: Math.floor(Math.random() * leads.length) // Placeholder
        }));
    }

    /**
     * Extract conversion triggers
     */
    extractConversionTriggers(leads) {
        const closedLeads = leads.filter(l => l.status === 'closed');
        return {
            avgTimeToClose: '3 days', // Placeholder
            topMessages: ['video demo', 'testimonials', 'money back guarantee'],
            peakConversionTime: '19:00-21:00'
        };
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.ZyraFirebaseService = ZyraFirebaseService;
}
