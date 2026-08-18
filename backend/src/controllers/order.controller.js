const OrderModel = require('../models/order.model');
const ProductModel = require('../models/product.model');
const { v4: uuidv4 } = require('uuid');

class OrderController {
  /**
   * GET /api/orders
   * Get all orders (admin gets all, customer gets own)
   */
  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || null;

      // Admin sees all, customer sees own orders only
      const userId = req.user.role === 'admin' ? null : req.user.id;

      const result = await OrderModel.findAll({ page, limit, userId, status });

      res.json({
        status: 'success',
        ...result
      });
    } catch (error) {
      console.error('Get Orders Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }

  /**
   * GET /api/orders/:id
   * Get order detail with items
   */
  static async getById(req, res) {
    try {
      const order = await OrderModel.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found.'
        });
      }

      // Customer can only see own orders
      if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden. Cannot access other user\'s orders.'
        });
      }

      res.json({
        status: 'success',
        data: { order }
      });
    } catch (error) {
      console.error('Get Order Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }

  /**
   * POST /api/orders
   * Create new order
   * Body: { items: [{ product_id, quantity }] }
   */
  static async create(req, res) {
    try {
      const { items } = req.body;

      // Validation
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Order items are required. Provide an array of { product_id, quantity }.'
        });
      }

      // Validate each item and get current prices
      const orderItems = [];
      for (const item of items) {
        if (!item.product_id || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Each item must have product_id and quantity > 0.'
          });
        }

        const product = await ProductModel.findById(item.product_id);
        if (!product) {
          return res.status(404).json({
            status: 'error',
            message: `Product with ID ${item.product_id} not found.`
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            status: 'error',
            message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}.`
          });
        }

        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price  // Snapshot current price
        });
      }

      // Generate order number
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const shortId = uuidv4().split('-')[0].toUpperCase();
      const order_number = `ORD-${date}-${shortId}`;

      // Create order with transaction
      const order = await OrderModel.create({
        user_id: req.user.id,
        order_number,
        items: orderItems
      });

      // Fetch complete order
      const fullOrder = await OrderModel.findById(order.id);

      res.status(201).json({
        status: 'success',
        message: 'Order created successfully.',
        data: { order: fullOrder }
      });
    } catch (error) {
      console.error('Create Order Error:', error);

      if (error.message.includes('Insufficient stock')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }

  /**
   * PATCH /api/orders/:id/status
   * Update order status (admin only)
   * Body: { status: 'processing' | 'completed' | 'cancelled' }
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const order = await OrderModel.findById(id);
      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found.'
        });
      }

      await OrderModel.updateStatus(id, status);
      const updated = await OrderModel.findById(id);

      res.json({
        status: 'success',
        message: `Order status updated to "${status}".`,
        data: { order: updated }
      });
    } catch (error) {
      console.error('Update Status Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }
}

module.exports = OrderController;
