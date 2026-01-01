/**
 * Scripture API Routes
 * Search, browse, and manage scripture database
 */

import express from 'express';
import {
  searchScriptures,
  getScriptureByLeg,
  getRandomScripture,
  getScriptureByReference,
  getCategories,
  getScriptureStats
} from '../services/scriptureService.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ========================================
// SCRIPTURE ROUTES
// ========================================

/**
 * @route   GET /api/scriptures/search
 * @desc    Search scriptures by keyword
 * @access  Public
 */
router.get('/search', optionalAuth, (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const results = searchScriptures(q);
    const limitedResults = results.slice(0, parseInt(limit));

    res.json({
      query: q,
      total: results.length,
      results: limitedResults
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/scriptures/leg/:legName
 * @desc    Get scriptures by leg category
 * @access  Public
 */
router.get('/leg/:legName', optionalAuth, (req, res) => {
  try {
    const { legName } = req.params;
    const { limit } = req.query;

    const scriptures = getScriptureByLeg(legName, limit ? parseInt(limit) : null);

    res.json({
      leg: legName,
      total: scriptures.length,
      scriptures
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/scriptures/random
 * @desc    Get random scripture (optionally filtered by leg)
 * @access  Public
 */
router.get('/random', optionalAuth, (req, res) => {
  try {
    const { leg } = req.query;

    const scripture = getRandomScripture(leg || null);

    res.json(scripture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/scriptures/reference/:reference
 * @desc    Get scripture by reference
 * @access  Public
 */
router.get('/reference/:reference', optionalAuth, (req, res) => {
  try {
    const { reference } = req.params;

    const scripture = getScriptureByReference(reference);

    if (!scripture) {
      return res.status(404).json({ message: 'Scripture not found' });
    }

    res.json(scripture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/scriptures/categories
 * @desc    Get all scripture categories
 * @access  Public
 */
router.get('/categories', optionalAuth, (req, res) => {
  try {
    const categories = getCategories();

    res.json({
      categories,
      total: categories.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/scriptures/stats
 * @desc    Get scripture database statistics
 * @access  Public
 */
router.get('/stats', optionalAuth, (req, res) => {
  try {
    const stats = getScriptureStats();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/scriptures/daily
 * @desc    Get daily scripture based on current date
 * @access  Public
 */
router.get('/daily', optionalAuth, (req, res) => {
  try {
    // Use date as seed for consistent daily scripture
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

    // Get all scriptures
    const categories = getCategories();
    const allScriptures = [];

    categories.forEach(category => {
      allScriptures.push(...getScriptureByLeg(category, null));
    });

    // Select based on day of year
    const scripture = allScriptures[dayOfYear % allScriptures.length];

    res.json({
      date: today.toISOString().split('T')[0],
      scripture
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
