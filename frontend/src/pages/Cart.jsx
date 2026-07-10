import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  removeFromCart, 
  updateQuantity, 
  applyCoupon, 
  removeCoupon,
  setCartItems
} from '../redux/slices/cartSlice.js';
import { toggleWishlistState } from '../redux/slices/wishlistSlice.js';
import { addToast } from '../redux/slices/notificationSlice.js';
import apiService from '../api/apiService.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { 
  Trash2, 
  Heart, 
  Tag, 
  ArrowRight, 
  ShoppingBag, 
  Percent, 
  Plus, 
  Minus,
  Truck,
  Check
} from 'lucide-react';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Sync cart from DB on load if logged in
  useEffect(() => {
    if (token) {
      apiService.cart.get()
        .then((items) => {
          dispatch(setCartItems(items));
        })
        .catch((err) => console.error('Failed to fetch DB cart', err));
    }
  }, [token, dispatch]);

  const handleQtyChange = async (productId, quantity, color, size) => {
    if (quantity <= 0) {
      await handleRemove(productId, color, size);
      return;
    }

    dispatch(updateQuantity({ productId, quantity, color, size }));

    if (token) {
      try {
        const updatedItems = cart.items.map((item) => {
          if (item.product._id === productId && item.color === color && item.size === size) {
            return { ...item, quantity };
          }
          return item;
        }).map(i => ({
          product: i.product._id,
          quantity: i.quantity,
          color: i.color,
          size: i.size
        }));
        await apiService.cart.sync(updatedItems);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRemove = async (productId, color, size) => {
    dispatch(removeFromCart({ productId, color, size }));
    dispatch(addToast({ text: 'Item removed from cart', type: 'info' }));

    if (token) {
      try {
        const updatedItems = cart.items.filter(
          (item) => !(item.product._id === productId && item.color === color && item.size === size)
        ).map(i => ({
          product: i.product._id,
          quantity: i.quantity,
          color: i.color,
          size: i.size
        }));
        await apiService.cart.sync(updatedItems);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Save for Later (move item from cart to wishlist)
  const handleSaveForLater = async (item) => {
    if (!token) {
      dispatch(addToast({ text: 'Please login to save items', type: 'warning' }));
      navigate('/login');
      return;
    }

    try {
      // Toggle wishlist state
      const alreadyWishlisted = (wishlistItems || []).filter(Boolean).some((w) => w._id === item.product._id);
      if (!alreadyWishlisted) {
        await apiService.wishlist.toggle(item.product._id);
        dispatch(toggleWishlistState(item.product));
      }

      // Remove from cart
      await handleRemove(item.product._id, item.color, item.size);
      dispatch(addToast({ text: 'Moved item to Wishlist', type: 'success' }));
    } catch (err) {
      console.error(err);
    }
  };

  // Validate coupon
  const handleCouponApply = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (!token) {
      dispatch(addToast({ text: 'Please login to apply coupons', type: 'warning' }));
      navigate('/login');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      // Calculate price of products after static product discounts
      const productDiscount = cart.items.reduce((acc, item) => {
        const disc = item.product.discountPercentage || 0;
        return acc + (item.product.price * (disc / 100) * item.quantity);
      }, 0);
      const subtotalAfterProductDiscount = cart.itemsPrice - productDiscount;

      const coupon = await apiService.coupons.validate(couponCode, subtotalAfterProductDiscount);
      dispatch(applyCoupon(coupon));
      dispatch(addToast({ text: `Coupon ${coupon.code} applied successfully!`, type: 'success' }));
      setCouponCode('');
    } catch (err) {
      dispatch(addToast({ text: err.response?.data?.message || 'Invalid coupon code', type: 'error' }));
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Free shipping tracker info
  const threshold = 4999;
  const netProductTotal = cart.itemsPrice - cart.discountPrice;
  const remainingForFreeShipping = threshold - netProductTotal;

  if (cart.items.length === 0) {
    return (
      <div className="bg-[#F5F5F5] min-h-screen flex flex-col">
        <Breadcrumbs paths={[{ name: 'Home', url: '/' }, { name: 'Cart', url: '/cart' }]} />
        
        {/* Beautiful empty state */}
        <div className="max-w-md mx-auto my-auto py-16 px-6 text-center bg-white border border-slate-200 rounded-2xl flat-shadow flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-sm text-gray-400 mt-2">
            Looks like you haven't added anything to your cart yet. Browse our products to find the best deals.
          </p>
          <Link
            to="/products"
            className="bg-primary text-secondary px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors mt-6 inline-block cursor-pointer flat-shadow active:scale-95"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Breadcrumbs paths={[{ name: 'Home', url: '/' }, { name: 'Cart', url: '/cart' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Column 1: Items List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Free Shipping Tracker */}
            {remainingForFreeShipping > 0 && cart.itemsPrice > 0 ? (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 text-sm text-blue-800 flat-shadow select-none">
                <Truck className="w-5 h-5 text-primary shrink-0" />
                <p>
                  Add <strong className="font-bold">₹{remainingForFreeShipping.toFixed(2)}</strong> more to get <strong>Free Express Shipping</strong>!
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3 text-sm text-green-800 flat-shadow select-none">
                <Check className="w-5 h-5 text-green-600 shrink-0" />
                <p>Congratulations! Your order qualifies for <strong>Free Express Shipping</strong>.</p>
              </div>
            )}

            {/* List box */}
            <div className="bg-white border border-slate-200 rounded-xl flat-shadow overflow-hidden divide-y divide-slate-100">
              {cart.items.map((item, idx) => {
                const discountItemPrice = item.product.price * (1 - (item.product.discountPercentage || 0) / 100);
                return (
                  <div key={idx} className="p-4 sm:p-5 flex gap-4 flex-col sm:flex-row justify-between">
                    
                    {/* Thumbnail & Title */}
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                        <img src={item.product.images[0]} alt={item.product.title} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="space-y-1">
                        <Link to={`/product/${item.product._id}`} className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-2">
                          {item.product.title}
                        </Link>
                        
                        {/* Selected options tags */}
                        <div className="flex flex-wrap gap-2 pt-1 select-none">
                          {item.color && (
                            <span className="text-[10px] bg-slate-100 text-gray-500 font-medium px-2 py-0.5 rounded">
                              Color: {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="text-[10px] bg-slate-100 text-gray-500 font-medium px-2 py-0.5 rounded">
                              Size: {item.size}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions and Quantity adjustments */}
                    <div className="flex sm:flex-col justify-between items-end gap-3 flex-row border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                      
                      {/* Pricing */}
                      <div className="flex flex-col text-right">
                        <span className="text-sm font-bold text-gray-900">₹{(discountItemPrice * item.quantity).toFixed(2)}</span>
                        {item.product.discountPercentage > 0 && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Controls bar */}
                      <div className="flex items-center gap-4 select-none">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button
                            onClick={() => handleQtyChange(item.product._id, item.quantity - 1, item.color, item.size)}
                            className="px-2 py-1 text-gray-500 hover:text-gray-950 font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 py-0.5 text-xs font-semibold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(item.product._id, item.quantity + 1, item.color, item.size)}
                            className="px-2 py-1 text-gray-500 hover:text-gray-950 font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Save for later / Trash */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveForLater(item)}
                            className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                            title="Save for Later"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemove(item.product._id, item.color, item.size)}
                            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-xs">
              <Link to="/products" className="text-primary hover:underline font-semibold flex items-center gap-1">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Column 2: Order Price Summary & Promo Codes */}
          <div className="space-y-6">
            
            {/* Promo coupon form */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flat-shadow space-y-4">
              <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1.5 select-none">
                <Tag className="w-4 h-4 text-primary" /> Apply Promo Coupon
              </h3>
              
              {cart.coupon ? (
                <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 flex items-center justify-between text-xs text-green-800">
                  <span className="font-semibold flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" /> Coupon: {cart.coupon.code} Applied
                  </span>
                  <button
                    onClick={() => dispatch(removeCoupon())}
                    className="text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponApply} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (WELCOME10)..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="bg-primary text-secondary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-colors disabled:bg-slate-200 disabled:text-gray-400 cursor-pointer"
                  >
                    {isValidatingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            {/* Price Detail Summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flat-shadow space-y-4">
              <h3 className="text-sm font-bold text-gray-950 border-b border-slate-100 pb-3 select-none">Price Details</h3>
              
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Price ({cart.items.length} items)</span>
                  <span className="font-medium text-gray-950">₹{cart.itemsPrice.toFixed(2)}</span>
                </div>
                {cart.discountPrice > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{cart.discountPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-medium text-gray-950">
                    {cart.shippingPrice === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      `₹${cart.shippingPrice.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-medium text-gray-950">₹{cart.taxPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-sm text-gray-950">
                <span>Total Amount</span>
                <span>₹{cart.totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary text-secondary py-3 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 flat-shadow active:scale-95 cursor-pointer"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
