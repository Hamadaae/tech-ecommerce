// controllers/product.controller.js
import Product from '../models/Product.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const products = await Product.find(filter).lean();
    return res.json(products);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      return next(err);
    }
    return res.json(product);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    
    // If there's a file uploaded, add the image path
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }
    
    const newProduct = new Product(productData);
    await newProduct.save();
    return res.status(201).json(newProduct);
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    return next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      return next(err);
    }
    return res.json(updated);
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    return next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      return next(err);
    }
    return res.json(deleted);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, category: '$_id', count: 1 } }
    ]);
    return res.json(categories);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};
