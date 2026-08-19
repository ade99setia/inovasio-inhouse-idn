const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const response = require('../utils/response');

/**
 * Auth Controller
 * Handles HTTP req/res only - no business logic
 */
const authController = {
  /**
   * POST /api/v1/auth/register
   */
  register: asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });

    return response.created(res, {
      message: 'User registered successfully.',
      data: result
    });
  }),

  /**
   * POST /api/v1/auth/login
   */
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    return response.success(res, {
      message: 'Login successful.',
      data: result
    });
  }),

  /**
   * GET /api/v1/auth/me
   */
  me: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);

    return response.success(res, {
      message: 'Profile retrieved successfully.',
      data: { user }
    });
  })
};

module.exports = authController;
