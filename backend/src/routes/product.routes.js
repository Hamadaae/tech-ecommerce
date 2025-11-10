import express from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../controllers/product.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();
// Public Routes
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);
// router.get('/search', searchProducts);

// Private/Protected Routes
// Admin-only product management
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
