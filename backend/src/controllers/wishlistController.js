import Wishlist from '../models/Wishlist.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'title price discountPercentage images stock rating');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json((wishlist.products || []).filter(p => p !== null));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle wishlist item (add if not exists, remove if exists)
// @route   POST /api/wishlist/:productId
// @access  Private
export const toggleWishlistItem = async (req, res) => {
  const { productId } = req.params;

  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);

    if (index === -1) {
      wishlist.products.push(productId);
    } else {
      wishlist.products.splice(index, 1);
    }

    await wishlist.save();

    const populatedWishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'title price discountPercentage images stock rating');

    res.json((populatedWishlist.products || []).filter(p => p !== null));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
