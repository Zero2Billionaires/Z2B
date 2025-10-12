/**
 * AI Coach Engine - Core conversation logic with Scripture integration
 * Integrates with Claude API or OpenAI for natural coaching conversations
 */

const CoachUser = require('../models/CoachUser');
const BTSSScore = require('../models/BTSSScore');
const CoachingSession = require('../models/CoachingSession');
const UserProgress = require('../models/UserProgress');

// Scripture Database (expandable)
const SCRIPTURE_DATABASE = {
  mindset: [
    {
      reference: 'Proverbs 23:7',
      verse: 'For as he thinks in his heart, so is he.',
      application: 'Your thoughts shape your reality. Think like a billionaire to become one.'
    },
    {
      reference: 'Romans 12:2',
      verse: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.',
      application: 'Transform your mindset to transform your wealth.'
    },
    {
      reference: 'Philippians 4:8',
      verse: 'Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.',
      application: 'Guard your mind with excellent thoughts.'
    }
  ],
  money: [
    {
      reference: 'Proverbs 13:11',
      verse: 'Dishonest money dwindles away, but whoever gathers money little by little makes it grow.',
      application: 'Build wealth systematically, not through schemes.'
    },
    {
      reference: 'Proverbs 21:5',
      verse: 'The plans of the diligent lead to profit as surely as haste leads to poverty.',
      application: 'Strategic planning leads to financial success.'
    },
    {
      reference: 'Luke 16:10',
      verse: 'Whoever can be trusted with very little can also be trusted with much.',
      application: 'Master small money to multiply into great wealth.'
    }
  ],
  legacy: [
    {
      reference: 'Proverbs 13:22',
      verse: 'A good person leaves an inheritance for their children\'s children.',
      application: 'Build systems that outlive you and bless generations.'
    },
    {
      reference: 'Ecclesiastes 2:21',
      verse: 'For a person may labor with wisdom, knowledge and skill, and then they must leave all they own to another who has not toiled for it.',
      application: 'Create succession plans for your legacy.'
    },
    {
      reference: 'Psalm 78:6',
      verse: 'So the next generation would know them, even the children yet to be born, and they in turn would tell their children.',
      application: 'Your legacy teaches future generations.'
    }
  ],
  movement: [
    {
      reference: 'Matthew 5:14-16',
      verse: 'You are the light of the world. A town built on a hill cannot be hidden... let your light shine before others.',
      application: 'Your influence and visibility create movement.'
    },
    {
      reference: 'Proverbs 27:17',
      verse: 'As iron sharpens iron, so one person sharpens another.',
      application: 'Build community to multiply your impact.'
    },
    {
      reference: 'Ecclesiastes 4:9-10',
      verse: 'Two are better than one, because they have a good return for their labor.',
      application: 'Collaboration multiplies success.'
    }
  ],
  encouragement: [
    {
      reference: 'Jeremiah 29:11',
      verse: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.',
      application: 'God has prosperity planned for you.'
    },
    {
      reference: 'Philippians 4:13',
      verse: 'I can do all this through him who gives me strength.',
      application: 'You have divine strength to build your legacy.'
    }
  ]
};

/**
 * Get relevant scripture based on context
 */
function getScripture(context) {
  const legMapping = {
    'Mindset Mystery': 'mindset',
    'Money Moves': 'money',
    'Legacy Mission': 'legacy',
    'Movement Momentum': 'movement'
  };

  const category = legMapping[context] || 'encouragement';
  const scriptures = SCRIPTURE_DATABASE[category];

  if (!scriptures || scriptures.length === 0) {
    return SCRIPTURE_DATABASE.encouragement[0];
  }

  // Return random scripture from category
  return scriptures[Math.floor(Math.random() * scriptures.length)];
}

/**
 * Build AI Coach System Prompt
 */
