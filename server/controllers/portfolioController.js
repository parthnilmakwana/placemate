const User = require('../models/User');
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
    const draft = await PortfolioDraft.findOne({ _id: req.params.id, userId: req.user._id });
    if (!draft) {
      return res.status(404).json({
        status: 'error',
        message: 'Draft not found.'
      });
    }
    
    if (draft.isApplied) {
      return res.status(400).json({
        status: 'error',
        message: 'This draft has already been applied.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user.profile) user.profile = {};

    // Apply drafted fields
    const newProfile = draft.profileDraft;
    user.profile.bio = newProfile.bio || user.profile.bio;
    user.profile.title = newProfile.title || user.profile.title;
    user.profile.theme = newProfile.theme || user.profile.theme;
    user.profile.skills = newProfile.skills || user.profile.skills;
    user.profile.experience = newProfile.experience || user.profile.experience;
    user.profile.projects = newProfile.projects || user.profile.projects;
    user.profile.education = newProfile.education || user.profile.education;

    user.markModified('profile');
    await user.save();

    draft.isApplied = true;
    await draft.save();

    res.status(200).json({
      status: 'success',
      message: 'Draft applied successfully.',
      user: {
        profile: user.profile
      }
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
