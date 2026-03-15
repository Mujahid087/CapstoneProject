import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { receiveRealTimeMessage } from "../redux/userSlice";
import { Navbar as BsNavbar, Nav, Container, Button, Badge } from "react-bootstrap";
import { useEffect } from "react";
import { io } from "socket.io-client";
import ThemeToggle from "./ThemeToggle";

const socketUrl = (import.meta.env.VITE_SOCKET_URL || "http://localhost:5000").replace(/\/+$/, "");

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, role, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { messages } = useSelector((state) => state.user);
  const { items: favoriteItems } = useSelector((state) => state.favorites);

  useEffect(() => {
    let socket;

    // Only set up customer socket; admin socket is handled by AdminLayout.
    if (user?.id && role === "customer") {
      socket = io(socketUrl);

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
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const unreadCount = messages?.filter((m) => !m.isRead).length || 0;

  const brandLink = token ? (role === "admin" ? "/admin/dashboard" : "/menu") : "/";

  return (
    <BsNavbar expand="lg" sticky="top" className="shadow-sm app-navbar">
      <Container>
        <BsNavbar.Brand as={Link} to={brandLink}>
          PizzaHub
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-nav" />
        <BsNavbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {token && role === "customer" && (
              <>
                <Nav.Link as={Link} to="/menu">
                  Menu
                </Nav.Link>
                <Nav.Link as={Link} to="/cart">
                  Cart {items.length > 0 && <Badge bg="danger" pill>{items.length}</Badge>}
                </Nav.Link>
                <Nav.Link as={Link} to="/orders">
                  Orders
                </Nav.Link>
                <Nav.Link as={Link} to="/favorites">
                  Favorites {favoriteItems.length > 0 && <Badge bg="danger" pill>{favoriteItems.length}</Badge>}
                </Nav.Link>
                <Nav.Link as={Link} to="/messages" className="position-relative">
                  Messages
                  {unreadCount > 0 && (
                    <Badge bg="danger" pill className="ms-1">
                      {unreadCount}
                    </Badge>
                  )}
                </Nav.Link>
                <Nav.Link as={Link} to="/profile">
                  Profile
                </Nav.Link>
              </>
            )}
          </Nav>
          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
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

