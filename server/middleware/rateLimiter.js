const rateLimit = require('express-rate-limit');

/**
 * Global Rate Limiter
 * Applied to all API routes to prevent general spam/DDoS.
 * Allows 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

/**
 * Auth Rate Limiter
 * Applied specifically to authentication routes (login/register).
 * Protects against brute-force password guessing and credential stuffing.
 * Allows 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login/register attempts from this IP, please try again after 15 minutes'
  }
});

module.exports = {
  globalLimiter,
  authLimiter
};
