const express = require('express');
const router = express.Router();
const { 
  getProfiles, 
  getProfile, 
  createProfile, 
  updateProfile, 
  deleteProfile, 
  setDefaultProfile, 
  duplicateProfile 
} = require('../controllers/profilesController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getProfiles)
  .post(createProfile);

router.route('/:id')
  .get(getProfile)
  .put(updateProfile)
  .delete(deleteProfile);

router.patch('/:id/default', setDefaultProfile);
router.post('/:id/duplicate', duplicateProfile);

module.exports = router;
