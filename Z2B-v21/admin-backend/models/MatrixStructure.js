const mongoose = require('mongoose');

/**
 * Z2B 7x7 Matrix Structure Schema
 *
 * This schema handles the forced matrix structure where:
 * - Each user has exactly 7 front-line positions
 * - Spillover automatically places new recruits under existing team
 * - Matrix goes 10 levels deep
 * - Tracks both sponsor (who recruited) and matrix parent (where placed)
 */

const matrixPositionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  position: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  filled: {
    type: Boolean,
    default: false
  },
  filledDate: {
    type: Date,
    default: null
  }
});

const matrixNodeSchema = new mongoose.Schema({
  // User Identity
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },

  // Sponsorship (Who Recruited Them)
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null  // null for root/admin
  },
  sponsorUsername: String,

  // Matrix Position (Where They're Placed)
  matrixParent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null  // null for root positions
  },
  matrixLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  matrixPosition: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  matrixPath: {
    type: String,
    required: true,
    // Format: "1.3.2" means position 1 -> position 3 -> position 2
  },

  // Matrix Children (7 positions)
  matrixChildren: [matrixPositionSchema],

  // Tracking
  joinedMatrix: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },

  // Personally Recruited (for ISP and TLI)
  personallyRecruited: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    dateRecruited: {
      type: Date,
      default: Date.now
    },
    matrixPlacement: String, // Where they ended up in matrix
    currentTier: String,
    currentTLILevel: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Commission Tracking
  commissions: {
    // ISP - from personally recruited
    isp: {
      totalEarned: {
        type: Number,
        default: 0
      },
      thisMonth: {
        type: Number,
        default: 0
      },
      lastMonth: {
        type: Number,
        default: 0
      }
    },

    // TSC - from matrix organization
    tsc: {
      totalEarned: {
        type: Number,
        default: 0
      },
      thisMonth: {
        type: Number,
        default: 0
      },
      byGeneration: {
        G2: { type: Number, default: 0 },
        G3: { type: Number, default: 0 },
        G4: { type: Number, default: 0 },
        G5: { type: Number, default: 0 },
        G6: { type: Number, default: 0 },
        G7: { type: Number, default: 0 },
        G8: { type: Number, default: 0 },
        G9: { type: Number, default: 0 },
        G10: { type: Number, default: 0 }
      }
    },

    // TLI - quarterly pool
    tli: {
      currentLevel: {
        type: Number,
        default: 0
      },
      qualified: {
        type: Boolean,
        default: false
      },
      qualifiedLeadersCount: {
        type: Number,
        default: 0
      },
      totalEarned: {
        type: Number,
        default: 0
      },
      lastPayout: {
        type: Number,
        default: 0
      },
      lastPayoutDate: Date
    }
  },

  // Matrix Statistics
  stats: {
    totalDownline: {
      type: Number,
      default: 0
    },
    activeDownline: {
      type: Number,
      default: 0
    },
    totalVolume: {
      type: Number,
      default: 0
    },
    monthlyVolume: {
      type: Number,
      default: 0
    },
    matrixFillPercentage: {
      type: Number,
      default: 0
    },
    deepestLevel: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true
});

// Indexes for fast queries
matrixNodeSchema.index({ userId: 1 }, { unique: true });
matrixNodeSchema.index({ sponsor: 1 });
matrixNodeSchema.index({ matrixParent: 1 });
matrixNodeSchema.index({ matrixLevel: 1 });
matrixNodeSchema.index({ matrixPath: 1 });
matrixNodeSchema.index({ 'personallyRecruited.userId': 1 });

// Methods

/**
 * Get next available position in matrix for spillover
 */
matrixNodeSchema.methods.getNextAvailablePosition = function() {
  const emptyPositions = this.matrixChildren.filter(child => !child.filled);
  return emptyPositions.length > 0 ? emptyPositions[0].position : null;
};

/**
 * Check if matrix level is full
 */
matrixNodeSchema.methods.isLevelFull = function() {
  return this.matrixChildren.every(child => child.filled);
};

/**
 * Get all matrix descendants up to N levels deep
 */
