import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { receiveRealTimeMessage } from "../redux/userSlice";
import { Navbar as BsNavbar, Nav, Container, Button, Badge } from "react-bootstrap";
import { useEffect } from "react";
import { io } from "socket.io-client";

function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, role, user } = useSelector((state) => state.auth);
    const { items } = useSelector((state) => state.cart);
    const { messages } = useSelector((state) => state.user);

    useEffect(() => {
        let socket;
        // Only set up customer socket — admin socket is handled by AdminLayout
        if (user?.id && role === "customer") {
            socket = io("http://localhost:5000");

            socket.emit("join_room", user.id);

            socket.on("new_notification", (newMessage) => {
                dispatch(receiveRealTimeMessage(newMessage));
            });
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, [dispatch, user, role]);

    const handleLogout = () => {
        navigate("/");
        // Defer auth state clearing to let the router move to "/" first
        // This prevents ProtectedRoute from intercepting and redirecting to "/login"
        setTimeout(() => {
            dispatch(logout());
        }, 0);
    };

    const unreadCount = messages?.filter(m => !m.isRead).length || 0;

    const brandLink = token
        ? role === "admin" ? "/admin/dashboard" : "/menu"
        : "/";

    return (
        <BsNavbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
            <Container>
                <BsNavbar.Brand as={Link} to={brandLink}>
                    🍕 PizzaHub
                </BsNavbar.Brand>
                <BsNavbar.Toggle aria-controls="main-nav" />
                <BsNavbar.Collapse id="main-nav">
                    <Nav className="me-auto">
                        {token && role === "customer" && (
                            <>
                                <Nav.Link as={Link} to="/menu">Menu</Nav.Link>
                                <Nav.Link as={Link} to="/cart">
                                    Cart{" "}
                                    {items.length > 0 && (
                                        <Badge bg="danger" pill>{items.length}</Badge>
                                    )}
                                </Nav.Link>
                                <Nav.Link as={Link} to="/orders">Orders</Nav.Link>
                                <Nav.Link as={Link} to="/messages" className="position-relative">
                                    Messages
                                    {unreadCount > 0 && (
                                        <Badge 
                                            bg="danger" 
                                            pill 
                                            className="ms-1"
                                        >
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </Nav.Link>
                                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                            </>
                        )}
                    </Nav>
                    <div className="d-flex align-items-center gap-2">
                        {token ? (
                            <Button variant="outline-light" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline-light" size="sm" onClick={() => navigate("/login")}>
                                    Login
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => navigate("/register")}>
                                    Register
                                </Button>
                            </>
                        )}
                    </div>
                </BsNavbar.Collapse>
            </Container>
        </BsNavbar>
    );
}

export default Navbar;
