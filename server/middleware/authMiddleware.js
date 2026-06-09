const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes. Verifies the JWT sent in the Authorization header.
 * Attaches the user object to the request for downstream controllers.
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check if header contains a Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Split "Bearer <token>" to extract token string
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify the token signature
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET
      );

      // Fetch user from DB, omit password, and attach to the request object
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'The user belonging to this token no longer exists'
        });
      }

      // Call next middleware in pipeline
      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, token validation failed'
      });
    }
  } else {
    // If no token was found in headers
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, no token provided'
    });
  }
};

/**
 * Middleware to restrict access to specific roles (e.g. admin)
 * @param  {...string} roles - Permitted roles list
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role '${req.user.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};
