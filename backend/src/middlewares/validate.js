/**
 * Middleware: Request Validation using Joi
 * Validates body, params, or query against a Joi schema
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => detail.message).join('; ');
      return res.status(422).json({
        success: false,
        message: messages,
        error: {
          code: 'VALIDATION_ERROR',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    // Replace request source with validated/sanitized value
    req[source] = value;
    next();
  };
};

module.exports = validate;
