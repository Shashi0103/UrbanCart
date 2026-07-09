import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-100 p-4 flat-shadow animate-pulse space-y-3">
      <div className="w-full h-48 bg-slate-200 rounded-md" />
      <div className="h-4 bg-slate-200 rounded-sm w-3/4" />
      <div className="flex gap-2 items-center">
        <div className="h-3.5 bg-slate-200 rounded-sm w-12" />
        <div className="h-3.5 bg-slate-200 rounded-sm w-8" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-slate-200 rounded-md w-20" />
        <div className="h-8 bg-slate-200 rounded-md w-16" />
      </div>
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="w-full h-96 bg-slate-200 rounded-lg" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-20 bg-slate-200 rounded-md" />
            ))}
          </div>
        </div>
        {/* Info */}
        <div className="space-y-6">
          <div className="h-8 bg-slate-200 rounded-sm w-2/3" />
          <div className="h-4 bg-slate-200 rounded-sm w-1/4" />
          <div className="h-6 bg-slate-200 rounded-sm w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded-sm" />
            <div className="h-4 bg-slate-200 rounded-sm" />
            <div className="h-4 bg-slate-200 rounded-sm w-5/6" />
          </div>
          <div className="h-10 bg-slate-200 rounded-md w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-slate-200 rounded-lg w-full" />
    </div>
  );
}
