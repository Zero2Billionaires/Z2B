import express from 'express';
import mongoose from 'mongoose';
import Anthropic from '@anthropic-ai/sdk';
import CoachUser from '../models/CoachUser.js';
import CoachingSession from '../models/CoachingSession.js';
import BTSSScore from '../models/BTSSScore.js';
import UserProgress from '../models/UserProgress.js';
import ActivityResponse from '../models/ActivityResponse.js';
import { protect, optionalAuth, checkOwnership } from '../middleware/auth.js';

const router = express.Router();

// Simple AI response generator for Coach ManLaw
// Uses environment variables to determine if real AI or placeholder responses
async function generateCoachResponse(userResponse, lessonContext) {
    const { day, lessonTitle, activity, btssImpact, responseType } = lessonContext;

    // Check if AI is enabled
    const enableAI = process.env.ENABLE_REAL_TIME_AI === 'true';
    const aiProvider = process.env.AI_PROVIDER || 'claude';

    if (!enableAI) {
        // Return placeholder response when AI is not enabled
        return generatePlaceholderResponse(userResponse, lessonContext);
    }

    try {
        // Use real AI API
        return await generateEnhancedResponse(userResponse, lessonContext);
    } catch (error) {
        console.error('AI Response Error:', error);
        return generatePlaceholderResponse(userResponse, lessonContext);
    }
}

function generatePlaceholderResponse(userResponse, lessonContext) {
    const { day, lessonTitle, btssImpact, responseType } = lessonContext;

    // INTELLIGENT RESPONSE GENERATOR - Analyzes user's actual content

    // Parse the user's response to extract key elements
    const lines = userResponse.split(/\n+/).filter(line => line.trim().length > 0);
    const sentences = userResponse.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const wordCount = userResponse.trim().split(/\s+/).length;

    // Extract key phrases and concepts (words 4+ characters that aren't common words)
    const commonWords = ['this', 'that', 'with', 'have', 'from', 'they', 'will', 'would', 'there', 'their', 'about', 'into', 'than', 'them', 'these', 'could', 'other', 'want', 'more', 'some', 'what', 'when', 'your', 'which', 'very', 'through', 'just', 'also', 'know', 'take', 'make', 'good', 'well'];
    const words = userResponse.toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 4 && !commonWords.includes(w));

    const keyPhrases = [...new Set(words)].slice(0, 5); // Get unique key words

    // Count list items (numbered or bulleted)
    const listItemCount = userResponse.match(/^[\s]*[-•*\d]+[.)\s]/gm)?.length || 0;

    // Build personalized response
    let feedback = "Legacy Builder! ";

    // Reference specific lesson structure
    if (listItemCount >= 3) {
        feedback += `I see you've broken this down into ${listItemCount} specific points - that's the kind of clarity that builds billion-dollar thinking. `;
    } else if (sentences.length >= 3) {
        feedback += `Your detailed breakdown here shows you're really processing this lesson. `;
    } else if (wordCount > 50) {
        feedback += `I appreciate the depth in your response to this lesson. `;
    }

    // Reference actual lesson content using key phrases
    if (keyPhrases.length > 0) {
        const samplePhrase = keyPhrases[Math.floor(Math.random() * Math.min(3, keyPhrases.length))];

        // Build contextual feedback based on BTSS focus
        if (btssImpact === 'money' || btssImpact === 'legacy') {
            feedback += `The way you're thinking about "${samplePhrase}" tells me you're applying this lesson to real wealth building. `;
        } else if (btssImpact === 'mindset') {
            feedback += `When you mention "${samplePhrase}", I see you're internalizing this lesson at a deep level. `;
        } else if (btssImpact === 'movement') {
            feedback += `Your focus on "${samplePhrase}" shows you understand how to apply this lesson to build influence. `;
        } else {
            feedback += `Your insights around "${samplePhrase}" show you're really grasping this lesson. `;
        }
    }

    // Add BTSS-specific affirmation
    const btssResponses = {
        mindset: "This is the kind of mindset shift that separates those who dream from those who build empires.",
        money: "This financial intelligence will translate directly into wealth creation opportunities.",
        legacy: "You're thinking in systems and automation - that's how you build something that outlasts you.",
        movement: "You're not just building a business, you're positioning yourself as a leader people will follow.",
        all: "You're integrating all four pillars beautifully - Mindset, Money, Legacy, and Movement working together."
    };

    feedback += btssResponses[btssImpact] || btssResponses['all'];

    // Call to action
    const actionItems = [
        " Now, take your first action on what you've written here today.",
        " Your next move: implement the strongest idea from this response within 24 hours.",
        " This is Day " + day + " - keep this momentum building every single day!",
        " Remember: Your billion-dollar future is built one powerful action at a time."
    ];

    feedback += actionItems[Math.floor(Math.random() * actionItems.length)];

    return feedback;
}

