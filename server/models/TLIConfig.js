/**
 * TLI Configuration Model
 * Stores editable TLI level requirements and rewards
 * CEO-only edit access with version history
 */

import mongoose from 'mongoose';

const tliConfigSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 11
  },

  name: {
    type: String,
    required: true
  },

  icon: {
    type: String,
    required: true
  },

  incomeRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },

  requirements: {
    // Minimum tier required
    minTier: {
      type: String,
      enum: ['FAM', 'Bronze', 'Copper', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      required: true
    },

    // Personal sales requirements
    personalSales: {
      type: Number,
      required: true
    },

    // Time frame for personal sales
    personalSalesTimeframe: {
      type: String,
      enum: ['lifetime', 'cycle', '3_consecutive_months'],
      default: 'lifetime'
    },

    // Number of consecutive months (if applicable)
    consecutiveMonths: {
      type: Number,
      default: 0
    },

    // Generation 1 team requirements
    gen1Requirements: {
      count: { type: Number, default: 0 },                    // How many Gen 1 needed
      mustBeLevel: { type: Number, default: 0 },             // What TLI level they must be
      minimumMonthsAtLevel: { type: Number, default: 0 }     // How long at that level
    }
  },

  // Monthly maintenance (ongoing requirements)
  monthlyMaintenance: {
    required: { type: Boolean, default: false },
    personalSales: { type: Number, default: 0 }
  },

  // Audit Trail
  version: {
    type: Number,
    default: 1
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lastModified: {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoachUser'
    },
    at: {
      type: Date,
      default: Date.now
    },
    reason: String
  }
}, {
  timestamps: true
});

// Compound index for level and active status
tliConfigSchema.index({ level: 1, isActive: 1 });

// Method to get all active TLI levels
tliConfigSchema.statics.getActiveLevels = async function() {
  return await this.find({ isActive: true }).sort({ level: 1 });
};

// Method to get specific active level
tliConfigSchema.statics.getActiveLevel = async function(level) {
  return await this.findOne({ level, isActive: true });
};

// Method to update TLI level (creates new version)
tliConfigSchema.statics.updateLevel = async function(level, updates, modifiedBy, reason) {
  // Deactivate current version
  await this.updateMany({ level, isActive: true }, { isActive: false });

  // Get last version
  const lastVersion = await this.findOne({ level }).sort({ version: -1 });
  const newVersion = (lastVersion?.version || 0) + 1;

  // Create new version
  const newConfig = new this({
    ...lastVersion.toObject(),
    ...updates,
    level,
    version: newVersion,
    isActive: true,
    lastModified: {
      by: modifiedBy,
      at: new Date(),
      reason
    }
  });

  delete newConfig._id;
  return await newConfig.save();
};

// Method to initialize default TLI levels
tliConfigSchema.statics.initializeDefaults = async function() {
  const existingLevels = await this.find({ isActive: true });
  if (existingLevels.length > 0) {
    return; // Already initialized
  }

  const defaultLevels = [
    {
      level: 1,
      name: 'Swift as Mercury',
      icon: '☿️',
      incomeRange: { min: 2500, max: 10000 },
      requirements: {
        minTier: 'Bronze',
        personalSales: 7,
        personalSalesTimeframe: 'lifetime',
        gen1Requirements: {
          count: 7,
          mustBeLevel: 0,
          minimumMonthsAtLevel: 0
        }
      }
    },
    {
      level: 2,
      name: 'Bright as Venus',
      icon: '♀️',
      incomeRange: { min: 5000, max: 20000 },
      requirements: {
        minTier: 'Bronze',
        personalSales: 1,
        personalSalesTimeframe: 'cycle',
        gen1Requirements: {
          count: 2,
          mustBeLevel: 1,
          minimumMonthsAtLevel: 1
        }
      },
      monthlyMaintenance: {
        required: true,
        personalSales: 1
      }
    },
    {
      level: 3,
      name: 'Solid as Earth',
      icon: '🌍',
      incomeRange: { min: 10000, max: 40000 },
      requirements: {
        minTier: 'Copper',
        personalSales: 2,
        personalSalesTimeframe: 'cycle',
        gen1Requirements: {
          count: 2,
          mustBeLevel: 2,
          minimumMonthsAtLevel: 1
        }
      },
      monthlyMaintenance: {
        required: true,
        personalSales: 2
      }
    },
    {
      level: 4,
      name: 'Fierce as Mars',
      icon: '♂️',
      incomeRange: { min: 25000, max: 80000 },
      requirements: {
        minTier: 'Copper',
        personalSales: 2,
        personalSalesTimeframe: 'cycle',
        gen1Requirements: {
          count: 2,
          mustBeLevel: 3,
          minimumMonthsAtLevel: 1
        }
      },
      monthlyMaintenance: {
        required: true,
        personalSales: 2
      }
    },
    {
      level: 5,
      name: 'Big as Jupiter',
      icon: '🪐',
      incomeRange: { min: 50000, max: 150000 },
      requirements: {
        minTier: 'Silver',
        personalSales: 3,
        personalSalesTimeframe: 'cycle',
        gen1Requirements: {
          count: 3,
          mustBeLevel: 4,
          minimumMonthsAtLevel: 1
        }
      },
      monthlyMaintenance: {
        required: true,
        personalSales: 3
      }
    },
    {
      level: 6,
      name: 'Mama I Made It',
      icon: '💫',
      incomeRange: { min: 100000, max: 300000 },
      requirements: {
        minTier: 'Silver',
        personalSales: 3,
        personalSalesTimeframe: '3_consecutive_months',
        consecutiveMonths: 3,
        gen1Requirements: {
          count: 3,
          mustBeLevel: 5,
          minimumMonthsAtLevel: 1
        }
      },
      monthlyMaintenance: {
        required: true,
        personalSales: 3
      }
    },
    {
      level: 7,
      name: 'Deep as Neptune',
      icon: '🔵',
      incomeRange: { min: 250000, max: 600000 },
      requirements: {
        minTier: 'Gold',
        personalSales: 7,
        personalSalesTimeframe: '3_consecutive_months',
        consecutiveMonths: 3,
        gen1Requirements: {
          count: 4,
          mustBeLevel: 6,
          minimumMonthsAtLevel: 2
        }
      },
      monthlyMaintenance: {
        required: true,
        personalSales: 7
      }
    },
    {
      level: 8,
      name: 'Bright as a Star',
      icon: '⭐',
      incomeRange: { min: 500000, max: 1200000 },
      requirements: {
        minTier: 'Platinum',
        personalSales: 7,
        personalSalesTimeframe: '3_consecutive_months',
        consecutiveMonths: 3,
        gen1Requirements: {
          count: 4,
          mustBeLevel: 6,
          minimumMonthsAtLevel: 2
        }
      },
      monthlyMaintenance: {
        required: true,
        personalSales: 7
      }
    }
  ];

  await this.insertMany(defaultLevels);
};

const TLIConfig = mongoose.model('TLIConfig', tliConfigSchema);

export default TLIConfig;
