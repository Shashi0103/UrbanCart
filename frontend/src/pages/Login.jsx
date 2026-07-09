import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice.js';
import { setCartItems } from '../redux/slices/cartSlice.js';
import { addToast } from '../redux/slices/notificationSlice.js';
import apiService from '../api/apiService.js';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { token } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Check saved email on remember me
  useEffect(() => {
    const savedEmail = localStorage.getItem('urbancart_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [token, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsPending(true);
    try {
      // 1. Call login API
      const result = await apiService.auth.login({ email, password });
      
      // 2. Dispatch credentials
      dispatch(setCredentials({
        user: { _id: result._id, name: result.name, email: result.email, role: result.role },
        token: result.token,
        refreshToken: result.refreshToken
      }));

      // Remember me handling
      if (rememberMe) {
        localStorage.setItem('urbancart_remember_email', email);
      } else {
        localStorage.removeItem('urbancart_remember_email');
      }

      dispatch(addToast({ text: `Welcome back, ${result.name}!`, type: 'success' }));

      // 3. Fetch/sync DB cart
      try {
        const dbCart = await apiService.cart.get();
        dispatch(setCartItems(dbCart));
      } catch (cartErr) {
        console.error('Failed to sync cart on login', cartErr);
      }

    } catch (err) {
      console.error(err);
      dispatch(addToast({ text: err.response?.data?.message || 'Login failed', type: 'error' }));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flat-shadow max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
            URBAN<span className="text-gray-900 font-medium">CART</span>
          </Link>
          <h2 className="text-lg font-bold text-gray-800 mt-2">Sign in to your account</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:border-primary text-gray-800"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 block">Password</label>
              <Link to="/forgot-password" className="text-[10px] text-primary font-bold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:border-primary text-gray-800"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between select-none">
            <label className="flex items-center gap-2 text-gray-600 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-200 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-secondary py-3 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer active:scale-95 disabled:bg-slate-200 disabled:text-gray-400 flex items-center justify-center gap-1.5"
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <hr className="border-slate-100" />

        <p className="text-center text-xs text-gray-500 font-semibold">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Register for free
          </Link>
        </p>

      </div>
    </div>
  );
}
