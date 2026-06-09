const express = require('express');
const router = express.Router();
const { mockUpgrade, mockDowngrade } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Mount billing endpoints under protection
router.post('/mock-upgrade', protect, mockUpgrade);
router.post('/mock-downgrade', protect, mockDowngrade);

module.exports = router;
