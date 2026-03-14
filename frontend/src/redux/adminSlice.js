import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

export const fetchDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/admin/dashboard");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch dashboard");
    }
  }
);

export const fetchRevenue = createAsyncThunk(
  "admin/fetchRevenue",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/admin/revenue");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch revenue");
    }
  }
);

export const generateBill = createAsyncThunk(
  "admin/generateBill",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/admin/bill/${orderId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to generate bill");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    dashboard: null,
    revenue: [],
    bill: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearBill(state) { state.bill = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRevenue.pending, (state) => { state.loading = true; })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.revenue = action.payload;
      })
      .addCase(fetchRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generateBill.pending, (state) => { state.loading = true; })
      .addCase(generateBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bill = action.payload;
      })
      .addCase(generateBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBill } = adminSlice.actions;
export default adminSlice.reducer;
