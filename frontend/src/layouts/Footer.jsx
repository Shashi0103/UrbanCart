import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '../redux/slices/notificationSlice.js';
import { Mail, Phone, MapPin, X } from 'lucide-react';

// ── Inline info modal ─────────────────────────────────────────────────────────
function InfoModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-gray-500"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-slate-100 pb-3">{title}</h2>
        <div className="text-sm text-gray-600 leading-relaxed space-y-3">{children}</div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const [modal, setModal] = useState(null); // 'about' | 'contact' | 'terms' | 'privacy'

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    dispatch(addToast({ text: 'Thank you for subscribing to our newsletter!', type: 'success' }));
    setEmail('');
  };

  return (
    <>
      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {modal === 'about' && (
        <InfoModal title="About Us" onClose={() => setModal(null)}>
          <p>
            <strong>UrbanCart</strong> is a modern full-stack e-commerce platform built with the MERN stack
            (MongoDB, Express, React, Node.js). It was designed and developed as a passion project by
            <strong> Shashi Kumar Sahu</strong> to showcase premium UI, real-time cart management,
            JWT authentication, order tracking, and AI-powered product recommendations.
          </p>
          <p>
            Our mission is to deliver a lightning-fast, intuitive shopping experience that puts the
            customer first — from discovery to doorstep.
          </p>
          <p>
            Features include a mock Stripe payment gateway, smart recommendation engine, wishlist
            management, coupon codes, admin dashboard, and full order lifecycle tracking.
          </p>
          <p className="text-gray-400 text-xs pt-2">Built with ❤️ in India 🇮🇳</p>
        </InfoModal>
      )}

      {modal === 'contact' && (
        <InfoModal title="Contact Support" onClose={() => setModal(null)}>
          <p>We are here to help! Reach out to our support team through any of the channels below:</p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>support@urbancart.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span>+91 91XX 7XXX 9X (Mon–Sat, 9 AM – 6 PM IST)</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>47-B, Nehru Nagar, Sector 12, New Delhi – 110019, India</span>
            </li>
          </ul>
          <p className="text-gray-400 text-xs pt-2">We typically respond within 24 hours on business days.</p>
        </InfoModal>
      )}

      {modal === 'terms' && (
        <InfoModal title="Terms of Service" onClose={() => setModal(null)}>
          <p><strong>Last updated:</strong> July 2026</p>
          <p>
            By accessing or using UrbanCart, you agree to be bound by these Terms of Service. Please read
            them carefully before placing any orders on our platform.
          </p>
          <p><strong>1. Use of the Platform</strong><br />
            UrbanCart is intended for personal, non-commercial use. You agree not to misuse our services,
            attempt unauthorized access, or engage in fraudulent transactions.
          </p>
          <p><strong>2. Orders & Payments</strong><br />
            All prices are listed in Indian Rupees (INR). Payments are processed securely via our mock
            Stripe integration. Orders are confirmed only after successful payment verification.
          </p>
          <p><strong>3. Returns & Refunds</strong><br />
            Eligible items may be returned within 7 days of delivery in original condition. Refunds are
            processed within 5–7 business days to the original payment method.
          </p>
          <p><strong>4. Account Responsibility</strong><br />
            You are responsible for maintaining the confidentiality of your account credentials. Notify us
            immediately of any unauthorized use of your account.
          </p>
          <p className="text-gray-400 text-xs pt-2">These terms are subject to change without prior notice.</p>
        </InfoModal>
      )}

      {modal === 'privacy' && (
        <InfoModal title="Privacy Policy" onClose={() => setModal(null)}>
          <p><strong>Last updated:</strong> July 2026</p>
          <p>
            Your privacy is important to us. This policy explains how UrbanCart collects, uses, and
            protects your personal information.
          </p>
          <p><strong>Information We Collect</strong><br />
            We collect information you provide directly (name, email, address) and data generated
            automatically (browsing behaviour, cart activity, device info).
          </p>
          <p><strong>How We Use Your Data</strong><br />
            Your data is used to process orders, personalize your experience, send transactional emails,
            improve our recommendation engine, and for internal analytics.
          </p>
          <p><strong>Data Security</strong><br />
            All passwords are hashed using industry-standard bcrypt encryption. We use HTTPS for all
            data transmissions and never store raw payment details.
          </p>
          <p><strong>Third Parties</strong><br />
            We do not sell your personal information to third parties. We may share data with service
            providers (e.g., payment processors) strictly for order fulfilment purposes.
          </p>
          <p className="text-gray-400 text-xs pt-2">For data deletion requests, contact support@urbancart.com.</p>
        </InfoModal>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 mt-auto text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Brand Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary tracking-tight">
                URBAN<span className="text-gray-900 font-medium">CART</span>
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Experience the future of e-commerce. Clean, minimal, and lightning-fast shopping designed around your needs.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link to="/products?category=electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
                <li><Link to="/products?category=fashion" className="hover:text-primary transition-colors">Fashion Wear</Link></li>
                <li><Link to="/products?category=mobiles" className="hover:text-primary transition-colors">Mobile Phones</Link></li>
              </ul>
            </div>

            {/* Policies & Help */}
            <div>
              <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-4">Help &amp; Info</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => setModal('about')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => setModal('contact')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Contact Support
                  </button>
                </li>
                <li>
                  <button onClick={() => setModal('terms')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => setModal('privacy')} className="hover:text-primary transition-colors cursor-pointer text-left">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Newsletter Box */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-4">Newsletter</h3>
              <p className="text-sm text-gray-500">Subscribe to receive exclusive deals and new release notifications.</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#F5F5F5] border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-800"
                />
                <button
                  type="submit"
                  className="bg-primary text-secondary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            </div>

          </div>

          <hr className="border-slate-200 my-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-3">
            <p>© {new Date().getFullYear()} UrbanCart Inc. All rights reserved.</p>

            {/* Creator credit with heartbeat */}
            <p className="flex items-center gap-1 font-medium text-gray-400">
              Created with{' '}
              <span
                className="inline-block text-blue-400"
                style={{ animation: 'heartbeat 1.2s ease-in-out infinite' }}
              >
                🩵
              </span>
              {' '}by <span className="text-gray-600 font-semibold ml-1">Shashi Kumar Sahu</span>
            </p>

            <span className="cursor-pointer hover:underline">English (US)</span>
          </div>
        </div>

        {/* Heartbeat keyframe */}
        <style>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            14%       { transform: scale(1.3); }
            28%       { transform: scale(1); }
            42%       { transform: scale(1.2); }
            70%       { transform: scale(1); }
          }
        `}</style>
      </footer>
    </>
  );
}
