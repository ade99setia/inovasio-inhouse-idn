const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * Middleware: Verify JWT Token
 * Extracts token from Authorization header
 * Sets req.user with decoded payload
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.unauthorized('Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Token expired. Please login again.', 'TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw AppError.unauthorized('Invalid token.', 'INVALID_TOKEN');
    }
    throw AppError.unauthorized('Authentication failed.');
  }
};

module.exports = authenticate;
