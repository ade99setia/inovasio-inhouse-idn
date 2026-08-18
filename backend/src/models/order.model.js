const db = require('../config/database');

class OrderModel {
  /**
   * Get all orders with pagination
   * Optionally filter by user_id
   */
  static async findAll({ page = 1, limit = 10, userId = null, status = null }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) AS total FROM orders o';
    const params = [];
    const countParams = [];
    const conditions = [];

    if (userId) {
      conditions.push('o.user_id = ?');
      params.push(userId);
      countParams.push(userId);
    }

    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
      countParams.push(status);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Find order by ID with items
   */
  static async findById(id) {
    const [orders] = await db.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (!orders[0]) return null;

    const [items] = await db.query(
      `SELECT oi.*, p.name AS product_name, p.sku AS product_sku
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    return { ...orders[0], items };
  }

  /**
   * Find order by order_number
   */
  static async findByOrderNumber(orderNumber) {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE order_number = ?',
      [orderNumber]
    );
    return rows[0] || null;
  }

  /**
   * Create order with items (transaction)
   */
  static async create({ user_id, order_number, items }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Calculate totals
      let subtotal = 0;
      for (const item of items) {
        subtotal += item.unit_price * item.quantity;
      }
      const discount = 0;
      const total = subtotal - discount;

      // Insert order
      const [orderResult] = await connection.query(
        `INSERT INTO orders (user_id, order_number, status, subtotal, discount, total)
         VALUES (?, ?, 'pending', ?, ?, ?)`,
        [user_id, order_number, subtotal, discount, total]
      );
      const orderId = orderResult.insertId;

      // Insert order items & decrement stock
      for (const item of items) {
        // Insert item
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.unit_price, item.unit_price * item.quantity]
        );

        // Decrement stock
        const [stockResult] = await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [item.quantity, item.product_id, item.quantity]
        );

        if (stockResult.affectedRows === 0) {
          throw new Error(`Insufficient stock for product ID ${item.product_id}`);
        }
      }

      await connection.commit();
      return { id: orderId, order_number, status: 'pending', subtotal, discount, total };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update order status
   */
  static async updateStatus(id, status) {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = OrderModel;
