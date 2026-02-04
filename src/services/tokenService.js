const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";
const JWT_COOKIE_EXPIRES_IN = process.env.JWT_COOKIE_EXPIRES_IN || 1;

/**
 * Generate JWT token for a user
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

/**
 * Get cookie options for JWT
 * @returns {Object} Cookie options
 */
const getCookieOptions = () => {
  return {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
};

/**
 * Create token and send response with cookie
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @param {string} cookieName - Name of the cookie (default: 'jwt')
 */
const createSendToken = (user, statusCode, res, cookieName = 'jwt') => {
  const token = signToken(user._id);
  const cookieOptions = getCookieOptions();

  res.cookie(cookieName, token, cookieOptions);

  // Remove password from output
  if (user.password !== undefined) {
    user.password = undefined;
  }

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

/**
 * Set cookie with token
 * @param {Object} res - Express response object
 * @param {string} cookieName - Name of the cookie
 * @param {string} token - JWT token
 */
const setCookie = (res, cookieName, token) => {
  const cookieOptions = getCookieOptions();
  res.cookie(cookieName, token, cookieOptions);
};

/**
 * Set multiple cookies (for admin tokens and device IDs)
 * @param {Object} res - Express response object
 * @param {Object} cookies - Object with cookie name-value pairs
 */
const setMultipleCookies = (res, cookies) => {
  const cookieOptions = getCookieOptions();
  Object.entries(cookies).forEach(([name, value]) => {
    res.cookie(name, value, cookieOptions);
  });
};

module.exports = {
  signToken,
  getCookieOptions,
  createSendToken,
  setCookie,
  setMultipleCookies
};
