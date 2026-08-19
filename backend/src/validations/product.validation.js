const Joi = require('joi');

const create = Joi.object({
  sku: Joi.string().max(50).required()
    .messages({ 'any.required': 'SKU is required.' }),
  name: Joi.string().max(150).required()
    .messages({ 'any.required': 'Product name is required.' }),
  price: Joi.number().precision(2).min(0).required()
    .messages({ 'any.required': 'Price is required.', 'number.min': 'Price cannot be negative.' }),
  stock: Joi.number().integer().min(0).default(0)
    .messages({ 'number.min': 'Stock cannot be negative.' }),
  description: Joi.string().allow('', null).optional()
});

const update = Joi.object({
  sku: Joi.string().max(50).optional(),
  name: Joi.string().max(150).optional(),
  price: Joi.number().precision(2).min(0).optional()
    .messages({ 'number.min': 'Price cannot be negative.' }),
  stock: Joi.number().integer().min(0).optional()
    .messages({ 'number.min': 'Stock cannot be negative.' }),
  description: Joi.string().allow('', null).optional()
}).min(1).messages({ 'object.min': 'At least one field must be provided for update.' });

const queryParams = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').default('')
});

module.exports = { create, update, queryParams };
