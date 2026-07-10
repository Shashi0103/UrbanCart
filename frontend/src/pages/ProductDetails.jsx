import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice.js';
import { toggleWishlistState } from '../redux/slices/wishlistSlice.js';
import { addToast } from '../redux/slices/notificationSlice.js';
import apiService from '../api/apiService.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ProductDetailsSkeleton } from '../components/SkeletonLoader.jsx';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle,
  ThumbsUp,
  Image as ImageIcon,
  Sparkles,
  Zap
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { token, user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const cartItems = useSelector((state) => state.cart.items);

  // Gallery and Detail options
  const [activeImage, setActiveImage] = useState('');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImage, setReviewImage] = useState('');

  // 1. Fetch Product details
  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiService.products.getById(id),
    retry: 1
  });

  // Sync active images and defaults when product data arrives
  useEffect(() => {
    if (product) {
      setActiveImage(product.images?.[0] || '');
      setSelectedColor(product.colors?.[0] || '');
      setSelectedSize(product.sizes?.[0] || '');
      setQuantity(1);
    }
    window.scrollTo(0, 0);
  }, [product, id]);

  // 2. Fetch reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => apiService.reviews.getByProductId(id),
    enabled: !!id
  });

  // 3. Fetch AI recommendations
  const { data: similarProducts = [] } = useQuery({
    queryKey: ['similar-products', id],
    queryFn: () => apiService.products.getAiRecommendations({ type: 'similarProducts', productId: id }),
    enabled: !!id
  });

  const { data: frequentlyBought = [] } = useQuery({
    queryKey: ['frequently-bought', id],
    queryFn: () => apiService.products.getAiRecommendations({ type: 'frequentlyBoughtTogether', productId: id }),
    enabled: !!id
  });

  const isWishlisted = (wishlistItems || []).filter(Boolean).some((item) => item._id === id);

  // 4. Hover Zoom logic
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  // 5. Add to Cart Mutation
  const handleAddToCart = async (buyNow = false) => {
    if (product.stock === 0) {
      dispatch(addToast({ text: 'Product is out of stock', type: 'warning' }));
      return;
    }

    dispatch(addToCart({ product, quantity, color: selectedColor, size: selectedSize }));
    dispatch(addToast({ text: `${product.title} added to cart`, type: 'success' }));

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
                ? Math.min(product.stock, item.quantity + quantity) 
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
            { product: product._id, quantity, color: selectedColor, size: selectedSize }
          ];
        }

        await apiService.cart.sync(updatedCartItems);
      } catch (err) {
        console.error(err);
      }
    }

    if (buyNow) {
      navigate('/cart');
    }
  };

  // 6. Wishlist Action
  const handleWishlistToggle = async () => {
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

  // 7. Post Review mutation
  const postReviewMutation = useMutation({
    mutationFn: (data) => apiService.reviews.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      dispatch(addToast({ text: 'Review submitted successfully', type: 'success' }));
      setReviewComment('');
      setReviewImage('');
    },
    onError: (err) => {
      dispatch(addToast({ text: err.response?.data?.message || 'Failed to submit review', type: 'error' }));
    }
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      dispatch(addToast({ text: 'Login required to post a review', type: 'warning' }));
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) return;

    postReviewMutation.mutate({
      rating: reviewRating,
      comment: reviewComment,
      images: reviewImage ? [reviewImage] : []
    });
  };

  // 8. Helpful Vote
  const handleHelpfulVote = async (reviewId) => {
    if (!token) {
      dispatch(addToast({ text: 'Please login to vote helpful', type: 'warning' }));
      return;
    }
    try {
      await apiService.reviews.toggleHelpful(reviewId);
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <ProductDetailsSkeleton />;

  if (isError) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">Error loading product details</h2>
        <p className="text-sm text-gray-500 mt-2">{error.message || 'Product not found.'}</p>
        <Link to="/products" className="text-primary font-semibold hover:underline mt-4 inline-block">Back to Products</Link>
      </div>
    );
  }

  const discountPrice = product.price * (1 - (product.discountPercentage || 0) / 100);

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Breadcrumbs paths={[{ name: 'Home', url: '/' }, { name: 'Products', url: '/products' }, { name: product.title, url: `/product/${id}` }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Core Product Layout */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flat-shadow grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Column 1: Image Gallery & Hover Zoom */}
          <div className="space-y-4">
            
            {/* Active Image Box */}
            <div className="relative aspect-square bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center select-none cursor-crosshair">
              <img
                src={activeImage}
                alt={product.title}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="max-h-full max-w-full object-contain"
              />
              
              {/* Zoom overlay window */}
              <div
                style={{
                  ...zoomStyle,
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: 'white'
                }}
              />
            </div>

            {/* Thumbnails list */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 select-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 bg-slate-50 border rounded-lg overflow-hidden shrink-0 cursor-pointer ${
                      activeImage === img ? 'border-primary ring-2 ring-primary/10' : 'border-slate-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Information Overview */}
          <div className="flex flex-col justify-between space-y-6">
            
            {/* Title, Category & Ratings */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                {product.brand?.name || 'UrbanCart'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {product.title}
              </h1>

              {/* Ratings Summary */}
              <div className="flex items-center gap-3 select-none">
                <div className="flex items-center bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded">
                  {product.rating} <Star className="w-3 h-3 fill-green-800 text-green-800 ml-0.5" />
                </div>
                <span className="text-xs font-semibold text-gray-400">{reviews.length} Customer Reviews</span>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-primary font-bold">{product.category?.name}</span>
              </div>
            </div>

            {/* Price Detail */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-gray-950">₹{discountPrice.toFixed(2)}</span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-base text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                    <span className="text-xs font-bold text-green-600">
                      {product.discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-gray-400">Inclusive of all local sales taxes</p>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed border-t border-slate-100 pt-4">
              {product.description}
            </p>

            {/* Product Options selectors */}
            <div className="space-y-4 border-t border-slate-100 pt-4">
              {/* Color selector */}
              {product.colors?.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-gray-700 block mb-2">Select Color</span>
                  <div className="flex gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3.5 py-1.5 text-xs font-semibold border rounded-lg cursor-pointer transition-colors ${
                          selectedColor === c
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-slate-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {product.sizes?.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-gray-700 block mb-2">Select Size / Capacity</span>
                  <div className="flex gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3.5 py-1.5 text-xs font-semibold border rounded-lg cursor-pointer transition-colors ${
                          selectedSize === s
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-slate-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector & Stock Status */}
              <div>
                <span className="text-xs font-bold text-gray-700 block mb-2">Quantity</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-lg select-none">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-gray-500 hover:text-gray-950 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-semibold text-gray-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 text-gray-500 hover:text-gray-950 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {product.stock > 0 ? (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 font-semibold">Out of Stock</span>
                  )}
                </div>
              </div>
            </div>

            {/* Buying Action triggers */}
            <div className="flex gap-4 border-t border-slate-100 pt-6">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={product.stock === 0}
                className="flex-1 bg-[#F5F5F5] hover:bg-slate-200 border border-slate-200 text-gray-800 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:bg-slate-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button
                onClick={() => handleAddToCart(true)}
                disabled={product.stock === 0}
                className="flex-1 bg-primary text-secondary py-3 rounded-xl font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:bg-slate-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <Zap className="w-5 h-5 fill-secondary" /> Buy Now
              </button>
              <button
                onClick={handleWishlistToggle}
                className="p-3 border border-slate-200 hover:border-slate-400 rounded-xl transition-all cursor-pointer"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>

          </div>
        </div>

        {/* Specifications Table & Descriptions */}
        {product.specifications?.length > 0 && (
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flat-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Specifications</h3>
            <div className="border-t border-slate-100">
              {product.specifications.map((spec, idx) => (
                <div key={idx} className="grid grid-cols-3 py-3 border-b border-slate-100 text-sm">
                  <span className="font-semibold text-gray-500">{spec.key}</span>
                  <span className="col-span-2 text-gray-800 font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequently Bought Together Showcase */}
        {frequentlyBought.length > 0 && (
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flat-shadow">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="text-lg font-bold text-gray-900">Frequently Bought Together</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {frequentlyBought.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </div>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Similar Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flat-shadow space-y-8">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-gray-900">Ratings & Customer Reviews</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. Review Summary */}
            <div className="text-center md:text-left space-y-3">
              <h4 className="text-5xl font-extrabold text-gray-950">{product.rating}</h4>
              <div className="flex justify-center md:justify-start text-amber-400 select-none">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.rating || 4.5) ? 'fill-amber-400' : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">Average review based on {reviews.length} ratings</p>
            </div>

            {/* 2. Review List */}
            <div className="col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No reviews yet for this product. Be the first to write one!</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="border-b border-slate-100 pb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 select-none">
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            {rev.rating} <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                          </span>
                          <span className="text-xs font-bold text-gray-800">{rev.user?.name || 'Customer'}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">{rev.comment}</p>

                      {rev.images?.length > 0 && (
                        <div className="flex gap-2">
                          {rev.images.map((img, index) => (
                            <img key={index} src={img} alt="review upload" className="w-12 h-12 object-cover rounded-md border border-slate-100" />
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => handleHelpfulVote(rev._id)}
                        className={`flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                          rev.helpfulUsers?.includes(user?._id) ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({rev.helpfulCount})
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. Review Posting Form */}
              {token && (
                <form onSubmit={handleReviewSubmit} className="pt-6 border-t border-slate-100 space-y-4">
                  <h4 className="text-sm font-bold text-gray-900">Write a Review</h4>
                  
                  {/* Rating Selector */}
                  <div className="flex items-center gap-2 select-none">
                    <span className="text-xs font-semibold text-gray-500">Your Rating:</span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setReviewRating(stars)}
                          className="hover:scale-110 cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${stars <= reviewRating ? 'fill-amber-400' : 'text-gray-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Tell us what you liked or disliked about this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:border-primary text-gray-800"
                  />

                  {/* Image link input */}
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Optional review image URL..."
                      value={reviewImage}
                      onChange={(e) => setReviewImage(e.target.value)}
                      className="bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary flex-1 text-gray-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={postReviewMutation.isPending}
                    className="bg-primary text-secondary px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary/95 transition-colors disabled:bg-slate-200 disabled:text-gray-400 cursor-pointer"
                  >
                    {postReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
