const express = require('express');
const { analyzePublic, analyzeAuthenticated } = require('../controllers/atsController');
const { protect } = require('../middleware/authMiddleware');
// Note: You can add an express rate limiter middleware for analyze-public here if available.

const router = express.Router();

router.post('/analyze-public', analyzePublic);
router.post('/analyze', protect, analyzeAuthenticated);

module.exports = router;
