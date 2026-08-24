const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/**
 * Helper utility to sign and generate a JWT token for authentication
 * @param {string} id - The MongoDB user ID
 * @param {string} sessionId - Unique session ID for session tracking
 * @returns {string} - The signed JWT
 */
const generateToken = (id, sessionId) => {
  return jwt.sign(
    { id, sessionId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Parse user agent to extract basic device, OS, and browser names
 */
const parseUserAgent = (uaString = '') => {
  let browser = 'Chrome';
  if (uaString.includes('Firefox')) browser = 'Firefox';
  else if (uaString.includes('Safari') && !uaString.includes('Chrome')) browser = 'Safari';
  else if (uaString.includes('Edge')) browser = 'Edge';

  let os = 'Windows';
  if (uaString.includes('Macintosh') || uaString.includes('Mac OS')) os = 'macOS';
  else if (uaString.includes('Linux')) os = 'Linux';
  else if (uaString.includes('iPhone') || uaString.includes('iPad')) os = 'iOS';
  else if (uaString.includes('Android')) os = 'Android';

  return { browser, os, device: `${os} • ${browser}` };
};

/**
 * Create a new session entry for user
 */
const createSession = async (user, req) => {
  const sessionId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  const uaInfo = parseUserAgent(req.headers['user-agent']);
  const ipAddress = req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1';

  if (!user.sessions) user.sessions = [];
  user.sessions.push({
    sessionId,
    device: uaInfo.device,
    os: uaInfo.os,
    browser: uaInfo.browser,
    ipAddress,
    lastActive: new Date(),
    createdAt: new Date()
  });

  if (user.sessions.length > 10) {
    user.sessions = user.sessions.slice(-10);
  }

  await user.save();
  return sessionId;
};

/**
 * Auto-migrate legacy user to populate settings and profile fields if they are missing
 */
const autoMigrateLegacyUser = async (user) => {
  if (!user) return;
  let isUpdated = false;

  if (!user.settings) {
    user.settings = {};
    isUpdated = true;
  }
  if (!user.profile) {
    user.profile = {};
    isUpdated = true;
  }
  
  // For Google users, we strictly use the Google profile name.
  // We do not want to auto-migrate the legacy user.name into settings.firstName
  // because that might overwrite their blank Google name with an old email fallback.
  if (!user.googleId) {
    if (!user.settings.firstName && user.name) {
      const nameParts = user.name.trim().split(' ');
      user.settings.firstName = nameParts[0] || '';
      user.settings.lastName = nameParts.slice(1).join(' ') || '';
      isUpdated = true;
    }
  }

  if (!user.profile.fullName && user.name) {
    user.profile.fullName = user.name;
    isUpdated = true;
  }

  if (isUpdated) {
    user.markModified('settings');
    user.markModified('profile');
    await user.save();
  }
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

    // Derive first/last name for settings initialization
    const nameParts = name.trim().split(' ');
    const regFirstName = nameParts[0] || '';
    const regLastName = nameParts.slice(1).join(' ') || '';

    // Create user in database with both name identities initialized
    const user = await User.create({
      name,
      email,
      password,
      username,
      settings: {
        firstName: regFirstName,
        lastName: regLastName,
      },
      profile: {
        fullName: name.trim(),
      },
    });

    // Create session and generate authentication token
    const sessionId = await createSession(user, req);
    const token = generateToken(user._id, sessionId);

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
        profile: user.profile,
        settings: user.settings,
        googleId: user.googleId,
        isDeactivated: user.isDeactivated
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

    if (user.isDeactivated) {
      user.isDeactivated = false; // Reactivate account automatically on successful login
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
    }

    // Auto-migrate legacy data fields if needed
    await autoMigrateLegacyUser(user);

    // Create session and generate token
    const sessionId = await createSession(user, req);
    const token = generateToken(user._id, sessionId);

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
        profile: user.profile,
        settings: user.settings,
        googleId: user.googleId,
        isDeactivated: user.isDeactivated
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
    // Auto-migrate legacy data fields if needed
    await autoMigrateLegacyUser(req.user);

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
        profile: req.user.profile,
        settings: req.user.settings,
        googleId: req.user.googleId,
        isDeactivated: req.user.isDeactivated
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
    const { sub: googleId, email, name, given_name, family_name, picture } = payload;

    // Derive first/last name from Google's structured fields (preferred).
    // If given_name is absent, we attempt to parse `name`.
    // We STRICTLY AVOID falling back to the email prefix for the Settings Name.
    let gFirstName = given_name || '';
    let gLastName = family_name || '';

    if (!gFirstName && name) {
      const parts = name.trim().split(' ');
      gFirstName = parts[0] || '';
      gLastName = parts.slice(1).join(' ') || '';
    }

    // The legacy root 'name' field can still use email fallback just so it's not empty, 
    // but the Settings Name will strictly be gFirstName/gLastName.
    const gFullName = [gFirstName, gLastName].filter(Boolean).join(' ') || name || email.split('@')[0];

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
    }

    // 3. If user still doesn't exist, create a new user account
    if (!user) {

      // Generate unique username from name
      const baseUsername = gFullName.toLowerCase().replace(/[^a-z0-9]/g, '');
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

      // Generate a long cryptographically secure random password that satisfies rules
      const randomPassword = crypto.randomBytes(32).toString('hex') + 'aA1!';

      // Create new user in MongoDB with both name identities initialized
      user = await User.create({
        name: gFullName,
        email,
        username,
        googleId,
        password: randomPassword,
        settings: {
          firstName: gFirstName,
          lastName: gLastName,
        },
        profile: {
          fullName: gFullName,
        },
      });
    } else {
      // User exists. Synchronize the latest Google name to the Settings name.
      // We will ALWAYS update to the latest Google name, even if it's empty, 
      // because Settings Name is strictly Google-controlled.
      if (!user.settings) user.settings = {};
      user.settings.firstName = gFirstName;
      user.settings.lastName = gLastName;

      // FIX: If the user's profile name is empty, or if it exactly matches the old legacy 
      // root name (which might be a garbage email prefix like "xcdgs"), 
      // overwrite it with the proper Google Name so it's not stuck forever.
      if (!user.profile) user.profile = {};
      if (!user.profile.fullName || user.profile.fullName === user.name) {
        user.profile.fullName = gFullName;
      }

      // Update the root legacy name as well to permanently wipe the garbage value from the DB
      user.name = gFullName;

      // Link googleId to existing email account if not already linked
      if (!user.googleId) user.googleId = googleId;

      // Reactivate account if it was deactivated
      if (user.isDeactivated) {
        user.isDeactivated = false;
      }

      user.markModified('settings');
      await user.save();
    }

    // Auto-migrate legacy data fields if needed
    await autoMigrateLegacyUser(user);

    // Generate local JWT token with session
    const sessionId = await createSession(user, req);
    const token = generateToken(user._id, sessionId);

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
        profile: user.profile,
        settings: user.settings,
        googleId: user.googleId,
        isDeactivated: user.isDeactivated
      }
    });
  } catch (error) {
    next(error);
  }
};

