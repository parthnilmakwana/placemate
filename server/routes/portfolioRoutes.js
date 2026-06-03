const express = require('express');
const router = express.Router();
const { getPublicPortfolio, updateSettings } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

// Public route to view a user's portfolio by username slug
router.get('/:username', getPublicPortfolio);

// Secure route to update username slug, theme preferences, and visibility
router.put('/settings', protect, updateSettings);

module.exports = router;
