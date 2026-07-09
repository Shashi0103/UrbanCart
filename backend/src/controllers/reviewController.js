import Review from '../models/Review.js';
import Product from '../models/Product.js';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create/Update product review
// @route   POST /api/reviews/product/:productId
// @access  Private
export const createProductReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment, images } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (alreadyReviewed) {
      // Update existing review instead of erroring out
      alreadyReviewed.rating = rating;
      alreadyReviewed.comment = comment;
      alreadyReviewed.images = images || alreadyReviewed.images;
      await alreadyReviewed.save();
    } else {
      // Create new review
      await Review.create({
        user: req.user._id,
        product: productId,
        rating: Number(rating),
        comment,
        images: images || []
      });
    }

    // Recalculate product rating
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    product.rating = parseFloat(avgRating.toFixed(1));
    await product.save();

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const markReviewHelpful = async (req, res) => {
  const { id } = req.params;

  try {
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already marked helpful
    const hasVoted = review.helpfulUsers.includes(req.user._id);

    if (hasVoted) {
      // Toggle off / remove helpful vote
      review.helpfulUsers = review.helpfulUsers.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
    } else {
      // Add helpful vote
      review.helpfulUsers.push(req.user._id);
    }

    review.helpfulCount = review.helpfulUsers.length;
    await review.save();

    res.json({ helpfulCount: review.helpfulCount, hasVoted: !hasVoted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
