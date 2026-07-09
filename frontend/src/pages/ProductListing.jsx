import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiService from '../api/apiService.js';
import ProductCard from '../components/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/SkeletonLoader.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read current filters from search query strings
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const minDiscount = searchParams.get('minDiscount') || '';
  const inStock = searchParams.get('inStock') || 'false';
  const sortBy = searchParams.get('sortBy') || 'relevance';
  const page = parseInt(searchParams.get('page')) || 1;

  // Local filter inputs (so they don't trigger queries instantly on typing)
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  // Sync local inputs when URL change
  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  // Query categories & brands for sidebar list
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: apiService.categories.getAll
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: apiService.brands.getAll
  });

  // Query Products matching active filters
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products-listing', q, category, brand, minPrice, maxPrice, rating, minDiscount, inStock, sortBy, subcategory, page],
    queryFn: () =>
      apiService.products.getAll({
        q,
        category,
        brand,
        minPrice,
        maxPrice,
        rating,
        minDiscount,
        inStock: inStock === 'true',
        sortBy,
        subcategory,
        page,
        limit: 9
      })
  });

  const products = data?.products || [];
  const totalPages = data?.pages || 1;
  const totalProducts = data?.totalProducts || 0;

  // Helper to update search params
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1'); // Reset to page 1 on filter
    if (key === 'category') {
      newParams.delete('subcategory');
    }
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    if (localMinPrice) newParams.set('minPrice', localMinPrice);
    else newParams.delete('minPrice');
    if (localMaxPrice) newParams.set('maxPrice', localMaxPrice);
    else newParams.delete('maxPrice');
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams({ q }));
    setLocalMinPrice('');
    setLocalMaxPrice('');
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex gap-8">
          
          {/* 1. Desktop Sidebar Filters */}
          <aside className="hidden md:block w-64 shrink-0 bg-white border border-slate-200 rounded-xl p-5 h-fit space-y-6 flat-shadow select-none">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-primary" /> Filters
              </h2>
              <button 
                onClick={handleClearFilters}
                className="text-xs text-primary hover:underline font-semibold cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Category</h3>
              <div className="space-y-1.5 text-sm text-gray-600">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`block w-full text-left py-0.5 cursor-pointer hover:text-primary transition-colors ${
                    !category ? 'text-primary font-bold' : ''
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`block w-full text-left py-0.5 cursor-pointer hover:text-primary transition-colors ${
                      category === cat.slug ? 'text-primary font-bold' : ''
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Brand</h3>
              <div className="space-y-1.5 text-sm text-gray-600">
                <button
                  onClick={() => updateFilter('brand', '')}
                  className={`block w-full text-left py-0.5 cursor-pointer hover:text-primary transition-colors ${
                    !brand ? 'text-primary font-bold' : ''
                  }`}
                >
                  All Brands
                </button>
                {brands.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => updateFilter('brand', b.slug)}
                    className={`block w-full text-left py-0.5 cursor-pointer hover:text-primary transition-colors ${
                      brand === b.slug ? 'text-primary font-bold' : ''
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Price Range</h3>
              <form onSubmit={handlePriceApply} className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="w-full bg-[#F5F5F5] text-sm text-gray-800 border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-primary"
                />
                <span className="text-gray-400 self-center">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="w-full bg-[#F5F5F5] text-sm text-gray-800 border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary text-secondary px-2.5 rounded hover:bg-primary/95 text-xs font-bold transition-colors cursor-pointer"
                >
                  Go
                </button>
              </form>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Customer Rating</h3>
              <div className="space-y-1.5 text-sm text-gray-600">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => updateFilter('rating', stars.toString())}
                    className={`flex items-center gap-1 cursor-pointer hover:text-primary transition-colors w-full text-left ${
                      rating === stars.toString() ? 'text-primary font-bold' : ''
                    }`}
                  >
                    <span>{stars}★ & above</span>
                  </button>
                ))}
                <button
                  onClick={() => updateFilter('rating', '')}
                  className={`block py-0.5 cursor-pointer hover:text-primary transition-colors w-full text-left ${
                    !rating ? 'text-primary font-bold' : ''
                  }`}
                >
                  Any Rating
                </button>
              </div>
            </div>

            {/* Availability Stock check */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Availability</h3>
              <label className="flex items-center gap-2 text-sm text-gray-600 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock === 'true'}
                  onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : 'false')}
                  className="rounded border-slate-200 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                Exclude Out of Stock
              </label>
            </div>
          </aside>

          {/* 2. Main Product Content Layout */}
          <div className="flex-1 space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between flat-shadow select-none">
              <div className="flex flex-col">
                {q && (
                  <span className="text-xs text-gray-400">Search results for</span>
                )}
                <h1 className="text-sm font-bold text-gray-900">
                  {q ? `"${q}"` : 'All Products'}{' '}
                  <span className="text-xs font-medium text-gray-500">({totalProducts} items)</span>
                </h1>
              </div>

              {/* Sorting and Mobile toggle filter */}
              <div className="flex items-center gap-3">
                
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="md:hidden flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold text-gray-600 hover:bg-slate-50 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                </button>

                {/* Sort selector */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 font-medium flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5" /> Sort By
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-primary text-gray-700 font-semibold"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="ratingDesc">Customer Rating</option>
                    <option value="bestSelling">Best Sellers</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Subcategories for Fashion Category */}
            {category === 'fashion' && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3 flat-shadow select-none">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subcategories:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All Fashion', val: '' },
                    { label: 'Men', val: 'men' },
                    { label: 'Women', val: 'women' },
                    { label: 'Kids', val: 'kids' }
                  ].map((sub) => {
                    const isSelected = subcategory === sub.val;
                    return (
                      <button
                        key={sub.label}
                        onClick={() => updateFilter('subcategory', sub.val)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-secondary border-primary shadow-sm'
                            : 'bg-slate-50 text-gray-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Products grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto flat-shadow flex flex-col items-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="font-bold text-gray-800 text-base">Unable to load products</h3>
                <p className="text-xs text-gray-400 mt-2">{error.message || 'An error occurred during query execution.'}</p>
              </div>
            ) : products.length === 0 ? (
              /* Beautiful Empty state */
              <div className="bg-white rounded-xl border border-slate-200 py-16 px-4 text-center flat-shadow flex flex-col items-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">No matches found</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-sm">
                  We couldn't find any products matching your active filters. Try adjusting your price ranges or selecting another category.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-primary text-secondary px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary/95 mt-6 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 pt-4 select-none">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-gray-600 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {[...Array(totalPages)].map((_, idx) => {
                  const currPage = idx + 1;
                  return (
                    <button
                      key={currPage}
                      onClick={() => handlePageChange(currPage)}
                      className={`w-9 h-9 border rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        page === currPage
                          ? 'bg-primary border-primary text-secondary flat-shadow'
                          : 'bg-white border-slate-200 text-gray-600 hover:bg-slate-50'
                      }`}
                    >
                      {currPage}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-gray-600 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 3. Mobile Filters Slide Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end md:hidden animate-fade-in">
          <div className="bg-white w-80 h-full p-6 overflow-y-auto flex flex-col justify-between animate-slide-left">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h2 className="font-bold text-gray-900 text-base">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Category</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <button
                    onClick={() => { updateFilter('category', ''); setMobileFiltersOpen(false); }}
                    className={`block py-1 cursor-pointer hover:text-primary transition-colors ${!category ? 'text-primary font-bold' : ''}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { updateFilter('category', cat.slug); setMobileFiltersOpen(false); }}
                      className={`block py-1 cursor-pointer hover:text-primary transition-colors ${category === cat.slug ? 'text-primary font-bold' : ''}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Brand</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <button
                    onClick={() => { updateFilter('brand', ''); setMobileFiltersOpen(false); }}
                    className={`block py-1 cursor-pointer hover:text-primary transition-colors ${!brand ? 'text-primary font-bold' : ''}`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b._id}
                      onClick={() => { updateFilter('brand', b.slug); setMobileFiltersOpen(false); }}
                      className={`block py-1 cursor-pointer hover:text-primary transition-colors ${brand === b.slug ? 'text-primary font-bold' : ''}`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Rating</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {[4, 3, 2].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => { updateFilter('rating', stars.toString()); setMobileFiltersOpen(false); }}
                      className={`block py-1 cursor-pointer hover:text-primary transition-colors ${rating === stars.toString() ? 'text-primary font-bold' : ''}`}
                    >
                      {stars}★ & above
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => { handleClearFilters(); setMobileFiltersOpen(false); }}
                className="w-full bg-[#F5F5F5] hover:bg-slate-200 text-gray-800 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-primary text-secondary py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