function buildSystemPrompt(user, btssScore, recentSessions) {
  const scripture = getScripture(user.currentFocusLeg);

  return `You are the Zero2Billionaires AI Coach, a warm, insightful, and faith-driven mentor guiding Legacy Builders through wealth and purpose using the Four Legs of a Billionaire Table.

## Core Identity
- Tone: Natural, empowering, Scripture-based, and concise
- Always personalize, celebrate wins, and confront limiting beliefs with truth
- Balance faith + strategy seamlessly

## User Context
Name: ${user.fullName}
Current Stage: ${user.currentStage}
Focus Leg: ${user.currentFocusLeg}
Check-in Streak: ${user.checkInStreak} days
Total Wins: ${user.totalWins}
Actions Completed: ${user.totalActionsCompleted}

## Current BTSS Scores
${btssScore ? `
- Mindset Mystery: ${btssScore.mindsetMysteryScore}/100
- Money Moves: ${btssScore.moneyMovesScore}/100
- Legacy Mission: ${btssScore.legacyMissionScore}/100
- Movement Momentum: ${btssScore.movementMomentumScore}/100
- Overall BTSS: ${btssScore.overallBTSS}/100
- Weakest Leg: ${btssScore.weakestLeg}
- Table Stability: ${btssScore.tableStability}
` : 'No BTSS assessment yet - encourage user to complete one.'}

## Today's Scripture
${scripture.reference}: "${scripture.verse}"
Application: ${scripture.application}

## The Four Legs Framework
1. **Mindset Mystery** - Identity in Christ, belief, vision, spiritual alignment
   Key: Rich in thought before rich in bank balance

2. **Money Moves** - Earn, multiply, protect; build scalable systems
   Key: Don't work for money—make it work for you

3. **Legacy Mission** - Create purpose-driven systems that outlive you
   Key: Build something that outlives your labor

4. **Movement Momentum** - Community, EQ, networking, visibility
   Key: When mission becomes movement, influence becomes infinite

## Conversation Guidelines
✅ Start with warmth + Scripture (naturally woven in)
✅ Focus coaching on ${user.currentFocusLeg} (the weakest leg)
✅ Celebrate wins enthusiastically
✅ Challenge limiting beliefs with compassion
✅ Keep responses concise (2-3 paragraphs max)
✅ End with ONE clear, actionable next step
✅ Use "Legacy Builder" language often
✅ Integrate faith naturally, not forcefully

🚫 Never lecture or overwhelm
🚫 Never judge or condemn
🚫 Never separate faith from business
🚫 Never give vague advice

## Core Philosophy
"I am a Legacy Builder, You are a Legacy Builder, and Together we are Builders of Legacies."

Remember: You're coaching ${user.fullName} through their ${user.currentStage} stage, focusing on strengthening their ${user.currentFocusLeg}. Be warm, be wise, be faith-driven.`;
}

/**
 * Generate AI Coach Response
 * This function would integrate with Claude API or OpenAI
 */
async function generateCoachResponse(sessionId, userMessage, apiKey = null, model = 'claude') {
  try {
    // Get session
    const session = await CoachingSession.findOne({ sessionId })
      .populate('userId');

    if (!session) {
      throw new Error('Session not found');
    }

    const user = await CoachUser.findById(session.userId._id || session.userId);
    const btssScore = await BTSSScore.getLatestScore(user._id);
    const recentSessions = await CoachingSession.getUserSessions(user._id, 5);

    // Build conversation history
    const conversationHistory = session.conversationLog.map(msg => ({
      role: msg.role === 'coach' ? 'assistant' : msg.role,
      content: msg.content
    }));

    // Build system prompt
    const systemPrompt = buildSystemPrompt(user, btssScore, recentSessions);

    // Prepare API request
    let aiResponse = '';
    let scripture = null;

    if (model === 'claude') {
      // Claude API Integration
      if (!apiKey) {
        // For development: return structured placeholder
        aiResponse = generatePlaceholderResponse(user, userMessage, btssScore);
      } else {
        // TODO: Integrate with Claude API
        // const response = await callClaudeAPI(systemPrompt, conversationHistory, userMessage, apiKey);
        // aiResponse = response.content;
        aiResponse = generatePlaceholderResponse(user, userMessage, btssScore);
      }
    } else {
      // OpenAI API Integration
      if (!apiKey) {
        aiResponse = generatePlaceholderResponse(user, userMessage, btssScore);
      } else {
        // TODO: Integrate with OpenAI API
        // const response = await callOpenAI(systemPrompt, conversationHistory, userMessage, apiKey);
        // aiResponse = response.content;
        aiResponse = generatePlaceholderResponse(user, userMessage, btssScore);
      }
    }

    // Add scripture if appropriate
    if (shouldIncludeScripture(session.conversationLog.length)) {
      scripture = getScripture(user.currentFocusLeg);
    }

    // Save coach response to session
    session.addMessage('coach', aiResponse);
    if (scripture) {
      session.addScripture(scripture.reference, scripture.verse, scripture.application);
    }
    await session.save();

    return {
      response: aiResponse,
      scripture,
      sessionId: session.sessionId,
      focusLeg: user.currentFocusLeg
    };
  } catch (error) {
    console.error('Error generating coach response:', error);
    throw error;
  }
}

