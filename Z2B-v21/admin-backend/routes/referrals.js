const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify user token (not admin)
const verifyUserToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's a user token (has userId)
        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Get Referral Stats - Returns team size, generations, and income potential
router.get('/stats', verifyUserToken, async (req, res) => {
    try {
        // Find the current user
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find all team members (users who have this user as sponsor)
        const teamMembers = await User.find({ sponsorId: user._id });

        // Calculate generations (simplified - direct referrals only for now)
        const generation1 = teamMembers.length;

        // Find generation 2 (referrals of referrals)
        const gen1Ids = teamMembers.map(m => m._id);
        const generation2Members = await User.find({ sponsorId: { $in: gen1Ids } });
        const generation2 = generation2Members.length;

        // Find generation 3
        const gen2Ids = generation2Members.map(m => m._id);
        const generation3Members = await User.find({ sponsorId: { $in: gen2Ids } });
        const generation3 = generation3Members.length;

        // Calculate total team size
        const totalTeamSize = generation1 + generation2 + generation3;

        // Get tier ISP rate
        const tierRates = {
            'FAM': '0%',
            'BRONZE': '25%',
            'COPPER': '30%',
            'SILVER': '35%',
            'GOLD': '40%',
            'PLATINUM': '45%',
            'LIFETIME': '45%'
        };

        const tierISPRate = tierRates[user.tier] || '0%';

        // Calculate potential income (simplified)
        const avgSalePrice = 480; // Average Bronze tier price
        const ispRate = parseInt(tierISPRate) / 100;

        const potentialISP = generation1 * avgSalePrice * ispRate;
        const potentialTSC = (generation2 * avgSalePrice * 0.05) + (generation3 * avgSalePrice * 0.03);
        const potentialQPB = Math.floor(generation1 / 3) * (avgSalePrice * 3 * 0.075); // 7.5% for first set

        res.json({
            success: true,
            data: {
                tier: user.tier,
                tierISPRate,
                stats: {
                    totalTeamSize,
                    directReferrals: generation1,
                    generation1,
                    generation2,
                    generation3,
                    potentialIncome: {
                        ISP: Math.round(potentialISP),
                        TSC: Math.round(potentialTSC),
                        QPB: Math.round(potentialQPB),
                        estimated: Math.round(potentialISP + potentialTSC + potentialQPB)
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching referral stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching referral statistics'
        });
    }
});

// Get Team Members List - Returns actual team members with details
router.get('/members', verifyUserToken, async (req, res) => {
    try {
        const generation = req.query.generation || 'all';

        // Find the current user
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let members = [];

        if (generation === 'all' || generation === '1') {
            // Get Generation 1 (direct referrals)
            const gen1 = await User.find({ sponsorId: user._id })
                .select('firstName lastName email phone tier referralCode createdAt')
                .sort({ createdAt: -1 });

            members = members.concat(gen1.map(m => ({
                fullName: `${m.firstName} ${m.lastName}`,
                firstName: m.firstName,
                lastName: m.lastName,
                email: m.email,
                phone: m.phone,
                membershipNumber: m.referralCode,
                tier: m.tier,
                joinedDate: m.createdAt,
                generation: 1,
                referralLink: `https://z2blegacybuilders.co.za/register.html?ref=${m.referralCode}`
            })));
        }

        if (generation === 'all' || generation === '2') {
            // Get Generation 2 (referrals of referrals)
            const gen1 = await User.find({ sponsorId: user._id }).select('_id');
            const gen1Ids = gen1.map(m => m._id);

            const gen2 = await User.find({ sponsorId: { $in: gen1Ids } })
                .select('firstName lastName email phone tier referralCode createdAt')
                .sort({ createdAt: -1 });

            members = members.concat(gen2.map(m => ({
                fullName: `${m.firstName} ${m.lastName}`,
                firstName: m.firstName,
                lastName: m.lastName,
                email: m.email,
                phone: m.phone,
                membershipNumber: m.referralCode,
                tier: m.tier,
                joinedDate: m.createdAt,
                generation: 2,
                referralLink: `https://z2blegacybuilders.co.za/register.html?ref=${m.referralCode}`
            })));
        }

        if (generation === 'all' || generation === '3') {
            // Get Generation 3
            const gen1 = await User.find({ sponsorId: user._id }).select('_id');
            const gen1Ids = gen1.map(m => m._id);
            const gen2 = await User.find({ sponsorId: { $in: gen1Ids } }).select('_id');
            const gen2Ids = gen2.map(m => m._id);

            const gen3 = await User.find({ sponsorId: { $in: gen2Ids } })
                .select('firstName lastName email phone tier referralCode createdAt')
                .sort({ createdAt: -1 });

            members = members.concat(gen3.map(m => ({
                fullName: `${m.firstName} ${m.lastName}`,
                firstName: m.firstName,
                lastName: m.lastName,
                email: m.email,
                phone: m.phone,
                membershipNumber: m.referralCode,
                tier: m.tier,
                joinedDate: m.createdAt,
                generation: 3,
                referralLink: `https://z2blegacybuilders.co.za/register.html?ref=${m.referralCode}`
            })));
        }

        res.json({
            success: true,
            data: {
                members,
                total: members.length,
                generation: generation
            }
        });

    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching team members'
        });
    }
});

module.exports = router;
