import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (cartData, { rejectWithValue }) => {
    try {
      const res = await API.post("/user/cart", cartData);
      return res.data.cartItem.items;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add to cart");
    }
  }
);

export const getCart = createAsyncThunk(
  "cart/getCart",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/user/cart/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to get cart");
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, itemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/user/cart/${userId}/${itemId}`, { quantity });
      return res.data.items;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update quantity");
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async ({ userId, itemId }, { rejectWithValue }) => {
    try {
      const res = await API.delete(`/user/cart/${userId}/${itemId}`);
      return res.data.items;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove item");
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (userId, { rejectWithValue }) => {
    try {
      await API.delete(`/user/cart/${userId}`);
      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to clear cart");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(getCart.pending, (state) => { state.loading = true; })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      })
      .addCase("auth/logout", (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export default cartSlice.reducer;
