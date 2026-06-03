const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// Secure route mapping profile updates to the controller
router.put('/', protect, updateProfile);

module.exports = router;
