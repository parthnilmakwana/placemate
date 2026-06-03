const User = require('../models/User');

/**
 * @desc    Update user profile & onboarding status
 * @route   PUT /api/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { profile, hasCompletedOnboarding } = req.body;

    if (!profile) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide profile details to update'
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
    user.profile = {
      ...user.profile.toObject(),
      ...profile
    };

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
        role: user.role,
        plan: user.plan,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};
