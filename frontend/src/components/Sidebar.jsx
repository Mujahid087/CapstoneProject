import { Nav, Badge } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

function Sidebar() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const { notifications } = useSelector(state => state.adminNotifications);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const links = [
        { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/admin/notifications", label: "Notifications", icon: "🔔", badge: unreadCount },
        { path: "/admin/categories", label: "Categories", icon: "📁" },
        { path: "/admin/menu", label: "Menu Items", icon: "🍕" },
        { path: "/admin/users", label: "Users", icon: "👥" },
        { path: "/admin/orders", label: "Orders", icon: "📦" },
        { path: "/admin/revenue", label: "Revenue", icon: "💰" },
    ];

    return (
        <>
            <button
                className="btn btn-dark d-lg-none position-fixed top-0 start-0 m-2 z-3"
                onClick={() => setCollapsed(!collapsed)}
                style={{ zIndex: 1060 }}
            >
                ☰
            </button>

            <div
                className={`sidebar bg-dark text-white vh-100 p-3 ${collapsed ? "d-none" : "d-none d-lg-block"}`}
                style={{ width: "240px", position: "fixed", top: 0, left: 0, zIndex: 1050 }}
            >
                <h4 className="text-center mb-4 mt-2">🍕 Admin Panel</h4>
                <Nav className="flex-column">
                    {links.map((link) => (
                        <Nav.Link
                            as={Link}
                            to={link.path}
                            key={link.path}
                            className={`text-white mb-1 rounded px-3 py-2 ${location.pathname === link.path ? "bg-danger" : ""
                                }`}
                            onClick={() => setCollapsed(false)}
                        >
                            {link.icon} {link.label}
                            {link.badge > 0 && (
                                <Badge bg="danger" className="ms-2 float-end rounded-pill">
                                    {link.badge}
                                </Badge>
                            )}
                        </Nav.Link>
                    ))}
                </Nav>
            </div>

            {collapsed && (
                <>
                    <div
                        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
                        style={{ zIndex: 1040 }}
                        onClick={() => setCollapsed(false)}
                    />
                    <div
                        className="sidebar bg-dark text-white vh-100 p-3 d-lg-none"
                        style={{ width: "240px", position: "fixed", top: 0, left: 0, zIndex: 1050 }}
                    >
                        <h4 className="text-center mb-4 mt-2">🍕 Admin Panel</h4>
                        <Nav className="flex-column">
                            {links.map((link) => (
                                <Nav.Link
                                    as={Link}
                                    to={link.path}
                                    key={link.path}
                                    className={`text-white mb-1 rounded px-3 py-2 ${location.pathname === link.path ? "bg-danger" : ""
                                        }`}
                                    onClick={() => setCollapsed(false)}
                                >
                                    {link.icon} {link.label}
                                    {link.badge > 0 && (
                                        <Badge bg="danger" className="ms-2 float-end rounded-pill">
                                            {link.badge}
                                        </Badge>
                                    )}
                                </Nav.Link>
                            ))}
                        </Nav>
                    </div>
                </>
            )}
        </>
    );
}

export default Sidebar;
