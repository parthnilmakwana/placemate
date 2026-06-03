const express = require('express');
const router = express.Router();
const { downloadResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

// Route mapping GET /api/resume/download to the download controller
router.get('/download', protect, downloadResume);

module.exports = router;