matrixNodeSchema.methods.getMatrixDescendants = async function(maxLevels = 10) {
  const MatrixNode = this.constructor;
  const descendants = [];

  const traverse = async (nodeId, currentLevel) => {
    if (currentLevel > maxLevels) return;

    const children = await MatrixNode.find({ matrixParent: nodeId });

    for (const child of children) {
      descendants.push({
        userId: child.userId,
        level: currentLevel,
        position: child.matrixPosition,
        path: child.matrixPath
      });

      await traverse(child.userId, currentLevel + 1);
    }
  };

  await traverse(this.userId, 1);
  return descendants;
};

/**
 * Calculate TLI qualification
 */
matrixNodeSchema.methods.checkTLIQualification = async function(targetLevel) {
  const tliRequirements = {
    1: { leaders: 0, atLevel: 0 },
    2: { leaders: 2, atLevel: 1 },
    3: { leaders: 2, atLevel: 2 },
    4: { leaders: 2, atLevel: 3 },
    5: { leaders: 2, atLevel: 4 },
    6: { leaders: 2, atLevel: 5 },
    7: { leaders: 7, atLevel: 5 }, // 7 leaders at 2 ranks lower
    8: { leaders: 7, atLevel: 6 },
    9: { leaders: 7, atLevel: 7 },
    10: { leaders: 7, atLevel: 8 }
  };

  const requirement = tliRequirements[targetLevel];
  if (!requirement) return false;

  const qualifiedLeaders = this.personallyRecruited.filter(
    recruit => recruit.currentTLILevel >= requirement.atLevel && recruit.isActive
  );

  return qualifiedLeaders.length >= requirement.leaders;
};

/**
 * Update statistics
 */
matrixNodeSchema.methods.updateStats = async function() {
  const descendants = await this.getMatrixDescendants();

  this.stats.totalDownline = descendants.length;
  this.stats.activeDownline = descendants.filter(d => d.isActive).length;
  this.stats.deepestLevel = descendants.reduce((max, d) => Math.max(max, d.level), 1);

  const filledPositions = this.matrixChildren.filter(c => c.filled).length;
  this.stats.matrixFillPercentage = (filledPositions / 7) * 100;

  await this.save();
};

// Static Methods

/**
 * Find next available position for spillover placement
 * Uses breadth-first search to find the next empty position
 */
matrixNodeSchema.statics.findSpilloverPosition = async function(rootUserId) {
  const queue = [rootUserId];
  const visited = new Set();

  while (queue.length > 0) {
    const currentUserId = queue.shift();

    if (visited.has(currentUserId.toString())) continue;
    visited.add(currentUserId.toString());

    const node = await this.findOne({ userId: currentUserId });
    if (!node) continue;

    // Check if this node has an empty position
    const nextPos = node.getNextAvailablePosition();
    if (nextPos !== null) {
      return {
        parentUserId: node.userId,
        position: nextPos,
        level: node.matrixLevel + 1,
        path: `${node.matrixPath}.${nextPos}`
      };
    }

    // Add filled children to queue
    const filledChildren = node.matrixChildren.filter(c => c.filled);
    filledChildren.forEach(child => {
      if (child.userId) {
        queue.push(child.userId);
      }
    });
  }

  return null; // No available position found
};

/**
 * Place user in matrix (spillover algorithm)
 */
matrixNodeSchema.statics.placeInMatrix = async function(newUserId, sponsorUserId) {
  // Find sponsor's matrix position
  const sponsor = await this.findOne({ userId: sponsorUserId });
  if (!sponsor) {
    throw new Error('Sponsor not found in matrix');
  }

  // Find next available position starting from sponsor
  const placement = await this.findSpilloverPosition(sponsorUserId);

  if (!placement) {
    throw new Error('No available matrix position found');
  }

  // Update parent's matrix children
  const parent = await this.findOne({ userId: placement.parentUserId });
  const childIndex = parent.matrixChildren.findIndex(
    c => c.position === placement.position
  );

  parent.matrixChildren[childIndex].userId = newUserId;
  parent.matrixChildren[childIndex].filled = true;
  parent.matrixChildren[childIndex].filledDate = new Date();
  await parent.save();

  return placement;
};

const MatrixNode = mongoose.model('MatrixNode', matrixNodeSchema);

module.exports = MatrixNode;
