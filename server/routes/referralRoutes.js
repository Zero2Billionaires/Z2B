/**
 * Referral Routes
 * Get referral stats, team members, commissions, etc.
 */

import express from 'express';
import CoachUser from '../models/CoachUser.js';
import Member from '../models/Member.js';
import { APIError } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/referrals/stats
 * @desc    Get current user's referral statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get direct referrals
    const directReferrals = await CoachUser.find({ sponsorId: userId })
      .select('fullName email membershipNumber tier joinedDate')
      .sort({ joinedDate: -1 });

    // Count total referrals by generation
    const generation1 = await CoachUser.countDocuments({ sponsorId: userId });

    // Get all referral IDs from generation 1
    const gen1Ids = directReferrals.map(r => r._id);

    // Generation 2 - referrals of your referrals
    const generation2 = await CoachUser.countDocuments({
      sponsorId: { $in: gen1Ids }
    });

    // Get generation 2 IDs for generation 3 count
    const gen2Users = await CoachUser.find({
      sponsorId: { $in: gen1Ids }
    }).select('_id');
    const gen2Ids = gen2Users.map(r => r._id);

    // Generation 3
    const generation3 = await CoachUser.countDocuments({
      sponsorId: { $in: gen2Ids }
    });

    // Calculate total team size (all generations)
    const totalTeamSize = generation1 + generation2 + generation3;

    // Get member's tier info
    const user = await CoachUser.findById(userId);

    // Tier-based ISP percentages (from compensation plan - matches opportunity page)
    const tierISPRates = {
      'FAM': 0.00,      // Free tier - no commission
      'Bronze': 0.18,   // 18% - Updated to match opportunity page
      'Copper': 0.22,   // 22% - Updated to match opportunity page
      'Silver': 0.25,   // 25% - Updated to match opportunity page
      'Gold': 0.28,     // 28% - Updated to match opportunity page
      'Platinum': 0.30, // 30% - Updated to match opportunity page
      'Diamond': 0.00   // Whitelabel tier - sets own prices, keeps all sales, pays Z2B whitelabel premium only
    };

    // Average monthly subscription price (example: R480 for Bronze)
    const avgSubscriptionPrice = 480;
    const userISPRate = tierISPRates[user.tier] || 0.20;

    // Calculate ISP based on tier percentage
    const ispCommission = generation1 * avgSubscriptionPrice * userISPRate;

    // TSC varies by tier (simplified calculation)
    const tscCommission = totalTeamSize * 50; // Placeholder for TSC calculation

    // QPB: Quick Pathfinder Bonus - 8% for first 3 sales, 10% for each additional set of 3
    // Cycle runs from 4th of current month to 3rd of next month
    const now = new Date();
    let cycleStartDate, cycleEndDate;

    // Determine current cycle dates
    if (now.getDate() >= 4) {
      // We're in the cycle that started on the 4th of this month
      cycleStartDate = new Date(now.getFullYear(), now.getMonth(), 4, 0, 0, 0);
      cycleEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 3, 23, 59, 59);
    } else {
      // We're in the cycle that started on the 4th of last month
      cycleStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 4, 0, 0, 0);
      cycleEndDate = new Date(now.getFullYear(), now.getMonth(), 3, 23, 59, 59);
    }

    // Get all referrals in current cycle with their tier information
    const cycleReferrals = await CoachUser.find({
      sponsorId: userId,
      joinedDate: { $gte: cycleStartDate, $lte: cycleEndDate }
    }).select('tier joinedDate').sort({ joinedDate: 1 });

    // Tier subscription prices
    const tierPrices = {
      'FAM': 0,
      'Bronze': 480,
      'Copper': 999,
      'Silver': 1480,
      'Gold': 2980,
      'Platinum': 4980,
      'Diamond': 4980
    };

    // Calculate QPB based on sets of 3
    let qpbBonus = 0;
    const totalSales = cycleReferrals.length;
    const completeSetsOf3 = Math.floor(totalSales / 3);

    if (completeSetsOf3 > 0) {
      // Process each set of 3
      for (let setIndex = 0; setIndex < completeSetsOf3; setIndex++) {
        const startIdx = setIndex * 3;
        const setOf3 = cycleReferrals.slice(startIdx, startIdx + 3);

        // Calculate total sales value for this set of 3
        const setSalesValue = setOf3.reduce((sum, referral) => {
          return sum + (tierPrices[referral.tier] || 0);
        }, 0);

        // First set of 3 = 7.5%, additional sets = 10% (matches opportunity page)
        const qpbRate = setIndex === 0 ? 0.075 : 0.10;
        qpbBonus += setSalesValue * qpbRate;
      }
    }

    const remainingSales = totalSales % 3;

    const potentialIncome = {
      ISP: Math.round(ispCommission),
      TSC: Math.round(tscCommission),
      QPB: Math.round(qpbBonus),
      estimated: Math.round(ispCommission + tscCommission + qpbBonus)
    };

    // Calculate days remaining in current cycle
    const daysRemaining = Math.ceil((cycleEndDate - now) / (1000 * 60 * 60 * 24));

    // QPB breakdown for display
    const qpbSets = [];
    for (let i = 0; i < completeSetsOf3; i++) {
      const rate = i === 0 ? '7.5%' : '10%';
      const setNum = i + 1;
      qpbSets.push({
        setNumber: setNum,
        rate: rate,
        description: `Set ${setNum} (Sales ${i * 3 + 1}-${i * 3 + 3}): ${rate}`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        membershipNumber: user.membershipNumber,
        referralLink: user.getReferralLink(),
        tier: user.tier,
        tierISPRate: (userISPRate * 100) + '%',
        stats: {
          directReferrals: generation1,
          generation1,
          generation2,
          generation3,
          totalTeamSize,
          potentialIncome,
          qpbProgress: {
            cycleStart: cycleStartDate,
            cycleEnd: cycleEndDate,
            totalSalesThisCycle: totalSales,
            completeSets: completeSetsOf3,
            remainingSales: remainingSales,
            nextSetNeeds: remainingSales > 0 ? 3 - remainingSales : 3,
            qpbEarned: Math.round(qpbBonus),
            qpbSets: qpbSets,
            daysRemaining: daysRemaining,
            explanation: completeSetsOf3 === 0
              ? `You need 3 sales by ${cycleEndDate.toLocaleDateString()} to earn your first QPB (7.5% of sales value)`
              : `You've earned ${completeSetsOf3} QPB set(s) this cycle! Next set pays 10%.`
          }
        },
        recentReferrals: directReferrals.slice(0, 10) // Last 10 referrals
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/referrals/team
 * @desc    Get user's full team (all generations)
 * @access  Private
 */
router.get('/team', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { generation, limit = 50, page = 1 } = req.query;

    // Get direct referrals (Generation 1)
    const generation1 = await CoachUser.find({ sponsorId: userId })
      .select('fullName email membershipNumber tier joinedDate totalActionsCompleted')
      .sort({ joinedDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // If specific generation requested
    if (generation === '2') {
      const gen1Ids = await CoachUser.find({ sponsorId: userId }).select('_id');
      const gen1IdArray = gen1Ids.map(r => r._id);

      const generation2 = await CoachUser.find({
        sponsorId: { $in: gen1IdArray }
      })
        .select('fullName email membershipNumber tier joinedDate sponsorId')
        .populate('sponsorId', 'fullName membershipNumber')
        .sort({ joinedDate: -1 })
        .limit(parseInt(limit));

      return res.status(200).json({
        success: true,
        data: {
          generation: 2,
          members: generation2,
          count: generation2.length
        }
      });
    }

    // Return generation 1 by default
    res.status(200).json({
      success: true,
      data: {
        generation: 1,
        members: generation1,
        count: generation1.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/referrals/validate/:membershipNumber
 * @desc    Validate a referral code
 * @access  Public
 */
router.get('/validate/:membershipNumber', async (req, res, next) => {
  try {
    const { membershipNumber } = req.params;

    // Validate format
    if (!/^Z2B\d{7}$/.test(membershipNumber)) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Invalid membership number format. Should be Z2B0000001'
      });
    }

    // Check if exists
    const coachUser = await CoachUser.findOne({ membershipNumber })
      .select('fullName membershipNumber tier');

    const member = await Member.findOne({ membershipNumber })
      .select('fullName membershipNumber tier');

    const sponsor = coachUser || member;

    if (!sponsor) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Membership number not found'
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      sponsor: {
        fullName: sponsor.fullName,
        membershipNumber: sponsor.membershipNumber,
        tier: sponsor.tier
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/referrals/leaderboard
 * @desc    Get top referrers
 * @access  Public
 */
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    // Aggregate to count referrals per user
    const topReferrers = await CoachUser.aggregate([
      {
        $lookup: {
          from: 'coachusers',
          localField: '_id',
          foreignField: 'sponsorId',
          as: 'referrals'
        }
      },
      {
        $project: {
          fullName: 1,
          membershipNumber: 1,
          tier: 1,
          totalReferrals: { $size: '$referrals' }
        }
      },
      {
        $match: {
          totalReferrals: { $gt: 0 }
        }
      },
      {
        $sort: { totalReferrals: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.status(200).json({
      success: true,
      data: topReferrers
    });
  } catch (error) {
    next(error);
  }
});

export default router;
