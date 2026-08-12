const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// Verifies the access token in the Authorization header and attaches
// { id, email } to req.user. Use on every protected REST route.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Missing access token'));
  }

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired access token'));
  }
}

module.exports = requireAuth;
