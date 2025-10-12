/**
 * Claude API Integration Service
 * Handles communication with Anthropic's Claude API
 */

import fetch from 'node-fetch';
import AI_CONFIG from '../config/aiConfig.js';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Call Claude API with system prompt and conversation history
 * @param {string} systemPrompt - The system prompt for Claude
 * @param {Array} conversationHistory - Array of {role, content} messages
 * @param {string} userMessage - The latest user message
 * @param {string} apiKey - Optional API key override
 * @returns {Promise<Object>} - Claude's response
 */
export async function callClaudeAPI(systemPrompt, conversationHistory = [], userMessage, apiKey = null) {
  try {
    const key = apiKey || AI_CONFIG.claude.apiKey;

    if (!key) {
      throw new Error('Claude API key not configured. Set CLAUDE_API_KEY in environment variables.');
    }

    // Prepare messages array
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Prepare API request
    const requestBody = {
      model: AI_CONFIG.claude.model,
      max_tokens: AI_CONFIG.claude.maxTokens,
      temperature: AI_CONFIG.claude.temperature,
      system: systemPrompt,
      messages: messages
    };

    // Make API call
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      content: data.content[0].text,
      usage: data.usage,
      model: data.model,
      stopReason: data.stop_reason
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return {
      success: false,
      error: error.message,
      content: null
    };
  }
}

/**
 * Call OpenAI API (GPT-4) with system prompt and conversation history
 * @param {string} systemPrompt - The system prompt for GPT
 * @param {Array} conversationHistory - Array of {role, content} messages
 * @param {string} userMessage - The latest user message
 * @param {string} apiKey - Optional API key override
 * @returns {Promise<Object>} - OpenAI's response
 */
export async function callOpenAI(systemPrompt, conversationHistory = [], userMessage, apiKey = null) {
  try {
    const key = apiKey || AI_CONFIG.openai.apiKey;

    if (!key) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in environment variables.');
    }

    // Prepare messages array
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Make API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.model,
        messages: messages,
        max_tokens: AI_CONFIG.openai.maxTokens,
        temperature: AI_CONFIG.openai.temperature
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
      finishReason: data.choices[0].finish_reason
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {
      success: false,
      error: error.message,
      content: null
    };
  }
}

/**
 * Universal AI call function that routes to the configured provider
 * @param {string} systemPrompt - The system prompt
 * @param {Array} conversationHistory - Conversation history
 * @param {string} userMessage - User's message
 * @param {string} provider - 'claude' or 'openai' (defaults to config)
 * @returns {Promise<Object>} - AI response
 */
export async function callAI(systemPrompt, conversationHistory, userMessage, provider = null) {
  const selectedProvider = provider || AI_CONFIG.provider;

  if (selectedProvider === 'claude') {
    return await callClaudeAPI(systemPrompt, conversationHistory, userMessage);
  } else if (selectedProvider === 'openai') {
    return await callOpenAI(systemPrompt, conversationHistory, userMessage);
  } else {
    throw new Error(`Unknown AI provider: ${selectedProvider}`);
  }
}

export default {
  callClaudeAPI,
  callOpenAI,
  callAI
};
