const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Helper function to calculate days remaining until deadline
function getDaysRemaining(deadline) {
    if (!deadline) return null;
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Get FAM Members with Countdown (Admin & User Dashboard)
router.get('/fam-countdown', verifyToken, async (req, res) => {
    try {
        const { userId } = req.query; // Optional: get specific user's countdown

        let query = { tier: 'FAM', famUpgradeDeadline: { $exists: true } };
        if (userId) {
            query._id = userId;
        }

        const famMembers = await User.find(query)
            .select('firstName lastName email referralCode tier famUpgradeDeadline createdAt directDownline')
            .populate('directDownline', 'firstName lastName email tier');

        const membersWithCountdown = famMembers.map(member => {
            const daysRemaining = getDaysRemaining(member.famUpgradeDeadline);
            const isPastDeadline = daysRemaining < 0;
            const isWarningZone = daysRemaining <= 14 && daysRemaining >= 0; // Last 2 weeks
            const teamCount = member.directDownline?.length || 0;

            return {
                _id: member._id,
                name: `${member.firstName} ${member.lastName}`,
                email: member.email,
                referralCode: member.referralCode,
                registeredDate: member.createdAt,
                deadline: member.famUpgradeDeadline,
                daysRemaining,
                isPastDeadline,
                isWarningZone,
                teamCount,
                teamMembers: member.directDownline,
                status: isPastDeadline ? 'EXPIRED' : isWarningZone ? 'WARNING' : 'ACTIVE',
                warningMessage: isPastDeadline
                    ? `⚠️ Deadline passed ${Math.abs(daysRemaining)} days ago! Team will be redistributed.`
                    : isWarningZone
                    ? `⏰ Only ${daysRemaining} days left! Upgrade now to keep your ${teamCount} team members.`
                    : `✓ ${daysRemaining} days remaining`
            };
        });

        // Sort by days remaining (urgent first)
        membersWithCountdown.sort((a, b) => a.daysRemaining - b.daysRemaining);

        res.json({
            success: true,
            data: membersWithCountdown,
            summary: {
                total: membersWithCountdown.length,
                expired: membersWithCountdown.filter(m => m.isPastDeadline).length,
                warning: membersWithCountdown.filter(m => m.isWarningZone).length,
                active: membersWithCountdown.filter(m => !m.isPastDeadline && !m.isWarningZone).length
            }
        });
    } catch (error) {
        console.error('Error fetching FAM countdown:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching FAM countdown data'
        });
    }
});

// Get Qualified Builders for Spillovers (2+ personal sales)
router.get('/qualified-builders', verifyToken, async (req, res) => {
    try {
        const qualifiedBuilders = await User.find({
            personalSales: { $gte: 2 },
            tier: { $ne: 'FAM' }, // Must be paid member
            accountStatus: 'ACTIVE'
        })
        .select('firstName lastName email referralCode tier personalSales qualifiedForSpillovers receivedSpillovers directDownline')
        .sort({ personalSales: -1 }); // Sort by most sales first

        const buildersWithStats = qualifiedBuilders.map(builder => ({
            _id: builder._id,
            name: `${builder.firstName} ${builder.lastName}`,
            email: builder.email,
            referralCode: builder.referralCode,
            tier: builder.tier,
            personalSales: builder.personalSales,
            qualifiedForSpillovers: builder.qualifiedForSpillovers,
            receivedSpillovers: builder.receivedSpillovers || 0,
            currentTeamSize: builder.directDownline?.length || 0,
            availableSlots: 12 - (builder.directDownline?.length || 0) // Max 12 in phased matrix
        }));

        res.json({
            success: true,
            data: buildersWithStats,
            totalQualified: buildersWithStats.length
        });
    } catch (error) {
        console.error('Error fetching qualified builders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching qualified builders'
        });
    }
});

