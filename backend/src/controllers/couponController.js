import Coupon from '../models/Coupon.js';

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
  const { code, purchaseAmount } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon code not found' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is inactive' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (purchaseAmount < coupon.minPurchase) {
      return res.status(400).json({ 
        message: `Minimum purchase amount of $${coupon.minPurchase} is required for this coupon` 
      });
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  const { code, discountType, discountAmount, minPurchase, expiryDate } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
      return res.status(400).json({ message: 'Coupon with this code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountAmount,
      minPurchase: minPurchase || 0,
      expiryDate
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  const { id } = req.params;
  const { discountType, discountAmount, minPurchase, expiryDate, isActive } = req.body;

  try {
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.discountType = discountType || coupon.discountType;
    coupon.discountAmount = discountAmount !== undefined ? discountAmount : coupon.discountAmount;
    coupon.minPurchase = minPurchase !== undefined ? minPurchase : coupon.minPurchase;
    coupon.expiryDate = expiryDate || coupon.expiryDate;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await Coupon.deleteOne({ _id: id });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
