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
      const { token } = res.data;
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      return { token, user: { id: decoded.id }, role: decoded.role };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
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
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.role = null;
      localStorage.removeItem("token");
    },
    clearAuthError(state) {
      state.error = null;
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
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
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.role;
      })
      .addCase(loginUser.rejected, (state, action) => {
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

export const { logout, clearAuthError, clearSuccessMessage } = authSlice.actions;
export default authSlice.reducer;
