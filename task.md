# UrbanCart Implementation Tasks

## [x] Phase 1: Project Initialization & Environment Setup
- [x] Initialize `backend/` folder and `package.json` with Express, Mongoose, JWT, bcrypt, Stripe, Multer.
- [x] Initialize `frontend/` folder with Vite + React + Tailwind CSS.
- [x] Configure Tailwind CSS settings (primary/secondary colors, Poppins font) and styles.
- [x] Set up environment files (`.env` configurations).

## [x] Phase 2: Backend Development (Models, Controllers & Routes)
- [x] Implement Mongoose models:
  - User, Product, Category, Brand, Order, Review, Wishlist, Cart, Coupon, Payment, Notification
- [x] Implement backend config (database connection, Stripe init, Cloudinary fallback).
- [x] Implement auth middleware (JWT validation, admin check) and error handler.
- [x] Implement controllers & routes:
  - Auth, Users, Products, Categories, Brands, Reviews, Orders, Payments, Coupons, Notifications, AI
- [x] Create a seed script to populate sample database with realistic categories, brands, and products in Indian Rupees (INR).

## [x] Phase 3: Frontend Foundations (Redux, Queries & Layouts)
- [x] Set up Redux Toolkit (auth, cart, wishlist, notifications).
- [x] Create Axios wrapper and configure API endpoints.
- [x] Create main layout (Sticky Navbar, responsive mobile navigation, Footer).
- [x] Implement global components (Skeletons, Breadcrumbs, ErrorBoundary, BackToTop button, rating stars).

## [x] Phase 4: Frontend Pages & Features
- [x] Build Home Page (Hero, Categories, Trending, Flash Sale, Newsletter).
- [x] Build Listing Page (Filters, Sort, Search, Grid).
- [x] Build Details Page (Image Gallery, Hover Zoom, Specs, Reviews, Similar Products, AI Recommendations).
- [x] Build Cart Page (Quantity selection, Save for Later, Coupon Code, Price Summary).
- [x] Build Multi-step Checkout Page (Shipping -> Delivery -> Payment -> Review -> Confirmation).
- [x] Build User Dashboard (Profile, Orders, Order tracking timeline, Addresses, Notifications).
- [x] Build Admin Dashboard (Analytics summary, CRUD Products/Categories/Brands, Order status, User blocking).
- [x] Build Auth pages (Login, Register, Forgot/Reset Password).

## [x] Phase 5: Verification & Walkthrough
- [x] Verify integration between frontend and backend.
- [x] Run backend verification scripts.
- [x] Document final deliverables in `walkthrough.md` with INR currency parameters.
