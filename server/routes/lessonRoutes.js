const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const CoachUser = require('../models/CoachUser');
const UserProgress = require('../models/UserProgress');

// ========================================
// LESSON LIBRARY ROUTES
// ========================================

// Get all lessons (with filters)
router.get('/', async (req, res) => {
  try {
    const { leg, stage, difficulty, limit = 50 } = req.query;

    const query = { isPublished: true };

    if (leg) {
      query.legCategory = parseInt(leg);
    }

    if (stage) {
      query.$or = [
        { targetStage: stage },
        { targetStage: 'All' }
      ];
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const lessons = await Lesson.find(query)
      .sort({ legCategory: 1, sequenceNumber: 1 })
      .limit(parseInt(limit));

    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single lesson by ID
router.get('/:lessonId', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
      .populate('prerequisiteLessons')
      .populate('nextRecommendedLessons');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lesson by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ lessonSlug: req.params.slug })
      .populate('prerequisiteLessons')
      .populate('nextRecommendedLessons');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lessons by leg category
router.get('/leg/:legNumber', async (req, res) => {
  try {
    const { stage } = req.query;
    const lessons = await Lesson.getLessonsByLeg(
      parseInt(req.params.legNumber),
      stage
    );

    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recommended lessons for user
router.get('/recommended/:userId', async (req, res) => {
  try {
    const user = await CoachUser.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get lessons for user's current stage and focus leg
    const legMapping = {
      'Mindset Mystery': 1,
      'Money Moves': 2,
      'Legacy Mission': 3,
      'Movement Momentum': 4
    };

    const focusLegNumber = legMapping[user.currentFocusLeg];

    const recommendedLessons = await Lesson.find({
      isPublished: true,
      legCategory: focusLegNumber,
      $or: [
        { targetStage: user.currentStage },
        { targetStage: 'All' }
      ]
    })
      .sort({ averageRating: -1, completionCount: -1 })
      .limit(5);

    res.json({
      user: {
        stage: user.currentStage,
        focusLeg: user.currentFocusLeg
      },
      lessons: recommendedLessons
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// LESSON COMPLETION ROUTES
// ========================================

// Mark lesson as completed
router.post('/complete', async (req, res) => {
  try {
    const { userId, lessonId, rating, notes } = req.body;

    // Find lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Record completion
    lesson.recordCompletion();
    if (rating) {
      lesson.updateRating(rating);
    }
    await lesson.save();

    // Update user stats
    const user = await CoachUser.findById(userId);
    if (user) {
      user.lessonsCompleted += 1;
      await user.save();
    }

    // Create action items from lesson if they don't exist
    if (lesson.actionSteps && lesson.actionSteps.length > 0) {
      const actionPromises = lesson.actionSteps.map(async (step) => {
        const action = new UserProgress({
          userId,
          actionItem: step.description,
          linkedLeg: step.linkedLeg || lesson.legCategoryName,
          lessonId: lesson._id,
          actionType: 'daily'
        });
        return action.save();
      });

      await Promise.all(actionPromises);
    }

    res.json({
      message: 'Lesson completed successfully!',
      lesson: {
        title: lesson.lessonTitle,
        completionCount: lesson.completionCount,
        averageRating: lesson.averageRating
      },
      user: {
        lessonsCompleted: user.lessonsCompleted
      },
      nextRecommended: lesson.nextRecommendedLessons
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's completed lessons
router.get('/completed/:userId', async (req, res) => {
  try {
    // Get all user progress items linked to lessons
    const completedActions = await UserProgress.find({
      userId: req.params.userId,
      lessonId: { $exists: true, $ne: null },
      status: 'completed'
    }).populate('lessonId');

    // Extract unique lessons
    const completedLessons = [];
    const seenLessons = new Set();

    completedActions.forEach(action => {
      if (action.lessonId && !seenLessons.has(action.lessonId._id.toString())) {
        completedLessons.push(action.lessonId);
        seenLessons.add(action.lessonId._id.toString());
      }
    });

    res.json(completedLessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// LESSON MANAGEMENT (Admin)
// ========================================

// Create new lesson
router.post('/', async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    const newLesson = await lesson.save();
    res.status(201).json(newLesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update lesson
router.put('/:lessonId', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    Object.assign(lesson, req.body);
    const updatedLesson = await lesson.save();
    res.json(updatedLesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete lesson
router.delete('/:lessonId', async (req, res) => {
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

// Get lesson statistics
router.get('/stats/all', async (req, res) => {
  try {
    const totalLessons = await Lesson.countDocuments({ isPublished: true });
    const lessonsByLeg = await Lesson.aggregate([
      { $match: { isPublished: true } },
      { $group: {
        _id: '$legCategoryName',
        count: { $sum: 1 },
        avgRating: { $avg: '$averageRating' },
        totalCompletions: { $sum: '$completionCount' }
      }}
    ]);

    const lessonsByStage = await Lesson.aggregate([
      { $match: { isPublished: true } },
      { $group: {
        _id: '$targetStage',
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      totalLessons,
      byLeg: lessonsByLeg,
      byStage: lessonsByStage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
