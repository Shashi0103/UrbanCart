import axios from 'axios';
import store from '../redux/store.js';
import { setCredentials, logout } from '../redux/slices/authSlice.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request Interceptor: Attach Auth Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('urbancart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Token Refresh on 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('urbancart_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call token refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { token } = response.data;

        // Store new token
        localStorage.setItem('urbancart_token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Update Redux state
        const user = JSON.parse(localStorage.getItem('urbancart_user'));
        store.dispatch(setCredentials({ user, token, refreshToken }));

        // Retry original request
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh expired or failed:', refreshError);
        // Force user logout
        store.dispatch(logout());
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
