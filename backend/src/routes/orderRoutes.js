import express from 'express';
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getDashboardAnalytics
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addOrderItems);
router.get('/my-orders', protect, getMyOrders);
router.get('/admin/analytics', protect, admin, getDashboardAnalytics);
router.get('/:id', protect, getOrderById);

// Admin Routes
router.get('/', protect, admin, getOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
