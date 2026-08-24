const User = require('../models/User');

/**
 * @desc    Update user profile & onboarding status
 * @route   PUT /api/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { profile, hasCompletedOnboarding, name } = req.body;

    if (!profile && name === undefined && hasCompletedOnboarding === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide details to update'
      });
    }

    // Fetch user by ID to perform updates directly on mongoose document
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User session not found'
      });
    }

    // Merge/Assign new profile details (bio, title, socials, edu, work, projects, preferences)
    if (profile) {
      // Map frontend's 'name' field to 'fullName' for backward compatibility
      // (ProfileTab sends profile.name but the schema field is profile.fullName)
      if (profile.name !== undefined && profile.fullName === undefined) {
        profile.fullName = profile.name;
      }

      const allowedFields = ['fullName', 'bio', 'title', 'githubUrl', 'linkedinUrl', 'skills', 'education', 'experience', 'projects', 'preferences'];
      const sanitizedProfile = {};
      for (const key of allowedFields) {
        if (profile[key] !== undefined) {
          sanitizedProfile[key] = profile[key];
        }
      }

      if (!user.profile) user.profile = {};
      Object.assign(user.profile, sanitizedProfile);

      // Mongoose requires markModified for nested objects replaced via spread
      user.markModified('profile');
    }

    // Also accept top-level 'name' field as a fallback for profile.fullName
    if (name && typeof name === 'string' && name.trim().length > 0) {
      if (!user.profile) user.profile = {};
      user.profile.fullName = name.trim();
      user.markModified('profile');
    }

    // Update onboarding completion flag if explicitly submitted
    if (typeof hasCompletedOnboarding === 'boolean') {
      user.hasCompletedOnboarding = hasCompletedOnboarding;
    }

    // Save changes to database (triggers database validation checks)
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        plan: user.plan,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        profile: user.profile,
        settings: user.settings,
        googleId: user.googleId,
        isDeactivated: user.isDeactivated
      }
    });
  } catch (error) {
    next(error);
  }
};
