const express = require('express');
const multer = require('multer');
const { extractText } = require('../controllers/uploadController');

const router = express.Router();

// Configure multer for memory storage
// Limit file size to 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

router.post('/extract-text', upload.single('file'), extractText);

module.exports = router;
