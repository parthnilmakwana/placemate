const express = require('express');
const router = express.Router();
const { downloadResume, enhanceResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

// Route mapping GET /api/resume/download to the download controller
router.get('/download', protect, downloadResume);

// Route for AI Resume Enhancement
router.post('/enhance', protect, enhanceResume);

module.exports = router;
