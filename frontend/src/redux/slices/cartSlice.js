import { createSlice } from '@reduxjs/toolkit';

const getProductId = (product) => {
  if (!product) return '';
  return typeof product === 'object' ? (product._id || product) : product;
};

const storedCart = localStorage.getItem('urbancart_cart')
  ? JSON.parse(localStorage.getItem('urbancart_cart'))
  : [];

const initialState = {
  items: storedCart,
  coupon: null, // { code, discountType, discountAmount }
  shippingPrice: 0,
  taxPrice: 0,
  itemsPrice: 0,
  discountPrice: 0,
  totalPrice: 0
};

const calculateTotals = (state) => {
  // Calculate price of items before discount
  state.itemsPrice = state.items.reduce((acc, item) => {
    return acc + (item.product.price * item.quantity);
  }, 0);

  // Calculate discount from discountPercentage of products
  const productDiscount = state.items.reduce((acc, item) => {
    const disc = item.product.discountPercentage || 0;
    return acc + (item.product.price * (disc / 100) * item.quantity);
  }, 0);

  // Apply Coupon code discount
  let couponDiscount = 0;
  if (state.coupon) {
    if (state.coupon.discountType === 'percentage') {
      couponDiscount = (state.itemsPrice - productDiscount) * (state.coupon.discountAmount / 100);
    } else if (state.coupon.discountType === 'fixed') {
      couponDiscount = state.coupon.discountAmount;
    }
  }

  state.discountPrice = parseFloat((productDiscount + couponDiscount).toFixed(2));
  
  const priceAfterDiscount = state.itemsPrice - state.discountPrice;

  // Free shipping on orders over ₹4,999, else ₹150
  state.shippingPrice = state.itemsPrice > 0 && priceAfterDiscount >= 4999 ? 0 : (state.itemsPrice > 0 ? 150 : 0);
  
  // 5% tax
  state.taxPrice = parseFloat((priceAfterDiscount * 0.05).toFixed(2));

  // Total price
  state.totalPrice = parseFloat((priceAfterDiscount + state.shippingPrice + state.taxPrice).toFixed(2));
  if (state.totalPrice < 0) state.totalPrice = 0;

  localStorage.setItem('urbancart_cart', JSON.stringify(state.items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems(state, action) {
      state.items = action.payload;
      calculateTotals(state);
    },
    addToCart(state, action) {
      const { product, quantity, color, size } = action.payload;
      const existingItem = state.items.find(
        (item) =>
          getProductId(item.product) === getProductId(product) &&
          item.color === color &&
          item.size === size
      );

      if (existingItem) {
        existingItem.quantity = Math.min(product.stock, existingItem.quantity + quantity);
      } else {
        state.items.push({ product, quantity, color, size });
      }
      calculateTotals(state);
    },
    updateQuantity(state, action) {
      const { productId, quantity, color, size } = action.payload;
      const item = state.items.find(
        (item) =>
          getProductId(item.product) === productId &&
          item.color === color &&
          item.size === size
      );
      if (item) {
        item.quantity = Math.max(1, Math.min(item.product.stock, quantity));
      }
      calculateTotals(state);
    },
    removeFromCart(state, action) {
      const { productId, color, size } = action.payload;
      state.items = state.items.filter(
        (item) =>
          !(getProductId(item.product) === productId && item.color === color && item.size === size)
      );
      calculateTotals(state);
    },
    applyCoupon(state, action) {
      state.coupon = action.payload; // { code, discountType, discountAmount }
      calculateTotals(state);
    },
    removeCoupon(state) {
      state.coupon = null;
      calculateTotals(state);
    },
    clearCart(state) {
      state.items = [];
      state.coupon = null;
      state.shippingPrice = 0;
      state.taxPrice = 0;
      state.itemsPrice = 0;
      state.discountPrice = 0;
      state.totalPrice = 0;
      localStorage.removeItem('urbancart_cart');
    }
  }
});

export const {
  setCartItems,
  addToCart,
  updateQuantity,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
