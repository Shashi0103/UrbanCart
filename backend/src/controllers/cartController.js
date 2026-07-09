import Cart from '../models/Cart.js';

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'title price discountPercentage images stock category brand',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync cart items (Saves cart state from frontend Redux)
// @route   POST /api/cart
// @access  Private
export const syncCart = async (req, res) => {
  const { items } = req.body; // Array of { product: id, quantity, color, size }

  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    cart.items = items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      color: item.color,
      size: item.size
    }));

    await cart.save();
    
    // Fetch and populate before returning
    const populatedCart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'title price discountPercentage images stock category brand',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      });

    res.json(populatedCart.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
