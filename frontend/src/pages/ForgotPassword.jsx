import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '../redux/slices/notificationSlice.js';
import apiService from '../api/apiService.js';
import { Mail, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsPending(true);
    try {
      const result = await apiService.auth.forgotPassword({ email });
      dispatch(addToast({ text: 'Password reset link generated', type: 'success' }));
      setIsSent(true);

      // Save reset token for direct sandbox link rendering
      if (result.resetToken) {
        setResetLink(`/reset-password/${result.resetToken}`);
      }
    } catch (err) {
      console.error(err);
      dispatch(addToast({ text: err.response?.data?.message || 'Email not found', type: 'error' }));
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
          <h2 className="text-lg font-bold text-gray-800 mt-2">Reset your password</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Enter your email address and we'll generate a recovery link.
          </p>
        </div>

        {/* Content */}
        {!isSent ? (
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

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-secondary py-3 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer active:scale-95 disabled:bg-slate-200 disabled:text-gray-400 flex items-center justify-center"
            >
              {isPending ? 'Processing...' : 'Send Recovery Link'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-2 animate-scale-up select-none">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
              <CheckCircle className="w-7 h-7" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed font-semibold">
              Recovery link generated. The URL has been printed in the server logs.
            </p>

            {resetLink && (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-xs">
                <p className="font-bold text-primary mb-2">Sandbox Testing Shortcut Link:</p>
                <Link to={resetLink} className="text-blue-600 underline font-semibold hover:text-blue-800 break-all">
                  Click here to Reset Password Now
                </Link>
              </div>
            )}
          </div>
        )}

        <hr className="border-slate-100" />

        <p className="text-center text-xs text-gray-500 font-semibold">
          Remembered password?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}
