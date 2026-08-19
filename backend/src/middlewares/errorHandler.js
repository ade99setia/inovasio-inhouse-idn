/**
 * Centralized Error Handler Middleware
 * Catches all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  }

  // Operational errors (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: { code: err.errorCode }
    });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry. Resource already exists.',
      error: { code: 'DUPLICATE_ENTRY' }
    });
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      success: false,
      message: 'Cannot delete. Resource is referenced by other records.',
      error: { code: 'FOREIGN_KEY_CONSTRAINT' }
    });
  }

  // MySQL check constraint
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({
      success: false,
      message: 'Data constraint violated.',
      error: { code: 'CONSTRAINT_VIOLATED' }
    });
  }

  // JSON parse error
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body.',
      error: { code: 'INVALID_JSON' }
    });
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body too large.',
      error: { code: 'PAYLOAD_TOO_LARGE' }
    });
  }

  // Unknown/unhandled errors
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message,
    error: { code: 'INTERNAL_ERROR' }
  });
};

module.exports = errorHandler;
