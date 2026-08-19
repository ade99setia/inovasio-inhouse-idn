const AppError = require('../utils/AppError');

/**
 * Middleware: Role-based Authorization
 * Usage: authorize('admin') or authorize('admin', 'manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden(
        `Access denied. Required role: ${roles.join(' or ')}.`
      );
    }

    next();
  };
};

module.exports = authorize;
