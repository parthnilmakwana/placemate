const User = require('../models/User');
const Profile = require('../models/Profile');
const Portfolio = require('../models/Portfolio');
const AIPortfolioUsage = require('../models/AIPortfolioUsage');
const PortfolioDraft = require('../models/PortfolioDraft');
const { generateContent } = require('../utils/aiClient');

/**
 * @desc    Get public portfolio data by username
 * @route   GET /api/portfolio/:username
 * @access  Public
 */
exports.getPublicPortfolio = async (req, res, next) => {
  try {
    const { username } = req.params;

    // 1. Try to find the new Portfolio document by slug
    let portfolio = await Portfolio.findOne({ slug: username.toLowerCase() }).populate('profileId');
    
    if (portfolio) {
      if (!portfolio.isPublic) {
        return res.status(404).json({ status: 'error', message: 'Portfolio not found or has been set to private by the owner' });
      }
      const profile = portfolio.profileId;
      return res.status(200).json({
        status: 'success',
        data: {
          name: profile?.fullName || '',
          username: portfolio.slug,
          title: profile?.title || '',
          bio: profile?.bio || '',
          githubUrl: profile?.githubUrl || '',
          linkedinUrl: profile?.linkedinUrl || '',
          skills: profile?.skills || [],
          education: profile?.education || [],
          experience: profile?.experience || [],
          projects: profile?.projects || [],
          theme: portfolio.theme || 'minimal'
        }
      });
    }

    // 2. Fallback for un-migrated users (find user document by username)
    const user = await User.findOne({ username: username.toLowerCase() }).lean();
    
    if (!user || user.profile?.isPublic === false) {
      return res.status(404).json({ status: 'error', message: 'Portfolio not found or has been set to private by the owner' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        name: user.profile?.fullName || '',
        username: user.username,
        title: user.profile?.title || '',
        bio: user.profile?.bio || '',
        githubUrl: user.profile?.githubUrl || '',
        linkedinUrl: user.profile?.linkedinUrl || '',
        skills: user.profile?.skills || [],
        education: user.profile?.education || [],
        experience: user.profile?.experience || [],
        projects: user.profile?.projects || [],
        theme: user.profile?.theme || 'minimal'
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

    // Initialize profile object if it does not exist (crash prevention for legacy accounts)
    if (!user.profile) {
      user.profile = {};
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
      const validThemes = ['minimal', 'dark', 'bold', 'developer', 'professional', 'creative', 'startup', 'corporate', 'futuristic', 'personal', 'student', 'pm', 'agency'];
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

    // Explicitly mark profile as modified to ensure Mongoose saves the nested object
    user.markModified('profile');

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

/**
 * @desc    Get AI portfolio generation usage for the current user
 * @route   GET /api/portfolio/usage
 * @access  Private
 */
exports.getAIUsage = async (req, res, next) => {
  try {
    let usage = await AIPortfolioUsage.findOne({ userId: req.user._id });
    
    // Create usage record if it doesn't exist
    if (!usage) {
      usage = new AIPortfolioUsage({ userId: req.user._id, generationCount: 0 });
      await usage.save();
    } else {
      // Check for daily reset
      const now = new Date();
      const lastReset = new Date(usage.lastResetDate);
      
      // If last reset was on a different day, reset count
      if (lastReset.getUTCFullYear() !== now.getUTCFullYear() || 
          lastReset.getUTCMonth() !== now.getUTCMonth() || 
          lastReset.getUTCDate() !== now.getUTCDate()) {
        usage.generationCount = 0;
        usage.lastResetDate = now;
        await usage.save();
      }
    }
    
    const maxGenerations = req.user.plan === 'pro' ? 10 : 2;
    const remaining = Math.max(0, maxGenerations - usage.generationCount);
    
    res.status(200).json({
      status: 'success',
      data: {
        generationCount: usage.generationCount,
        maxGenerations,
        remaining
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate a portfolio using AI
 * @route   POST /api/portfolio/generate
 * @access  Private
 */
exports.generateAIPortfolio = async (req, res, next) => {
  try {
    const { profession, style, color, goals } = req.body;
    
    // 1. Check Usage Limits
    let usage = await AIPortfolioUsage.findOne({ userId: req.user._id });
    if (!usage) {
      usage = new AIPortfolioUsage({ userId: req.user._id, generationCount: 0 });
    } else {
      const now = new Date();
      const lastReset = new Date(usage.lastResetDate);
      if (lastReset.getUTCFullYear() !== now.getUTCFullYear() || 
          lastReset.getUTCMonth() !== now.getUTCMonth() || 
          lastReset.getUTCDate() !== now.getUTCDate()) {
        usage.generationCount = 0;
        usage.lastResetDate = now;
      }
    }
    
    const maxGenerations = req.user.plan === 'pro' ? 10 : 2;
    if (usage.generationCount >= maxGenerations) {
      return res.status(429).json({
        status: 'error',
        message: 'Daily AI generation limit reached. Please try again tomorrow or upgrade your plan.'
      });
    }

    // 2. Generate Prompt
    const prompt = `
      You are an expert portfolio generator. Generate a complete, professional portfolio configuration.
      User Details:
      - Profession: ${profession || 'Developer'}
      - Style Preference: ${style || 'minimal'}
      - Color Preference: ${color || 'Not specified'}
      - Goals: ${goals || 'Stand out to recruiters'}
      
      Respond ONLY with a valid JSON object matching this schema:
      {
        "bio": "string",
        "title": "string",
        "theme": "${style || 'minimal'}",
        "skills": ["string"],
        "experience": [{ "company": "string", "position": "string", "startDate": "string", "endDate": "string", "current": boolean, "description": "string" }],
        "projects": [{ "title": "string", "description": "string", "technologies": ["string"], "githubLink": "string", "liveLink": "string" }],
        "education": [{ "institution": "string", "degree": "string", "fieldOfStudy": "string", "startYear": number, "endYear": number, "description": "string" }]
      }
    `;

    // 3. Call AI
    const response = await generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    // 4. Parse AI Response
    let portfolioData;
    try {
      const rawText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      portfolioData = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({
        status: 'error',
        message: 'AI generated invalid data. Please try again.'
      });
    }

    // 5. Save Draft
    const draft = new PortfolioDraft({
      userId: req.user._id,
      profileDraft: portfolioData
    });
    await draft.save();

    // 6. Update Usage
    usage.generationCount += 1;
    await usage.save();

    res.status(200).json({
      status: 'success',
      message: 'Portfolio generated successfully and saved as draft.',
      data: {
        draftId: draft._id,
        draft: draft.profileDraft,
        remaining: maxGenerations - usage.generationCount
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply a portfolio draft to the user's active profile
 * @route   POST /api/portfolio/draft/:id/apply
 * @access  Private
 */
exports.applyPortfolioDraft = async (req, res, next) => {
  try {
    const { profileId } = req.body; // Allow passing specific profile to apply to

    const draft = await PortfolioDraft.findOne({ _id: req.params.id, userId: req.user._id });
    if (!draft) {
      return res.status(404).json({ status: 'error', message: 'Draft not found.' });
    }
    
    if (draft.isApplied) {
      return res.status(400).json({ status: 'error', message: 'This draft has already been applied.' });
    }

    const newProfileData = draft.profileDraft;

    // Find target Profile
    let targetProfile;
    if (profileId) {
      targetProfile = await Profile.findOne({ _id: profileId, userId: req.user._id });
    } else {
      // Fallback to owner profile
      targetProfile = await Profile.findOne({ userId: req.user._id, profileType: 'OWNER' });
    }

    if (targetProfile) {
      targetProfile.bio = newProfileData.bio || targetProfile.bio;
      targetProfile.title = newProfileData.title || targetProfile.title;
      targetProfile.theme = newProfileData.theme || targetProfile.theme;
      targetProfile.skills = newProfileData.skills || targetProfile.skills;
      targetProfile.experience = newProfileData.experience || targetProfile.experience;
      targetProfile.projects = newProfileData.projects || targetProfile.projects;
      targetProfile.education = newProfileData.education || targetProfile.education;
      await targetProfile.save();
    }

    // Also update legacy user.profile for backward compatibility
    const user = await User.findById(req.user._id);
    if (!user.profile) user.profile = {};
    user.profile.bio = newProfileData.bio || user.profile.bio;
    user.profile.title = newProfileData.title || user.profile.title;
    user.profile.theme = newProfileData.theme || user.profile.theme;
    user.profile.skills = newProfileData.skills || user.profile.skills;
    user.profile.experience = newProfileData.experience || user.profile.experience;
    user.profile.projects = newProfileData.projects || user.profile.projects;
    user.profile.education = newProfileData.education || user.profile.education;
    user.markModified('profile');
    await user.save();

    draft.isApplied = true;
    await draft.save();

    res.status(200).json({
      status: 'success',
      message: 'Draft applied successfully.',
      data: targetProfile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Discard a portfolio draft
 * @route   DELETE /api/portfolio/draft/:id
 * @access  Private
 */
exports.discardPortfolioDraft = async (req, res, next) => {
  try {
    const draft = await PortfolioDraft.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!draft) {
      return res.status(404).json({
        status: 'error',
        message: 'Draft not found.'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Draft discarded successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// CRUD Operations for Portfolio Collection

exports.getPortfolios = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: portfolios });
  } catch (error) {
    next(error);
  }
};

exports.getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id }).populate('profileId');
    if (!portfolio) {
      return res.status(404).json({ status: 'error', message: 'Portfolio not found' });
    }
    res.status(200).json({ status: 'success', data: portfolio });
  } catch (error) {
    next(error);
  }
};

exports.createPortfolio = async (req, res, next) => {
  try {
    const { title, slug, profileId, theme, isPublic } = req.body;

    if (!profileId || !slug) {
      return res.status(400).json({ status: 'error', message: 'Profile ID and Slug are required' });
    }

    let cleanSlug = slug.trim().toLowerCase();
    const slugRegex = /^[a-z0-9-]{3,30}$/;
    if (!slugRegex.test(cleanSlug)) {
      return res.status(400).json({ status: 'error', message: 'Slug must be 3-30 characters, lowercase letters, numbers, hyphens only' });
    }

    const taken = await Portfolio.findOne({ slug: cleanSlug });
    if (taken) {
      // Auto-generate a unique slug
      let counter = 1;
      let newSlug = `${cleanSlug}-${counter}`;
      while (await Portfolio.findOne({ slug: newSlug })) {
        counter++;
        newSlug = `${cleanSlug}-${counter}`;
      }
      cleanSlug = newSlug;
    }

    const profile = await Profile.findOne({ _id: profileId, userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'Profile not found or unauthorized' });
    }

    const portfolio = await Portfolio.create({
      userId: req.user._id,
      profileId,
      title: title || 'New Portfolio',
      slug: cleanSlug,
      theme: theme || 'minimal',
      isPublic: isPublic !== undefined ? isPublic : true
    });

    res.status(201).json({ status: 'success', data: portfolio });
  } catch (error) {
    next(error);
  }
};

exports.updatePortfolio = async (req, res, next) => {
  try {
    const { title, slug, profileId, theme, isPublic } = req.body;

    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ status: 'error', message: 'Portfolio not found' });
    }

    if (slug) {
      const cleanSlug = slug.trim().toLowerCase();
      
      const slugRegex = /^[a-z0-9-]{3,30}$/;
      if (!slugRegex.test(cleanSlug)) {
        return res.status(400).json({ status: 'error', message: 'Slug must be 3-30 characters, lowercase letters, numbers, hyphens only' });
      }

      if (cleanSlug !== portfolio.slug) {
        const taken = await Portfolio.findOne({ slug: cleanSlug, _id: { $ne: portfolio._id } });
        if (taken) return res.status(400).json({ status: 'error', message: 'Slug is already claimed' });
        portfolio.slug = cleanSlug;
      }
    }

    if (profileId) {
      const profile = await Profile.findOne({ _id: profileId, userId: req.user._id });
      if (!profile) return res.status(404).json({ status: 'error', message: 'Profile not found' });
      portfolio.profileId = profileId;
    }

    if (title !== undefined) portfolio.title = title;
    if (theme !== undefined) portfolio.theme = theme;
    if (isPublic !== undefined) portfolio.isPublic = isPublic;

    await portfolio.save();
    res.status(200).json({ status: 'success', data: portfolio });
  } catch (error) {
    next(error);
  }
};

exports.deletePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ status: 'error', message: 'Portfolio not found' });
    }
    res.status(200).json({ status: 'success', message: 'Portfolio deleted successfully' });
  } catch (error) {
    next(error);
  }
};
