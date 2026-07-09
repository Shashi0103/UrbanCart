import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '../redux/slices/notificationSlice.js';
import apiService from '../api/apiService.js';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      dispatch(addToast({ text: 'Passwords do not match', type: 'error' }));
      return;
    }

    setIsPending(true);
    try {
      await apiService.auth.resetPassword(token, { password });
      dispatch(addToast({ text: 'Password reset successful. Please sign in.', type: 'success' }));
      navigate('/login');
    } catch (err) {
      console.error(err);
      dispatch(addToast({ text: err.response?.data?.message || 'Invalid or expired token', type: 'error' }));
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
          <h2 className="text-lg font-bold text-gray-800 mt-2">Enter New Password</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Create a secure password to recover your account session.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">New Password</label>
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
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Confirm New Password</label>
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
            className="w-full bg-primary text-secondary py-3 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer active:scale-95 disabled:bg-slate-200 disabled:text-gray-400 flex items-center justify-center"
          >
            {isPending ? 'Saving password...' : 'Reset Password'}
          </button>
        </form>

      </div>
    </div>
  );
}
