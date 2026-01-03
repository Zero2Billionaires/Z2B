/**
 * Admin API Routes
 * User management, lesson management, and platform administration
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { requireAdmin, requireCEO, requirePermission } from '../middleware/adminAuth.js';
import CoachUser from '../models/CoachUser.js';
import Lesson from '../models/Lesson.js';
import CoachingSession from '../models/CoachingSession.js';
import BTSSScore from '../models/BTSSScore.js';
import UserProgress from '../models/UserProgress.js';
import CommissionConfig from '../models/CommissionConfig.js';
import TLIConfig from '../models/TLIConfig.js';
import CEOAward from '../models/CEOAward.js';

const router = express.Router();

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// ========================================
// USER MANAGEMENT
// ========================================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Admin
 */
router.get('/users', async (req, res) => {
  try {
    const { stage, role, limit = 50, page = 1, search } = req.query;

    const query = {};
    if (stage) query.currentStage = stage;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await CoachUser.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await CoachUser.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get single user details
 * @access  Admin
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await CoachUser.findById(req.params.userId)
      .populate('memberId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional stats
    const latestBTSS = await BTSSScore.getLatestScore(user._id);
    const sessionCount = await CoachingSession.countDocuments({ userId: user._id });
    const actionCount = await UserProgress.countDocuments({ userId: user._id });

    res.json({
      user,
      stats: {
        latestBTSS,
        totalSessions: sessionCount,
        totalActions: actionCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user details
 * @access  Admin
 */
router.put('/users/:userId', async (req, res) => {
  try {
    const { fullName, email, role, currentStage, currentFocusLeg, notificationsEnabled } = req.body;

    const user = await CoachUser.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (currentStage) user.currentStage = currentStage;
    if (currentFocusLeg) user.currentFocusLeg = currentFocusLeg;
    if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user account
 * @access  Admin
 */
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await CoachUser.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete associated data
    await CoachingSession.deleteMany({ userId: user._id });
    await BTSSScore.deleteMany({ userId: user._id });
    await UserProgress.deleteMany({ userId: user._id });

    await user.deleteOne();

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/admin/users/:userId/reset-password
 * @desc    Reset user password
 * @access  Admin
 */
router.post('/users/:userId/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await CoachUser.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// LESSON MANAGEMENT
// ========================================

/**
 * @route   GET /api/admin/lessons
 * @desc    Get all lessons (including unpublished)
 * @access  Admin
 */
router.get('/lessons', async (req, res) => {
  try {
    const { leg, stage, published, limit = 50, page = 1 } = req.query;

    const query = {};
    if (leg) query.legCategory = parseInt(leg);
    if (stage) query.targetStage = stage;
    if (published !== undefined) query.isPublished = published === 'true';

    const lessons = await Lesson.find(query)
      .sort({ legCategory: 1, sequenceNumber: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Lesson.countDocuments(query);

    res.json({
      lessons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/admin/lessons
 * @desc    Create new lesson
 * @access  Admin
 */
router.post('/lessons', async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    const newLesson = await lesson.save();

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson: newLesson
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/admin/lessons/:lessonId
 * @desc    Update lesson
 * @access  Admin
 */
router.put('/lessons/:lessonId', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    Object.assign(lesson, req.body);
    const updatedLesson = await lesson.save();

    res.json({
      message: 'Lesson updated successfully',
      lesson: updatedLesson
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/lessons/:lessonId
 * @desc    Delete lesson
 * @access  Admin
 */
router.delete('/lessons/:lessonId', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    await lesson.deleteOne();

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/admin/lessons/:lessonId/publish
 * @desc    Publish/unpublish lesson
 * @access  Admin
 */
router.post('/lessons/:lessonId/publish', async (req, res) => {
  try {
    const { isPublished } = req.body;

    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    lesson.isPublished = isPublished;
    await lesson.save();

    res.json({
      message: `Lesson ${isPublished ? 'published' : 'unpublished'} successfully`,
      lesson
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route   POST /api/admin/lessons/bulk-import
 * @desc    Bulk import lessons from JSON
 * @access  Admin
 */
router.post('/lessons/bulk-import', async (req, res) => {
  try {
    const { lessons } = req.body;

    if (!Array.isArray(lessons)) {
      return res.status(400).json({ message: 'Lessons must be an array' });
    }

    const results = await Lesson.insertMany(lessons, { ordered: false });

    res.status(201).json({
      message: `${results.length} lessons imported successfully`,
      imported: results.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ========================================
// SESSION MANAGEMENT
// ========================================

/**
 * @route   GET /api/admin/sessions
 * @desc    Get all coaching sessions with filters
 * @access  Admin
 */
router.get('/sessions', async (req, res) => {
  try {
    const { userId, status, limit = 50, page = 1 } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const sessions = await CoachingSession.find(query)
      .populate('userId', 'fullName email')
      .sort({ sessionDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await CoachingSession.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/sessions/:sessionId
 * @desc    Delete coaching session
 * @access  Admin
 */
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const session = await CoachingSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await session.deleteOne();

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// PLATFORM MANAGEMENT
// ========================================

/**
 * @route   GET /api/admin/stats/summary
 * @desc    Get platform statistics summary
 * @access  Admin
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalUsers = await CoachUser.countDocuments();
    const activeUsers = await CoachUser.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const totalSessions = await CoachingSession.countDocuments();
    const totalLessons = await Lesson.countDocuments({ isPublished: true });
    const totalActions = await UserProgress.countDocuments();
    const completedActions = await UserProgress.countDocuments({ status: 'completed' });

    // Get recent registrations
    const recentUsers = await CoachUser.find()
      .select('fullName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactiveRate: totalUsers > 0 ? (((totalUsers - activeUsers) / totalUsers) * 100).toFixed(2) : 0
      },
      sessions: {
        total: totalSessions,
        average: totalUsers > 0 ? (totalSessions / totalUsers).toFixed(2) : 0
      },
      lessons: {
        total: totalLessons
      },
      actions: {
        total: totalActions,
        completed: completedActions,
        completionRate: totalActions > 0 ? ((completedActions / totalActions) * 100).toFixed(2) : 0
      },
      recentRegistrations: recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/admin/broadcast
 * @desc    Broadcast message to all users (future: email/notification)
 * @access  Admin
 */
router.post('/broadcast', async (req, res) => {
  try {
    const { message, targetRole, targetStage } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Build query for target users
    const query = {};
    if (targetRole) query.role = targetRole;
    if (targetStage) query.currentStage = targetStage;

    const users = await CoachUser.find(query).select('email fullName');

    // TODO: Implement actual notification system (email, push, etc.)
    // For now, just return the count

    res.json({
      message: 'Broadcast queued successfully',
      recipientCount: users.length,
      recipients: users.slice(0, 10).map(u => u.email) // First 10 for preview
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// ADMIN ROLE MANAGEMENT (CEO/SENIOR)
// ========================================

/**
 * @route   POST /api/admin/assign-role
 * @desc    Assign admin role to a user
 * @access  CEO/Senior with canManageAdmins
 */
router.post('/assign-role', protect, requireAdmin, requirePermission('canManageAdmins'), async (req, res) => {
  try {
    const { userId, role, permissions, notes } = req.body;

    const validRoles = ['call_center', 'support', 'sales', 'finance', 'senior', 'ceo'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin role'
      });
    }

    // Only CEO can assign CEO role
    if (role === 'ceo' && req.adminRole !== 'ceo') {
      return res.status(403).json({
        success: false,
        message: 'Only CEO can assign CEO role'
      });
    }

    const user = await CoachUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Default permissions by role
    const rolePermissions = {
      call_center: { canRead: true, canEdit: false, canDelete: false, canManageAdmins: false, canEditCommissions: false, canCreateAwards: false, canAuthorizeFree: false, canProcessPayouts: false, canViewFinancials: false },
      support: { canRead: true, canEdit: true, canDelete: false, canManageAdmins: false, canEditCommissions: false, canCreateAwards: false, canAuthorizeFree: false, canProcessPayouts: false, canViewFinancials: false },
      sales: { canRead: true, canEdit: true, canDelete: false, canManageAdmins: false, canEditCommissions: false, canCreateAwards: false, canAuthorizeFree: false, canProcessPayouts: false, canViewFinancials: true },
      finance: { canRead: true, canEdit: true, canDelete: false, canManageAdmins: false, canEditCommissions: false, canCreateAwards: false, canAuthorizeFree: false, canProcessPayouts: true, canViewFinancials: true },
      senior: { canRead: true, canEdit: true, canDelete: true, canManageAdmins: true, canEditCommissions: false, canCreateAwards: false, canAuthorizeFree: true, canProcessPayouts: true, canViewFinancials: true },
      ceo: { canRead: true, canEdit: true, canDelete: true, canManageAdmins: true, canEditCommissions: true, canCreateAwards: true, canAuthorizeFree: true, canProcessPayouts: true, canViewFinancials: true }
    };

    user.adminRole = role;
    user.roleAssignedDate = new Date();
    user.assignedBy = req.userId;
    user.roleNotes = notes || '';
    user.adminPermissions = permissions || rolePermissions[role];

    await user.save();

    res.json({
      success: true,
      message: `Admin role ${role} assigned successfully`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        adminRole: user.adminRole,
        permissions: user.adminPermissions
      }
    });

  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign admin role'
    });
  }
});

/**
 * @route   GET /api/admin/list-admins
 * @desc    List all admin users
 * @access  Admin with canRead
 */
router.get('/list-admins', protect, requireAdmin, requirePermission('canRead'), async (req, res) => {
  try {
    const admins = await CoachUser.find({
      adminRole: { $ne: 'none' }
    })
    .select('fullName email membershipNumber adminRole adminPermissions roleAssignedDate assignedBy')
    .populate('assignedBy', 'fullName email')
    .sort({ roleAssignedDate: -1 });

    res.json({
      success: true,
      count: admins.length,
      admins
    });

  } catch (error) {
    console.error('List admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list admins'
    });
  }
});

/**
 * @route   PUT /api/admin/permissions/:userId
 * @desc    Update admin permissions
 * @access  CEO/Senior with canManageAdmins
 */
router.put('/permissions/:userId', protect, requireAdmin, requirePermission('canManageAdmins'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    const user = await CoachUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.adminRole === 'ceo' && req.adminRole !== 'ceo') {
      return res.status(403).json({
        success: false,
        message: 'Only CEO can modify CEO permissions'
      });
    }

    user.adminPermissions = { ...user.adminPermissions, ...permissions };
    await user.save();

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        adminRole: user.adminRole,
        permissions: user.adminPermissions
      }
    });

  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permissions'
    });
  }
});

/**
 * @route   DELETE /api/admin/remove-role/:userId
 * @desc    Remove admin role from user
 * @access  CEO/Senior with canManageAdmins
 */
router.delete('/remove-role/:userId', protect, requireAdmin, requirePermission('canManageAdmins'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await CoachUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.adminRole === 'ceo' && req.adminRole !== 'ceo') {
      return res.status(403).json({
        success: false,
        message: 'Only CEO can remove CEO role'
      });
    }

    if (userId === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove your own admin role'
      });
    }

    user.adminRole = 'none';
    user.adminPermissions = {
      canRead: false,
      canEdit: false,
      canDelete: false,
      canManageAdmins: false,
      canEditCommissions: false,
      canCreateAwards: false,
      canAuthorizeFree: false,
      canProcessPayouts: false,
      canViewFinancials: false
    };

    await user.save();

    res.json({
      success: true,
      message: 'Admin role removed successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        adminRole: user.adminRole
      }
    });

  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove admin role'
    });
  }
});

// ========================================
// COMMISSION CONFIGURATION (CEO ONLY)
// ========================================

/**
 * @route   GET /api/admin/config/commissions
 * @desc    Get current commission rates
 * @access  Admin with canViewFinancials
 */
router.get('/config/commissions', protect, requireAdmin, requirePermission('canViewFinancials'), async (req, res) => {
  try {
    const ispConfig = await CommissionConfig.getActiveConfig('ISP');
    const qpbConfig = await CommissionConfig.getActiveConfig('QPB');
    const tscConfig = await CommissionConfig.getActiveConfig('TSC');

    res.json({
      success: true,
      commissions: {
        ISP: ispConfig,
        QPB: qpbConfig,
        TSC: tscConfig
      }
    });

  } catch (error) {
    console.error('Get commissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get commission rates'
    });
  }
});

/**
 * @route   PUT /api/admin/config/commissions
 * @desc    Update commission rates
 * @access  CEO only
 */
router.put('/config/commissions', protect, requireAdmin, requireCEO, requirePermission('canEditCommissions'), async (req, res) => {
  try {
    const { configType, rates, reason } = req.body;

    if (!['ISP', 'QPB', 'TSC'].includes(configType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid config type'
      });
    }

    const newConfig = await CommissionConfig.createNewVersion(
      configType,
      { [`${configType.toLowerCase()}Rates`]: rates },
      req.userId,
      reason
    );

    res.json({
      success: true,
      message: `${configType} rates updated successfully`,
      config: newConfig
    });

  } catch (error) {
    console.error('Update commissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update commission rates'
    });
  }
});

/**
 * @route   GET /api/admin/config/commissions/history
 * @desc    Get commission rate version history
 * @access  CEO only
 */
router.get('/config/commissions/history', protect, requireAdmin, requireCEO, async (req, res) => {
  try {
    const { configType } = req.query;

    const query = configType ? { configType } : {};
    const history = await CommissionConfig.find(query)
      .populate('modifiedBy', 'fullName email')
      .sort({ version: -1, createdAt: -1 });

    res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get commission history'
    });
  }
});

// ========================================
// TLI CONFIGURATION (CEO ONLY)
// ========================================

/**
 * @route   GET /api/admin/config/tli
 * @desc    Get all TLI levels
 * @access  Admin with canRead
 */
router.get('/config/tli', protect, requireAdmin, requirePermission('canRead'), async (req, res) => {
  try {
    const levels = await TLIConfig.getActiveLevels();

    res.json({
      success: true,
      levels
    });

  } catch (error) {
    console.error('Get TLI levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get TLI levels'
    });
  }
});

/**
 * @route   PUT /api/admin/config/tli/:level
 * @desc    Update TLI level requirements
 * @access  CEO only
 */
router.put('/config/tli/:level', protect, requireAdmin, requireCEO, async (req, res) => {
  try {
    const { level } = req.params;
    const { updates, reason } = req.body;

    const newConfig = await TLIConfig.updateLevel(
      parseInt(level),
      updates,
      req.userId,
      reason
    );

    res.json({
      success: true,
      message: `TLI Level ${level} updated successfully`,
      config: newConfig
    });

  } catch (error) {
    console.error('Update TLI level error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update TLI level'
    });
  }
});

/**
 * @route   GET /api/admin/config/tli/history/:level
 * @desc    Get TLI level version history
 * @access  CEO only
 */
router.get('/config/tli/history/:level', protect, requireAdmin, requireCEO, async (req, res) => {
  try {
    const { level } = req.params;

    const history = await TLIConfig.find({ level: parseInt(level) })
      .populate('lastModified.by', 'fullName email')
      .sort({ version: -1 });

    res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('Get TLI history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get TLI history'
    });
  }
});

// ========================================
// CEO AWARDS MANAGEMENT
// ========================================

/**
 * @route   POST /api/admin/ceo/awards/create
 * @desc    Create new CEO award
 * @access  CEO only with canCreateAwards
 */
router.post('/ceo/awards/create', protect, requireAdmin, requireCEO, requirePermission('canCreateAwards'), async (req, res) => {
  try {
    const awardData = {
      ...req.body,
      createdBy: req.userId,
      status: 'draft'
    };

    const award = new CEOAward(awardData);
    await award.save();

    res.status(201).json({
      success: true,
      message: 'CEO Award created successfully',
      award
    });

  } catch (error) {
    console.error('Create award error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create CEO award'
    });
  }
});

/**
 * @route   PUT /api/admin/ceo/awards/:id/submit-approval
 * @desc    Submit award for board approval
 * @access  CEO only
 */
router.put('/ceo/awards/:id/submit-approval', protect, requireAdmin, requireCEO, async (req, res) => {
  try {
    const award = await CEOAward.findById(req.params.id);
    if (!award) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    await award.submitForApproval();

    res.json({
      success: true,
      message: 'Award submitted for board approval',
      award
    });

  } catch (error) {
    console.error('Submit approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit for approval'
    });
  }
});

/**
 * @route   POST /api/admin/ceo/awards/:id/vote
 * @desc    Board member votes on award
 * @access  CEO/Senior only
 */
router.post('/ceo/awards/:id/vote', protect, requireAdmin, async (req, res) => {
  try {
    const { vote, comment } = req.body;

    // Only CEO and senior admins can vote
    if (req.adminRole !== 'ceo' && req.adminRole !== 'senior') {
      return res.status(403).json({
        success: false,
        message: 'Only board members can vote'
      });
    }

    const award = await CEOAward.findById(req.params.id);
    if (!award) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    await award.addVote(req.userId, vote, comment);

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      award
    });

  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record vote'
    });
  }
});

/**
 * @route   GET /api/admin/ceo/awards
 * @desc    List all CEO awards
 * @access  Admin with canRead
 */
router.get('/ceo/awards', protect, requireAdmin, requirePermission('canRead'), async (req, res) => {
  try {
    const { status } = req.query;

    const query = status ? { status } : {};
    const awards = await CEOAward.find(query)
      .populate('createdBy', 'fullName email')
      .populate('approvalVotes.boardMember', 'fullName email adminRole')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: awards.length,
      awards
    });

  } catch (error) {
    console.error('List awards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list awards'
    });
  }
});

/**
 * @route   POST /api/admin/ceo/awards/:id/select-winners
 * @desc    Select winners for approved award
 * @access  CEO only
 */
router.post('/ceo/awards/:id/select-winners', protect, requireAdmin, requireCEO, async (req, res) => {
  try {
    const { winners } = req.body;

    const award = await CEOAward.findById(req.params.id);
    if (!award) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    await award.selectWinners(winners);

    res.json({
      success: true,
      message: 'Winners selected successfully',
      award
    });

  } catch (error) {
    console.error('Select winners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to select winners'
    });
  }
});

// ========================================
// FREE MEMBERSHIP AUTHORIZATION (CEO/SENIOR)
// ========================================

/**
 * @route   POST /api/admin/ceo/authorize-free-membership
 * @desc    Authorize free membership for a user
 * @access  CEO/Senior with canAuthorizeFree
 */
router.post('/ceo/authorize-free-membership', protect, requireAdmin, requirePermission('canAuthorizeFree'), async (req, res) => {
  try {
    const { userId, category, justification, expiresAt, notes } = req.body;

    const validCategories = ['partner', 'community', 'cash_deposit', 'special'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid free membership category'
      });
    }

    const user = await CoachUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.freeMembershipStatus = {
      isFree: true,
      category,
      justification,
      authorizedBy: req.userId,
      authorizedDate: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      notes
    };

    await user.save();

    res.json({
      success: true,
      message: 'Free membership authorized successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        freeMembershipStatus: user.freeMembershipStatus
      }
    });

  } catch (error) {
    console.error('Authorize free membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authorize free membership'
    });
  }
});

/**
 * @route   GET /api/admin/ceo/free-members
 * @desc    List all users with free memberships
 * @access  Admin with canRead
 */
router.get('/ceo/free-members', protect, requireAdmin, requirePermission('canRead'), async (req, res) => {
  try {
    const freeMembers = await CoachUser.find({
      'freeMembershipStatus.isFree': true
    })
    .select('fullName email membershipNumber tier freeMembershipStatus')
    .populate('freeMembershipStatus.authorizedBy', 'fullName email')
    .sort({ 'freeMembershipStatus.authorizedDate': -1 });

    res.json({
      success: true,
      count: freeMembers.length,
      members: freeMembers
    });

  } catch (error) {
    console.error('List free members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list free members'
    });
  }
});

/**
 * @route   DELETE /api/admin/ceo/revoke-free-membership/:userId
 * @desc    Revoke free membership authorization
 * @access  CEO/Senior with canAuthorizeFree
 */
router.delete('/ceo/revoke-free-membership/:userId', protect, requireAdmin, requirePermission('canAuthorizeFree'), async (req, res) => {
  try {
    const user = await CoachUser.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.freeMembershipStatus = {
      isFree: false,
      category: null,
      justification: '',
      authorizedBy: null,
      authorizedDate: null,
      expiresAt: null,
      notes: `Revoked by ${req.user.fullName} on ${new Date().toLocaleDateString()}`
    };

    await user.save();

    res.json({
      success: true,
      message: 'Free membership revoked successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Revoke free membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke free membership'
    });
  }
});

export default router;
