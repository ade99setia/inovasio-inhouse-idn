const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

class AuthController {
  /**
   * POST /api/auth/register
   * Register new user
   */
  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Name, email, and password are required.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters.'
        });
      }

      // Check existing user
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          message: 'Email already registered.'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Create user
      const user = await UserModel.create({
        name,
        email,
        password_hash,
        role: role || 'customer'
      });

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Register Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login user and return JWT
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required.'
        });
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password.'
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password.'
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        status: 'success',
        message: 'Login successful.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }

  /**
   * GET /api/auth/profile
   * Get current user profile (requires auth)
   */
  static async profile(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found.'
        });
      }

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      console.error('Profile Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
    }
  }
}

module.exports = AuthController;
