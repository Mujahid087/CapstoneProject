import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../services/api";

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/user/favorites");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch favorites");
    }
  }
);

export const addFavorite = createAsyncThunk(
  "favorites/addFavorite",
  async (itemId, { rejectWithValue }) => {
    try {
      const res = await API.post(`/user/favorites/${itemId}`);
      return res.data.favorites;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add favorite");
    }
  }
);

export const removeFavorite = createAsyncThunk(
  "favorites/removeFavorite",
  async (itemId, { rejectWithValue }) => {
    try {
      const res = await API.delete(`/user/favorites/${itemId}`);
      return res.data.favorites;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove favorite");
    }
  }
);

const favoriteSlice = createSlice({
  name: "favorites",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase("auth/logout", (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export default favoriteSlice.reducer;
