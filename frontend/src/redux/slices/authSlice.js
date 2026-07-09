import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('urbancart_user') 
  ? JSON.parse(localStorage.getItem('urbancart_user')) 
  : null;
const storedToken = localStorage.getItem('urbancart_token') || null;
const storedRefreshToken = localStorage.getItem('urbancart_refresh_token') || null;

const initialState = {
  user: storedUser,
  token: storedToken,
  refreshToken: storedRefreshToken,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      
      localStorage.setItem('urbancart_user', JSON.stringify(user));
      localStorage.setItem('urbancart_token', token);
      localStorage.setItem('urbancart_refresh_token', refreshToken);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      
      localStorage.removeItem('urbancart_user');
      localStorage.removeItem('urbancart_token');
      localStorage.removeItem('urbancart_refresh_token');
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('urbancart_user', JSON.stringify(state.user));
    }
  }
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
