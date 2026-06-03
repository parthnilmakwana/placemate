const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Helper utility to sign and generate a JWT token for authentication
 * @param {string} id - The MongoDB user ID
 * @returns {string} - The signed JWT
 */
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'super_secret_dev_key_for_placemate_app_12345', 
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if password or email is missing
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email address'
      });
    }

    // Generate unique username from user name (slugified lowercase alphanumeric)
    const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername || 'user';
    let count = 1;
    let usernameExists = await User.findOne({ username });
    while (usernameExists) {
      username = `${baseUsername}${count}`;
      usernameExists = await User.findOne({ username });
      count++;
    }

    // Create user in database (triggers the pre-save password hashing hook)
    const user = await User.create({
      name,
      email,
      password,
      username
    });

    // Generate authentication token
    const token = generateToken(user._id);

    // Send successful response
    res.status(201).json({
      status: 'success',
      token,
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
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Find user in DB and explicitly select password (which is normally hidden)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send successful response
    res.status(200).json({
      status: 'success',
      token,
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
 * @desc    Get current logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
        plan: req.user.plan,
        hasCompletedOnboarding: req.user.hasCompletedOnboarding,
        profile: req.user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};
