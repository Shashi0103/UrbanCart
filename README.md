# 🛒 UrbanCart

> A modern, full-stack e-commerce web application built with the MERN stack — featuring real-time cart management, JWT authentication, order tracking, a personalized product recommendation system, a mock Stripe sandbox checkout simulation, and a sleek premium UI.

---

## 🌟 Live Demo

- **Frontend**: [urbancartshopping.onrender.com](https://urbancartshopping.onrender.com)
- **Backend API**: [urbancart-api.onrender.com](https://urbancart-api.onrender.com)

---

## ✨ Features

### 🛍️ Shopping Experience
- Browse products across **Electronics**, **Fashion (Men/Women/Kids)**, and more
- Advanced **filtering & sorting** by price, brand, rating, and category
- **Product detail pages** with image gallery, color/size variants
- **Wishlist** — save products for later
- **Cart** — add, remove, and update quantities with live price calculation
- **Coupon codes** — apply discounts at checkout

### 🔐 Authentication & Security
- **JWT-based auth** with access tokens + refresh token rotation
- **Register & Login** with password hashing (bcryptjs)
- **Protected routes** — cart, checkout, dashboard require login
- Token auto-refresh on expiry — seamless session management

### 📦 Orders & Checkout
- Multi-step checkout flow — Address → Review → Payment
- **Stripe sandbox simulation** — test with mock card details
- Payment success animation (Stripe-style checkmark)
- Cart auto-clears after successful order
- **Order history** in user dashboard

### 👤 User Dashboard
- View & update profile
- Track all past orders with status timeline
- Notifications center
- Manage saved addresses

### 🛠️ Admin Dashboard
- Revenue analytics with monthly sales chart
- Manage all orders and update statuses
- Product & inventory management
- Low stock alerts

---

## 🧱 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Redux Toolkit | Global state management |
| React Router v7 | Client-side routing |
| TanStack Query | Server state & caching |
| Axios | HTTP client with interceptors |
| Lucide React | Icon library |
| Vite | Build tool |
| Vanilla CSS | Custom styling |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Stripe | Payment processing (sandbox) |
| dotenv | Environment config |
| Nodemon | Dev auto-restart |

---

## 📁 Project Structure

```
UrbanCart/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth & error handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── utils/           # Seed script, token helpers
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios client & API service
    │   ├── components/      # Reusable UI components
    │   ├── layouts/         # Header, Footer, MainLayout
    │   ├── pages/           # All page components
    │   ├── redux/           # Store, slices (auth, cart, wishlist)
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account

### 1. Clone the repository
```bash
git clone https://github.com/Shashi0103/UrbanCart.git
cd UrbanCart
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/urbancart
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
STRIPE_SECRET_KEY=sk_test_your_stripe_key
CLIENT_URL=http://localhost:5173
```

Seed the database:
```bash
node src/utils/seed.js
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for access tokens |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key (use test key) |
| `CLIENT_URL` | Frontend URL for CORS |

### Frontend (optional `frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (default: http://localhost:5000/api) |

---

## 💳 Test Payment Credentials

This app uses **Stripe Sandbox mode**. No real charges are made.

| Field | Value |
|---|---|
| Card Number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g. `12/29`) |
| CVC | Any 3 digits (e.g. `123`) |
| Name | Any name |

---


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Shashi** — [@Shashi0103](https://github.com/Shashi0103)

---

<p align="center">Built with ❤️ using the MERN Stack</p>
