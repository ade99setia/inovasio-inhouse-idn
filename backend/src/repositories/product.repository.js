const db = require('../config/database');

class ProductRepository {
  async findAll({ limit, offset, search }) {
    let sql = `SELECT * FROM products`;
    const params = [];

    if (search) {
      sql += ` WHERE name LIKE ? OR sku LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY id ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(sql, params);
    return rows;
  }

  async count({ search }) {
    let sql = `SELECT COUNT(*) AS total FROM products`;
    const params = [];

    if (search) {
      sql += ` WHERE name LIKE ? OR sku LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await db.query(sql, params);
    return rows[0].total;
  }

  async findById(id) {
    const sql = `SELECT * FROM products WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  async findBySku(sku) {
    const sql = `SELECT * FROM products WHERE sku = ?`;
    const [rows] = await db.query(sql, [sku]);
    return rows[0] || null;
  }

  async create({ sku, name, price, stock, description }) {
    const sql = `
      INSERT INTO products (sku, name, price, stock, description)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [sku, name, price, stock || 0, description || null]);
    return { id: result.insertId, sku, name, price, stock: stock || 0, description };
  }

  async update(id, { sku, name, price, stock, description }) {
    const sql = `
      UPDATE products
      SET sku = ?, name = ?, price = ?, stock = ?, description = ?
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [sku, name, price, stock, description, id]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const sql = `DELETE FROM products WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  async decrementStock(connection, productId, quantity) {
    const sql = `
      UPDATE products
      SET stock = stock - ?
      WHERE id = ? AND stock >= ?
    `;
    const [result] = await connection.query(sql, [quantity, productId, quantity]);
    return result.affectedRows > 0;
  }

  async findByIdForUpdate(connection, id) {
    const sql = `SELECT * FROM products WHERE id = ? FOR UPDATE`;
    const [rows] = await connection.query(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = new ProductRepository();
