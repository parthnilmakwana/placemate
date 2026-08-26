const express = require('express');
const router = express.Router();
const { 
  getPublicPortfolio, 
  updateSettings, 
  getAIUsage, 
  generateAIPortfolio, 
  applyPortfolioDraft,
  discardPortfolioDraft,
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

// Specific paths must go before parameter paths (/:id or /:username)

// AI Portfolio routes (Protected)
router.get('/usage', protect, getAIUsage);
router.post('/generate', protect, generateAIPortfolio);
router.post('/draft/:id/apply', protect, applyPortfolioDraft);
router.delete('/draft/:id', protect, discardPortfolioDraft);

// Settings (Protected)
router.put('/settings', protect, updateSettings);

// CRUD routes for Portfolios (Protected)
router.get('/', protect, getPortfolios);
router.post('/', protect, createPortfolio);

// We need a specific prefix for single portfolio CRUD to not conflict with /:username
// Wait, the client doesn't use the CRUD yet, so we can use a sub-path or just use /item/:id
// Let's use /item/:id
router.get('/item/:id', protect, getPortfolio);
router.put('/item/:id', protect, updatePortfolio);
router.delete('/item/:id', protect, deletePortfolio);

// Public route to view a user's portfolio by username slug (Catch-all)
router.get('/:username', getPublicPortfolio);

module.exports = router;
