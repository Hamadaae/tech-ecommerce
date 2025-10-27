// controllers/product.controller.js
import Product from '../models/Product.js';


export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      q,               
      search,          
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const numericPage = Math.max(1, parseInt(page));
    const numericLimit = Math.max(1, parseInt(limit));
    const skip = (numericPage - 1) * numericLimit;

    const filter = {};
    if (category) filter.category = category;

    const searchTerm = search || q;
    let query;
    if (searchTerm && searchTerm.trim() !== '') {
      query = Product.find(
        { $text: { $search: searchTerm } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });
    } else {
      query = Product.find(filter);
      let sortObj = { createdAt: -1 };
      if (sort) {
        const [field, dir] = sort.split(':');
        sortObj = { [field]: dir === 'asc' ? 1 : -1 };
      }
      query = query.sort(sortObj);
    }

    const [products, total] = await Promise.all([
      query.skip(skip).limit(numericLimit).lean(),
      Product.countDocuments(
        searchTerm ? { $text: { $search: searchTerm } } : filter
      ),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / numericLimit));

    return res.json({
      data: products,
      meta: {
        total,
        page: numericPage,
        totalPages,
        limit: numericLimit,
        search: searchTerm || null,
      },
    });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};


export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      const err = new Error("Product not found");
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
    const newProduct = new Product(req.body);
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
      const err = new Error("Product not found");
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
      const err = new Error("Product not found");
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
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
    ]);
    return res.json(categories);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};

// export const searchProducts = async (req, res, next) => {
//   try {
//     const { query } = req.query;

//     if (!query || query.trim() === '') {
//       return res.status(400).json({ message: 'Search query is required' });
//     }

//     const results = await Product.find(
//       { $text: { $search: query } },
//       { score: { $meta: 'textScore' } }
//     )
//       .sort({ score: { $meta: 'textScore' } })
//       .limit(20);

//     res.status(200).json(results);
//   } catch (error) {
//     next(error);
//   }
// };