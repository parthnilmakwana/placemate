const User = require('../models/User');
const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const { generateResumePDF } = require('../utils/pdfgen');
const { enhanceResumeGeneral, enhanceTextSnippet } = require('../utils/aiMatcher');

/**
 * @desc    Generate and stream the user's PDF resume
 * @route   GET /api/resume/download
 * @access  Private (Authenticated users only)
 */
exports.downloadResume = async (req, res, next) => {
  try {
    // 1. Fetch user profile from database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const { sentJobId, optimize: optimizeQuery, resumeId } = req.query;
    
    // 2. Resolve the profile to use (either from Resume model or fallback to User)
    let activeProfile = user.profile;
    let activeName = user.name;
    
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id }).populate('profileId');
      if (resume && resume.profileId) {
        activeProfile = resume.profileId;
        activeName = resume.profileId.fullName;
      }
    }

    // 3. Determine if downloading a tailored resume
    const optimize = optimizeQuery === 'true';
    let tailoredProfile = null;
    let customFileName = `${(activeProfile?.fullName || activeName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;

    if (sentJobId) {
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(sentJobId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid sentJobId format' });
      }
      const SentJob = require('../models/SentJob');
      const sentJob = await SentJob.findById(sentJobId);
      
      if (sentJob && sentJob.userId.toString() === req.user._id.toString()) {
        // Ensure tailoredProfile has bio and data before using
        if (sentJob.tailoredProfile && sentJob.tailoredProfile.bio) {
          tailoredProfile = sentJob.tailoredProfile;
          const companySlug = sentJob.company.replace(/[^a-zA-Z0-9]/g, '_');
          customFileName = `${(activeProfile?.fullName || activeName || 'Candidate').replace(/\s+/g, '_')}_Tailored_${companySlug}_Resume.pdf`;
          console.log(`[RESUME] Generating tailored resume for job: ${sentJob.title} at ${sentJob.company}`);
        }
      }
    }

    // 4. Generate PDFKit document
    const docUser = { name: activeName, profile: activeProfile };
    const doc = generateResumePDF(docUser, { optimize, tailoredProfile });

    // 4. Compile PDF stream in memory to prevent silent post-header failures
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    const resumeBuffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));
    });

    // 5. Set content headers and send binary buffer response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${customFileName}"`);
    res.send(resumeBuffer);
  } catch (error) {
    console.error('Error generating resume download:', error);
    // If headers haven't been sent, return error json, otherwise just end request
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Could not generate resume PDF. Please check your profile data.'
      });
    } else {
      res.end();
    }
  }
};

/**
 * @desc    Enhance the user's resume using Gemini AI and return as draft
 * @route   POST /api/resume/enhance
 * @access  Private
 */
exports.enhanceResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.profile || (!user.profile.bio && user.profile.experience.length === 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'Profile is too empty to enhance. Please fill in basic experience or bio first.'
      });
    }

    // Call the AI Matcher utility
    const enhancedDraft = await enhanceResumeGeneral(user.profile);

    res.status(200).json({
      status: 'success',
      draft: enhancedDraft
    });
  } catch (error) {
    console.error('Error in enhanceResume:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to enhance resume with AI. Please try again later.'
    });
  }
};

/**
 * @desc    Enhance a single text snippet (for Tiptap editor)
 * @route   POST /api/resume/enhance-text
 * @access  Private
 */
exports.enhanceText = async (req, res, next) => {
  try {
    const { text, mode } = req.body;
    if (!text) {
      return res.status(400).json({ status: 'error', message: 'Text is required' });
    }

    const enhancedText = await enhanceTextSnippet(text, mode || 'professional');

    res.status(200).json({
      status: 'success',
      data: enhancedText
    });
  } catch (error) {
    console.error('Error in enhanceText:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to enhance text. Please try again later.'
    });
  }
};

// CRUD Operations for Resume Collection

exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: resumes });
  } catch (error) {
    next(error);
  }
};

exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id }).populate('profileId');
    if (!resume) {
      return res.status(404).json({ status: 'error', message: 'Resume not found' });
    }
    res.status(200).json({ status: 'success', data: resume });
  } catch (error) {
    next(error);
  }
};

exports.createResume = async (req, res, next) => {
  try {
    const { title, profileId, settings } = req.body;

    if (!profileId) {
      return res.status(400).json({ status: 'error', message: 'Profile ID is required' });
    }

    // Verify profile ownership
    const profile = await Profile.findOne({ _id: profileId, userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'Profile not found or unauthorized' });
    }

    const resume = await Resume.create({
      userId: req.user._id,
      profileId,
      title: title || 'New Resume',
      settings: settings || undefined
    });

    res.status(201).json({ status: 'success', data: resume });
  } catch (error) {
    next(error);
  }
};

exports.updateResume = async (req, res, next) => {
  try {
    const { title, profileId, settings } = req.body;

    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ status: 'error', message: 'Resume not found' });
    }

    if (profileId) {
      const profile = await Profile.findOne({ _id: profileId, userId: req.user._id });
      if (!profile) {
        return res.status(404).json({ status: 'error', message: 'Profile not found or unauthorized' });
      }
      resume.profileId = profileId;
    }

    if (title) resume.title = title;
    
    if (settings) {
      if (settings.themeId) resume.settings.themeId = settings.themeId;
      if (settings.fontFamily) resume.settings.fontFamily = settings.fontFamily;
      if (settings.primaryColor) resume.settings.primaryColor = settings.primaryColor;
      if (settings.secondaryColor) resume.settings.secondaryColor = settings.secondaryColor;
      if (settings.fontSize) resume.settings.fontSize = settings.fontSize;
    }

    await resume.save();

    res.status(200).json({ status: 'success', data: resume });
  } catch (error) {
    next(error);
  }
};

exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ status: 'error', message: 'Resume not found' });
    }

    res.status(200).json({ status: 'success', message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
};
