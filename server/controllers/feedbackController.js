const Feedback = require('../models/Feedback');

/**
 * @desc    Submit user feedback
 * @route   POST /api/feedback
 * @access  Private
 */
exports.createFeedback = async (req, res, next) => {
  try {
    const { category, rating, text } = req.body;

    // Validate existence of required inputs
    if (!category || rating === undefined || !text) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide category, rating, and feedback text description'
      });
    }

    // Save to database, linking to logged-in user ID
    const feedback = await Feedback.create({
      userId: req.user._id,
      category,
      rating,
      text
    });

    res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    next(error);
  }
};
