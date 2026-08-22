const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSettings,
  updateAccount,
  updateJobPreferences,
  updateNotifications,
  updatePrivacy,
  updateAppearance,
  changePassword,
  getSessions,
  revokeSession,
  logoutAllOtherSessions,
  exportUserData,
  deactivateAccount,
  deleteAccount
} = require('../controllers/settingsController');

// All settings routes are protected
router.use(protect);

router.get('/', getSettings);
router.patch('/account', updateAccount);
router.patch('/job-preferences', updateJobPreferences);
router.patch('/notifications', updateNotifications);
router.patch('/privacy', updatePrivacy);
router.patch('/appearance', updateAppearance);
router.patch('/password', changePassword);

router.get('/sessions', getSessions);
router.delete('/sessions/:sessionId', revokeSession);
router.post('/sessions/logout-all', logoutAllOtherSessions);

router.get('/export', exportUserData);
router.post('/deactivate', deactivateAccount);
router.delete('/account', deleteAccount);

module.exports = router;
