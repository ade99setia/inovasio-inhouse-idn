const db = require('../config/database');

class UserModel {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Create new user
   */
  static async create({ name, email, password_hash, role = 'customer' }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, role]
    );
    return { id: result.insertId, name, email, role };
  }

  /**
   * Get all users (admin)
   */
  static async findAll() {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY id ASC'
    );
    return rows;
  }

  /**
   * Update user profile
   */
  static async update(id, { name, email }) {
    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;
