import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";

const localToken = localStorage.getItem("token");
let initialUser = null;
let initialRole = null;
let validToken = null;

if (localToken && localToken !== "null" && localToken !== "undefined") {
  try {
    const decoded = jwtDecode(localToken);
    if (decoded.exp * 1000 > Date.now()) {
      initialUser = { id: decoded.id };
      initialRole = decoded.role;
      validToken = localToken;
    } else {
      localStorage.removeItem("token");
    }
  } catch {
    localStorage.removeItem("token");
  }
}

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await API.post("/user/register", userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await API.post("/user/login", credentials);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        const decoded = jwtDecode(res.data.token);
        return {
          message: res.data.message,
          requiresOtp: false,
          token: res.data.token,
          user: { id: decoded.id },
          role: decoded.role,
        };
      }

      return {
        message: res.data.message,
        email: res.data.email,
        requiresOtp: Boolean(res.data.requiresOtp),
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await API.post("/user/verify-otp", { email, otp });
      const { token } = res.data;
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      return { token, user: { id: decoded.id }, role: decoded.role };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "OTP verification failed");
    }
  }
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (email, { rejectWithValue }) => {
    try {
      const res = await API.post("/user/resend-otp", { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to resend OTP");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await API.put("/user/profile", profileData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,
    token: validToken || null,
    role: initialRole,
    pendingEmail: null,
    otpRequired: false,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.role = null;
      state.pendingEmail = null;
      state.otpRequired = false;
      localStorage.removeItem("token");
    },
    clearAuthError(state) {
      state.error = null;
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
    clearOtpState(state) {
      state.pendingEmail = null;
      state.otpRequired = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.requiresOtp) {
          state.pendingEmail = action.payload.email;
          state.otpRequired = true;
          state.token = null;
          state.user = null;
          state.role = null;
        } else {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.role = action.payload.role;
          state.pendingEmail = null;
          state.otpRequired = false;
        }
        state.successMessage = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.pendingEmail = null;
        state.otpRequired = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError, clearSuccessMessage, clearOtpState } = authSlice.actions;
export default authSlice.reducer;
