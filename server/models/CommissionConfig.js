/**
 * Commission Configuration Model
 * Stores editable commission rates for ISP, QPB, and TSC
 * CEO-only edit access with version history
 */

import mongoose from 'mongoose';

const commissionConfigSchema = new mongoose.Schema({
  configType: {
    type: String,
    enum: ['ISP', 'QPB', 'TSC'],
    required: true,
    unique: true
  },

  // ISP Configuration (Individual Sales Profit)
  ispRates: {
    FAM: { type: Number, default: 0.00 },
    Bronze: { type: Number, default: 0.18 },
    Copper: { type: Number, default: 0.22 },
    Silver: { type: Number, default: 0.25 },
    Gold: { type: Number, default: 0.28 },
    Platinum: { type: Number, default: 0.30 },
    Diamond: { type: Number, default: 0.00 }
  },

  // QPB Configuration (Quick Pathfinder Bonus)
  qpbRates: {
    firstSet: { type: Number, default: 0.075 },      // 7.5% for first 3
    additionalSets: { type: Number, default: 0.10 },  // 10% for additional sets of 3
    cycleDefinition: {
      startDay: { type: Number, default: 4 },  // 4th of month
      endDay: { type: Number, default: 3 }     // 3rd of next month
    },
    first90DaysOnly: { type: Boolean, default: true }
  },

  // TSC Configuration (Team Sales Commission - 10 generations)
  tscRates: {
    gen2: { type: Number, default: 0.10 },   // 10%
    gen3: { type: Number, default: 0.05 },   // 5%
    gen4: { type: Number, default: 0.03 },   // 3%
    gen5: { type: Number, default: 0.02 },   // 2%
    gen6: { type: Number, default: 0.01 },   // 1%
    gen7: { type: Number, default: 0.01 },   // 1%
    gen8: { type: Number, default: 0.01 },   // 1%
    gen9: { type: Number, default: 0.01 },   // 1%
    gen10: { type: Number, default: 0.01 }   // 1%
  },

  // Audit Trail
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },

  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoachUser',
    required: false
  },

  modifiedAt: {
    type: Date,
    default: Date.now
  },

  reason: {
    type: String,
    required: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Method to get active configuration
commissionConfigSchema.statics.getActiveConfig = async function(configType) {
  return await this.findOne({ configType, isActive: true });
};

// Method to create new version
commissionConfigSchema.statics.createNewVersion = async function(configType, newRates, modifiedBy, reason) {
  // Deactivate current version
  await this.updateMany({ configType, isActive: true }, { isActive: false });

  // Get last version number
  const lastVersion = await this.findOne({ configType }).sort({ version: -1 });
  const newVersion = (lastVersion?.version || 0) + 1;

  // Create new version
  const newConfig = new this({
    configType,
    ...newRates,
    modifiedBy,
    reason,
    version: newVersion,
    isActive: true
  });

  return await newConfig.save();
};

const CommissionConfig = mongoose.model('CommissionConfig', commissionConfigSchema);

export default CommissionConfig;
