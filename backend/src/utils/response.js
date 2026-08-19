/**
 * Standardized API Response Helper
 */
const response = {
  /**
   * Success response
   */
  success(res, { statusCode = 200, message = 'Success.', data = null }) {
    const payload = { success: true, message };
    if (data !== null) payload.data = data;
    return res.status(statusCode).json(payload);
  },

  /**
   * Created response (201)
   */
  created(res, { message = 'Resource created successfully.', data = null }) {
    return response.success(res, { statusCode: 201, message, data });
  },

  /**
   * Error response
   */
  error(res, { statusCode = 500, message = 'Internal server error.', errorCode = 'INTERNAL_ERROR' }) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: { code: errorCode }
    });
  }
};

module.exports = response;
