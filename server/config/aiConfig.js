/**
 * AI Platform Configuration
 * Configure your AI provider (Claude or OpenAI) here
 */

export const AI_CONFIG = {
  // Choose your AI provider: 'claude' or 'openai'
  provider: process.env.AI_PROVIDER || 'claude',

  // Claude Configuration
  claude: {
    apiKey: process.env.CLAUDE_API_KEY || '',
    model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 1024,
    temperature: parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.7,
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1024,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  },

  // System Prompt Configuration
  systemPrompt: {
    includeScripture: true,
    focusOnWeakestLeg: true,
    maxConversationHistory: 10,
  },

  // Feature Flags
  features: {
    realTimeAI: process.env.ENABLE_REAL_TIME_AI === 'true' || false,
    scriptureAPI: process.env.ENABLE_SCRIPTURE_API === 'true' || false,
    analyticsTracking: process.env.ENABLE_ANALYTICS === 'true' || true,
  }
};

export default AI_CONFIG;