async function generateEnhancedResponse(userResponse, lessonContext) {
    const { day, lessonTitle, activity, btssImpact, responseType } = lessonContext;

    try {
        // Initialize Anthropic client with API key from env
        const anthropic = new Anthropic({
            apiKey: process.env.CLAUDE_API_KEY
        });

        // Build the world-class system prompt for Coach ManLaw
        const systemPrompt = `You are Coach ManLaw, the world's first hybrid AI billionaire coach combining FOUR legendary business personalities into one powerful mentor. You guide people through the 90-Day Legacy Builder Transformation using the 4M Billionaire Table framework (Mindset Mystery, Money Moves, Legacy Missions, Momentum Movement).

YOUR UNIQUE 4-PART PERSONALITY BLEND:

🎯 10% HUMOR - Infectious Energy & Motivation
- Use witty analogies, clever wordplay, and motivational humor to keep things engaging
- Make complex concepts fun and memorable with creative metaphors
- Keep the energy high with enthusiastic language and playful challenges
- Example: "You're thinking too small! That goal needs steroids and a cape!"

❤️ 20% EMOTIONAL INTELLIGENCE - Principle-Centered Leadership
- Lead with empathy, active listening, and genuine care for their growth
- Encourage win-win thinking, integrity, and character-based success
- Help them build self-awareness and emotional regulation
- Teach them to lead themselves before leading others
- Use the 7 Habits framework: Be proactive, begin with the end in mind, put first things first
- Example: "I hear the uncertainty in your words. That's your old identity fighting the new one. Let's honor both and move forward with integrity."

🙏 35% THE KINGDOM OF GOD WEALTH BLUEPRINT - Faith-Based Leadership
- Integrate biblical wisdom and spiritual principles into business strategy
- Quote relevant scriptures that apply to their specific situation
- Connect wealth creation to divine purpose and generational legacy
- Teach them to build with God's blueprint, not just ego
- Emphasize stewardship, generosity, and kingdom-minded entrepreneurship
- Example: "Proverbs 16:3 says 'Commit your work to the Lord, and your plans will be established.' What if this setback is God redirecting you to something better?"

🎯 35% STRATEGIC EXECUTION - Data-Driven Business Mastery
- Provide tactical, actionable strategies and frameworks
- Think like a business strategist: systems, metrics, optimization
- Focus on high-leverage activities and 80/20 principles
- Challenge them with data-driven questions and execution plans
- Push for speed of implementation and decision velocity
- Example: "Let's break this into the 80/20: What's the ONE action that will drive 80% of your results? Do that first, ignore the rest for now."

COACHING APPROACH:
1. **Acknowledge Specifics**: Reference their exact words, ideas, and insights to show you're truly listening
2. **Blend Personalities**: Mix humor with scripture, empathy with strategy, motivation with tactics
3. **BTSS Connection**: Connect their response to the 4M framework (Mindset Mystery, Money Moves, Legacy Missions, Momentum Movement)
4. **Challenge + Support**: Push them to think 10x bigger while supporting their journey with empathy
5. **Clear Action Step**: End with ONE specific, actionable next step they can take today

RESPONSE FORMULA (3-5 sentences):
- Sentence 1: Acknowledge something specific they wrote (quote their words or reference their idea)
- Sentence 2: Add value - Use scripture, strategy, or insight that elevates their thinking
- Sentence 3: Challenge them to go deeper or think bigger (with humor or empathy)
- Sentence 4: Clear action step tied to the 4M Billionaire Table

LANGUAGE STYLE:
- Call them "Legacy Builder" as a term of respect and potential
- Use powerful, declarative statements: "This IS your moment" not "This could be"
- Be conversational but commanding - like a wise mentor who believes in them more than they believe in themselves
- Balance directness with warmth, strategy with soul, faith with facts

BTSS FRAMEWORK (4M Billionaire Table):
- **Mindset Mystery**: Identity shift, billionaire thinking, confidence, vision, beliefs
- **Money Moves**: Financial intelligence, multiple income streams, value creation, wealth multiplication
- **Legacy Missions**: Systems, automation, team building, scalability, generational impact
- **Momentum Movement**: Personal brand, influence, community, thought leadership, movement creation

Remember: You're not just a coach - you're a LEGACY ARCHITECT helping them build billion-dollar empires with purpose, principles, and proven frameworks. Make every response count!`;

        const userPrompt = `Day ${day}: ${lessonTitle}
${responseType === 'activity' ? 'Activity' : 'Assignment'}: ${activity || 'Lesson activity'}
BTSS Impact: ${btssImpact}

The user's response:
"${userResponse}"

Provide powerful, personalized coaching feedback that:
1. Acknowledges specific points they made (reference their actual words/ideas)
2. Connects their thinking to the BTSS framework
3. Encourages them to go even deeper or take action
4. Makes them feel seen, challenged, and inspired`;

        // Call Claude API
        const message = await anthropic.messages.create({
            model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: 300,
            temperature: 0.8,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: userPrompt
                }
            ]
        });

        // Extract the response text
        const feedback = message.content[0].text;
        return feedback;

    } catch (error) {
        console.error('Claude API Error:', error);
        // Fallback to placeholder if API fails
        return generatePlaceholderResponse(userResponse, lessonContext);
    }
}

