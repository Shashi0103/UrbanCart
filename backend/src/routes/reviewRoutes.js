import express from 'express';
import {
  getProductReviews,
  createProductReview,
  markReviewHelpful,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protect, createProductReview);
router.post('/:id/helpful', protect, markReviewHelpful);

export default router;
