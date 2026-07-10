import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice.js';
import { clearCart } from '../redux/slices/cartSlice.js';
import { setWishlistItems } from '../redux/slices/wishlistSlice.js';
import { addToast } from '../redux/slices/notificationSlice.js';
import apiService from '../api/apiService.js';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  ShoppingBag, 
  Settings, 
  Bell,
  History,
  TrendingUp
} from 'lucide-react';

export default function Header() {
  const { user, token } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);
  const wishlistCount = wishlistItems.filter(Boolean).length;
  const [categories, setCategories] = useState([]);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  // UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const profileRef = useRef(null);
  const categoryRef = useRef(null);

  // Fetch Categories & Wishlist Count & Notifications
  useEffect(() => {
    apiService.categories.getAll()
      .then(setCategories)
      .catch(err => console.error('Failed to load categories', err));

    if (token) {
      apiService.wishlist.get()
        .then(items => dispatch(setWishlistItems(items)))
        .catch(err => console.error('Failed to load wishlist items', err));

      apiService.notifications.getAll()
        .then(notifs => setUnreadNotifications(notifs.filter(n => !n.read).length))
        .catch(err => console.error(err));
    } else {
      dispatch(setWishlistItems([]));
      setUnreadNotifications(0);
    }
  }, [token, cartItems]); // Re-run when cart details changes or login status updates

  // Load Recent Searches
  useEffect(() => {
    const saved = localStorage.getItem('urbancart_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timer = setTimeout(() => {
        apiService.products.getSuggestions(searchQuery)
          .then(setSuggestions)
          .catch(err => console.error(err));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Click Outside Handlers
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close drawers/menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setCategoryDropdownOpen(false);
  }, [location]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    // Save recent search
    const updatedRecent = [
      searchQuery.trim(),
      ...recentSearches.filter(s => s !== searchQuery.trim())
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem('urbancart_recent_searches', JSON.stringify(updatedRecent));
    
    setShowSuggestions(false);
    navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (text) => {
    setSearchQuery(text);
    // Add to recent searches
    const updatedRecent = [
      text,
      ...recentSearches.filter(s => s !== text)
    ].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('urbancart_recent_searches', JSON.stringify(updatedRecent));
    
    setShowSuggestions(false);
    navigate(`/products?q=${encodeURIComponent(text)}`);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('urbancart_refresh_token');
      await apiService.auth.logout(refreshToken);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(logout());
      dispatch(clearCart());
      dispatch(setWishlistItems([]));
      dispatch(addToast({ text: 'Logged out successfully', type: 'info' }));
      navigate('/');
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-secondary border-b border-slate-200/80 flat-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Category Button */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold text-primary tracking-tight select-none">
              URBAN<span className="text-gray-900 font-medium">CART</span>
            </Link>

            {/* Desktop Categories Dropdown */}
            <div className="hidden lg:relative" ref={categoryRef}>
              <button 
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary transition-colors cursor-pointer"
              >
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-secondary border border-slate-100 rounded-lg flat-shadow py-2 animate-fade-in origin-top-left z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/products?category=${cat.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {categories.length === 0 && (
                    <span className="block px-4 py-2 text-sm text-gray-400">No categories seeded</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-[#F5F5F5] text-gray-800 placeholder-gray-400 pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-primary focus:bg-secondary focus:ring-2 focus:ring-primary/10 transition-all text-sm"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </form>

            {/* Search Suggestions Panel */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-secondary border border-slate-100 rounded-lg flat-shadow py-3 z-50 animate-fade-in">
                {/* Autocomplete list */}
                {suggestions.length > 0 ? (
                  <div>
                    <h3 className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Search Suggestions</h3>
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSuggestionClick(s.text)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <Search className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">{s.text}</span>
                          {s.category && <span className="text-xs text-gray-400">in {s.category}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="mb-2">
                        <h3 className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5" /> Recent Searches
                        </h3>
                        {recentSearches.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(s)}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-gray-600 flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span>{s}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Popular Searches */}
                    <div>
                      <h3 className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Popular Searches
                      </h3>
                      {['iPhone', 'Wireless Headphones', 'Sneakers', 'Laptops'].map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(s)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-gray-600 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5 text-gray-300" />
                          <span>{s}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Navigation Actions */}
          <div className="hidden md:flex items-center gap-5">
            {/* Wishlist */}
            <Link to="/dashboard/wishlist" className="relative p-1.5 text-gray-600 hover:text-primary transition-colors">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-secondary text-[10px] font-bold rounded-full flex items-center justify-center flat-shadow border-2 border-secondary animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link to="/cart" className="relative p-1.5 text-gray-600 hover:text-primary transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-secondary text-[10px] font-bold rounded-full flex items-center justify-center flat-shadow border-2 border-secondary">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Notifications */}
            <Link 
              to={token ? "/dashboard/notifications" : "/login"} 
              className="relative p-1.5 text-gray-600 hover:text-primary transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-secondary" />
              )}
            </Link>

            {/* Profile Dropdown */}
            {token && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm font-semibold select-none">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-secondary border border-slate-100 rounded-lg flat-shadow py-2 animate-fade-in origin-top-right z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    </div>

                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition-colors">
                      <User className="w-4 h-4 text-gray-400" /> My Profile
                    </Link>
                    <Link to="/dashboard/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition-colors">
                      <ShoppingBag className="w-4 h-4 text-gray-400" /> My Orders
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary font-semibold hover:bg-slate-50 transition-colors">
                        <Settings className="w-4 h-4 text-primary" /> Admin Dashboard
                      </Link>
                    )}

                    <hr className="border-slate-100 my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-primary text-secondary px-5 py-1.5 rounded-md text-sm font-semibold hover:bg-primary/95 transition-all flat-shadow active:scale-95 cursor-pointer"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile responsive toggle button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Wishlist Mobile */}
            <Link to="/dashboard/wishlist" className="relative p-1 text-gray-600">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-secondary text-[8px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Mobile */}
            <Link to="/cart" className="relative p-1 text-gray-600">
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-secondary text-[8px] font-bold rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Notifications Mobile */}
            <Link 
              to={token ? "/dashboard/notifications" : "/login"} 
              className="relative p-1 text-gray-600 hover:text-primary transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-secondary" />
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-gray-600 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-secondary px-4 py-4 space-y-3 flat-shadow animate-fade-in">
          
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Navigation</h4>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                className="block py-2 text-sm text-gray-700 hover:text-primary"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <hr className="border-slate-100" />

          {token && user ? (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">My Account</h4>
              <Link to="/dashboard" className="block py-2 text-sm text-gray-700">My Profile</Link>
              <Link to="/dashboard/orders" className="block py-2 text-sm text-gray-700">My Orders</Link>
              <Link to="/dashboard/wishlist" className="block py-2 text-sm text-gray-700">My Wishlist</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="block py-2 text-sm text-primary font-bold">Admin Dashboard</Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-sm text-red-600 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="block w-full bg-primary text-secondary text-center py-2.5 rounded-lg text-sm font-semibold"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
