const orderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');
const response = require('../utils/response');

/**
 * Order Controller
 * Handles HTTP req/res only - no business logic
 */
const orderController = {
  /**
   * GET /api/v1/orders
   */
  getAll: asyncHandler(async (req, res) => {
    const { page, limit, status } = req.query;
    const result = await orderService.getAll({ page, limit, status, user: req.user });

    return response.success(res, {
      message: 'Orders retrieved successfully.',
      data: result
    });
  }),

  /**
   * GET /api/v1/orders/:id
   */
  getById: asyncHandler(async (req, res) => {
    const order = await orderService.getById(parseInt(req.params.id), req.user);

    return response.success(res, {
      message: 'Order retrieved successfully.',
      data: { order }
    });
  }),

  /**
   * POST /api/v1/orders
   */
  create: asyncHandler(async (req, res) => {
    const { items } = req.body;
    const order = await orderService.create({ items, user: req.user });

    return response.created(res, {
      message: 'Order created successfully.',
      data: { order }
    });
  }),

  /**
   * PATCH /api/v1/orders/:id/status
   */
  updateStatus: asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const order = await orderService.updateStatus(id, status);

    return response.success(res, {
      message: `Order status updated to "${status}".`,
      data: { order }
    });
  })
};

module.exports = orderController;
