import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import menuReducer from "./menuSlice";
import cartReducer from "./cartSlice";
import orderReducer from "./orderSlice";
import userReducer from "./userSlice";
import adminReducer from "./adminSlice";
import adminNotificationReducer from "./adminNotificationSlice";
import favoriteReducer from "./favoriteSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    cart: cartReducer,
    order: orderReducer,
    user: userReducer,
    favorites: favoriteReducer,
    admin: adminReducer,
    adminNotifications: adminNotificationReducer,
  },
});

export default store;
