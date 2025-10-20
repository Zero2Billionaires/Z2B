/**
 * Scripture Service - Enhanced Scripture Database with Search
 * Comprehensive Bible verse database for Coach ManLaw
 */

const COMPREHENSIVE_SCRIPTURE_DATABASE = {
  mindset: [
    {
      reference: 'Proverbs 23:7',
      verse: 'For as he thinks in his heart, so is he.',
      application: 'Your thoughts shape your reality. Think like a billionaire to become one.',
      category: 'Identity',
      tags: ['thoughts', 'identity', 'transformation']
    },
    {
      reference: 'Romans 12:2',
      verse: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.',
      application: 'Transform your mindset to transform your wealth.',
      category: 'Renewal',
      tags: ['transformation', 'mindset', 'renewal']
    },
    {
      reference: 'Philippians 4:8',
      verse: 'Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.',
      application: 'Guard your mind with excellent thoughts.',
      category: 'Focus',
      tags: ['thoughts', 'excellence', 'focus']
    },
    {
      reference: 'Proverbs 4:23',
      verse: 'Above all else, guard your heart, for everything you do flows from it.',
      application: 'Your heart and mind are the source of your success.',
      category: 'Protection',
      tags: ['heart', 'guard', 'source']
    },
    {
      reference: '2 Corinthians 10:5',
      verse: 'We demolish arguments and every pretension that sets itself up against the knowledge of God, and we take captive every thought to make it obedient to Christ.',
      application: 'Take control of limiting beliefs and negative thoughts.',
      category: 'Authority',
      tags: ['thoughts', 'control', 'authority']
    }
  ],
  money: [
    {
      reference: 'Proverbs 13:11',
      verse: 'Dishonest money dwindles away, but whoever gathers money little by little makes it grow.',
      application: 'Build wealth systematically, not through schemes.',
      category: 'Growth',
      tags: ['wealth', 'integrity', 'growth']
    },
    {
      reference: 'Proverbs 21:5',
      verse: 'The plans of the diligent lead to profit as surely as haste leads to poverty.',
      application: 'Strategic planning leads to financial success.',
      category: 'Planning',
      tags: ['planning', 'diligence', 'profit']
    },
    {
      reference: 'Luke 16:10',
      verse: 'Whoever can be trusted with very little can also be trusted with much.',
      application: 'Master small money to multiply into great wealth.',
      category: 'Stewardship',
      tags: ['stewardship', 'trust', 'multiplication']
    },
    {
      reference: 'Malachi 3:10',
      verse: 'Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this, says the LORD Almighty, and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it.',
      application: 'Give first, then watch God multiply your finances.',
      category: 'Giving',
      tags: ['giving', 'tithe', 'blessing']
    },
    {
      reference: 'Deuteronomy 8:18',
      verse: 'But remember the LORD your God, for it is he who gives you the ability to produce wealth.',
      application: 'God is your source of wealth-building ability.',
      category: 'Source',
      tags: ['ability', 'wealth', 'source']
    },
    {
      reference: 'Proverbs 10:4',
      verse: 'Lazy hands make for poverty, but diligent hands bring wealth.',
      application: 'Hard work and diligence create wealth.',
      category: 'Work',
      tags: ['work', 'diligence', 'prosperity']
    }
  ],
  legacy: [
    {
      reference: 'Proverbs 13:22',
      verse: 'A good person leaves an inheritance for their children\'s children.',
      application: 'Build systems that outlive you and bless generations.',
      category: 'Generational',
      tags: ['inheritance', 'legacy', 'generations']
    },
    {
      reference: 'Psalm 78:6',
      verse: 'So the next generation would know them, even the children yet to be born, and they in turn would tell their children.',
      application: 'Your legacy teaches future generations.',
      category: 'Teaching',
      tags: ['teaching', 'future', 'generations']
    },
    {
      reference: 'Proverbs 22:6',
      verse: 'Start children off on the way they should go, and even when they are old they will not turn from it.',
      application: 'Legacy begins with training the next generation.',
      category: 'Training',
      tags: ['training', 'children', 'legacy']
    },
    {
      reference: 'Ecclesiastes 2:21',
      verse: 'For a person may labor with wisdom, knowledge and skill, and then they must leave all they own to another who has not toiled for it.',
      application: 'Create succession plans for your legacy.',
      category: 'Succession',
      tags: ['succession', 'planning', 'wisdom']
    },
    {
      reference: 'Matthew 6:19-20',
      verse: 'Do not store up for yourselves treasures on earth, where moths and vermin destroy, and where thieves break in and steal. But store up for yourselves treasures in heaven.',
      application: 'Build eternal legacy, not just earthly wealth.',
      category: 'Eternal',
      tags: ['eternal', 'treasure', 'heaven']
    }
  ],
  movement: [
    {
      reference: 'Matthew 5:14-16',
      verse: 'You are the light of the world. A town built on a hill cannot be hidden... let your light shine before others.',
      application: 'Your influence and visibility create movement.',
      category: 'Influence',
      tags: ['influence', 'light', 'visibility']
    },
    {
      reference: 'Proverbs 27:17',
      verse: 'As iron sharpens iron, so one person sharpens another.',
      application: 'Build community to multiply your impact.',
      category: 'Community',
      tags: ['community', 'growth', 'sharpening']
    },
    {
      reference: 'Ecclesiastes 4:9-10',
      verse: 'Two are better than one, because they have a good return for their labor.',
      application: 'Collaboration multiplies success.',
      category: 'Collaboration',
      tags: ['collaboration', 'partnership', 'multiplication']
    },
    {
      reference: '1 Corinthians 15:58',
      verse: 'Therefore, my dear brothers and sisters, stand firm. Let nothing move you. Always give yourselves fully to the work of the Lord, because you know that your labor in the Lord is not in vain.',
      application: 'Your work creates lasting movement and impact.',
      category: 'Perseverance',
      tags: ['perseverance', 'work', 'impact']
    },
    {
      reference: 'Acts 1:8',
      verse: 'But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.',
      application: 'Your influence will expand beyond your wildest dreams.',
      category: 'Expansion',
      tags: ['power', 'witness', 'expansion']
    }
  ],
  encouragement: [
    {
      reference: 'Jeremiah 29:11',
      verse: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.',
      application: 'God has prosperity planned for you.',
      category: 'Hope',
      tags: ['hope', 'future', 'prosperity']
    },
    {
      reference: 'Philippians 4:13',
      verse: 'I can do all this through him who gives me strength.',
      application: 'You have divine strength to build your legacy.',
      category: 'Strength',
      tags: ['strength', 'power', 'ability']
    },
    {
      reference: 'Isaiah 41:10',
      verse: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
      application: 'God is with you in every business challenge.',
      category: 'Presence',
      tags: ['fear', 'presence', 'help']
    },
    {
      reference: 'Joshua 1:9',
      verse: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.',
      application: 'Take bold action with divine confidence.',
      category: 'Courage',
      tags: ['courage', 'boldness', 'confidence']
    },
    {
      reference: 'Romans 8:31',
      verse: 'What, then, shall we say in response to these things? If God is for us, who can be against us?',
      application: 'You cannot fail when God is on your side.',
      category: 'Victory',
      tags: ['victory', 'support', 'confidence']
    }
  ],
  wealth: [
    {
      reference: '3 John 1:2',
      verse: 'Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers.',
      application: 'God desires your comprehensive prosperity.',
      category: 'Prosperity',
      tags: ['prosperity', 'health', 'soul']
    },
    {
      reference: 'Psalm 35:27',
      verse: 'Let the LORD be magnified, Who has pleasure in the prosperity of His servant.',
      application: 'God takes pleasure in your wealth and success.',
      category: 'Blessing',
      tags: ['blessing', 'pleasure', 'prosperity']
    },
    {
      reference: 'Proverbs 10:22',
      verse: 'The blessing of the LORD brings wealth, without painful toil for it.',
      application: 'Divine blessing creates effortless wealth.',
      category: 'Blessing',
      tags: ['blessing', 'wealth', 'grace']
    }
  ],
  wisdom: [
    {
      reference: 'Proverbs 3:13-14',
      verse: 'Blessed are those who find wisdom, those who gain understanding, for she is more profitable than silver and yields better returns than gold.',
      application: 'Wisdom is your greatest wealth asset.',
      category: 'Value',
      tags: ['wisdom', 'understanding', 'value']
    },
    {
      reference: 'James 1:5',
      verse: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.',
      application: 'Ask God for business wisdom and strategy.',
      category: 'Request',
      tags: ['asking', 'generosity', 'wisdom']
    },
    {
      reference: 'Proverbs 16:16',
      verse: 'How much better to get wisdom than gold, to get insight rather than silver!',
      application: 'Invest in wisdom before wealth.',
      category: 'Priority',
      tags: ['wisdom', 'priority', 'investment']
    }
  ]
};

