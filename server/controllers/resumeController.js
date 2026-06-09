const User = require('../models/User');
const { generateResumePDF } = require('../utils/pdfgen');
const { enhanceResumeGeneral } = require('../utils/aiMatcher');

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

    // 2. Determine if downloading a tailored resume
    const { sentJobId, optimize: optimizeQuery } = req.query;
    const optimize = optimizeQuery === 'true';
    let tailoredProfile = null;
    let customFileName = `${user.name.replace(/\s+/g, '_')}_Resume.pdf`;

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
          customFileName = `${user.name.replace(/\s+/g, '_')}_Tailored_${companySlug}_Resume.pdf`;
          console.log(`[RESUME] Generating tailored resume for job: ${sentJob.title} at ${sentJob.company}`);
        }
      }
    }

    // 3. Generate PDFKit document
    const doc = generateResumePDF(user, { optimize, tailoredProfile });

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
