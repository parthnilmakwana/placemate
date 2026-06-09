const express = require('express');
const router = express.Router();
const { getPublicPortfolio, updateSettings } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

// Secure route to update username slug, theme preferences, and visibility
router.put('/settings', protect, updateSettings);

// AI Portfolio Generator Routes
router.get('/usage', protect, require('../controllers/portfolioController').getAIUsage);
router.post('/generate', protect, require('../controllers/portfolioController').generateAIPortfolio);
router.post('/draft/:id/apply', protect, require('../controllers/portfolioController').applyPortfolioDraft);
router.delete('/draft/:id', protect, require('../controllers/portfolioController').discardPortfolioDraft);

// Public route to view a user's portfolio by username slug
router.get('/:username', getPublicPortfolio);

module.exports = router;
