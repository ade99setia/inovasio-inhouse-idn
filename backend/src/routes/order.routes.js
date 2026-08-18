const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All order routes require authentication
router.use(authenticate);

// Customer & Admin
router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getById);
router.post('/', OrderController.create);

// Admin only
router.patch('/:id/status', authorize('admin'), OrderController.updateStatus);

module.exports = router;
