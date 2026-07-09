import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-[#F5F5F5] min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 flat-shadow max-w-md w-full text-center space-y-6 animate-scale-up select-none">
        
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <AlertTriangle className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
          <h2 className="text-lg font-bold text-gray-800">Page Not Found</h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <Link
          to="/"
          className="bg-primary text-secondary px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors inline-block cursor-pointer flat-shadow active:scale-95"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
