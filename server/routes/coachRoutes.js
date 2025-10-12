import express from 'express';
import CoachUser from '../models/CoachUser.js';
import CoachingSession from '../models/CoachingSession.js';
import BTSSScore from '../models/BTSSScore.js';
import UserProgress from '../models/UserProgress.js';

const router = express.Router();

// ========================================
// COACH USER ROUTES
// ========================================

// Get coach user profile
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await CoachUser.findById(req.params.userId)
      .populate('memberId');

    if (!user) {
      return res.status(404).json({ message: 'Coach user not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new coach user
router.post('/user', async (req, res) => {
  try {
    const coachUser = new CoachUser(req.body);
    const newUser = await coachUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update coach user
router.put('/user/:userId', async (req, res) => {
  try {
    const user = await CoachUser.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Coach user not found' });
    }

    Object.assign(user, req.body);
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ========================================
// CHECK-IN ROUTES
// ========================================

// Start a new check-in session
router.post('/check-in', async (req, res) => {
  try {
    const { userId, sessionType } = req.body;

    // Get user
    const user = await CoachUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Record check-in
    user.recordCheckIn();
    await user.save();

    // Create new coaching session
    const session = new CoachingSession({
      userId,
      sessionType: sessionType || 'daily',
      sessionDate: new Date(),
      status: 'active'
    });

    // Add welcome message
    session.addMessage('system', `Welcome back, ${user.fullName}! Let's make today count.`);

    await session.save();

    res.status(201).json({
      session,
      user: {
        checkInStreak: user.checkInStreak,
        currentStage: user.currentStage,
        currentFocusLeg: user.currentFocusLeg
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active session
router.get('/check-in/active/:userId', async (req, res) => {
  try {
    const session = await CoachingSession.findOne({
      userId: req.params.userId,
      status: 'active'
    }).sort({ sessionDate: -1 });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete check-in session
router.post('/check-in/:sessionId/complete', async (req, res) => {
  try {
    const session = await CoachingSession.findOne({
      sessionId: req.params.sessionId
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const { duration, userRating, userFeedback } = req.body;

    session.completeSession(duration);
    if (userRating) session.userRating = userRating;
    if (userFeedback) session.userFeedback = userFeedback;

    await session.save();

    res.json({ message: 'Session completed', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// CHAT/CONVERSATION ROUTES
// ========================================

// Send message to coach
router.post('/chat', async (req, res) => {
  try {
    const { sessionId, userId, message } = req.body;

    // Find or create session
    let session;
    if (sessionId) {
      session = await CoachingSession.findOne({ sessionId });
    } else {
      session = await CoachingSession.findOne({
        userId,
        status: 'active'
      }).sort({ sessionDate: -1 });
    }

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    // Add user message
    session.addMessage('user', message);
    await session.save();

    // Here you would integrate with AI (Claude/OpenAI)
    // For now, return a placeholder response
    const coachResponse = {
      sessionId: session.sessionId,
      response: "AI Coach response will be generated here",
      requiresAction: false
    };

    res.json(coachResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get conversation history
router.get('/chat/history/:userId', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const sessions = await CoachingSession.getUserSessions(
      req.params.userId,
      parseInt(limit)
    );

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get session statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const stats = await CoachingSession.getSessionStats(req.params.userId);
    const completionRate = await UserProgress.getCompletionRate(req.params.userId);

    res.json({
      sessionStats: stats,
      actionStats: completionRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// ACTION ITEM ROUTES
// ========================================

// Add action item to session
router.post('/action', async (req, res) => {
  try {
    const { sessionId, userId, description, linkedLeg, priority, dueDate } = req.body;

    let session = null;
    // Add to session
    if (sessionId) {
      session = await CoachingSession.findOne({ sessionId });
      if (session) {
        session.addActionItem(description, linkedLeg, priority, dueDate);
        await session.save();
      }
    }

    // Create in UserProgress
    const action = new UserProgress({
      userId,
      actionItem: description,
      linkedLeg,
      priority,
      dueDate,
      sessionId: session ? session._id : null
    });

    await action.save();

    res.status(201).json(action);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's active actions
router.get('/actions/:userId', async (req, res) => {
  try {
    const actions = await UserProgress.getActiveActions(req.params.userId);
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update action status
router.put('/action/:actionId', async (req, res) => {
  try {
    const action = await UserProgress.findById(req.params.actionId);
    if (!action) {
      return res.status(404).json({ message: 'Action not found' });
    }

    const { status, outcome, impactRating, blockers, supportNeeded } = req.body;

    if (status) action.status = status;
    if (outcome) action.outcome = outcome;
    if (impactRating) action.impactRating = impactRating;

    if (status === 'blocked') {
      action.markBlocked(blockers, supportNeeded);
    } else if (status === 'completed') {
      action.markCompleted(outcome, impactRating);
    }

    await action.save();

    // Update user stats
    if (status === 'completed') {
      const user = await CoachUser.findById(action.userId);
      if (user) {
        user.totalActionsCompleted += 1;
        await user.save();
      }
    }

    res.json(action);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get overdue actions
router.get('/actions/:userId/overdue', async (req, res) => {
  try {
    const overdueActions = await UserProgress.getOverdueActions(req.params.userId);
    res.json(overdueActions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// WINS ROUTES
// ========================================

// Record a win
router.post('/win', async (req, res) => {
  try {
    const { sessionId, userId, description, linkedLeg, significance } = req.body;

    // Add to session if provided
    if (sessionId) {
      const session = await CoachingSession.findOne({ sessionId });
      if (session) {
        session.recordWin(description, linkedLeg, significance);
        await session.save();
      }
    }

    // Update user stats
    const user = await CoachUser.findById(userId);
    if (user) {
      user.totalWins += 1;
      await user.save();
    }

    res.status(201).json({
      message: 'Win recorded!',
      totalWins: user.totalWins
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's recent wins
router.get('/wins/:userId', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const sessions = await CoachingSession.find({ userId: req.params.userId })
      .sort({ sessionDate: -1 })
      .limit(parseInt(limit));

    const wins = sessions.reduce((all, session) => {
      return all.concat(session.winsRecorded.map(win => ({
        ...win.toObject(),
        sessionDate: session.sessionDate,
        sessionType: session.sessionType
      })));
    }, []);

    res.json(wins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
