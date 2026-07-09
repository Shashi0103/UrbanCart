import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice.js';
import { setCartItems } from '../redux/slices/cartSlice.js';
import { addToast } from '../redux/slices/notificationSlice.js';
import apiService from '../api/apiService.js';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      dispatch(addToast({ text: 'Passwords do not match', type: 'error' }));
      return;
    }

    setIsPending(true);
    try {
      const result = await apiService.auth.register({ name, email, password });
      
      dispatch(setCredentials({
        user: { _id: result._id, name: result.name, email: result.email, role: result.role },
        token: result.token,
        refreshToken: result.refreshToken
      }));

      dispatch(addToast({ text: `Account created! Welcome, ${result.name}!`, type: 'success' }));
      
      // Initialize cart
      dispatch(setCartItems([]));
      navigate('/');
    } catch (err) {
      console.error(err);
      dispatch(addToast({ text: err.response?.data?.message || 'Registration failed', type: 'error' }));
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
          <h2 className="text-lg font-bold text-gray-800 mt-2">Create your free account</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:border-primary text-gray-800"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

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
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Password</label>
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

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:border-primary text-gray-800"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-secondary py-3 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer active:scale-95 disabled:bg-slate-200 disabled:text-gray-400 flex items-center justify-center gap-1.5"
          >
            {isPending ? 'Registering...' : 'Register'}
          </button>
        </form>

        <hr className="border-slate-100" />

        <p className="text-center text-xs text-gray-500 font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}
