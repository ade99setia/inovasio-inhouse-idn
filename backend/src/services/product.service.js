const productRepository = require('../repositories/product.repository');
const AppError = require('../utils/AppError');

class ProductService {
  /**
   * Get all products with pagination & search
   */
  async getAll({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      productRepository.findAll({ limit, offset, search }),
      productRepository.count({ search })
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get product by ID
   */
  async getById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found.');
    }
    return product;
  }

  /**
   * Create new product
   */
  async create({ sku, name, price, stock, description }) {
    // Check duplicate SKU
    const existing = await productRepository.findBySku(sku);
    if (existing) {
      throw AppError.conflict('SKU already exists.', 'DUPLICATE_SKU');
    }

    // Validate price
    if (price < 0) {
      throw AppError.badRequest('Price cannot be negative.');
    }

    // Validate stock
    if (stock !== undefined && stock < 0) {
      throw AppError.badRequest('Stock cannot be negative.');
    }

    return productRepository.create({ sku, name, price, stock, description });
  }

  /**
   * Update product
   */
  async update(id, { sku, name, price, stock, description }) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found.');
    }

    // Check SKU conflict if changed
    if (sku && sku !== product.sku) {
      const existing = await productRepository.findBySku(sku);
      if (existing) {
        throw AppError.conflict('SKU already exists.', 'DUPLICATE_SKU');
      }
    }

    // Validate price
    if (price !== undefined && price < 0) {
      throw AppError.badRequest('Price cannot be negative.');
    }

    // Validate stock
    if (stock !== undefined && stock < 0) {
      throw AppError.badRequest('Stock cannot be negative.');
    }

    const updated = await productRepository.update(id, {
      sku: sku || product.sku,
      name: name || product.name,
      price: price !== undefined ? price : product.price,
      stock: stock !== undefined ? stock : product.stock,
      description: description !== undefined ? description : product.description
    });

    if (!updated) {
      throw AppError.internal('Failed to update product.');
    }

    return productRepository.findById(id);
  }

  /**
   * Delete product
   */
  async delete(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found.');
    }

    const deleted = await productRepository.delete(id);
    if (!deleted) {
      throw AppError.internal('Failed to delete product.');
    }

    return true;
  }
}

module.exports = new ProductService();
