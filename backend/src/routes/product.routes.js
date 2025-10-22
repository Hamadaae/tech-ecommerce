import express from 'express';

import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories } from '../controllers/product.controller.js';

import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router()
// Public Routes
router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/:id', getProductById)

// Private/Protected Routes
router.post('/', authMiddleware ,createProduct)
router.put('/:id', authMiddleware , updateProduct)
router.delete('/:id', authMiddleware , deleteProduct)

export default router
