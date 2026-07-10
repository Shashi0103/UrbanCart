import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [], // Array of { id, text, type, duration }
  unreadCount: 0
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addToast(state, action) {
      const { text, type = 'success', duration = 3000 } = action.payload;
      const id = Date.now().toString() + Math.random().toString().substring(2, 6);
      state.toasts.push({ id, text, type, duration });
    },
    removeToast(state, action) {
      const id = action.payload;
      state.toasts = state.toasts.filter((toast) => toast.id !== id);
    },
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
    decrementUnreadCount(state) {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    }
  }
});

export const { addToast, removeToast, setUnreadCount, decrementUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
