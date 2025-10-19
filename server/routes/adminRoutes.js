/**
 * Admin API Routes
 * User management, lesson management, and platform administration
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import CoachUser from '../models/CoachUser.js';
import Lesson from '../models/Lesson.js';
import CoachingSession from '../models/CoachingSession.js';
import BTSSScore from '../models/BTSSScore.js';
import UserProgress from '../models/UserProgress.js';

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

export default router;
