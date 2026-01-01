/**
 * Request Validation Middleware
 * Validates incoming requests based on schemas
 */

import { APIError } from './errorHandler.js';

/**
 * Validate BTSS assessment data
 */
export function validateBTSSAssessment(req, res, next) {
  const {
    userId,
    mindsetMysteryScore,
    moneyMovesScore,
    legacyMissionScore,
    movementMomentumScore
  } = req.body;

  const errors = [];

  // Check required fields
  if (!userId) errors.push('userId is required');

  // Validate scores
  const scores = {
    mindsetMysteryScore,
    moneyMovesScore,
    legacyMissionScore,
    movementMomentumScore
  };

  Object.entries(scores).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      errors.push(`${key} is required`);
    } else if (typeof value !== 'number') {
      errors.push(`${key} must be a number`);
    } else if (value < 0 || value > 100) {
      errors.push(`${key} must be between 0 and 100`);
    }
  });

  if (errors.length > 0) {
    throw new APIError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  next();
}

/**
 * Validate check-in request
 */
export function validateCheckIn(req, res, next) {
  const { userId, sessionType } = req.body;

  const errors = [];

  if (!userId) errors.push('userId is required');

  if (sessionType && !['daily', 'weekly', 'monthly', 'ad-hoc'].includes(sessionType)) {
    errors.push('sessionType must be one of: daily, weekly, monthly, ad-hoc');
  }

  if (errors.length > 0) {
    throw new APIError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  next();
}

/**
 * Validate chat message
 */
export function validateChatMessage(req, res, next) {
  const { userId, message } = req.body;

  const errors = [];

  if (!userId && !req.body.sessionId) {
    errors.push('Either userId or sessionId is required');
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('message is required and must be a non-empty string');
  }

  if (message && message.length > 5000) {
    errors.push('message must be less than 5000 characters');
  }

  if (errors.length > 0) {
    throw new APIError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  next();
}

/**
 * Validate action item
 */
export function validateActionItem(req, res, next) {
  const { userId, description, linkedLeg, priority } = req.body;

  const errors = [];

  if (!userId) errors.push('userId is required');
  if (!description || description.trim().length === 0) {
    errors.push('description is required');
  }

  const validLegs = ['Mindset Mystery', 'Money Moves', 'Legacy Mission', 'Movement Momentum'];
  if (linkedLeg && !validLegs.includes(linkedLeg)) {
    errors.push(`linkedLeg must be one of: ${validLegs.join(', ')}`);
  }

  if (priority && !['high', 'medium', 'low'].includes(priority)) {
    errors.push('priority must be one of: high, medium, low');
  }

  if (errors.length > 0) {
    throw new APIError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  next();
}

/**
 * Validate lesson completion
 */
export function validateLessonCompletion(req, res, next) {
  const { userId, lessonId, rating } = req.body;

  const errors = [];

  if (!userId) errors.push('userId is required');
  if (!lessonId) errors.push('lessonId is required');

  if (rating !== undefined) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      errors.push('rating must be a number between 1 and 5');
    }
  }

  if (errors.length > 0) {
    throw new APIError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  next();
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(req, res, next) {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potentially dangerous characters
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
}

export default {
  validateBTSSAssessment,
  validateCheckIn,
  validateChatMessage,
  validateActionItem,
  validateLessonCompletion,
  sanitizeInput
};
