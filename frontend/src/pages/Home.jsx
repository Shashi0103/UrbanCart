import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import apiService from '../api/apiService.js';
import ProductCard from '../components/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/SkeletonLoader.jsx';
import { 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const { user } = useSelector((state) => state.auth);
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 34, seconds: 12 });

  // 1. Simulated Flash Sale Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Querying Categories
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: apiService.categories.getAll
  });

  // 3. Querying Products
  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: ['products-home'],
    queryFn: () => apiService.products.getAll({ limit: 8 })
  });
  const products = productsData?.products || [];

  // 4. Querying AI Recommendations (Recommended For You)
  const { data: aiRecommended = [], isLoading: aiLoading } = useQuery({
    queryKey: ['ai-recommended-home', user?._id],
    queryFn: () => apiService.products.getAiRecommendations({ type: 'recommendedForYou', userId: user?._id })
  });

  const featuredBrands = [
    { name: 'Apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300' },
    { name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300' },
    { name: 'Sony', logo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300' },
    { name: 'Dell', logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300' },
    { name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' }
  ];

  // Carousel Configuration
  const [activeSlide, setActiveSlide] = useState(0);
  const mockSlides = [
    {
      _id: 'featured-1',
      title: 'Sony WH-1000XM5 Wireless Headphones',
      brand: { name: 'Sony' },
      description: 'Industry-leading noise cancellation, exceptional sound quality, and crystal clear calling.',
      price: 29990,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800']
    },
    {
      _id: 'featured-2',
      title: "Levi's Men 511 Slim Fit Jeans",
      brand: { name: "Levi's" },
      description: 'A modern slim with room to move. Crafted in high stretch denim for daily comfort.',
      price: 2599,
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800']
    },
    {
      _id: 'featured-3',
      title: "Zara Floral Print Midi Dress",
      brand: { name: 'Zara' },
      description: 'Elegant V-neck dress featuring self-matching fabric details and tiered skirt floral panels.',
      price: 3990,
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800']
    },
    {
      _id: 'featured-4',
      title: 'iPhone 15 Pro Max',
      brand: { name: 'Apple' },
      description: 'Titanium design, A17 Pro Chip, customizable Action button, and professional camera arrays.',
      price: 139900,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800']
    }
  ];

  const getCarouselSlides = () => {
    if (products.length === 0) return mockSlides;
    
    // Pick specific category representatives for a diverse carousel list
    const mobiles = products.find(p => p.category?.slug === 'mobiles') || products[0];
    const electronics = products.find(p => p.category?.slug === 'electronics') || products[1];
    
    // Find clothing items
    const fashionItems = products.filter(p => p.category?.slug === 'fashion');
    const mensCloth = fashionItems.find(p => p.title.toLowerCase().includes('men')) || products[2];
    const womensCloth = fashionItems.find(p => p.title.toLowerCase().includes('women') || p.title.toLowerCase().includes('zara')) || products[3];
    
    const selected = [];
    if (mobiles) selected.push(mobiles);
    if (mensCloth && !selected.includes(mensCloth)) selected.push(mensCloth);
    if (womensCloth && !selected.includes(womensCloth)) selected.push(womensCloth);
    if (electronics && !selected.includes(electronics)) selected.push(electronics);
    
    // Fill up to 4 elements if needed
    while (selected.length < 4 && selected.length < products.length) {
      const nextItem = products.find(p => !selected.includes(p));
      if (nextItem) selected.push(nextItem);
      else break;
    }
    
    return selected;
  };

  const slides = getCarouselSlides();
  const currentProduct = slides[activeSlide] || slides[0];

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="space-y-8 bg-[#F5F5F5] min-h-screen pb-12">
      
      {/* Horizontal Category Strip (Flipkart-style directly under Header) */}
      <section className="bg-white border-b border-slate-200/80 py-3 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {catLoading ? (
            <div className="flex gap-4 overflow-x-auto justify-between">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="w-16 h-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
              ))}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto justify-between md:justify-center items-center py-0.5 select-none scrollbar-none">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center gap-1 min-w-[72px] hover:text-primary transition-all text-center shrink-0 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center group-hover:border-primary/40 group-hover:scale-105 transition-all">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100';
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 group-hover:text-primary transition-colors truncate max-w-[85px]">{cat.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hero Banner Section (Auto-playing Product Carousel with Cross-Fade) */}
      <section className="bg-white border-b border-slate-100 py-6 sm:py-8 select-none relative overflow-hidden flat-shadow mx-4 sm:mx-6 lg:mx-8 rounded-2xl group/hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative min-h-[640px] sm:min-h-[500px] lg:min-h-[360px] w-full">
          {slides.map((slide, idx) => {
            const isActive = activeSlide === idx;
            return (
              <div
                key={slide._id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full absolute inset-0 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-in-out ${
                  isActive
                    ? 'opacity-100 scale-100 translate-x-0 pointer-events-auto z-10'
                    : 'opacity-0 scale-95 translate-x-4 pointer-events-none z-0'
                }`}
              >
                {/* Slide Text Content */}
                <div className="space-y-4">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {slide.brand?.name || 'Exclusive Deal'}
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-sm text-gray-500 max-w-md leading-relaxed line-clamp-2">
                    {slide.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-primary">
                      ₹{slide.price?.toLocaleString('en-IN')}
                    </span>
                    {slide.discountPercentage > 0 && (
                      <span className="text-xs font-semibold text-green-600">
                        {slide.discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Link
                      to={`/product/${slide._id}`}
                      className="bg-primary text-secondary px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-all flat-shadow hover:translate-y-[-1px] cursor-pointer"
                    >
                      Buy Now
                    </Link>
                    <Link
                      to="/products"
                      className="bg-[#F5F5F5] hover:bg-slate-200 text-gray-800 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      Browse Store
                    </Link>
                  </div>
                </div>

                {/* Slide Image Box */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                  <img
                    src={slide.images?.[0]}
                    alt={slide.title}
                    className="max-h-[85%] max-w-[85%] object-contain"
                  />
                </div>
              </div>
            );
          })}

          {/* Left/Right manual switch arrows (placed at parent wrapper level) */}
          <button
            onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full border border-slate-100 opacity-0 group-hover/hero:opacity-100 transition-opacity flat-shadow cursor-pointer z-20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full border border-slate-100 opacity-0 group-hover/hero:opacity-100 transition-opacity flat-shadow cursor-pointer z-20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Slide Indicator Dots (placed at parent wrapper level) */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  activeSlide === idx ? 'bg-primary w-4' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Countdown Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-500 rounded-2xl flat-shadow p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="p-3 bg-white/10 rounded-xl">
              <Clock className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Flash Sale is Live!</h2>
              <p className="text-xs text-red-100">Hurry, get up to 20% discount on select electronics.</p>
            </div>
          </div>

          {/* Countdown Blocks */}
          <div className="flex gap-2 text-center text-sm font-mono font-bold select-none">
            <div className="bg-white/15 px-3 py-2 rounded-lg min-w-[50px]">
              <span className="block text-lg">{String(countdown.hours).padStart(2, '0')}</span>
              <span className="text-[10px] uppercase font-sans text-red-200">Hrs</span>
            </div>
            <span className="text-2xl self-center">:</span>
            <div className="bg-white/15 px-3 py-2 rounded-lg min-w-[50px]">
              <span className="block text-lg">{String(countdown.minutes).padStart(2, '0')}</span>
              <span className="text-[10px] uppercase font-sans text-red-200">Min</span>
            </div>
            <span className="text-2xl self-center">:</span>
            <div className="bg-white/15 px-3 py-2 rounded-lg min-w-[50px]">
              <span className="block text-lg">{String(countdown.seconds).padStart(2, '0')}</span>
              <span className="text-[10px] uppercase font-sans text-red-200">Sec</span>
            </div>
          </div>

          <Link
            to="/products?minDiscount=10"
            className="bg-white text-red-600 px-6 py-2.5 rounded-lg font-bold hover:bg-slate-50 transition-colors cursor-pointer text-sm"
          >
            View Deals
          </Link>
        </div>
      </section>

      {/* Trending Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-baseline mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Trending Products</h2>
            <p className="text-xs text-gray-400">Popular products bought this week</p>
          </div>
          <Link to="/products" className="text-primary hover:underline text-sm font-semibold flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {prodLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* AI Recommendation Showcase */}
      <section className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recommended For You</h2>
              <p className="text-xs text-gray-400">AI-customized product matching based on views and tags</p>
            </div>
          </div>

          {aiLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {aiRecommended.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Value Trust badging */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center select-none">
          <div className="flex flex-col items-center p-4">
            <Truck className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">Free Express Shipping</h3>
            <p className="text-xs text-gray-400 mt-1">Automatic free delivery on orders above $100</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <RotateCcw className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">30-Day Easy Returns</h3>
            <p className="text-xs text-gray-400 mt-1">No questions asked return and refund policy</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <ShieldCheck className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">100% Secured Payments</h3>
            <p className="text-xs text-gray-400 mt-1">Stripe checkout integrations with encryption</p>
          </div>
        </div>
      </section>

      {/* Popular Brands Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
        <h3 className="text-center font-bold text-sm text-gray-400 uppercase tracking-widest mb-8">Popular Brands</h3>
        <div className="flex justify-around items-center flex-wrap gap-8 opacity-60">
          {featuredBrands.map((b, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="font-bold text-gray-700 text-lg hover:text-primary transition-colors cursor-pointer">{b.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Testimonials section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 rounded-2xl select-none">
        <h2 className="text-center font-bold text-xl text-gray-900 mb-8">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Sneha Iyer', comment: 'UrbanCart is my go-to shopping platform. Delivery is always early, and the product quality is top notch.', job: 'UI Designer' },
            { name: 'Rohan Deshmukh', comment: 'Stripe payment was seamless, and the tracking timeline is very precise. Highly recommend for electronics.', job: 'Software Engineer' },
            { name: 'Ananya Nair', comment: 'The UI is extremely beautiful, minimal, and does not overwhelm me with ads. Love the Poppins styling!', job: 'Product Manager' }
          ].map((t, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 flat-shadow">
              <p className="text-sm text-gray-500 italic leading-relaxed">"{t.comment}"</p>
              <div className="mt-4">
                <h4 className="font-bold text-sm text-gray-800">{t.name}</h4>
                <span className="text-[10px] text-gray-400">{t.job}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