/**
 * Search scriptures by keyword
 */
export function searchScriptures(query) {
  const lowercaseQuery = query.toLowerCase();
  const results = [];

  Object.keys(COMPREHENSIVE_SCRIPTURE_DATABASE).forEach(leg => {
    COMPREHENSIVE_SCRIPTURE_DATABASE[leg].forEach(scripture => {
      const matchScore = calculateMatchScore(scripture, lowercaseQuery);
      if (matchScore > 0) {
        results.push({
          ...scripture,
          leg,
          matchScore
        });
      }
    });
  });

  // Sort by match score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Calculate match score for search
 */
function calculateMatchScore(scripture, query) {
  let score = 0;

  // Check verse content
  if (scripture.verse.toLowerCase().includes(query)) score += 5;

  // Check reference
  if (scripture.reference.toLowerCase().includes(query)) score += 4;

  // Check application
  if (scripture.application.toLowerCase().includes(query)) score += 3;

  // Check tags
  scripture.tags.forEach(tag => {
    if (tag.toLowerCase().includes(query)) score += 2;
  });

  // Check category
  if (scripture.category.toLowerCase().includes(query)) score += 1;

  return score;
}

/**
 * Get scripture by leg
 */
export function getScriptureByLeg(leg, limit = 5) {
  const legMapping = {
    'Mindset Mystery': 'mindset',
    'Money Moves': 'money',
    'Legacy Mission': 'legacy',
    'Movement Momentum': 'movement'
  };

  const category = legMapping[leg] || leg.toLowerCase();
  const scriptures = COMPREHENSIVE_SCRIPTURE_DATABASE[category] || [];

  if (limit) {
    return scriptures.slice(0, limit);
  }

  return scriptures;
}

/**
 * Get random scripture
 */
export function getRandomScripture(leg = null) {
  if (leg) {
    const scriptures = getScriptureByLeg(leg, null);
    return scriptures[Math.floor(Math.random() * scriptures.length)];
  }

  // Get from all scriptures
  const allScriptures = [];
  Object.keys(COMPREHENSIVE_SCRIPTURE_DATABASE).forEach(category => {
    allScriptures.push(...COMPREHENSIVE_SCRIPTURE_DATABASE[category]);
  });

  return allScriptures[Math.floor(Math.random() * allScriptures.length)];
}

/**
 * Get scripture by reference
 */
export function getScriptureByReference(reference) {
  for (const category of Object.keys(COMPREHENSIVE_SCRIPTURE_DATABASE)) {
    const scripture = COMPREHENSIVE_SCRIPTURE_DATABASE[category].find(
      s => s.reference.toLowerCase() === reference.toLowerCase()
    );
    if (scripture) {
      return { ...scripture, leg: category };
    }
  }
  return null;
}

/**
 * Get all categories
 */
export function getCategories() {
  return Object.keys(COMPREHENSIVE_SCRIPTURE_DATABASE);
}

/**
 * Get scripture statistics
 */
export function getScriptureStats() {
  const stats = {
    total: 0,
    byLeg: {}
  };

  Object.keys(COMPREHENSIVE_SCRIPTURE_DATABASE).forEach(leg => {
    const count = COMPREHENSIVE_SCRIPTURE_DATABASE[leg].length;
    stats.byLeg[leg] = count;
    stats.total += count;
  });

  return stats;
}

export default {
  searchScriptures,
  getScriptureByLeg,
  getRandomScripture,
  getScriptureByReference,
  getCategories,
  getScriptureStats,
  COMPREHENSIVE_SCRIPTURE_DATABASE
};
