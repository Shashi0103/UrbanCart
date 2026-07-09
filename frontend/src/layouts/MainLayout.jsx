import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ToastContainer from '../components/ToastContainer.jsx';
import { ArrowUp } from 'lucide-react';

export default function MainLayout() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Header */}
      <Header />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-5 z-40 bg-primary text-secondary p-3 rounded-full flat-shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
