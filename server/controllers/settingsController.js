const User = require('../models/User');
const SentJob = require('../models/SentJob');
const DailyRecommendation = require('../models/DailyRecommendation');
const Feedback = require('../models/Feedback');
const PortfolioDraft = require('../models/PortfolioDraft');
const AIPortfolioUsage = require('../models/AIPortfolioUsage');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all user settings, preferences, and session info
 * @route   GET /api/settings
 * @access  Private
 */
exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Default settings if undefined on existing legacy users
    const settings = user.settings || {
      notifications: { jobRecommendations: true, applicationUpdates: true, interviewReminders: true, productUpdates: false },
      privacy: { recruiterVisibility: true, searchEngineVisibility: true, contactVisibility: false },
      appearance: { theme: 'system', language: 'en' }
    };

    const preferences = user.profile?.preferences || {};

    const firstName = user.settings?.firstName || '';
    const lastName = user.settings?.lastName || '';

    res.status(200).json({
      status: 'success',
      data: {
        account: {
          firstName,
          lastName,
          name: user.name,
          email: user.email,
          username: user.username,
          googleId: user.googleId,
          isGoogleAccount: Boolean(user.googleId)
        },
        jobPreferences: {
          preferredRoles: (preferences.targetRoles || []).join(', '),
          preferredLocations: (preferences.targetLocations || []).join(', '),
          workMode: preferences.remotePreference || 'any',
          employmentType: preferences.jobType || 'Any',
          experienceLevel: preferences.experienceLevel || 'any',
          minSalary: preferences.minimumSalary || 0,
          maxSalary: preferences.maximumSalary || 0,
          jobSearchStatus: preferences.jobSearchStatus || 'Actively looking'
        },
        notifications: settings.notifications,
        privacy: settings.privacy,
        appearance: settings.appearance
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update basic account information (First Name, Last Name, Email)
 * @route   PATCH /api/settings/account
 * @access  Private
 */
exports.updateAccount = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (firstName !== undefined || lastName !== undefined) {
      // Ignore firstName and lastName updates if the user is a Google account
      // The Settings name is Google-controlled and locked for Google users.
      if (!user.googleId) {
        if (!user.settings) user.settings = {};
        if (firstName !== undefined) user.settings.firstName = firstName.trim();
        if (lastName !== undefined) user.settings.lastName = lastName.trim();
        user.markModified('settings');
      }
    }

    if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ status: 'error', message: 'Please enter a valid email address.' });
      }

      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ status: 'error', message: 'This email address is already in use by another account.' });
      }

      user.email = cleanEmail;
    }

    await user.save();

    const nameParts = user.name.split(' ');
    res.status(200).json({
      status: 'success',
      message: 'Account details updated successfully.',
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
      },
      data: {
        firstName: user.settings?.firstName || '',
        lastName: user.settings?.lastName || '',
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update job preferences
 * @route   PATCH /api/settings/job-preferences
 * @access  Private
 */
exports.updateJobPreferences = async (req, res, next) => {
  try {
    const {
      preferredRoles,
      preferredLocations,
      workMode,
      employmentType,
      experienceLevel,
      minSalary,
      maxSalary,
      jobSearchStatus
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (!user.profile) user.profile = {};
    if (!user.profile.preferences) user.profile.preferences = {};

    // Validate salary inputs
    const parsedMin = minSalary !== undefined && minSalary !== '' ? Number(minSalary) : user.profile.preferences.minimumSalary || 0;
    const parsedMax = maxSalary !== undefined && maxSalary !== '' ? Number(maxSalary) : user.profile.preferences.maximumSalary || 0;

    if (isNaN(parsedMin) || parsedMin < 0) {
      return res.status(400).json({ status: 'error', message: 'Minimum salary must be a positive number.' });
    }
    if (isNaN(parsedMax) || parsedMax < 0) {
      return res.status(400).json({ status: 'error', message: 'Maximum salary must be a positive number.' });
    }
    if (parsedMax > 0 && parsedMin > parsedMax) {
      return res.status(400).json({ status: 'error', message: 'Minimum salary cannot be greater than maximum salary.' });
    }

    // Parse array values from comma-separated string or array
    let rolesArray = [];
    if (Array.isArray(preferredRoles)) rolesArray = preferredRoles;
    else if (typeof preferredRoles === 'string') {
      rolesArray = preferredRoles.split(',').map(r => r.trim()).filter(Boolean);
    } else {
      rolesArray = user.profile.preferences.targetRoles || [];
    }

    let locationsArray = [];
    if (Array.isArray(preferredLocations)) locationsArray = preferredLocations;
    else if (typeof preferredLocations === 'string') {
      locationsArray = preferredLocations.split(',').map(l => l.trim()).filter(Boolean);
    } else {
      locationsArray = user.profile.preferences.targetLocations || [];
    }

    user.profile.preferences.targetRoles = rolesArray;
    user.profile.preferences.targetLocations = locationsArray;
    
    // Map workMode to remotePreference
    if (workMode) {
      const modeLower = workMode.toLowerCase();
      if (['remote', 'onsite', 'on-site', 'hybrid', 'any'].includes(modeLower)) {
        user.profile.preferences.remotePreference = modeLower === 'on-site' ? 'onsite' : modeLower;
      }
    }

    if (employmentType) {
      const validTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Any'];
      const matchedType = validTypes.find(t => t.toLowerCase() === employmentType.toLowerCase());
      user.profile.preferences.jobType = matchedType || employmentType;
    }

    if (experienceLevel) {
      const expLower = experienceLevel.toLowerCase();
      const validExp = ['entry-level', 'fresher', 'junior', 'mid', 'mid-level', 'senior', 'executive', 'any'];
      if (expLower === 'entry-level') user.profile.preferences.experienceLevel = 'fresher';
      else if (expLower === 'mid-level') user.profile.preferences.experienceLevel = 'mid';
      else if (validExp.includes(expLower)) user.profile.preferences.experienceLevel = expLower;
    }

    user.profile.preferences.minimumSalary = parsedMin;
    user.profile.preferences.maximumSalary = parsedMax;

    if (jobSearchStatus) {
      user.profile.preferences.jobSearchStatus = jobSearchStatus;
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Job preferences saved successfully.',
      data: {
        preferredRoles: user.profile.preferences.targetRoles.join(', '),
        preferredLocations: user.profile.preferences.targetLocations.join(', '),
        workMode: user.profile.preferences.remotePreference,
        employmentType: user.profile.preferences.jobType,
        experienceLevel: user.profile.preferences.experienceLevel,
        minSalary: user.profile.preferences.minimumSalary,
        maxSalary: user.profile.preferences.maximumSalary,
        jobSearchStatus: user.profile.preferences.jobSearchStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update notification settings
 * @route   PATCH /api/settings/notifications
 * @access  Private
 */
exports.updateNotifications = async (req, res, next) => {
  try {
    const { jobRecommendations, applicationUpdates, interviewReminders, productUpdates } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (!user.settings) user.settings = {};
    if (!user.settings.notifications) {
      user.settings.notifications = {
        jobRecommendations: true,
        applicationUpdates: true,
        interviewReminders: true,
        productUpdates: false
      };
    }

    if (typeof jobRecommendations === 'boolean') user.settings.notifications.jobRecommendations = jobRecommendations;
    if (typeof applicationUpdates === 'boolean') user.settings.notifications.applicationUpdates = applicationUpdates;
    if (typeof interviewReminders === 'boolean') user.settings.notifications.interviewReminders = interviewReminders;
    if (typeof productUpdates === 'boolean') user.settings.notifications.productUpdates = productUpdates;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Notification preferences updated successfully.',
      data: user.settings.notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update privacy settings
 * @route   PATCH /api/settings/privacy
 * @access  Private
 */
exports.updatePrivacy = async (req, res, next) => {
  try {
    const { recruiterVisibility, searchEngineVisibility, contactVisibility } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (!user.settings) user.settings = {};
    if (!user.settings.privacy) {
      user.settings.privacy = { recruiterVisibility: true, searchEngineVisibility: true, contactVisibility: false };
    }

    if (typeof recruiterVisibility === 'boolean') user.settings.privacy.recruiterVisibility = recruiterVisibility;
    if (typeof searchEngineVisibility === 'boolean') user.settings.privacy.searchEngineVisibility = searchEngineVisibility;
    if (typeof contactVisibility === 'boolean') user.settings.privacy.contactVisibility = contactVisibility;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Privacy settings updated successfully.',
      data: user.settings.privacy
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appearance preferences (theme, language)
 * @route   PATCH /api/settings/appearance
 * @access  Private
 */
exports.updateAppearance = async (req, res, next) => {
  try {
    const { theme, language } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (!user.settings) user.settings = {};
    if (!user.settings.appearance) {
      user.settings.appearance = { theme: 'system', language: 'en' };
    }

    if (theme && ['light', 'dark', 'system'].includes(theme)) {
      user.settings.appearance.theme = theme;
    }

    if (language) {
      user.settings.appearance.language = language;
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Appearance preferences updated.',
      data: user.settings.appearance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password securely
 * @route   PATCH /api/settings/password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ status: 'error', message: 'Please provide new password and confirmation.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: 'error', message: 'New password and confirmation do not match.' });
    }

    // Password strength check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Check current password if not a pure Google OAuth user
    if (!user.googleId || currentPassword) {
      if (!currentPassword) {
        return res.status(400).json({ status: 'error', message: 'Please provide your current password.' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ status: 'error', message: 'Current password is incorrect.' });
      }
    }

    user.password = newPassword; // Triggers pre-save bcrypt hook
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active user sessions
 * @route   GET /api/settings/sessions
 * @access  Private
 */
exports.getSessions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const currentSessionId = req.currentSessionId;

    const formattedSessions = (user.sessions || []).map(session => ({
      id: session.sessionId,
      device: session.device || `${session.os} • ${session.browser}`,
      os: session.os,
      browser: session.browser,
      ipAddress: session.ipAddress,
      lastActive: session.lastActive,
      isCurrent: session.sessionId === currentSessionId
    }));

    res.status(200).json({
      status: 'success',
      data: formattedSessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke a specific session
 * @route   DELETE /api/settings/sessions/:sessionId
 * @access  Private
 */
exports.revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.sessions = (user.sessions || []).filter(s => s.sessionId !== sessionId);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Session revoked successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke all sessions except current one
 * @route   POST /api/settings/sessions/logout-all
 * @access  Private
 */
exports.logoutAllOtherSessions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const currentSessionId = req.currentSessionId;
    user.sessions = (user.sessions || []).filter(s => s.sessionId === currentSessionId);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Logged out of all other active sessions.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export user data in JSON format
 * @route   GET /api/settings/export
 * @access  Private
 */
exports.exportUserData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const sentJobs = await SentJob.find({ userId }).lean();
    const recommendations = await DailyRecommendation.find({ userId }).lean();
    const feedback = await Feedback.find({ userId }).lean();
    const portfolioDrafts = await PortfolioDraft.find({ userId }).lean();

    // Sanitize user output: remove password, tokens, internal fields
    delete user.password;
    delete user.sessions;
    delete user.loginAttempts;
    delete user.lockUntil;

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      account: {
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        plan: user.plan,
        createdAt: user.createdAt
      },
      profile: user.profile || {},
      settings: user.settings || {},
      applicationHistory: sentJobs.map(j => ({
        title: j.title,
        company: j.company,
        status: j.status,
        applyUrl: j.applyUrl,
        createdAt: j.createdAt
      })),
      dailyRecommendationsCount: recommendations.length,
      feedback: feedback.map(f => ({ content: f.content, rating: f.rating, createdAt: f.createdAt })),
      portfolioDraftsCount: portfolioDrafts.length
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=placemate-export-${user.username || 'data'}.json`);
    res.status(200).send(JSON.stringify(exportPayload, null, 2));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate user account
 * @route   POST /api/settings/deactivate
 * @access  Private
 */
exports.deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.isDeactivated = true;
    user.sessions = []; // Clear sessions so they must log in to reactivate
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Your account has been deactivated. Logging back in will reactivate it.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Permanently delete user account and associated data
 * @route   DELETE /api/settings/account
 * @access  Private
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Password confirmation for non-Google users
    if (!user.googleId) {
      if (!password) {
        return res.status(400).json({ status: 'error', message: 'Password is required to confirm account deletion.' });
      }
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ status: 'error', message: 'Incorrect password.' });
      }
    }

    // Cascade delete associated user data
    await SentJob.deleteMany({ userId });
    await DailyRecommendation.deleteMany({ userId });
    await Feedback.deleteMany({ userId });
    await PortfolioDraft.deleteMany({ userId });
    await AIPortfolioUsage.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      status: 'success',
      message: 'Account and associated data deleted permanently.'
    });
  } catch (error) {
    next(error);
  }
};
