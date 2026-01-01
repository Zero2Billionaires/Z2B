import express from 'express';
import BTSSScore from '../models/BTSSScore.js';
import CoachUser from '../models/CoachUser.js';

const router = express.Router();

// ========================================
// BTSS SCORING ROUTES
// ========================================

// Submit new BTSS assessment
router.post('/assess', async (req, res) => {
  try {
    const {
      userId,
      mindsetMysteryScore,
      moneyMovesScore,
      legacyMissionScore,
      movementMomentumScore,
      assessmentType,
      notes,
      mindsetDetails,
      moneyDetails,
      legacyDetails,
      movementDetails
    } = req.body;

    // Validate scores
    if (!userId || mindsetMysteryScore === undefined || moneyMovesScore === undefined ||
        legacyMissionScore === undefined || movementMomentumScore === undefined) {
      return res.status(400).json({ message: 'Missing required assessment data' });
    }

    // Create new BTSS score
    const btssScore = new BTSSScore({
      userId,
      mindsetMysteryScore,
      moneyMovesScore,
      legacyMissionScore,
      movementMomentumScore,
      assessmentType: assessmentType || 'self',
      notes,
      mindsetDetails,
      moneyDetails,
      legacyDetails,
      movementDetails
    });

    await btssScore.save();

    // Update user's focus leg based on weakest leg
    const user = await CoachUser.findById(userId);
    if (user) {
      user.currentFocusLeg = btssScore.weakestLeg;

      // Check if stage should advance
      const overallBTSS = btssScore.overallBTSS;
      let newStage = user.currentStage;

      if (overallBTSS >= 76 && user.currentStage !== 'Master') {
        newStage = 'Master';
      } else if (overallBTSS >= 51 && user.currentStage === 'Intermediate') {
        newStage = 'Advanced';
      } else if (overallBTSS >= 26 && user.currentStage === 'Beginner') {
        newStage = 'Intermediate';
      }

      if (newStage !== user.currentStage) {
        user.advanceStage(newStage, overallBTSS);
      }

      await user.save();
    }

    res.status(201).json({
      btssScore,
      insights: {
        overallBTSS: btssScore.overallBTSS,
        weakestLeg: btssScore.weakestLeg,
        strongestLeg: btssScore.strongestLeg,
        tableStability: btssScore.tableStability,
        focusArea: `Focus on strengthening your ${btssScore.weakestLeg}`,
        stageAdvancement: user ? {
          currentStage: user.currentStage,
          message: newStage !== user.currentStage ? `Congratulations! You've advanced to ${newStage}!` : null
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current BTSS score
router.get('/:userId', async (req, res) => {
  try {
    const latestScore = await BTSSScore.getLatestScore(req.params.userId);

    if (!latestScore) {
      return res.status(404).json({ message: 'No BTSS scores found for this user' });
    }

    res.json(latestScore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get BTSS score history
router.get('/history/:userId', async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const history = await BTSSScore.getScoreHistory(
      req.params.userId,
      parseInt(limit)
    );

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get BTSS growth rate
router.get('/growth/:userId', async (req, res) => {
  try {
    const growthRate = await BTSSScore.calculateGrowthRate(req.params.userId);

    if (!growthRate) {
      return res.status(404).json({
        message: 'Insufficient data to calculate growth rate. Need at least 2 assessments.'
      });
    }

    res.json(growthRate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get BTSS breakdown by leg
router.get('/breakdown/:userId', async (req, res) => {
  try {
    const latestScore = await BTSSScore.getLatestScore(req.params.userId);

    if (!latestScore) {
      return res.status(404).json({ message: 'No BTSS scores found' });
    }

    const breakdown = {
      legs: [
        {
          name: 'Mindset Mystery',
          score: latestScore.mindsetMysteryScore,
          phase: getPhase(latestScore.mindsetMysteryScore),
          isWeakest: latestScore.weakestLeg === 'Mindset Mystery',
          isStrongest: latestScore.strongestLeg === 'Mindset Mystery',
          details: latestScore.mindsetDetails
        },
        {
          name: 'Money Moves',
          score: latestScore.moneyMovesScore,
          phase: getPhase(latestScore.moneyMovesScore),
          isWeakest: latestScore.weakestLeg === 'Money Moves',
          isStrongest: latestScore.strongestLeg === 'Money Moves',
          details: latestScore.moneyDetails
        },
        {
          name: 'Legacy Mission',
          score: latestScore.legacyMissionScore,
          phase: getPhase(latestScore.legacyMissionScore),
          isWeakest: latestScore.weakestLeg === 'Legacy Mission',
          isStrongest: latestScore.strongestLeg === 'Legacy Mission',
          details: latestScore.legacyDetails
        },
        {
          name: 'Movement Momentum',
          score: latestScore.movementMomentumScore,
          phase: getPhase(latestScore.movementMomentumScore),
          isWeakest: latestScore.weakestLeg === 'Movement Momentum',
          isStrongest: latestScore.strongestLeg === 'Movement Momentum',
          details: latestScore.movementDetails
        }
      ],
      overall: {
        btss: latestScore.overallBTSS,
        stability: latestScore.tableStability,
        assessmentDate: latestScore.scoreDate
      }
    };

    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get comparison between two assessments
router.get('/compare/:userId/:scoreId1/:scoreId2', async (req, res) => {
  try {
    const score1 = await BTSSScore.findById(req.params.scoreId1);
    const score2 = await BTSSScore.findById(req.params.scoreId2);

    if (!score1 || !score2) {
      return res.status(404).json({ message: 'One or both scores not found' });
    }

    const comparison = {
      score1: {
        date: score1.scoreDate,
        overall: score1.overallBTSS,
        legs: {
          mindset: score1.mindsetMysteryScore,
          money: score1.moneyMovesScore,
          legacy: score1.legacyMissionScore,
          movement: score1.movementMomentumScore
        }
      },
      score2: {
        date: score2.scoreDate,
        overall: score2.overallBTSS,
        legs: {
          mindset: score2.mindsetMysteryScore,
          money: score2.moneyMovesScore,
          legacy: score2.legacyMissionScore,
          movement: score2.movementMomentumScore
        }
      },
      changes: {
        overall: score2.overallBTSS - score1.overallBTSS,
        mindset: score2.mindsetMysteryScore - score1.mindsetMysteryScore,
        money: score2.moneyMovesScore - score1.moneyMovesScore,
        legacy: score2.legacyMissionScore - score1.legacyMissionScore,
        movement: score2.movementMomentumScore - score1.movementMomentumScore
      },
      improvements: [],
      declines: []
    };

    // Identify improvements and declines
    Object.keys(comparison.changes).forEach(key => {
      const change = comparison.changes[key];
      if (change > 0) {
        comparison.improvements.push({ area: key, change });
      } else if (change < 0) {
        comparison.declines.push({ area: key, change });
      }
    });

    res.json(comparison);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to determine phase
function getPhase(score) {
  if (score >= 76) return 'Mastery';
  if (score >= 51) return 'Strength';
  if (score >= 26) return 'Growth';
  return 'Foundation';
}

export default router;
