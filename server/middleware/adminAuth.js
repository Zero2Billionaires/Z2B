/**
 * Admin Authorization Middleware
 * Checks if user has required admin permissions
 */

import CoachUser from '../models/CoachUser.js';

/**
 * Verify user is authenticated and has admin role
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated (protect middleware should set req.user)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has admin role
    if (!req.user.adminRole || req.user.adminRole === 'none') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Attach admin info to request for easier access
    req.userId = req.user._id;
    req.adminRole = req.user.adminRole;
    req.adminPermissions = req.user.adminPermissions || {};

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};

/**
 * Require specific permission
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Must have admin role first
      if (!req.adminPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      // Check if user has the required permission
      if (!req.adminPermissions[permission]) {
        return res.status(403).json({
          success: false,
          message: `Permission denied: ${permission} required`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Require CEO role specifically
 */
export const requireCEO = async (req, res, next) => {
  try {
    if (!req.adminRole || req.adminRole !== 'ceo') {
      return res.status(403).json({
        success: false,
        message: 'CEO access required'
      });
    }

    next();
  } catch (error) {
    console.error('CEO check error:', error);
    res.status(500).json({
      success: false,
      message: 'CEO authorization check failed'
    });
  }
};

/**
 * Require minimum admin level
 */
export const requireMinRole = (minRole) => {
  const roleHierarchy = {
    'none': 0,
    'call_center': 1,
    'support': 2,
    'sales': 3,
    'finance': 4,
    'senior': 5,
    'ceo': 6
  };

  return async (req, res, next) => {
    try {
      const userLevel = roleHierarchy[req.adminRole] || 0;
      const requiredLevel = roleHierarchy[minRole] || 0;

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          message: `Minimum role required: ${minRole}`
        });
      }

      next();
    } catch (error) {
      console.error('Role level check error:', error);
      res.status(500).json({
        success: false,
        message: 'Role authorization check failed'
      });
    }
  };
};
