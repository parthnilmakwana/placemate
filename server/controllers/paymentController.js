const User = require('../models/User');

/**
 * @desc    Simulate Razorpay checkout success and upgrade user to Pro plan
 * @route   POST /api/payments/mock-upgrade
 * @access  Private
 */
exports.mockUpgrade = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.'
      });
    }

    user.plan = 'pro';
    await user.save();

    console.log(`[PAYMENT] Mock upgraded user ${user.name} to Pro Plan.`);

    res.status(200).json({
      status: 'success',
      message: 'Plan upgraded to Pro successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Error in mock upgrade payment handler:', error);
    next(error);
  }
};

/**
 * @desc    Simulate cancellation and downgrade user back to Free plan (testing purposes)
 * @route   POST /api/payments/mock-downgrade
 * @access  Private
 */
exports.mockDowngrade = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.'
      });
    }

    user.plan = 'free';
    await user.save();

    console.log(`[PAYMENT] Mock downgraded user ${user.name} to Free Plan.`);

    res.status(200).json({
      status: 'success',
      message: 'Plan reset to Free successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Error in mock downgrade payment handler:', error);
    next(error);
  }
};
