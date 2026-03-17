import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/admin/users");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const getUserAddresses = createAsyncThunk(
  "user/getUserAddresses",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/user/address/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch addresses");
    }
  }
);

export const addAddress = createAsyncThunk(
  "user/addAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const res = await API.post("/user/address", addressData);
      return res.data.address;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add address");
    }
  }
);

export const updateAddress = createAsyncThunk(
  "user/updateAddress",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/user/address/${id}`, data);
      return res.data.address;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update address");
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "user/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/user/address/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete address");
    }
  }
);

export const getUserMessages = createAsyncThunk(
  "user/getUserMessages",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/user/messages/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch messages");
    }
  }
);

export const sendMessage = createAsyncThunk(
  "user/sendMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      const res = await API.post("/admin/message", messageData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send message");
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  "user/markMessageAsRead",
  async (messageId, { rejectWithValue }) => {
    try {
      const res = await API.put(`/user/messages/${messageId}/read`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark as read");
    }
  }
);

export const makePayment = createAsyncThunk(
  "user/makePayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const res = await API.post("/user/payment", paymentData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Payment failed");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    addresses: [],
    messages: [],
    loading: false,
    error: null,
    paymentSuccess: null,
  },
  reducers: {
    clearUserError(state) { state.error = null; },
    clearPaymentSuccess(state) { state.paymentSuccess = null; },
    receiveRealTimeMessage(state, action) {
      
      state.messages.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => { state.loading = true; })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserAddresses.pending, (state) => { state.loading = true; })
      .addCase(getUserAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(getUserAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const idx = state.addresses.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.addresses[idx] = action.payload;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((a) => a._id !== action.payload);
      })
      .addCase(getUserMessages.pending, (state) => { state.loading = true; })
      .addCase(getUserMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(getUserMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const idx = state.messages.findIndex((m) => m._id === action.payload._id);
        if (idx !== -1) state.messages[idx] = action.payload;
      })
      .addCase(makePayment.fulfilled, (state, action) => {
        state.paymentSuccess = action.payload.message;
      })
      .addCase(makePayment.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase("auth/logout", (state) => {
        state.users = [];
        state.addresses = [];
        state.messages = [];
        state.loading = false;
        state.error = null;
        state.paymentSuccess = null;
      });
  },
});

export const { clearUserError, clearPaymentSuccess, receiveRealTimeMessage } = userSlice.actions;
export default userSlice.reducer;
