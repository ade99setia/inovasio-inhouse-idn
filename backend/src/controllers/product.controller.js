const ProductModel = require('../models/product.model');

class ProductController {
  /**
   * GET /api/products
   * Get all products with pagination & search
   */
  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await ProductModel.findAll({ page, limit, search });

      res.json({
        status: 'success',
        ...result
      });
    } catch (error) {
      console.error('Get Products Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }

  /**
   * GET /api/products/:id
   * Get single product by ID
   */
  static async getById(req, res) {
    try {
      const product = await ProductModel.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found.'
        });
      }

      res.json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      console.error('Get Product Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }

  /**
   * POST /api/products
   * Create new product (admin only)
   */
  static async create(req, res) {
    try {
      const { sku, name, price, stock, description } = req.body;

      // Validation
      if (!sku || !name || price === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'SKU, name, and price are required.'
        });
      }

      // Check duplicate SKU
      const existing = await ProductModel.findBySku(sku);
      if (existing) {
        return res.status(409).json({
          status: 'error',
          message: 'SKU already exists.'
        });
      }

      const product = await ProductModel.create({ sku, name, price, stock, description });

      res.status(201).json({
        status: 'success',
        message: 'Product created successfully.',
        data: { product }
      });
    } catch (error) {
      console.error('Create Product Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }

  /**
   * PUT /api/products/:id
   * Update product (admin only)
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { sku, name, price, stock, description } = req.body;

      // Check product exists
      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found.'
        });
      }

      // Check duplicate SKU (if changed)
      if (sku && sku !== product.sku) {
        const existing = await ProductModel.findBySku(sku);
        if (existing) {
          return res.status(409).json({
            status: 'error',
            message: 'SKU already exists.'
          });
        }
      }

      await ProductModel.update(id, {
        sku: sku || product.sku,
        name: name || product.name,
        price: price !== undefined ? price : product.price,
        stock: stock !== undefined ? stock : product.stock,
        description: description !== undefined ? description : product.description
      });

      const updated = await ProductModel.findById(id);

      res.json({
        status: 'success',
        message: 'Product updated successfully.',
        data: { product: updated }
      });
    } catch (error) {
      console.error('Update Product Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }

  /**
   * DELETE /api/products/:id
   * Delete product (admin only)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found.'
        });
      }

      const deleted = await ProductModel.delete(id);
      if (!deleted) {
        return res.status(409).json({
          status: 'error',
          message: 'Cannot delete product. It may be referenced by existing orders.'
        });
      }

      res.json({
        status: 'success',
        message: 'Product deleted successfully.'
      });
    } catch (error) {
      // Handle FK constraint error
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          status: 'error',
          message: 'Cannot delete product. It is referenced by existing orders.'
        });
      }
      console.error('Delete Product Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }
}

module.exports = ProductController;
