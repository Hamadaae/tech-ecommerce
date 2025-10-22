import express from 'express';
import upload from '../middleware/upload.middleware.js';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories } from '../controllers/product.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router()
// Public Routes
router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/:id', getProductById)

// Private/Protected Routes
router.post('/', authMiddleware, upload.single('image'), createProduct)
router.put('/:id', authMiddleware, upload.single('image'), updateProduct)
router.delete('/:id', authMiddleware, deleteProduct)

export default router
