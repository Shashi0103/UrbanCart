import axiosClient from './axiosClient.js';

export const apiService = {
  // Auth API
  auth: {
    register: (data) => axiosClient.post('/auth/register', data).then(r => r.data),
    login: (data) => axiosClient.post('/auth/login', data).then(r => r.data),
    logout: (refreshToken) => axiosClient.post('/auth/logout', { refreshToken }).then(r => r.data),
    forgotPassword: (data) => axiosClient.post('/auth/forgot-password', data).then(r => r.data),
    resetPassword: (token, data) => axiosClient.post(`/auth/reset-password/${token}`, data).then(r => r.data),
    getMe: () => axiosClient.get('/auth/me').then(r => r.data),
  },

  // User Profile & Address API
  users: {
    updateProfile: (data) => axiosClient.put('/users/profile', data).then(r => r.data),
    getAddresses: () => axiosClient.get('/users/addresses').then(r => r.data),
    addAddress: (data) => axiosClient.post('/users/addresses', data).then(r => r.data),
    updateAddress: (id, data) => axiosClient.put(`/users/addresses/${id}`, data).then(r => r.data),
    deleteAddress: (id) => axiosClient.delete(`/users/addresses/${id}`).then(r => r.data),
    
    // Admin user routes
    getAllUsers: () => axiosClient.get('/users').then(r => r.data),
    toggleBlock: (id) => axiosClient.put(`/users/${id}/block`).then(r => r.data),
    toggleAdmin: (id) => axiosClient.put(`/users/${id}/admin`).then(r => r.data),
  },

  // Category API
  categories: {
    getAll: () => axiosClient.get('/categories').then(r => r.data),
    create: (data) => axiosClient.post('/categories', data).then(r => r.data),
    update: (id, data) => axiosClient.put(`/categories/${id}`, data).then(r => r.data),
    delete: (id) => axiosClient.delete(`/categories/${id}`).then(r => r.data),
  },

  // Brand API
  brands: {
    getAll: () => axiosClient.get('/brands').then(r => r.data),
    create: (data) => axiosClient.post('/brands', data).then(r => r.data),
    update: (id, data) => axiosClient.put(`/brands/${id}`, data).then(r => r.data),
    delete: (id) => axiosClient.delete(`/brands/${id}`).then(r => r.data),
  },

  // Product API
  products: {
    getAll: (params) => axiosClient.get('/products', { params }).then(r => r.data),
    getById: (id) => axiosClient.get(`/products/${id}`).then(r => r.data),
    create: (data) => axiosClient.post('/products', data).then(r => r.data),
    update: (id, data) => axiosClient.put(`/products/${id}`, data).then(r => r.data),
    delete: (id) => axiosClient.delete(`/products/${id}`).then(r => r.data),
    
    // Search Suggestions and AI Recommendations
    getSuggestions: (q) => axiosClient.get('/products/search/suggestions', { params: { q } }).then(r => r.data),
    getAiRecommendations: (params) => axiosClient.get('/products/ai/recommendations', { params }).then(r => r.data),
  },

  // Cart API (DB Sync)
  cart: {
    get: () => axiosClient.get('/cart').then(r => r.data),
    sync: (items) => axiosClient.post('/cart', { items }).then(r => r.data),
  },

  // Wishlist API
  wishlist: {
    get: () => axiosClient.get('/wishlist').then(r => r.data),
    toggle: (productId) => axiosClient.post(`/wishlist/${productId}`).then(r => r.data),
  },

  // Coupon API
  coupons: {
    validate: (code, purchaseAmount) => axiosClient.post('/coupons/validate', { code, purchaseAmount }).then(r => r.data),
    getAll: () => axiosClient.get('/coupons').then(r => r.data),
    create: (data) => axiosClient.post('/coupons', data).then(r => r.data),
    update: (id, data) => axiosClient.put(`/coupons/${id}`, data).then(r => r.data),
    delete: (id) => axiosClient.delete(`/coupons/${id}`).then(r => r.data),
  },

  // Review API
  reviews: {
    getByProductId: (productId) => axiosClient.get(`/reviews/product/${productId}`).then(r => r.data),
    create: (productId, data) => axiosClient.post(`/reviews/product/${productId}`, data).then(r => r.data),
    toggleHelpful: (id) => axiosClient.post(`/reviews/${id}/helpful`).then(r => r.data),
  },

  // Order API
  orders: {
    create: (data) => axiosClient.post('/orders', data).then(r => r.data),
    getById: (id) => axiosClient.get(`/orders/${id}`).then(r => r.data),
    getMyOrders: () => axiosClient.get('/orders/my-orders').then(r => r.data),
    
    // Admin orders routes
    getAll: () => axiosClient.get('/orders').then(r => r.data),
    updateStatus: (id, status) => axiosClient.put(`/orders/${id}/status`, { status }).then(r => r.data),
    getAnalytics: () => axiosClient.get('/orders/admin/analytics').then(r => r.data),
  },

  // Payment API
  payments: {
    createSession: (orderId) => axiosClient.post('/payments/create-checkout-session', { orderId }).then(r => r.data),
    confirmMock: (orderId, paymentIntentId) => axiosClient.post('/payments/confirm', { orderId, paymentIntentId }).then(r => r.data),
  },

  // Notification API
  notifications: {
    getAll: () => axiosClient.get('/notifications').then(r => r.data),
    markAsRead: (id) => axiosClient.put(`/notifications/${id}/read`).then(r => r.data),
    markAllAsRead: () => axiosClient.put('/notifications/read-all').then(r => r.data),
  }
};
export default apiService;