// Process FAM Spillover Distribution (Manual or Scheduled)
router.post('/process-spillovers', verifyToken, async (req, res) => {
    try {
        // Find expired FAM members (past deadline and not upgraded)
        const expiredFAMs = await User.find({
            tier: 'FAM',
            famUpgradeDeadline: { $lt: new Date() },
            isSpilloverEligible: { $ne: true } // Not already processed
        }).populate('directDownline sponsorId');

        if (expiredFAMs.length === 0) {
            return res.json({
                success: true,
                message: 'No expired FAM members to process',
                processed: 0
            });
        }

        // Mark them as spillover eligible
        const expiredIds = expiredFAMs.map(f => f._id);
        await User.updateMany(
            { _id: { $in: expiredIds } },
            {
                $set: {
                    isSpilloverEligible: true,
                    registrationType: 'SPILLOVER'
                }
            }
        );

        // Get qualified builders (2+ personal sales, first-come-first-serve)
        const qualifiedBuilders = await User.find({
            personalSales: { $gte: 2 },
            tier: { $ne: 'FAM' },
            accountStatus: 'ACTIVE',
            qualifiedForSpillovers: true
        })
        .populate('directDownline')
        .sort({ personalSales: -1, createdAt: 1 }); // Most sales, then earliest qualification

        if (qualifiedBuilders.length === 0) {
            return res.json({
                success: true,
                message: 'No qualified builders available for spillovers',
                expiredFAMs: expiredFAMs.length,
                processed: 0
            });
        }

        // Distribute expired FAMs' team members to qualified builders
        const distributions = [];
        let builderIndex = 0;

        for (const expiredFAM of expiredFAMs) {
            if (!expiredFAM.directDownline || expiredFAM.directDownline.length === 0) {
                continue; // No team to distribute
            }

            // Get team members to redistribute
            const teamMembers = expiredFAM.directDownline;

            for (const teamMember of teamMembers) {
                // Find next qualified builder with available slots (round-robin)
                let attempts = 0;
                let builder = null;

                while (attempts < qualifiedBuilders.length) {
                    const currentBuilder = qualifiedBuilders[builderIndex % qualifiedBuilders.length];
                    const currentSlots = currentBuilder.directDownline?.length || 0;

                    if (currentSlots < 12) { // Has space in phased matrix
                        builder = currentBuilder;
                        break;
                    }

                    builderIndex++;
                    attempts++;
                }

                if (!builder) {
                    console.log('No builders with available slots');
                    break;
                }

                // Update team member's placement
                await User.findByIdAndUpdate(teamMember._id, {
                    $set: {
                        sponsorId: builder._id,
                        placementParentId: builder._id,
                        registrationType: 'SPILLOVER'
                    }
                });

                // Add to builder's downline
                await User.findByIdAndUpdate(builder._id, {
                    $push: { directDownline: teamMember._id },
                    $inc: { receivedSpillovers: 1 }
                });

                distributions.push({
                    teamMember: `${teamMember.firstName} ${teamMember.lastName}`,
                    fromFAM: `${expiredFAM.firstName} ${expiredFAM.lastName}`,
                    toBuilder: `${builder.firstName} ${builder.lastName}`,
                    builderEmail: builder.email
                });

                builderIndex++; // Move to next builder for next member
            }

            // Clear expired FAM's downline
            await User.findByIdAndUpdate(expiredFAM._id, {
                $set: { directDownline: [] }
            });
        }

        res.json({
            success: true,
            message: `Successfully distributed ${distributions.length} team members from ${expiredFAMs.length} expired FAM accounts`,
            expiredFAMs: expiredFAMs.length,
            distributions: distributions.length,
            details: distributions
        });
    } catch (error) {
        console.error('Error processing spillovers:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing spillover distribution'
        });
    }
});

// Get Spillover Statistics (Admin Dashboard)
router.get('/statistics', verifyToken, async (req, res) => {
    try {
        const stats = await Promise.all([
            // Total FAM members
            User.countDocuments({ tier: 'FAM' }),

            // FAM members approaching deadline (within 14 days)
            User.countDocuments({
                tier: 'FAM',
                famUpgradeDeadline: {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                }
            }),

            // Expired FAM members
            User.countDocuments({
                tier: 'FAM',
                famUpgradeDeadline: { $lt: new Date() }
            }),

            // Qualified builders
            User.countDocuments({
                personalSales: { $gte: 2 },
                tier: { $ne: 'FAM' },
                qualifiedForSpillovers: true
            }),

            // Total spillovers distributed
            User.aggregate([
                { $match: { receivedSpillovers: { $gt: 0 } } },
                { $group: { _id: null, total: { $sum: '$receivedSpillovers' } } }
            ])
        ]);

        res.json({
            success: true,
            statistics: {
                totalFAMs: stats[0],
                approachingDeadline: stats[1],
                expiredFAMs: stats[2],
                qualifiedBuilders: stats[3],
                totalSpilloversDistributed: stats[4][0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Error fetching spillover statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching spillover statistics'
        });
    }
});

module.exports = router;
