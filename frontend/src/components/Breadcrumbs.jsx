import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ paths = [] }) {
  const location = useLocation();

  // If manual paths are passed, use them. Otherwise, generate from URL path.
  let breadcrumbsList = paths;

  if (paths.length === 0) {
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get('category');
    const brand = queryParams.get('brand');
    const q = queryParams.get('q');

    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    breadcrumbsList = [
      { name: 'Home', url: '/' }
    ];

    if (pathSegments[0] === 'products') {
      breadcrumbsList.push({ name: 'All Products', url: '/products' });
      if (category) {
        // Uppercase first letter of category name
        const catName = category.charAt(0).toUpperCase() + category.slice(1);
        breadcrumbsList.push({ name: catName, url: `/products?category=${category}` });
      }
      if (brand) {
        const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
        breadcrumbsList.push({ name: brandName, url: `/products?brand=${brand}` });
      }
      if (q) {
        breadcrumbsList.push({ name: `Search: "${q}"`, url: location.pathname + location.search });
      }
    } else if (pathSegments[0] === 'dashboard') {
      breadcrumbsList.push({ name: 'Dashboard', url: '/dashboard' });
      if (pathSegments[1]) {
        const subName = pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1);
        breadcrumbsList.push({ name: subName, url: `/dashboard/${pathSegments[1]}` });
      }
    } else if (pathSegments[0]) {
      const segmentName = pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1);
      breadcrumbsList.push({ name: segmentName, url: `/${pathSegments[0]}` });
    }
  }

  return (
    <nav className="flex items-center text-xs font-medium text-gray-500 py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      <ol className="flex items-center gap-1.5 flex-wrap">
        {breadcrumbsList.map((breadcrumb, index) => {
          const isLast = index === breadcrumbsList.length - 1;
          
          return (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
              <li>
                {isLast ? (
                  <span className="text-gray-900 font-semibold truncate max-w-[150px] block">
                    {breadcrumb.name}
                  </span>
                ) : (
                  <Link 
                    to={breadcrumb.url}
                    className="hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {breadcrumb.name === 'Home' && <Home className="w-3.5 h-3.5" />}
                    <span>{breadcrumb.name}</span>
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
