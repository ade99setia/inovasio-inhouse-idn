const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { create, updateStatus, queryParams } = require('../validations/order.validation');

// All order routes require authentication
router.use(authenticate);

// GET /api/v1/orders
router.get('/', validate(queryParams, 'query'), orderController.getAll);

// GET /api/v1/orders/:id
router.get('/:id', orderController.getById);

// POST /api/v1/orders
router.post('/', validate(create), orderController.create);

// PATCH /api/v1/orders/:id/status (admin only)
router.patch('/:id/status', authorize('admin'), validate(updateStatus), orderController.updateStatus);

module.exports = router;
