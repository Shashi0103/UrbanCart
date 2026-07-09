import express from 'express';
import {
  createCheckoutSession,
  confirmOrderPayment,
  stripeWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/confirm', protect, confirmOrderPayment);

// Webhook listener should be accessible without token protection
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
