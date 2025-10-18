import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import adminMiddleware from '../middleware/admin.middleware.js';
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderToPaid
} from '../controllers/order.controller.js';

const router = express.Router();

// 🧍‍♂️ User Routes (Protected)
router.post('/', authMiddleware, createOrder);          // Create new order
router.get('/my', authMiddleware, getMyOrders);         // Get user's own orders
router.get('/:id', authMiddleware, getOrderById);       // Get specific order by ID
router.put('/:id/pay', authMiddleware, updateOrderToPaid); // Mark order as paid

// 🛠️ Admin Routes (Protected + Admin)
router.get('/', authMiddleware, adminMiddleware, getAllOrders); // List all orders
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus); // Update order status
router.delete('/:id', authMiddleware, adminMiddleware, deleteOrder); // Delete order

export default router;
