/**
 * Authentication Routes
 * Register, Login, Logout, Get Current User, Update Profile
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import CoachUser from '../models/CoachUser.js';
import Member from '../models/Member.js';
import { APIError } from '../middleware/errorHandler.js';
import {
  protect,
  generateToken,
  verifyToken,
  sendTokenResponse
} from '../middleware/auth.js';

const router = express.Router();

// ========================================
// PUBLIC ROUTES
// ========================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password, memberId, referralCode, tier } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return next(new APIError('Please provide all required fields', 400));
    }

    // Check if user exists
    const existingUser = await CoachUser.findOne({ email });
    if (existingUser) {
      return next(new APIError('User with this email already exists', 400));
    }

    // Find sponsor by referral code (membership number)
    let sponsorId = null;
    if (referralCode) {
      // Check if it's a valid Z2B membership number format
      if (/^Z2B\d{7}$/.test(referralCode)) {
        // Look for sponsor in both CoachUser and Member collections
        const sponsorCoachUser = await CoachUser.findOne({ membershipNumber: referralCode });
        const sponsorMember = await Member.findOne({ membershipNumber: referralCode });

        if (sponsorCoachUser) {
          sponsorId = sponsorCoachUser._id;
        } else if (sponsorMember) {
          // Link to member if found
          sponsorId = sponsorMember._id;
        } else {
          return next(new APIError('Invalid referral code', 400));
        }
      } else {
        return next(new APIError('Referral code must be in format Z2B0000001', 400));
      }
    }

    // Verify memberId exists if provided
    if (memberId) {
      const member = await Member.findById(memberId);
      if (!member) {
        return next(new APIError('Invalid member ID', 400));
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await CoachUser.create({
      fullName,
      email,
      password: hashedPassword,
      memberId: memberId || null,
      sponsorId: sponsorId || null,
      tier: tier || 'FAM',
      currentStage: 'Beginner',
      currentFocusLeg: 'Mindset Mystery'
    });

    // Send token response with membership info
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(new APIError('Please provide email and password', 400));
    }

    // Check for user (include password for comparison)
    const user = await CoachUser.findOne({ email }).select('+password');

    if (!user) {
      return next(new APIError('Invalid credentials', 401));
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new APIError('Invalid credentials', 401));
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user / clear cookie
 * @access  Private
 */
router.post('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ========================================
// PROTECTED ROUTES
// ========================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  const user = await CoachUser.findById(req.user._id)
    .populate('memberId', 'username email tier')
    .populate('sponsorId', 'fullName membershipNumber email');

  // Add referral stats
  const totalReferrals = await CoachUser.countDocuments({ sponsorId: req.user._id });

  res.status(200).json({
    success: true,
    user: {
      ...user.toObject(),
      referralStats: {
        totalReferrals,
        referralLink: user.getReferralLink(),
        membershipNumber: user.membershipNumber
      }
    }
  });
});

/**
 * @route   PUT /api/auth/updateprofile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/updateprofile', protect, async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      email: req.body.email,
      preferredCheckInTime: req.body.preferredCheckInTime,
      notificationsEnabled: req.body.notificationsEnabled
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await CoachUser.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/updatepassword
 * @desc    Update password
 * @access  Private
 */
router.put('/updatepassword', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new APIError('Please provide current and new password', 400));
    }

    const user = await CoachUser.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return next(new APIError('Current password is incorrect', 401));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/forgotpassword
 * @desc    Request password reset (sends email)
 * @access  Public
 */
router.post('/forgotpassword', async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await CoachUser.findOne({ email });

    if (!user) {
      return next(new APIError('No user found with that email', 404));
    }

    // Generate reset token
    const resetToken = generateToken(user._id, '1h');

    // TODO: Send email with reset token
    // For now, return token in response (in production, send via email)

    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      note: 'In production, this token would be sent via email'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/resetpassword/:resetToken
 * @desc    Reset password using token
 * @access  Public
 */
router.put('/resetpassword/:resetToken', async (req, res, next) => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;

    if (!password) {
      return next(new APIError('Please provide a new password', 400));
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(resetToken);
    } catch (error) {
      return next(new APIError('Invalid or expired reset token', 400));
    }

    // Get user
    const user = await CoachUser.findById(decoded.id);

    if (!user) {
      return next(new APIError('Invalid token', 400));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', protect, (req, res) => {
  res.status(200).json({
    success: true,
    valid: true,
    user: {
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      currentStage: req.user.currentStage,
      currentFocusLeg: req.user.currentFocusLeg
    }
  });
});

export default router;
