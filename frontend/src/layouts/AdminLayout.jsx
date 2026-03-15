import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { fetchAdminNotifications, receiveAdminNotification } from "../redux/adminNotificationSlice";
import Sidebar from "../components/Sidebar";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import socket from "../services/socket";
import ThemeToggle from "../components/ThemeToggle";

function AdminLayout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, role } = useSelector((state) => state.auth);

    useEffect(() => {
        // Load existing notifications from DB on mount
        dispatch(fetchAdminNotifications());

        if (user && role === "admin") {

            // ✅ FIX: emit "join_admin_room" INSIDE the "connect" handler.
            // socket.connect() is async — emitting immediately after calling it
            // means the event fires before the handshake completes and the
            // server never receives it, so the socket never joins admin_room.
            const handleConnect = () => {
                console.log("[Socket.IO] Admin connected:", socket.id);
                socket.emit("join_admin_room"); // safe to emit now — connection confirmed
            };

            const handleNotification = (notification) => {
                console.log("[Socket.IO] new_admin_notification received:", notification);
                dispatch(receiveAdminNotification(notification));
                toast.info(`🔔 ${notification.eventTitle}: ${notification.message}`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            };

            const handleDisconnect = (reason) => {
                console.warn("[Socket.IO] Admin disconnected:", reason);
            };

            // Register all listeners BEFORE connecting
            socket.on("connect", handleConnect);
            socket.on("new_admin_notification", handleNotification);
            socket.on("disconnect", handleDisconnect);

            // Now connect — "connect" event will fire once ready, which emits join_admin_room
            socket.connect();
        }

        // Cleanup: remove named listeners and disconnect on unmount / logout
        return () => {
            socket.off("connect");
            socket.off("new_admin_notification");
            socket.off("disconnect");
            socket.disconnect();
        };
    }, [dispatch, user, role]);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/", { replace: true });
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="admin-content w-100">
                <div className="admin-topbar shadow-sm d-flex justify-content-between align-items-center px-4 py-2">
                    <h5 className="mb-0">Pizza Admin</h5>
                    <div className="d-flex align-items-center gap-2">
                        <ThemeToggle />
                        <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </div>
                <div className="p-4 admin-page-shell min-vh-100">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;

