const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({ 'any.required': 'Name is required.' }),
  email: Joi.string().email().max(150).required()
    .messages({ 'any.required': 'Email is required.', 'string.email': 'Invalid email format.' }),
  password: Joi.string().min(6).max(100).required()
    .messages({ 'any.required': 'Password is required.', 'string.min': 'Password must be at least 6 characters.' }),
  role: Joi.string().valid('admin', 'customer').default('customer')
});

const login = Joi.object({
  email: Joi.string().email().required()
    .messages({ 'any.required': 'Email is required.', 'string.email': 'Invalid email format.' }),
  password: Joi.string().required()
    .messages({ 'any.required': 'Password is required.' })
});

module.exports = { register, login };
