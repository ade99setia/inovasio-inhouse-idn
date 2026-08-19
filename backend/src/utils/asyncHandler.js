/**
 * Async Handler Wrapper
 * Catches async errors and forwards them to the error middleware
 * Eliminates the need for try/catch in every controller
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
