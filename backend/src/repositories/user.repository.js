const db = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    const sql = `
      SELECT id, name, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE email = ?
    `;
    const [rows] = await db.query(sql, [email]);
    return rows[0] || null;
  }

  async findById(id) {
    const sql = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  async create({ name, email, password_hash, role }) {
    const sql = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [name, email, password_hash, role]);
    return { id: result.insertId, name, email, role };
  }

  async findAll({ limit, offset }) {
    const sql = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [limit, offset]);
    return rows;
  }

  async count() {
    const sql = `SELECT COUNT(*) AS total FROM users`;
    const [rows] = await db.query(sql);
    return rows[0].total;
  }
}

module.exports = new UserRepository();