// Most routes require authentication
// Some routes allow optional auth for public access

// ========================================
// COACH USER ROUTES
// ========================================

// Get coach user profile (protected, must be owner or admin)
router.get('/user/:userId', protect, checkOwnership, async (req, res) => {
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

// Update coach user (protected, must be owner or admin)
router.put('/user/:userId', protect, checkOwnership, async (req, res) => {
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

// Start a new check-in session (protected)
router.post('/check-in', protect, async (req, res) => {
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

// Get active session (protected, must be owner)
router.get('/check-in/active/:userId', protect, checkOwnership, async (req, res) => {
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

// Send message to coach (protected)
router.post('/chat', protect, async (req, res) => {
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

// ========================================
// ACTIVITY RESPONSE ROUTES
// ========================================

// Submit activity/assignment response
router.post('/activity-response', async (req, res) => {
  try {
    const { userId, day, lessonTitle, responseType, userResponse, btssImpact, activity } = req.body;

    // Validate required fields
    if (!userId || !day || !lessonTitle || !responseType || !userResponse) {
      return res.status(400).json({
        message: 'Missing required fields: userId, day, lessonTitle, responseType, userResponse'
      });
    }

    // Generate coach feedback
    const lessonContext = {
      day,
      lessonTitle,
      activity,
      btssImpact: btssImpact || 'all',
      responseType
    };

    const coachFeedback = await generateCoachResponse(userResponse, lessonContext);

    // Save the response
    const activityResponse = new ActivityResponse({
      userId,
      day,
      lessonTitle,
      responseType,
      userResponse,
      coachFeedback,
      feedbackGeneratedAt: new Date(),
      btssImpact: btssImpact || 'all',
      completionStatus: 'reviewed'
    });

    await activityResponse.save();

    // Update user's completion stats (only if userId is a valid ObjectId)
    try {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        const user = await CoachUser.findById(userId);
        if (user) {
          user.totalActionsCompleted = (user.totalActionsCompleted || 0) + 1;
          await user.save();
        }
      }
    } catch (userUpdateError) {
      // Ignore user update errors for demo users
      console.log('Skipping user stats update:', userUpdateError.message);
    }

    res.status(201).json({
      success: true,
      response: activityResponse,
      feedback: coachFeedback
    });
  } catch (error) {
    console.error('Activity Response Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's activity responses
router.get('/activity-responses/:userId', async (req, res) => {
  try {
    const { day, limit = 50 } = req.query;

    let query = { userId: req.params.userId };
    if (day) {
      query.day = parseInt(day);
    }

    const responses = await ActivityResponse.find(query)
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit));

    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activity completion stats
router.get('/activity-stats/:userId', async (req, res) => {
  try {
    const stats = await ActivityResponse.getCompletionStats(req.params.userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
