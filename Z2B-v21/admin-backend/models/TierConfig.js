const mongoose = require('mongoose');

// ============================================================================
// TIER CONFIGURATION MODEL
// ============================================================================
// Manages how many apps each tier gets and default app allocations
// Admin can modify these rules from the admin panel

const tierConfigSchema = new mongoose.Schema({
    tier: {
        type: String,
        enum: ['BRONZE', 'COPPER', 'SILVER', 'GOLD', 'PLATINUM'],
        required: true,
        unique: true
    },

    // How many total apps this tier allows
    totalAppsAllowed: {
        type: Number,
        required: true
    },

    // Apps that are ALWAYS included (mandatory)
    mandatoryApps: [{
        type: String,
        // Always includes: coach-manlaw + the intro app
    }],

    // Apps user can choose from (additional to mandatory)
    additionalAppsCount: {
        type: Number,
        default: 0
    },

    // Whether this tier gets ALL apps automatically
    getsAllApps: {
        type: Boolean,
        default: false
    },

    // Tier pricing
    monthlyPrice: {
        type: Number,
        required: true
    },

    // Description for display
    description: {
        type: String
    },

    // Active status
    isActive: {
        type: Boolean,
        default: true
    },

    // Last modified
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Default tier configurations
tierConfigSchema.statics.getDefaultConfigs = function() {
    return [
        {
            tier: 'BRONZE',
            totalAppsAllowed: 2,
            mandatoryApps: ['coach-manlaw'], // + intro app
            additionalAppsCount: 0,
            getsAllApps: false,
            monthlyPrice: 960,
            description: 'Coach Manlaw + 1 App (the app that introduced you)'
        },
        {
            tier: 'COPPER',
            totalAppsAllowed: 3,
            mandatoryApps: ['coach-manlaw'], // + intro app
            additionalAppsCount: 1,
            getsAllApps: false,
            monthlyPrice: 1980,
            description: 'Coach Manlaw + 2 Apps (intro app + 1 of your choice)'
        },
        {
            tier: 'SILVER',
            totalAppsAllowed: 4,
            mandatoryApps: ['coach-manlaw'], // + intro app
            additionalAppsCount: 2,
            getsAllApps: false,
            monthlyPrice: 2980,
            description: 'Coach Manlaw + 3 Apps (intro app + 2 of your choice)'
        },
        {
            tier: 'GOLD',
            totalAppsAllowed: 7,
            mandatoryApps: ['coach-manlaw'], // + intro app
            additionalAppsCount: 5,
            getsAllApps: false,
            monthlyPrice: 4980,
            description: 'Coach Manlaw + 6 Apps (intro app + 5 of your choice)'
        },
        {
            tier: 'PLATINUM',
            totalAppsAllowed: 9,
            mandatoryApps: ['coach-manlaw'],
            additionalAppsCount: 0,
            getsAllApps: true,
            monthlyPrice: 6980,
            description: 'Coach Manlaw + 8 Apps'
        }
    ];
};

module.exports = mongoose.model('TierConfig', tierConfigSchema);
