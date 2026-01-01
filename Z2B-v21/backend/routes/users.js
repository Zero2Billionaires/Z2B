const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../middleware/auth');

// Helper function to check if phase is complete (3 generations deep with 3 positions each)
async function isPhaseComplete(userId, phase, maxGenerations = 3) {
    const user = await User.findById(userId).populate('directDownline');
    if (!user) return false;

    // Get positions for this phase (phase 1: pos 1-3, phase 2: pos 4-6, etc.)
    const phaseStart = (phase - 1) * 3 + 1;
    const phaseEnd = phase * 3;
    const phaseDownline = user.directDownline.filter((child, idx) => {
        const pos = idx + 1;
        return pos >= phaseStart && pos <= phaseEnd;
    });

    if (phaseDownline.length < 3) return false; // Phase not filled yet

    // Check if all 3 positions have gone 3 generations deep
    async function checkGenerationDepth(nodeId, currentDepth) {
        if (currentDepth >= maxGenerations) return true;
        const node = await User.findById(nodeId).populate('directDownline');
        if (!node || !node.directDownline || node.directDownline.length === 0) return false;
        if (node.directDownline.length < 3) return false; // Must have 3 to be complete

        // Check all 3 children go to next depth
        for (const child of node.directDownline) {
            const isDeep = await checkGenerationDepth(child._id, currentDepth + 1);
            if (!isDeep) return false;
        }
        return true;
    }

    for (const child of phaseDownline) {
        const isComplete = await checkGenerationDepth(child._id, 1);
        if (!isComplete) return false;
    }

    return true;
}

// Helper function to find next available position in Phased 12x12 Matrix
async function findNextAvailablePosition(sponsorId, placementParentId = null) {
    if (!sponsorId) {
        return { placementParentId: null, position: '1', level: 0, phase: 1 };
    }

    const sponsor = await User.findById(sponsorId).populate('directDownline');
    if (!sponsor) {
        return { placementParentId: null, position: '1', level: 0, phase: 1 };
    }

    // If manual placement with specific parent, use that
    if (placementParentId) {
        const parent = await User.findById(placementParentId).populate('directDownline');
        if (parent && parent.directDownline.length < 3) {
            const position = parent.directDownline.length + 1;
            return {
                placementParentId: parent._id,
                placementParentName: parent.name,
                placementParentEmail: parent.email,
                position: position.toString(),
                level: (parent.matrixLevel || 0) + 1,
                phase: parent.matrixPhase || 1
            };
        }
    }

    // Determine current phase for sponsor
    let currentPhase = sponsor.matrixPhase || 1;
    const sponsorDownlineCount = sponsor.directDownline?.length || 0;

    // Check if we need to advance to next phase
    if (sponsorDownlineCount >= currentPhase * 3) {
        // Current phase positions filled, check if phase is complete (3 generations deep)
        const phaseComplete = await isPhaseComplete(sponsor._id, currentPhase);
        if (phaseComplete && currentPhase < 4) {
            currentPhase++;
            sponsor.matrixPhase = currentPhase;
            await sponsor.save();
        }
    }

    // Check if sponsor has space in current phase
    const maxPositionsForPhase = currentPhase * 3;
    if (sponsorDownlineCount < maxPositionsForPhase) {
        const position = sponsorDownlineCount + 1;
        return {
            placementParentId: sponsor._id,
            placementParentName: sponsor.name,
            placementParentEmail: sponsor.email,
            position: position.toString(),
            level: (sponsor.matrixLevel || 0) + 1,
            phase: currentPhase
        };
    }

    // If sponsor is full for current phase, find next available in downline (breadth-first, max 3 levels)
    const queue = [[sponsor._id, 0]]; // [userId, depth]
    const visited = new Set();
    const MAX_DEPTH = 3; // Only go 3 generations deep

    while (queue.length > 0) {
        const [currentId, depth] = queue.shift();
        if (depth >= MAX_DEPTH) continue; // Stop at 3 generations
        if (visited.has(currentId.toString())) continue;
        visited.add(currentId.toString());

        const current = await User.findById(currentId).populate('directDownline');
        if (!current) continue;

        // Check if current user has space (less than 3 direct)
        if (!current.directDownline || current.directDownline.length < 3) {
            const position = (current.directDownline?.length || 0) + 1;
            return {
                placementParentId: current._id,
                placementParentName: current.name,
                placementParentEmail: current.email,
                position: position.toString(),
                level: (current.matrixLevel || 0) + 1,
                phase: current.matrixPhase || 1
            };
        }

        // Add children to queue if within depth limit
        if (current.directDownline && depth + 1 < MAX_DEPTH) {
            current.directDownline.forEach(child => {
                if (child && child._id) queue.push([child._id, depth + 1]);
            });
        }
    }

    // Fallback: place under sponsor (should rarely happen)
    return {
        placementParentId: sponsor._id,
        placementParentName: sponsor.name,
        placementParentEmail: sponsor.email,
        position: (sponsorDownlineCount + 1).toString(),
        level: (sponsor.matrixLevel || 0) + 1,
        phase: currentPhase
    };
}