/**
 * Determine if scripture should be included
 */
function shouldIncludeScripture(messageCount) {
  // Include scripture at start of conversation and every 5 messages
  return messageCount <= 2 || messageCount % 5 === 0;
}

/**
 * Generate placeholder response for development
 */
function generatePlaceholderResponse(user, userMessage, btssScore) {
  const lowercaseMessage = userMessage.toLowerCase();

  // Detect intent
  if (lowercaseMessage.includes('help') || lowercaseMessage.includes('stuck')) {
    return `${user.fullName}, I hear you, Legacy Builder. When we feel stuck, it's often our ${user.currentFocusLeg} that needs attention.

Here's what I want you to do: Take one small action today that moves you forward in this area. Not a massive leap—just one intentional step.

Remember Proverbs 13:11: "Whoever gathers money little by little makes it grow." Small, consistent actions compound into breakthrough.

What's ONE thing you can do in the next hour to strengthen your ${user.currentFocusLeg}?`;
  }

  if (lowercaseMessage.includes('win') || lowercaseMessage.includes('success') || lowercaseMessage.includes('achieved')) {
    return `YES! That's what I'm talking about, ${user.fullName}! 🎉

Legacy Builders like you turn vision into reality. This win isn't just about what you did—it's about who you're becoming. Your ${user.currentStage} journey is unfolding beautifully.

Now, let's build on this momentum. How can you multiply this win? What system can you create so this success becomes repeatable?

Keep climbing, Builder. Your table is getting stronger! 💪`;
  }

  if (lowercaseMessage.includes('money') || lowercaseMessage.includes('income') || lowercaseMessage.includes('financial')) {
    return `Money is a tool, ${user.fullName}, and Legacy Builders know how to wield it wisely.

Luke 16:10 reminds us: "Whoever can be trusted with very little can also be trusted with much." Your current Money Moves score is ${btssScore ? btssScore.moneyMovesScore : '—'}/100.

Here's your focus: Don't just work for money. Make money work FOR you. That means building systems, automating income, and multiplying through investment.

What's ONE money move you can make this week to strengthen this leg of your table?`;
  }

  // Default response
  return `Hey ${user.fullName}, thanks for sharing that with me.

As a ${user.currentStage} Legacy Builder, you're on a powerful journey. Right now, our focus is strengthening your ${user.currentFocusLeg}—that's where your breakthrough is waiting.

Remember: "I am a Legacy Builder, You are a Legacy Builder, and Together we are Builders of Legacies."

Tell me—what's the biggest challenge you're facing in your ${user.currentFocusLeg} right now? Let's tackle it together.`;
}

/**
 * Generate daily check-in message
 */
function generateCheckInMessage(user, sessionType = 'daily') {
  const scripture = getScripture(user.currentFocusLeg);
  const greeting = getTimeBasedGreeting();

  if (sessionType === 'daily') {
    return {
      message: `${greeting}, ${user.fullName}! ☀️

Welcome back, Legacy Builder! Your ${user.checkInStreak}-day streak is proof of your commitment. That's what separates dreamers from builders.

Today's Word: ${scripture.reference}
"${scripture.verse}"

${scripture.application}

We're focusing on your ${user.currentFocusLeg} today. Quick check: How are you feeling about this area on a scale of 1-10?`,
      scripture
    };
  } else if (sessionType === 'weekly') {
    return {
      message: `${greeting}, ${user.fullName}! 📊

It's time for your weekly deep dive, Legacy Builder. Let's review your progress across all Four Legs and identify where you've grown and where we need to focus.

This week's theme: ${scripture.reference}
"${scripture.verse}"

Ready to assess your BTSS and plan your week ahead? Let's build! 💪`,
      scripture
    };
  } else if (sessionType === 'monthly') {
    return {
      message: `${greeting}, ${user.fullName}! 🎯

Monthly check-in time, Legacy Builder! This is where we step back, see the big picture, and celebrate how far you've come.

As a ${user.currentStage} Builder with ${user.totalWins} wins recorded and ${user.totalActionsCompleted} actions completed, you're making REAL progress.

Let's do a comprehensive BTSS assessment and set your strategic targets for the month ahead.

Ready to level up? 🚀`,
      scripture
    };
  }
}

/**
 * Get time-based greeting
 */
function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

module.exports = {
  generateCoachResponse,
  generateCheckInMessage,
  getScripture,
  buildSystemPrompt
};
