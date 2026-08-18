const db = require('../config/database');

class ProductModel {
  /**
   * Get all products with optional pagination & search
   */
  static async findAll({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM products';
    let countQuery = 'SELECT COUNT(*) AS total FROM products';
    const params = [];
    const countParams = [];

    if (search) {
      const searchClause = ' WHERE name LIKE ? OR sku LIKE ?';
      query += searchClause;
      countQuery += searchClause;
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY id ASC LIMIT ? OFFSET ?';
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
   * Find product by ID
   */
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Find product by SKU
   */
  static async findBySku(sku) {
    const [rows] = await db.query('SELECT * FROM products WHERE sku = ?', [sku]);
    return rows[0] || null;
  }

  /**
   * Create new product
   */
  static async create({ sku, name, price, stock, description }) {
    const [result] = await db.query(
      'INSERT INTO products (sku, name, price, stock, description) VALUES (?, ?, ?, ?, ?)',
      [sku, name, price, stock || 0, description || null]
    );
    return { id: result.insertId, sku, name, price, stock, description };
  }

  /**
   * Update product
   */
  static async update(id, { sku, name, price, stock, description }) {
    const [result] = await db.query(
      'UPDATE products SET sku = ?, name = ?, price = ?, stock = ?, description = ? WHERE id = ?',
      [sku, name, price, stock, description, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete product
   */
  static async delete(id) {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * Update stock (decrement)
   */
  static async decrementStock(id, quantity) {
    const [result] = await db.query(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantity, id, quantity]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ProductModel;
