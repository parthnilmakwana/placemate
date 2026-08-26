const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const Portfolio = require('../models/Portfolio');

// GET /api/profiles
exports.getProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: profiles });
  } catch (err) {
    next(err);
  }
};

// GET /api/profiles/:id
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ _id: req.params.id, userId: req.user._id });
    if (!profile) return res.status(404).json({ status: 'error', message: 'Profile not found' });
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
};

// POST /api/profiles
exports.createProfile = async (req, res, next) => {
  try {
    const { fullName, firstName, lastName, bio, title, theme, skills, education, experience, projects, linkedinUrl, githubUrl, website, email, phone, location } = req.body;
    
    if (!fullName) {
      return res.status(400).json({ status: 'error', message: 'Full Name is required' });
    }

    const newProfile = await Profile.create({
      userId: req.user._id,
      profileType: 'CUSTOM',
      isOwner: false,
      isDefault: false,
      fullName, firstName, lastName, bio, title, theme, skills, education, experience, projects, linkedinUrl, githubUrl, website, email, phone, location
    });

    res.status(201).json({ status: 'success', data: newProfile });
  } catch (err) {
    next(err);
  }
};

// PUT /api/profiles/:id
exports.updateProfile = async (req, res, next) => {
  try {
    const profileId = req.params.id;
    const profile = await Profile.findOne({ _id: profileId, userId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'Profile not found' });
    }

    const { fullName, firstName, lastName, bio, title, theme, skills, education, experience, projects, linkedinUrl, githubUrl, website, email, phone, location } = req.body;

    // Only allow updating editable fields
    if (fullName) profile.fullName = fullName;
    if (firstName !== undefined) profile.firstName = firstName;
    if (lastName !== undefined) profile.lastName = lastName;
    if (bio !== undefined) profile.bio = bio;
    if (title !== undefined) profile.title = title;
    if (theme !== undefined) profile.theme = theme;
    if (skills !== undefined) profile.skills = skills;
    if (education !== undefined) profile.education = education;
    if (experience !== undefined) profile.experience = experience;
    if (projects !== undefined) profile.projects = projects;
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) profile.githubUrl = githubUrl;
    if (website !== undefined) profile.website = website;
    if (email !== undefined) profile.email = email;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;

    await profile.save();

    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/profiles/:id
exports.deleteProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ _id: req.params.id, userId: req.user._id });
    if (!profile) return res.status(404).json({ status: 'error', message: 'Profile not found' });
    
    if (profile.profileType === 'OWNER') {
      return res.status(400).json({ status: 'error', message: 'Cannot delete the Owner Profile' });
    }

    // Check usage
    const resumeCount = await Resume.countDocuments({ profileId: profile._id });
    const portfolioCount = await Portfolio.countDocuments({ profileId: profile._id });

    if (resumeCount > 0 || portfolioCount > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `This profile is currently being used by ${resumeCount} resumes and ${portfolioCount} portfolios. You must reassign or delete these documents before deleting this profile.` 
      });
    }

    await Profile.deleteOne({ _id: profile._id });
    res.status(200).json({ status: 'success', message: 'Profile deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/profiles/:id/default
exports.setDefaultProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ _id: req.params.id, userId: req.user._id });
    if (!profile) return res.status(404).json({ status: 'error', message: 'Profile not found' });
    
    // Unset all other defaults
    await Profile.updateMany({ userId: req.user._id }, { $set: { isDefault: false } });
    
    // Set this as default
    profile.isDefault = true;
    await profile.save();

    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
};

// POST /api/profiles/:id/duplicate
exports.duplicateProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!profile) return res.status(404).json({ status: 'error', message: 'Profile not found' });
    
    // Remove id and reset specific fields
    delete profile._id;
    delete profile.createdAt;
    delete profile.updatedAt;
    
    profile.profileType = 'CUSTOM';
    profile.isOwner = false;
    profile.isDefault = false;
    profile.fullName = `${profile.fullName} (Copy)`;

    const newProfile = await Profile.create(profile);
    res.status(201).json({ status: 'success', data: newProfile });
  } catch (err) {
    next(err);
  }
};
