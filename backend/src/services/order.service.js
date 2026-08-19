const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const AppError = require('../utils/AppError');
const { v4: uuidv4 } = require('uuid');

class OrderService {
  /**
   * Get all orders with pagination
   * Admin: all orders, Customer: own orders only
   */
  async getAll({ page = 1, limit = 10, status, user }) {
    const offset = (page - 1) * limit;
    const userId = user.role === 'admin' ? null : user.id;

    const [data, total] = await Promise.all([
      orderRepository.findAll({ limit, offset, userId, status }),
      orderRepository.count({ userId, status })
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get order by ID with items
   * Customer can only view own orders
   */
  async getById(id, user) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw AppError.notFound('Order not found.');
    }

    // Ownership check
    if (user.role !== 'admin' && order.user_id !== user.id) {
      throw AppError.forbidden('You do not have access to this order.');
    }

    const items = await orderRepository.findItemsByOrderId(id);
    return { ...order, items };
  }

  /**
   * Create order with transaction
   *
   * Business Logic Flow:
   * 1. Validate items array
   * 2. Begin transaction
   * 3. Lock products (SELECT FOR UPDATE)
   * 4. Validate each product exists and has sufficient stock
   * 5. Calculate subtotals and total
   * 6. Create order record
   * 7. Create order_items records
   * 8. Decrement stock for each product
   * 9. Commit transaction
   * 10. Return complete order
   *
   * If ANY step fails → ROLLBACK
   */
  async create({ items, user }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest('Order must contain at least one item.');
    }

    const connection = await orderRepository.getConnection();

    try {
      await connection.beginTransaction();

      // Validate and prepare order items
      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        // Validate item structure
        if (!item.product_id || !item.quantity || item.quantity <= 0) {
          throw AppError.badRequest('Each item must have a valid product_id and quantity > 0.');
        }

        // Lock product row for update (prevent race condition)
        const product = await productRepository.findByIdForUpdate(connection, item.product_id);
        if (!product) {
          throw AppError.notFound(`Product with ID ${item.product_id} not found.`);
        }

        // Check stock availability
        if (product.stock < item.quantity) {
          throw AppError.badRequest(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}.`,
            'INSUFFICIENT_STOCK'
          );
        }

        // Snapshot price at time of order
        const itemSubtotal = parseFloat(product.price) * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: parseFloat(product.price),
          subtotal: itemSubtotal
        });
      }

      // Calculate totals
      const discount = 0;
      const total = subtotal - discount;

      // Generate order number
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const shortId = uuidv4().split('-')[0].toUpperCase();
      const order_number = `ORD-${date}-${shortId}`;

      // Create order
      const orderId = await orderRepository.createOrder(connection, {
        user_id: user.id,
        order_number,
        status: 'pending',
        subtotal,
        discount,
        total
      });

      // Create order items & decrement stock
      for (const item of orderItems) {
        await orderRepository.createOrderItem(connection, {
          order_id: orderId,
          ...item
        });

        const stockUpdated = await productRepository.decrementStock(
          connection,
          item.product_id,
          item.quantity
        );

        if (!stockUpdated) {
          throw AppError.badRequest('Stock update failed. Concurrent modification detected.', 'STOCK_UPDATE_FAILED');
        }
      }

      // Commit transaction
      await connection.commit();

      // Return complete order
      const order = await orderRepository.findById(orderId);
      const orderItemsResult = await orderRepository.findItemsByOrderId(orderId);
      return { ...order, items: orderItemsResult };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update order status (admin only)
   * Valid transitions: pending → processing → completed | cancelled
   */
  async updateStatus(id, status) {
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw AppError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await orderRepository.findById(id);
    if (!order) {
      throw AppError.notFound('Order not found.');
    }

    // Business rule: cannot update completed or cancelled orders
    if (order.status === 'completed' || order.status === 'cancelled') {
      throw AppError.badRequest(
        `Cannot update order with status "${order.status}".`,
        'ORDER_FINALIZED'
      );
    }

    await orderRepository.updateStatus(id, status);

    const updated = await orderRepository.findById(id);
    const items = await orderRepository.findItemsByOrderId(id);
    return { ...updated, items };
  }
}

module.exports = new OrderService();
