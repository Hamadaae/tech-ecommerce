// controllers/product.controller.js
import Product from '../models/Product.js';



export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      q,               // legacy query name
      search,          // preferred search param
      sort,            // expected format: "price:asc" or "rating:desc"
      page = 1,
      limit = 10,
    } = req.query;

    const numericPage = Math.max(1, parseInt(page, 10) || 1);
    const numericLimit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (numericPage - 1) * numericLimit;

    const filter = {};
    if (category) filter.category = category;

    const searchTerm = (search || q || '').trim();
    // Build optional sort object from "field:dir"
    let sortObj = null;
    if (sort && typeof sort === 'string' && sort.includes(':')) {
      const [field, dir] = sort.split(':');
      // default to descending if dir is not 'asc'
      sortObj = { [field]: dir === 'asc' ? 1 : -1 };
    }

    let query;
    if (searchTerm !== '') {
      // Use text search. If sortObj exists, apply score first then requested field.
      const baseQuery = Product.find(
        { $text: { $search: searchTerm } },
        { score: { $meta: 'textScore' } }
      );

      if (sortObj) {
        // Put text score first to preserve relevance, then secondary sort
        query = baseQuery.sort({ score: { $meta: 'textScore' }, ...sortObj });
      } else {
        query = baseQuery.sort({ score: { $meta: 'textScore' } });
      }
    } else {
      // No search term - regular find with optional category filter and sort
      query = Product.find(filter);
      if (sortObj) {
        query = query.sort(sortObj);
      } else {
        // default fallback sort
        query = query.sort({ createdAt: -1 });
      }
    }

    const [products, total] = await Promise.all([
      query.skip(skip).limit(numericLimit).lean(),
      Product.countDocuments(searchTerm ? { $text: { $search: searchTerm } } : filter),
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