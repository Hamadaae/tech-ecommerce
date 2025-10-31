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
  updateOrderToPaid,
  cancelUnpaidOrder
} from '../controllers/order.controller.js';

const router = express.Router();

// User Routes 
router.post('/', authMiddleware, createOrder);          
router.get('/my', authMiddleware, getMyOrders);         
router.get('/:id', authMiddleware, getOrderById);       
router.put('/:id/pay', authMiddleware, updateOrderToPaid); 
router.delete('/:id/cancel', authMiddleware, cancelUnpaidOrder);

// Admin Routes 
router.get('/', authMiddleware, adminMiddleware, getAllOrders); 
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus); 
router.delete('/:id', authMiddleware, adminMiddleware, deleteOrder); 

export default router;
