const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { register, login } = require('../validations/auth.validation');

// POST /api/v1/auth/register
router.post('/register', validate(register), authController.register);

// POST /api/v1/auth/login
router.post('/login', validate(login), authController.login);

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.me);

module.exports = router;
