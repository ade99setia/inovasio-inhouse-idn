const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');
const response = require('../utils/response');

/**
 * Product Controller
 * Handles HTTP req/res only - no business logic
 */
const productController = {
  /**
   * GET /api/v1/products
   */
  getAll: asyncHandler(async (req, res) => {
    const { page, limit, search } = req.query;
    const result = await productService.getAll({ page, limit, search });

    return response.success(res, {
      message: 'Products retrieved successfully.',
      data: result
    });
  }),

  /**
   * GET /api/v1/products/:id
   */
  getById: asyncHandler(async (req, res) => {
    const product = await productService.getById(parseInt(req.params.id));

    return response.success(res, {
      message: 'Product retrieved successfully.',
      data: { product }
    });
  }),

  /**
   * POST /api/v1/products
   */
  create: asyncHandler(async (req, res) => {
    const { sku, name, price, stock, description } = req.body;
    const product = await productService.create({ sku, name, price, stock, description });

    return response.created(res, {
      message: 'Product created successfully.',
      data: { product }
    });
  }),

  /**
   * PUT /api/v1/products/:id
   */
  update: asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { sku, name, price, stock, description } = req.body;
    const product = await productService.update(id, { sku, name, price, stock, description });

    return response.success(res, {
      message: 'Product updated successfully.',
      data: { product }
    });
  }),

  /**
   * DELETE /api/v1/products/:id
   */
  delete: asyncHandler(async (req, res) => {
    await productService.delete(parseInt(req.params.id));

    return response.success(res, {
      message: 'Product deleted successfully.'
    });
  })
};

module.exports = productController;
