const db = require('../config/database');

class OrderRepository {
  async findAll({ limit, offset, userId, status }) {
    let sql = `
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (userId) {
      conditions.push('o.user_id = ?');
      params.push(userId);
    }

    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(sql, params);
    return rows;
  }

  async count({ userId, status }) {
    let sql = `SELECT COUNT(*) AS total FROM orders o`;
    const params = [];
    const conditions = [];

    if (userId) {
      conditions.push('o.user_id = ?');
      params.push(userId);
    }

    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await db.query(sql, params);
    return rows[0].total;
  }

  async findById(id) {
    const sql = `
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  async findItemsByOrderId(orderId) {
    const sql = `
      SELECT oi.*, p.name AS product_name, p.sku AS product_sku
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
    const [rows] = await db.query(sql, [orderId]);
    return rows;
  }

  async createOrder(connection, { user_id, order_number, status, subtotal, discount, total }) {
    const sql = `
      INSERT INTO orders (user_id, order_number, status, subtotal, discount, total)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.query(sql, [user_id, order_number, status, subtotal, discount, total]);
    return result.insertId;
  }

  async createOrderItem(connection, { order_id, product_id, quantity, unit_price, subtotal }) {
    const sql = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.query(sql, [order_id, product_id, quantity, unit_price, subtotal]);
  }

  async updateStatus(id, status) {
    const sql = `UPDATE orders SET status = ? WHERE id = ?`;
    const [result] = await db.query(sql, [status, id]);
    return result.affectedRows > 0;
  }

  async getConnection() {
    return db.getConnection();
  }
}

module.exports = new OrderRepository();
