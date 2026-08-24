const { analyzeResumeDeterministically, analyzeResumeWithAI } = require('../services/atsService');
const User = require('../models/User');

/**
 * @desc    Analyze resume text deterministically (Public/Landing page)
 * @route   POST /api/ats/analyze-public
 * @access  Public
 */
exports.analyzePublic = (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Resume text is required' });
    }

    const result = analyzeResumeDeterministically(text);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in analyzePublic:', error);
    res.status(500).json({ success: false, error: 'Server error during ATS analysis' });
  }
};

/**
 * @desc    Analyze user profile against Job Description using AI (Dashboard)
 * @route   POST /api/ats/analyze
 * @access  Private
 */
exports.analyzeAuthenticated = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ success: false, error: 'Job description is required for deep analysis.' });
    }

    // Fetch the full user to get their profile
    const user = await User.findById(req.user.id);
    
    if (!user || !user.profile) {
      return res.status(404).json({ success: false, error: 'User profile not found. Please complete your profile first.' });
    }

    const analysis = await analyzeResumeWithAI(user.profile, jobDescription);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error in analyzeAuthenticated:', error);
    res.status(500).json({ success: false, error: 'Failed to perform AI ATS analysis.' });
  }
};
