const express = require('express');
const router = express.Router();
const { getJobsHistory, updateJobStatus, getRecommendations, searchJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Mount routes under authentication checks
// NOTE: Static routes (recommendations, search) must come BEFORE parameterized routes (/:id)
// Otherwise Express would interpret "recommendations" as an :id value
router.get('/recommendations', protect, getRecommendations);
router.get('/search', protect, searchJobs);
router.get('/history', protect, getJobsHistory);
router.patch('/:id/status', protect, updateJobStatus);

module.exports = router;

