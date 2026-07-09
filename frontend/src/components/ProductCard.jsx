import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice.js';
import { toggleWishlistState } from '../redux/slices/wishlistSlice.js';
import { addToast } from '../redux/slices/notificationSlice.js';
import apiService from '../api/apiService.js';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const cartItems = useSelector((state) => state.cart.items);

  const [selectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize] = useState(product.sizes?.[0] || '');

  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  // Toggle Wishlist
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents navigating to details page
    if (!token) {
      dispatch(addToast({ text: 'Please login to manage wishlist', type: 'warning' }));
      navigate('/login');
      return;
    }

    try {
      await apiService.wishlist.toggle(product._id);
      dispatch(toggleWishlistState(product));
      dispatch(
        addToast({
          text: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
          type: 'success'
        })
      );
    } catch (err) {
      console.error(err);
      dispatch(addToast({ text: 'Failed to update wishlist', type: 'error' }));
    }
  };

  // Add to Cart
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents navigating to details page
    if (product.stock === 0) {
      dispatch(addToast({ text: 'Product is out of stock', type: 'warning' }));
      return;
    }

    // Add locally to Redux
    dispatch(addToCart({ product, quantity: 1, color: selectedColor, size: selectedSize }));
    dispatch(addToast({ text: `${product.title} added to cart`, type: 'success' }));

    // Sync to DB if logged in
    if (token) {
      try {
        const existingIndex = cartItems.findIndex(
          (i) =>
            i.product._id === product._id &&
            i.color === selectedColor &&
            i.size === selectedSize
        );

        let updatedCartItems;
        if (existingIndex > -1) {
          updatedCartItems = cartItems.map((item, idx) => {
            const isTarget = idx === existingIndex;
            return {
              product: item.product._id,
              quantity: isTarget 
                ? Math.min(product.stock, item.quantity + 1) 
                : item.quantity,
              color: item.color,
              size: item.size
            };
          });
        } else {
          updatedCartItems = [
            ...cartItems.map((i) => ({
              product: i.product._id,
              quantity: i.quantity,
              color: i.color,
              size: i.size
            })),
            { product: product._id, quantity: 1, color: selectedColor, size: selectedSize }
          ];
        }

        await apiService.cart.sync(updatedCartItems);
      } catch (err) {
        console.error('Failed to sync cart to DB', err);
      }
    }
  };

  const discountPrice = product.price * (1 - (product.discountPercentage || 0) / 100);

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group bg-white border border-slate-200/60 rounded-xl overflow-hidden flat-shadow flat-shadow-hover flex flex-col h-full cursor-pointer transition-transform active:scale-[0.99] select-none"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden select-none">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Percentage Badge */}
        {product.discountPercentage > 0 && (
          <span className="absolute top-3 left-3 bg-green-500 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full z-10 flat-shadow">
            {product.discountPercentage}% OFF
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-secondary/80 backdrop-blur-xs text-gray-400 hover:text-red-500 rounded-full flat-shadow hover:scale-110 transition-all z-20 cursor-pointer"
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Info panel */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand Name */}
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">
          {product.brand?.name || 'UrbanCart'}
        </span>

        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 leading-tight mb-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Rating stars */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(product.rating || 4.5) ? 'fill-amber-400' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium text-gray-500">({product.rating || '4.5'})</span>
        </div>

        {/* Price & Add button footer */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">₹{discountPrice.toFixed(2)}</span>
            {product.discountPercentage > 0 && (
              <span className="text-[10px] text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-primary text-secondary px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-primary/95 disabled:bg-slate-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
