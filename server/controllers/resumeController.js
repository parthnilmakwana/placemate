const User = require('../models/User');
const { generateResumePDF } = require('../utils/pdfgen');

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

    // 2. Read optimization setting from query parameter
    const optimize = req.query.optimize === 'true';

    // 3. Set content headers for PDF streaming download
    const safeFileName = `${user.name.replace(/\s+/g, '_')}_Resume.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);

    // 4. Generate PDFKit document
    const doc = generateResumePDF(user, { optimize });

    // 5. Pipe PDF stream directly to Express response
    doc.pipe(res);
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
