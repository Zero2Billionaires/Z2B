/**
 * Analytics API Routes
 * User progress analytics, BTSS trends, and insights
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import CoachUser from '../models/CoachUser.js';
import CoachingSession from '../models/CoachingSession.js';
import BTSSScore from '../models/BTSSScore.js';
import UserProgress from '../models/UserProgress.js';
import Lesson from '../models/Lesson.js';

const router = express.Router();

// ========================================
// USER ANALYTICS ROUTES
// ========================================

/**
 * @route   GET /api/analytics/user/:userId/dashboard
 * @desc    Get comprehensive user dashboard analytics
 * @access  Private (owner or admin)
 */
router.get('/user/:userId/dashboard', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check ownership
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get user data
    const user = await CoachUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get BTSS history
    const btssHistory = await BTSSScore.getScoreHistory(userId, 12);
    const latestBTSS = await BTSSScore.getLatestScore(userId);

    // Get session statistics
    const sessionStats = await CoachingSession.getSessionStats(userId);

    // Get action completion rate
    const actionStats = await UserProgress.getCompletionRate(userId);

    // Get active actions
    const activeActions = await UserProgress.getActiveActions(userId);

    // Get recent wins
    const recentWins = await CoachingSession.find({ userId })
      .sort({ sessionDate: -1 })
      .limit(5)
      .select('winsRecorded sessionDate');

    const wins = [];
    recentWins.forEach(session => {
      session.winsRecorded.forEach(win => {
        wins.push({
          ...win.toObject(),
          sessionDate: session.sessionDate
        });
      });
    });

    res.json({
      user: {
        fullName: user.fullName,
        currentStage: user.currentStage,
        currentFocusLeg: user.currentFocusLeg,
        checkInStreak: user.checkInStreak,
        totalWins: user.totalWins,
        totalActionsCompleted: user.totalActionsCompleted,
        lessonsCompleted: user.lessonsCompleted,
        joinedDate: user.joinedDate,
        lastActive: user.lastActive
      },
      btss: {
        latest: latestBTSS,
        history: btssHistory,
        growth: btssHistory.length >= 2 ? {
          overall: btssHistory[0].overallBTSS - btssHistory[1].overallBTSS,
          mindset: btssHistory[0].mindsetMysteryScore - btssHistory[1].mindsetMysteryScore,
          money: btssHistory[0].moneyMovesScore - btssHistory[1].moneyMovesScore,
          legacy: btssHistory[0].legacyMissionScore - btssHistory[1].legacyMissionScore,
          movement: btssHistory[0].movementMomentumScore - btssHistory[1].movementMomentumScore
        } : null
      },
      sessions: sessionStats,
      actions: {
        ...actionStats,
        active: activeActions.length,
        activeList: activeActions.slice(0, 5)
      },
      wins: wins.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/analytics/user/:userId/btss-trends
 * @desc    Get BTSS trends and predictions
 * @access  Private
 */
router.get('/user/:userId/btss-trends', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { months = 6 } = req.query;

    const history = await BTSSScore.getScoreHistory(userId, parseInt(months));

    if (history.length < 2) {
      return res.json({
        message: 'Need at least 2 assessments for trend analysis',
        history
      });
    }

    // Calculate trends
    const trends = {
      overall: calculateTrend(history.map(h => h.overallBTSS)),
      mindset: calculateTrend(history.map(h => h.mindsetMysteryScore)),
      money: calculateTrend(history.map(h => h.moneyMovesScore)),
      legacy: calculateTrend(history.map(h => h.legacyMissionScore)),
      movement: calculateTrend(history.map(h => h.movementMomentumScore))
    };

    // Identify fastest growing and slowest growing legs
    const legTrends = [
      { leg: 'Mindset Mystery', trend: trends.mindset },
      { leg: 'Money Moves', trend: trends.money },
      { leg: 'Legacy Mission', trend: trends.legacy },
      { leg: 'Movement Momentum', trend: trends.movement }
    ];

    const sortedLegs = legTrends.sort((a, b) => b.trend.slope - a.trend.slope);

    res.json({
      history,
      trends,
      insights: {
        fastestGrowing: sortedLegs[0],
        slowestGrowing: sortedLegs[sortedLegs.length - 1],
        overallTrend: trends.overall.direction,
        recommendation: generateRecommendation(sortedLegs, trends.overall)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/analytics/user/:userId/progress-report
 * @desc    Get comprehensive progress report
 * @access  Private
 */
router.get('/user/:userId/progress-report', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const user = await CoachUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get sessions in date range
    const sessionQuery = { userId };
    if (Object.keys(dateFilter).length > 0) {
      sessionQuery.sessionDate = dateFilter;
    }

    const sessions = await CoachingSession.find(sessionQuery);

    // Calculate metrics
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const totalWins = sessions.reduce((sum, s) => sum + s.winsRecorded.length, 0);
    const totalActions = sessions.reduce((sum, s) => sum + s.actionItemsGiven.length, 0);
    const totalScripturesShared = sessions.reduce((sum, s) => sum + s.scriptureShared.length, 0);

    // Get actions in date range
    const actionQuery = { userId };
    if (Object.keys(dateFilter).length > 0) {
      actionQuery.createdDate = dateFilter;
    }

    const actions = await UserProgress.find(actionQuery);
    const completedActions = actions.filter(a => a.status === 'completed');

    res.json({
      period: {
        start: startDate || user.joinedDate,
        end: endDate || new Date()
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        completionRate: totalSessions > 0 ? ((completedSessions / totalSessions) * 100).toFixed(2) : 0
      },
      wins: {
        total: totalWins,
        average: totalSessions > 0 ? (totalWins / totalSessions).toFixed(2) : 0
      },
      actions: {
        total: actions.length,
        completed: completedActions.length,
        completionRate: actions.length > 0 ? ((completedActions.length / actions.length) * 100).toFixed(2) : 0,
        byLeg: getActionsByLeg(completedActions)
      },
      scripture: {
        totalShared: totalScripturesShared
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// ADMIN ANALYTICS ROUTES
// ========================================

/**
 * @route   GET /api/analytics/platform/overview
 * @desc    Get platform-wide analytics
 * @access  Admin only
 */
router.get('/platform/overview', protect, authorize('admin'), async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await CoachUser.countDocuments();
    const activeUsers = await CoachUser.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const usersByStage = await CoachUser.aggregate([
      {
        $group: {
          _id: '$currentStage',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get session statistics
    const totalSessions = await CoachingSession.countDocuments();
    const completedSessions = await CoachingSession.countDocuments({ status: 'completed' });

    // Get lesson statistics
    const totalLessons = await Lesson.countDocuments();
    const publishedLessons = await Lesson.countDocuments({ isPublished: true });

    // Get BTSS statistics
    const avgBTSS = await BTSSScore.aggregate([
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$overallBTSS' },
          avgMindset: { $avg: '$mindsetMysteryScore' },
          avgMoney: { $avg: '$moneyMovesScore' },
          avgLegacy: { $avg: '$legacyMissionScore' },
          avgMovement: { $avg: '$movementMomentumScore' }
        }
      }
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        byStage: usersByStage
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        completionRate: totalSessions > 0 ? ((completedSessions / totalSessions) * 100).toFixed(2) : 0
      },
      lessons: {
        total: totalLessons,
        published: publishedLessons
      },
      btss: avgBTSS[0] || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Calculate trend (simple linear regression)
 */
function calculateTrend(scores) {
  if (scores.length < 2) {
    return { slope: 0, direction: 'insufficient data' };
  }

  const n = scores.length;
  const indices = Array.from({ length: n }, (_, i) => i);

  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = scores.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * scores[i], 0);
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  let direction = 'stable';
  if (slope > 2) direction = 'strongly increasing';
  else if (slope > 0.5) direction = 'increasing';
  else if (slope < -2) direction = 'strongly decreasing';
  else if (slope < -0.5) direction = 'decreasing';

  return {
    slope: slope.toFixed(2),
    direction,
    avgValue: (sumY / n).toFixed(2)
  };
}

/**
 * Generate recommendation based on trends
 */
function generateRecommendation(legTrends, overallTrend) {
  const slowest = legTrends[legTrends.length - 1];

  if (overallTrend.direction.includes('increasing')) {
    return `Great progress! Focus on ${slowest.leg} to balance your table further.`;
  } else if (overallTrend.direction.includes('decreasing')) {
    return `Let's refocus. Prioritize ${slowest.leg} and reconnect with your foundational goals.`;
  } else {
    return `Steady progress. Strengthen ${slowest.leg} to see breakthrough growth.`;
  }
}

/**
 * Group actions by leg
 */
function getActionsByLeg(actions) {
  const byLeg = {
    'Mindset Mystery': 0,
    'Money Moves': 0,
    'Legacy Mission': 0,
    'Movement Momentum': 0
  };

  actions.forEach(action => {
    if (byLeg.hasOwnProperty(action.linkedLeg)) {
      byLeg[action.linkedLeg]++;
    }
  });

  return byLeg;
}

export default router;
