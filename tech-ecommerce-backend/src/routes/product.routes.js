import express from 'express';

import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories } from '../controllers/product.controller.js';

const router = express.Router()

router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/:id', getProductById)


router.post('/', createProduct)
router.put('/:id' , updateProduct)
router.delete('/:id', deleteProduct)

export default router

// router.get('/', getProducts);
// router.get('/:id', getProductById);
// router.get('/categories', getCategories);



// router.post('/', createProduct);
// router.put('/:id', updateProduct);
// router.delete('/:id', deleteProduct);

// export default router