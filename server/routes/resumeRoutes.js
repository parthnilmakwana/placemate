const express = require('express');
const router = express.Router();
const { 
  downloadResume, 
  enhanceResume,
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getResumes)
  .post(createResume);

// Route mapping GET /api/resume/download to the download controller
router.get('/download', downloadResume);

// Route for AI Resume Enhancement
router.post('/enhance', enhanceResume);

// Route for specific text snippet enhancement
const { enhanceText } = require('../controllers/resumeController');
router.post('/enhance-text', enhanceText);

router.route('/:id')
  .get(getResume)
  .put(updateResume)
  .delete(deleteResume);

module.exports = router;