// Get All Users (with pagination and filtering)
router.get('/', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000; // Higher limit for admin panel
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.tier) filter.tier = req.query.tier;
        if (req.query.status) filter.accountStatus = req.query.status;
        if (req.query.search) {
            filter.$or = [
                { firstName: new RegExp(req.query.search, 'i') },
                { lastName: new RegExp(req.query.search, 'i') },
                { email: new RegExp(req.query.search, 'i') },
                { referralCode: new RegExp(req.query.search, 'i') }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.json({
            success: true,
            users: users, // Add 'users' field for frontend compatibility
            data: users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// Get Single User by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('sponsorId', 'firstName lastName email referralCode');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user'
        });
    }
});

// Grant Free Access - Find user by email and upgrade tier with free access
router.put('/grant-free-access', verifyToken, async (req, res) => {
    try {
        const { email, tier } = req.body;

        if (!email || !tier) {
            return res.status(400).json({
                success: false,
                message: 'Email and tier are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email address'
            });
        }

        // Update user tier and grant free access
        const oldTier = user.tier;
        user.tier = tier;
        user.freeAccess = true; // Mark as free access granted
        user.accountNotes = (user.accountNotes || '') + `\n[${new Date().toISOString()}] Admin granted free access: upgraded from ${oldTier} to ${tier}`;

        await user.save();

        res.json({
            success: true,
            message: `Free access granted! User upgraded from ${oldTier} to ${tier}`,
            data: {
                email: user.email,
                oldTier,
                newTier: tier,
                freeAccess: true
            }
        });
    } catch (error) {
        console.error('Error granting free access:', error);
        res.status(500).json({
            success: false,
            message: 'Error granting free access'
        });
    }
});

// Create New User (Admin Registration)
router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            name,
            firstName,
            lastName,
            email,
            phone,
            tier,
            isBetaTester,
            sponsorCode,
            password,
            freeAccess,
            idNumber,
            recruitingBuilderId, // Builder who recruited this person (for ISP credit)
            enableStrategicPlacement // If true, create as PENDING_PLACEMENT for manual placement
        } = req.body;

        // Handle name field - split into firstName and lastName if provided
        let fName = firstName;
        let lName = lastName;

        if (name && !firstName && !lastName) {
            const nameParts = name.trim().split(' ');
            fName = nameParts[0] || 'User';
            lName = nameParts.slice(1).join(' ') || '';
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Find sponsor if sponsor code provided
        let sponsor = null;
        let sponsorId = null;
        if (sponsorCode) {
            sponsor = await User.findOne({ referralCode: sponsorCode });
            if (sponsor) {
                sponsorId = sponsor._id;
            }
        }

        // Determine recruiting builder (ISP beneficiary)
        let recruitingBuilder = null;
        let recruitingBuilderId_final = recruitingBuilderId || sponsorId;
        if (recruitingBuilderId_final) {
            recruitingBuilder = await User.findById(recruitingBuilderId_final);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password || 'Welcome@123', 10);

        let placement = null;
        let placementStatus = 'AUTO_PLACED';
        let registrationType = 'MANUAL'; // Admin created

        // If strategic placement is enabled, create as pending
        if (enableStrategicPlacement && recruitingBuilder) {
            placementStatus = 'PENDING_PLACEMENT';
            // Don't calculate placement yet - builder will choose
        } else {
            // Auto-place in matrix
            placement = await findNextAvailablePosition(sponsorId);
        }

        // Create new user with placement info
        const user = new User({
            firstName: fName,
            lastName: lName,
            email: email.toLowerCase(),
            phone,
            idNumber,
            tier: tier || 'FAM',
            isBetaTester: isBetaTester || false,
            sponsorCode,
            sponsorId: sponsorId,
            password: hashedPassword,
            isEmailVerified: true,
            createdByAdmin: true,
            accountStatus: 'ACTIVE',
            freeAccess: freeAccess || false,
            placementPosition: placement ? placement.position : null,
            placementParentId: placement ? placement.placementParentId : null,
            matrixLevel: placement ? placement.level : 0,
            matrixPhase: placement ? placement.phase : 1,
            registrationType,
            recruitingBuilderId: recruitingBuilderId_final,
            ispBeneficiaryId: recruitingBuilderId_final, // ISP goes to recruiting builder
            placementStatus,
            placementLocked: placementStatus === 'AUTO_PLACED' // Auto-placed = immediately locked
        });

        await user.save();

        // Update placement parent's directDownline array (only if auto-placed)
        if (placement && placement.placementParentId) {
            await User.findByIdAndUpdate(
                placement.placementParentId,
                { $push: { directDownline: user._id } }
            );
        }

        // Update sponsor's directReferrals count if sponsor exists
        if (sponsor) {
            sponsor.directReferrals = (sponsor.directReferrals || 0) + 1;
            await sponsor.save();
        }

        // Update recruiting builder's personal sales count
        if (recruitingBuilder) {
            recruitingBuilder.personalSales = (recruitingBuilder.personalSales || 0) + 1;
            await recruitingBuilder.save();
        }

        // Prepare response with placement information
        const responseData = {
            id: user._id,
            email: user.email,
            name: user.name,
            referralCode: user.referralCode,
            placementStatus,
            placement: placement ? {
                position: placement.position,
                level: placement.level,
                phase: placement.phase,
                parentName: placement.placementParentName || 'Top Level',
                parentEmail: placement.placementParentEmail || 'N/A',
                sponsorName: sponsor ? sponsor.name : 'No Sponsor',
                sponsorEmail: sponsor ? sponsor.email : 'N/A'
            } : {
                status: 'Pending Strategic Placement',
                message: 'Builder can now place this member strategically'
            }
        };

        res.status(201).json({
            success: true,
            message: placementStatus === 'PENDING_PLACEMENT'
                ? 'User created successfully. Ready for strategic placement.'
                : 'User created and placed successfully',
            data: responseData
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating user'
        });
    }
});

