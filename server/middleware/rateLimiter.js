const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development';

/**
 * Global Rate Limiter
 * Applied to all API routes to prevent general spam/DDoS.
 * Allows 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 5000 : 100, // Increase limit in dev mode
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
  max: isDev ? 500 : 10, // Increase limit in dev mode
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
