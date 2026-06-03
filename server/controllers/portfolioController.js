const User = require('../models/User');

/**
 * @desc    Get public portfolio data by username
 * @route   GET /api/portfolio/:username
 * @access  Public
 */
exports.getPublicPortfolio = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Find the user document by username
    const user = await User.findOne({ username: username.toLowerCase() });
    
    // If user not found, or user portfolio is set to private
    if (!user || user.profile?.isPublic === false) {
      return res.status(404).json({
        status: 'error',
        message: 'Portfolio not found or has been set to private by the owner'
      });
    }

    // Sanitize and return ONLY safe public data (do not leak password, email, role, etc.)
    res.status(200).json({
      status: 'success',
      data: {
        name: user.name,
        username: user.username,
        title: user.profile.title,
        bio: user.profile.bio,
        githubUrl: user.profile.githubUrl,
        linkedinUrl: user.profile.linkedinUrl,
        skills: user.profile.skills,
        education: user.profile.education,
        experience: user.profile.experience,
        projects: user.profile.projects,
        theme: user.profile.theme || 'minimal'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update portfolio settings (username slug, theme layout, and visibility toggles)
 * @route   PUT /api/portfolio/settings
 * @access  Private
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const { username, theme, isPublic } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User session not found'
      });
    }

    // 1. Handle Username update & validation checks
    if (username !== undefined) {
      const cleanUsername = username.trim().toLowerCase();

      // Check validation constraints
      const usernameRegex = /^[a-z0-9-]{3,30}$/;
      if (!usernameRegex.test(cleanUsername)) {
        return res.status(400).json({
          status: 'error',
          message: 'Username must be between 3 and 30 characters and contain only lowercase letters, numbers, and hyphens'
        });
      }

      // Check if username is already claimed by another user
      const taken = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
      if (taken) {
        return res.status(400).json({
          status: 'error',
          message: 'This username is already claimed. Please try another one.'
        });
      }

      user.username = cleanUsername;
    }

    // 2. Handle Theme update
    if (theme !== undefined) {
      const validThemes = ['minimal', 'dark', 'bold'];
      if (!validThemes.includes(theme)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid theme choice'
        });
      }
      user.profile.theme = theme;
    }

    // 3. Handle Visibility Toggle
    if (isPublic !== undefined) {
      user.profile.isPublic = !!isPublic;
    }

    // Save updates
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Portfolio settings updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
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
