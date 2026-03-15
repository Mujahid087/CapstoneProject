import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

export const fetchCategories = createAsyncThunk(
  "menu/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/user/categories");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch categories");
    }
  }
);

export const fetchMenuByCategory = createAsyncThunk(
  "menu/fetchMenuByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/user/menu/${categoryId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch menu");
    }
  }
);

export const fetchPublicMenuItems = createAsyncThunk(
  "menu/fetchPublicMenuItems",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/user/menu");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch menu");
    }
  }
);

export const fetchAllMenuItems = createAsyncThunk(
  "menu/fetchAllMenuItems",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/admin/menu");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch menu items");
    }
  }
);

export const createMenuItem = createAsyncThunk(
  "menu/createMenuItem",
  async (itemData, { rejectWithValue }) => {
    try {
      const res = await API.post("/admin/menu", itemData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create item");
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  "menu/updateMenuItem",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/admin/menu/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update item");
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  "menu/deleteMenuItem",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/admin/menu/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete item");
    }
  }
);

export const createCategory = createAsyncThunk(
  "menu/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const res = await API.post("/admin/category", categoryData);
      return res.data.category;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create category");
    }
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    categories: [],
    menuItems: [],
    allMenuItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearMenuError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMenuByCategory.pending, (state) => { state.loading = true; })
      .addCase(fetchMenuByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = action.payload;
      })
      .addCase(fetchMenuByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPublicMenuItems.pending, (state) => { state.loading = true; })
      .addCase(fetchPublicMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = action.payload;
      })
      .addCase(fetchPublicMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllMenuItems.pending, (state) => { state.loading = true; })
      .addCase(fetchAllMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.allMenuItems = action.payload;
      })
      .addCase(fetchAllMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.allMenuItems.push(action.payload);
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const idx = state.allMenuItems.findIndex((i) => i._id === action.payload._id);
        if (idx !== -1) state.allMenuItems[idx] = action.payload;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.allMenuItems = state.allMenuItems.filter((i) => i._id !== action.payload);
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      });
  },
});

export const { clearMenuError } = menuSlice.actions;
export default menuSlice.reducer;
