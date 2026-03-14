import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import CustomerLayout from "../layouts/CustomerLayout";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";

import MenuPage from "../pages/customer/MenuPage";
import CartPage from "../pages/customer/CartPage";
import OrdersPage from "../pages/customer/OrdersPage";
import PaymentPage from "../pages/customer/PaymentPage";
import CheckoutPage from "../pages/customer/CheckoutPage";
import ProfilePage from "../pages/customer/ProfilePage";
import MessagesPage from "../pages/customer/MessagesPage";

import DashboardPage from "../pages/admin/DashboardPage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import MenuItemsPage from "../pages/admin/MenuItemsPage";
import UsersPage from "../pages/admin/UsersPage";
import AdminOrdersPage from "../pages/admin/OrdersPage";
import RevenuePage from "../pages/admin/RevenuePage";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage";

function AppRoutes() {
    const { token, role } = useSelector((state) => state.auth);

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
                path="/login"
                element={
                    token ? (
                        <Navigate to={role === "admin" ? "/admin/dashboard" : "/menu"} replace />
                    ) : (
                        <LoginPage />
                    )
                }
            />
            <Route
                path="/register"
                element={token ? <Navigate to="/menu" replace /> : <RegisterPage />}
            />

            <Route
                element={
                    <ProtectedRoute allowedRoles={["customer"]}>
                        <CustomerLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/payment/:orderId" element={<PaymentPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/messages" element={<MessagesPage />} />
            </Route>

            <Route
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/categories" element={<CategoriesPage />} />
                <Route path="/admin/menu" element={<MenuItemsPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/revenue" element={<RevenuePage />} />
                <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default AppRoutes;