// Strategic Placement - Builder places their manually recruited member
router.post('/:userId/strategic-placement', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { placementParentId } = req.body; // Where to place the member

        // Get the user to be placed
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify placement is not already locked
        if (user.placementLocked) {
            return res.status(400).json({
                success: false,
                message: 'Placement is already locked and cannot be changed'
            });
        }

        // Verify user is in pending placement status
        if (user.placementStatus !== 'PENDING_PLACEMENT') {
            return res.status(400).json({
                success: false,
                message: 'User is not pending strategic placement'
            });
        }

        // Verify the requesting user is the ISP beneficiary (owns this recruit)
        // For now, we'll allow admin to place anyone. Later, add builder authentication check
        // if (req.user.id !== user.ispBeneficiaryId.toString()) {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Only the recruiting builder can place this member'
        //     });
        // }

        // Calculate placement
        const placement = await findNextAvailablePosition(user.sponsorId, placementParentId);

        // Get placement parent info
        const placementParent = await User.findById(placement.placementParentId);

        // Update user with placement information
        user.placementPosition = placement.position;
        user.placementParentId = placement.placementParentId;
        user.matrixLevel = placement.level;
        user.matrixPhase = placement.phase;
        user.placementStatus = 'PLACED';
        user.placementLocked = true; // PERMANENT - cannot be changed
        user.placementLockedAt = new Date();

        await user.save();

        // Update placement parent's directDownline array
        if (placement.placementParentId) {
            await User.findByIdAndUpdate(
                placement.placementParentId,
                { $push: { directDownline: user._id } }
            );
        }

        res.json({
            success: true,
            message: 'Member placed successfully. Placement is now permanent.',
            data: {
                userId: user._id,
                userName: user.name,
                placement: {
                    position: placement.position,
                    level: placement.level,
                    phase: placement.phase,
                    parentName: placement.placementParentName || 'Top Level',
                    parentEmail: placement.placementParentEmail || 'N/A',
                    lockedAt: user.placementLockedAt
                }
            }
        });
    } catch (error) {
        console.error('Error performing strategic placement:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing strategic placement'
        });
    }
});

// Update User
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updates = req.body;

        // Don't allow password update through this route
        delete updates.password;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
    }
});

// Grant Free Access to Apps
router.post('/:id/grant-access', verifyToken, async (req, res) => {
    try {
        const { apps } = req.body; // { zyro: true, zyra: true, ... }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.freeAppAccess = { ...user.freeAppAccess, ...apps };
        await user.save();

        res.json({
            success: true,
            message: 'App access granted successfully',
            data: user.freeAppAccess
        });
    } catch (error) {
        console.error('Error granting access:', error);
        res.status(500).json({
            success: false,
            message: 'Error granting app access'
        });
    }
});

// Add Fuel Credits
router.post('/:id/add-fuel', verifyToken, async (req, res) => {
    try {
        const { credits, reason } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.fuelCredits += parseInt(credits);
        user.accountNotes = (user.accountNotes || '') + `\n[${new Date().toISOString()}] Admin added ${credits} fuel credits. Reason: ${reason || 'N/A'}`;
        await user.save();

        res.json({
            success: true,
            message: `${credits} fuel credits added successfully`,
            data: {
                newBalance: user.fuelCredits
            }
        });
    } catch (error) {
        console.error('Error adding fuel:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding fuel credits'
        });
    }
});

// Change User Tier
router.post('/:id/change-tier', verifyToken, async (req, res) => {
    try {
        const { tier, reason } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const oldTier = user.tier;
        user.tier = tier;
        user.accountNotes = (user.accountNotes || '') + `\n[${new Date().toISOString()}] Admin changed tier from ${oldTier} to ${tier}. Reason: ${reason || 'N/A'}`;
        await user.save();

        res.json({
            success: true,
            message: `User tier changed from ${oldTier} to ${tier}`,
            data: {
                oldTier,
                newTier: tier
            }
        });
    } catch (error) {
        console.error('Error changing tier:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing user tier'
        });
    }
});

// Delete User
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
});

module.exports = router;
