const MatrixNode = require('../models/MatrixStructure');
const User = require('../models/User');

/**
 * Z2B 7x7 Matrix Placement Service
 *
 * Handles automatic spillover placement in the 7x7 matrix structure
 */

class MatrixPlacementService {
  /**
   * Initialize a new user in the matrix
   * @param {ObjectId} newUserId - New user's ID
   * @param {ObjectId} sponsorUserId - Sponsor's user ID
   * @param {String} username - New user's username
   * @returns {Object} Placement information
   */
  static async initializeUserInMatrix(newUserId, sponsorUserId, username) {
    try {
      // Check if user already exists in matrix
      const existing = await MatrixNode.findOne({ userId: newUserId });
      if (existing) {
        throw new Error('User already exists in matrix');
      }

      // Get sponsor's information
      const sponsor = await MatrixNode.findOne({ userId: sponsorUserId });
      if (!sponsor && sponsorUserId) {
        throw new Error('Sponsor not found in matrix');
      }

      let placement;

      // If no sponsor (root user/admin), place at level 1
      if (!sponsorUserId) {
        placement = {
          parentUserId: null,
          position: 1,
          level: 1,
          path: '1'
        };
      } else {
        // Find spillover position
        placement = await MatrixNode.findSpilloverPosition(sponsorUserId);

        if (!placement) {
          throw new Error('No available matrix position found');
        }

        // Update parent's children array
        const parent = await MatrixNode.findOne({ userId: placement.parentUserId });
        const childIndex = parent.matrixChildren.findIndex(
          c => c.position === placement.position
        );

        parent.matrixChildren[childIndex] = {
          userId: newUserId,
          position: placement.position,
          filled: true,
          filledDate: new Date()
        };

        await parent.save();

        // Update parent's stats
        await parent.updateStats();
      }

      // Create new matrix node
      const newNode = new MatrixNode({
        userId: newUserId,
        username: username,
        sponsor: sponsorUserId,
        sponsorUsername: sponsor ? sponsor.username : null,
        matrixParent: placement.parentUserId,
        matrixLevel: placement.level,
        matrixPosition: placement.position,
        matrixPath: placement.path,
        matrixChildren: [
          { position: 1, filled: false },
          { position: 2, filled: false },
          { position: 3, filled: false },
          { position: 4, filled: false },
          { position: 5, filled: false },
          { position: 6, filled: false },
          { position: 7, filled: false }
        ],
        joinedMatrix: new Date(),
        isActive: true,
        lastActivity: new Date()
      });

      await newNode.save();

      // Update sponsor's personallyRecruited array
      if (sponsor) {
        sponsor.personallyRecruited.push({
          userId: newUserId,
          username: username,
          dateRecruited: new Date(),
          matrixPlacement: placement.path,
          currentTier: 'FAM', // Default, will be updated
          currentTLILevel: 0,
          isActive: true
        });
        await sponsor.save();
      }

      // Notify upline of spillover (if applicable)
      if (placement.level > 2) {
        await this.notifySpillover(placement.parentUserId, newUserId, username);
      }

      return {
        success: true,
        placement: {
          level: placement.level,
          position: placement.position,
          path: placement.path,
          parent: placement.parentUserId
        },
        message: `Successfully placed in matrix at Level ${placement.level}, Position ${placement.position}`
      };

    } catch (error) {
      console.error('Matrix placement error:', error);
      throw error;
    }
  }

  /**
   * Get user's complete matrix tree
   * @param {ObjectId} userId - User's ID
   * @param {Number} depth - How many levels to retrieve (default 3)
   * @returns {Object} Matrix tree structure
   */
  static async getMatrixTree(userId, depth = 3) {
    try {
      const rootNode = await MatrixNode.findOne({ userId }).populate('userId', 'username tier');

      if (!rootNode) {
        throw new Error('User not found in matrix');
      }

      const buildTree = async (node, currentDepth) => {
        if (currentDepth >= depth) return null;

        const children = [];

        for (const child of node.matrixChildren) {
          if (child.filled && child.userId) {
            const childNode = await MatrixNode.findOne({ userId: child.userId })
              .populate('userId', 'username tier');

            if (childNode) {
              children.push({
                userId: childNode.userId._id,
                username: childNode.userId.username,
                tier: childNode.userId.tier,
                position: child.position,
                level: childNode.matrixLevel,
                path: childNode.matrixPath,
                filled: true,
                filledDate: child.filledDate,
                children: await buildTree(childNode, currentDepth + 1)
              });
            }
          } else {
            children.push({
              position: child.position,
              filled: false,
              placeholder: true
            });
          }
        }

        return children;
      };

      const tree = {
        userId: rootNode.userId._id,
        username: rootNode.username,
        tier: rootNode.userId ? rootNode.userId.tier : null,
        level: rootNode.matrixLevel,
        path: rootNode.matrixPath,
        stats: rootNode.stats,
        children: await buildTree(rootNode, 1)
      };

      return tree;

    } catch (error) {
      console.error('Get matrix tree error:', error);
      throw error;
    }
  }

