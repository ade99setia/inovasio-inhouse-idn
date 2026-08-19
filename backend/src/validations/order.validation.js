const Joi = require('joi');

const create = Joi.object({
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.number().integer().positive().required()
        .messages({ 'any.required': 'product_id is required.' }),
      quantity: Joi.number().integer().positive().required()
        .messages({ 'any.required': 'quantity is required.', 'number.positive': 'Quantity must be greater than 0.' })
    })
  ).min(1).required()
    .messages({ 'any.required': 'Items array is required.', 'array.min': 'Order must contain at least one item.' })
});

const updateStatus = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled').required()
    .messages({
      'any.required': 'Status is required.',
      'any.only': 'Status must be one of: pending, processing, completed, cancelled.'
    })
});

const queryParams = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled').optional()
});

module.exports = { create, updateStatus, queryParams };
