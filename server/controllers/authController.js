const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/**
 * Helper utility to sign and generate a JWT token for authentication
 * @param {string} id - The MongoDB user ID
 * @returns {string} - The signed JWT
 */
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET, 
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

    // Email format validation via regular expression
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address'
      });
    }

    // Password strength validation: min 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
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
      if (count > 10) {
        // Fallback: append a random 4-character hex suffix to ensure uniqueness and avoid infinite loops
        const crypto = require('crypto');
        const suffix = crypto.randomBytes(2).toString('hex');
        username = `${baseUsername}${suffix}`;
        break;
      }
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

    // Find user in DB and explicitly select password and lockout fields
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if account is temporarily locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(401).json({
        status: 'error',
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment login attempts and check for lockout trigger
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
        console.warn(`[AUTH] User account ${email} locked until ${new Date(user.lockUntil).toISOString()} due to 5 failed logins.`);
      }
      await user.save();

      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts and lockout on successful authentication
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
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

/**
 * @desc    Authenticate user via Google OAuth & get token
 * @route   POST /api/auth/google
 * @access  Public
 */
exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Google ID Token is required'
      });
    }

    // Verify Google ID Token signature and audience
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error('Google ID Token verification failed:', verifyError.message);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Google ID Token'
      });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Verify we got the required fields from Google
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Google account must have a verified email address'
      });
    }

    // 1. Search for user by googleId
    let user = await User.findOne({ googleId });

    // 2. If not found by googleId, check by email (to link account if they registered with email previously)
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Link googleId to existing email account
        user.googleId = googleId;
        await user.save();
      }
    }

    // 3. If user still doesn't exist, create a new user account
    if (!user) {
      // Generate unique username from name
      const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      let username = baseUsername || 'user';
      let count = 1;
      let usernameExists = await User.findOne({ username });
      while (usernameExists) {
        if (count > 10) {
          const suffix = crypto.randomBytes(2).toString('hex');
          username = `${baseUsername}${suffix}`;
          break;
        }
        username = `${baseUsername}${count}`;
        usernameExists = await User.findOne({ username });
        count++;
      }

      // Generate a long cryptographically secure random password that satisfies rules:
      // min 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
      const randomPassword = crypto.randomBytes(32).toString('hex') + 'aA1!';

      // Create new user in MongoDB
      user = await User.create({
        name,
        email,
        username,
        googleId,
        password: randomPassword,
      });
    }

    // Generate local JWT token
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

