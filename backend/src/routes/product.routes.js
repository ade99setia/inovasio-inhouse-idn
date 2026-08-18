const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// Protected routes (admin only)
router.post('/', authenticate, authorize('admin'), ProductController.create);
router.put('/:id', authenticate, authorize('admin'), ProductController.update);
router.delete('/:id', authenticate, authorize('admin'), ProductController.delete);

module.exports = router;
