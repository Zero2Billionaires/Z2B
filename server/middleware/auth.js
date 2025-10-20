/**
 * JWT Authentication Middleware
 * Protects routes and validates JWT tokens
 */

import jwt from 'jsonwebtoken';
import { APIError } from './errorHandler.js';
import CoachUser from '../models/CoachUser.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token in cookies (if using cookie-based auth)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new APIError('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token and attach to request
    req.user = await CoachUser.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new APIError('User not found', 404));
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new APIError('Not authorized, token invalid', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new APIError('Not authorized, token expired', 401));
    }
    return next(new APIError('Not authorized to access this route', 401));
  }
};

/**
 * Optional authentication - Attach user if token exists, but don't require it
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await CoachUser.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid, but that's okay for optional auth
      req.user = null;
    }
  }

  next();
};

/**
 * Authorize specific roles
 * Usage: authorize('admin', 'moderator')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new APIError('Not authorized to access this route', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new APIError(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Check if user owns the resource
 * Compares userId in request params with authenticated user
 */
export const checkOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;

  if (!req.user) {
    return next(new APIError('Not authorized to access this route', 401));
  }

  // Allow if user is accessing their own resource or is admin
  if (req.user._id.toString() !== resourceUserId && req.user.role !== 'admin') {
    return next(
      new APIError('Not authorized to access this resource', 403)
    );
  }

  next();
};

/**
 * Rate limit by user (requires authentication)
 */
export const userRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requestCounts = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const userRequests = requestCounts.get(userId) || { count: 0, resetTime: now + windowMs };

    // Reset if window expired
    if (now > userRequests.resetTime) {
      userRequests.count = 0;
      userRequests.resetTime = now + windowMs;
    }

    // Increment count
    userRequests.count++;
    requestCounts.set(userId, userRequests);

    // Check if exceeded
    if (userRequests.count > maxRequests) {
      return next(
        new APIError(
          `Rate limit exceeded. Try again in ${Math.ceil((userRequests.resetTime - now) / 1000)} seconds`,
          429
        )
      );
    }

    next();
  };
};

/**
 * Generate JWT token
 */
export const generateToken = (userId, expiresIn = '30d') => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

/**
 * Send token response (with cookie)
 */
export const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        currentStage: user.currentStage,
        currentFocusLeg: user.currentFocusLeg
      }
    });
};

export default {
  protect,
  optionalAuth,
  authorize,
  checkOwnership,
  userRateLimit,
  generateToken,
  verifyToken,
  sendTokenResponse
};
