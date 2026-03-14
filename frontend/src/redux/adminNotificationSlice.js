import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

export const fetchAdminNotifications = createAsyncThunk(
    "adminNotifications/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get("/admin/notifications");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch admin notifications");
        }
    }
);

export const markNotificationsRead = createAsyncThunk(
    "adminNotifications/markRead",
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.put("/admin/notifications/read");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to mark notifications read");
        }
    }
);

const adminNotificationSlice = createSlice({
    name: "adminNotifications",
    initialState: {
        notifications: [],
        loading: false,
        error: null,
    },
    reducers: {
        receiveAdminNotification(state, action) {
            // Unshift places the newest real-time notification at the precise top of the array
            state.notifications.unshift(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminNotifications.pending, (state) => { state.loading = true; })
            .addCase(fetchAdminNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload;
            })
            .addCase(fetchAdminNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(markNotificationsRead.fulfilled, (state) => {
                // Instantly sync the UI state to all read status without waiting for network re-fetch
                state.notifications.forEach(n => n.isRead = true);
            });
    }
});

export const { receiveAdminNotification } = adminNotificationSlice.actions;
export default adminNotificationSlice.reducer;