  /**
   * Calculate commissions for a sale in the matrix
   * @param {ObjectId} buyerUserId - Who made the purchase
   * @param {Number} amount - Purchase amount
   * @param {Number} pv - Point value
   * @returns {Array} Commission records
   */
  static async calculateMatrixCommissions(buyerUserId, amount, pv) {
    try {
      const commissions = [];
      const buyer = await MatrixNode.findOne({ userId: buyerUserId });

      if (!buyer) {
        throw new Error('Buyer not found in matrix');
      }

      // 1. ISP - Sponsor earns 30% (goes to direct sponsor, not matrix parent)
      if (buyer.sponsor) {
        const sponsor = await MatrixNode.findOne({ userId: buyer.sponsor });
        if (sponsor) {
          const sponsorUser = await User.findById(buyer.sponsor);
          const ispRate = this.getISPRate(sponsorUser.tier);
          const ispAmount = amount * ispRate;

          commissions.push({
            userId: buyer.sponsor,
            type: 'ISP',
            amount: ispAmount,
            from: buyerUserId,
            description: `ISP from ${buyer.username}`,
            percentage: ispRate * 100
          });

          // Update sponsor's ISP earnings
          sponsor.commissions.isp.totalEarned += ispAmount;
          sponsor.commissions.isp.thisMonth += ispAmount;
          await sponsor.save();
        }
      }

      // 2. TSC - Matrix upline earns based on generation
      await this.calculateTSCCommissions(buyer, amount, pv, commissions);

      return commissions;

    } catch (error) {
      console.error('Calculate matrix commissions error:', error);
      throw error;
    }
  }

  /**
   * Calculate TSC commissions through matrix levels
   * @param {Object} buyer - Buyer's matrix node
   * @param {Number} amount - Purchase amount
   * @param {Number} pv - Point value
   * @param {Array} commissions - Commission array to populate
   */
  static async calculateTSCCommissions(buyer, amount, pv, commissions) {
    const tscRates = {
      2: 0.10,  // G2: 10%
      3: 0.05,  // G3: 5%
      4: 0.03,  // G4: 3%
      5: 0.02,  // G5: 2%
      6: 0.01,  // G6: 1%
      7: 0.01,  // G7: 1%
      8: 0.01,  // G8: 1%
      9: 0.01,  // G9: 1%
      10: 0.01  // G10: 1%
    };

    let currentNode = buyer;
    let generation = 1;

    // Traverse up the matrix tree
    while (currentNode.matrixParent && generation <= 10) {
      const parent = await MatrixNode.findOne({ userId: currentNode.matrixParent });

      if (!parent) break;

      generation++;

      // TSC starts at G2 (generation 2)
      if (generation >= 2 && tscRates[generation]) {
        const tscAmount = amount * tscRates[generation];

        commissions.push({
          userId: parent.userId,
          type: 'TSC',
          generation: generation,
          amount: tscAmount,
          from: buyer.userId,
          description: `TSC G${generation} from ${buyer.username}`,
          percentage: tscRates[generation] * 100
        });

        // Update parent's TSC earnings
        parent.commissions.tsc.totalEarned += tscAmount;
        parent.commissions.tsc.thisMonth += tscAmount;
        parent.commissions.tsc.byGeneration[`G${generation}`] += tscAmount;
        await parent.save();
      }

      currentNode = parent;
    }
  }

  /**
   * Get ISP rate based on tier
   * @param {String} tier - User's tier
   * @returns {Number} ISP rate (0.18-0.30)
   */
  static getISPRate(tier) {
    const rates = {
      'FAM': 0,
      'BRONZE': 0.18,
      'COPPER': 0.22,
      'SILVER': 0.25,
      'GOLD': 0.28,
      'PLATINUM': 0.30
    };
    return rates[tier] || 0;
  }

  /**
   * Notify user of spillover placement
   * @param {ObjectId} userId - User who received spillover
   * @param {ObjectId} newUserId - New user placed under them
   * @param {String} newUsername - New user's username
   */
  static async notifySpillover(userId, newUserId, newUsername) {
    // TODO: Implement notification system
    // This could send email, SMS, or in-app notification
    console.log(`Spillover notification: ${newUsername} placed under user ${userId}`);
  }

  /**
   * Get spillover statistics for a user
   * @param {ObjectId} userId - User's ID
   * @returns {Object} Spillover stats
   */
  static async getSpilloverStats(userId) {
    try {
      const node = await MatrixNode.findOne({ userId });

      if (!node) {
        throw new Error('User not found in matrix');
      }

      // Count spillover: People sponsored by user but not in their direct matrix line
      const personallyRecruited = node.personallyRecruited.length;
      const directMatrixChildren = node.matrixChildren.filter(c => c.filled).length;

      // Find how many were placed outside direct line
      const descendants = await node.getMatrixDescendants(2);
      const level2Count = descendants.filter(d => d.level === 2).length;

      return {
        totalRecruited: personallyRecruited,
        directLine: directMatrixChildren,
        spilloverReceived: level2Count - directMatrixChildren,
        spilloverGiven: personallyRecruited - directMatrixChildren,
        matrixFillPercentage: (directMatrixChildren / 7) * 100
      };

    } catch (error) {
      console.error('Get spillover stats error:', error);
      throw error;
    }
  }
}

module.exports = MatrixPlacementService;
