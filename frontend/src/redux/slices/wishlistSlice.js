import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [] // Array of Product objects
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistItems(state, action) {
      state.items = action.payload;
    },
    toggleWishlistState(state, action) {
      const product = action.payload;
      const index = state.items.findIndex(item => item._id === product._id);
      
      if (index === -1) {
        state.items.push(product);
      } else {
        state.items.splice(index, 1);
      }
    }
  }
});

export const { setWishlistItems, toggleWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
