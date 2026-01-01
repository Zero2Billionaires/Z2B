/**
 * Centralized Error Handling Middleware
 */

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
export function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    error = new APIError(message, 404);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error = new APIError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    error = new APIError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new APIError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = new APIError(message, 401);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

/**
 * Not Found middleware
 */
export function notFound(req, res, next) {
  const error = new APIError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default {
  APIError,
  errorHandler,
  notFound,
  asyncHandler
};
