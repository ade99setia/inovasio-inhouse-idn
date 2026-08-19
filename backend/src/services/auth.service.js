const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password, role }) {
    // Check existing user
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw AppError.conflict('Email already registered.', 'EMAIL_EXISTS');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await userRepository.create({
      name,
      email,
      password_hash,
      role: role || 'customer'
    });

    // Generate token
    const token = this._generateToken(user);

    return { user, token };
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    // Find user (includes password_hash for comparison)
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    // Generate token
    const token = this._generateToken(user);

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found.');
    }
    return user;
  }

  /**
   * Generate JWT token
   * Only includes identity data - no sensitive info
   */
  _generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }
}

module.exports = new AuthService();
