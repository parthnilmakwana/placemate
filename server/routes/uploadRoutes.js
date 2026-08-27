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

const fs = require('fs');
const path = require('path');
router.post('/extract-text', upload.single('file'), async (req, res, next) => {
  try {
    fs.appendFileSync(path.join(__dirname, '../upload.log'), `[${new Date().toISOString()}] REQ: file=${!!req.file}, mimetype=${req.file?.mimetype}\n`);
    await extractText(req, res);
    fs.appendFileSync(path.join(__dirname, '../upload.log'), `[${new Date().toISOString()}] RES: status=${res.statusCode}\n`);
  } catch(e) {
    fs.appendFileSync(path.join(__dirname, '../upload.log'), `[${new Date().toISOString()}] ERR: ${e.message}\n`);
    next(e);
  }
});

const { parseToProfile } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware'); // Need protect for this one

router.post('/parse-to-profile', protect, upload.single('file'), async (req, res, next) => {
  try {
    fs.appendFileSync(path.join(__dirname, '../upload.log'), `[${new Date().toISOString()}] REQ (parse): file=${!!req.file}\n`);
    await parseToProfile(req, res);
  } catch(e) {
    next(e);
  }
});

module.exports = router;
