const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { create, update, queryParams } = require('../validations/product.validation');

// Public routes
router.get('/', validate(queryParams, 'query'), productController.getAll);
router.get('/:id', productController.getById);

// Protected routes (admin only)
router.post('/', authenticate, authorize('admin'), validate(create), productController.create);
router.put('/:id', authenticate, authorize('admin'), validate(update), productController.update);
router.delete('/:id', authenticate, authorize('admin'), productController.delete);

module.exports = router;
