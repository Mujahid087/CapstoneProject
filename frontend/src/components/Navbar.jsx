import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { receiveRealTimeMessage } from "../redux/userSlice";
import { Navbar as BsNavbar, Nav, Container, Button, Badge, Dropdown } from "react-bootstrap";
import { forwardRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import ThemeToggle from "./ThemeToggle";
import API from "../services/api";
import UserAvatar from "./UserAvatar";

const socketUrl = (process.env.VITE_SOCKET_URL || "http://localhost:5000").replace(/\/+$/, "");

const AvatarToggle = forwardRef(({ onClick, name, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className="bg-transparent border-0 p-0 d-flex align-items-center"
    {...props}
    onClick={(event) => {
      event.preventDefault();
      onClick(event);
    }}
    aria-label="Open profile menu"
  >
    <UserAvatar name={name} size={36} className="d-block navbar-avatar" />
  </button>
));

AvatarToggle.displayName = "AvatarToggle";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { token, role, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { messages } = useSelector((state) => state.user);
  const { items: favoriteItems } = useSelector((state) => state.favorites);

  const [profileName, setProfileName] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let socket;

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

  useEffect(() => {
    let isMounted = true;

    if (!token || role !== "customer") {
      setProfileName("");
      return () => {
        isMounted = false;
      };
    }

    API.get("/user/profile")
      .then((res) => {
        if (isMounted) {
          setProfileName(res.data?.name || "");
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfileName("");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, role]);

  const unreadCount = messages?.filter((m) => !m.isRead).length || 0;
  const cartCount = items.length || 0;
  const username = profileName || user?.name || "Profile";
  const brandLink = token ? (role === "admin" ? "/admin/dashboard" : "/menu") : "/";

  const navLinkClass = (isActive) => (isActive ? "text-danger fw-semibold" : "text-light");

  const isPathActive = (targetPath) => location.pathname === targetPath;

  const closeMenu = () => setExpanded(false);

  const handleLogout = () => {
    dispatch(logout());
    closeMenu();
    navigate("/", { replace: true });
  };

  return (
    <BsNavbar expand="lg" sticky="top" className="shadow-sm app-navbar" expanded={expanded}>
      <Container>
        <BsNavbar.Brand as={Link} to={brandLink} onClick={closeMenu}>
          PizzaHub
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-nav" onClick={() => setExpanded((prev) => !prev)} />

        <BsNavbar.Collapse id="main-nav">
          <Nav className="me-auto align-items-lg-center gap-lg-1">
            {token && role === "customer" && (
              <>
                <Nav.Link as={Link} to="/menu" className={navLinkClass(isPathActive("/menu"))} onClick={closeMenu}>
                  Menu
                </Nav.Link>
                <Nav.Link as={Link} to="/cart" className={navLinkClass(isPathActive("/cart"))} onClick={closeMenu}>
                  <span className="d-inline-flex align-items-center gap-1">
                    <span role="img" aria-label="cart">🛒</span>
                    <span>Cart</span>
                    {cartCount > 0 && <Badge bg="danger" pill>{cartCount}</Badge>}
                  </span>
                </Nav.Link>
                <Nav.Link as={Link} to="/orders" className={navLinkClass(isPathActive("/orders"))} onClick={closeMenu}>
                  Orders
                </Nav.Link>
                <Nav.Link as={Link} to="/favorites" className={navLinkClass(isPathActive("/favorites"))} onClick={closeMenu}>
                  Favorites {favoriteItems.length > 0 && <Badge bg="danger" pill>{favoriteItems.length}</Badge>}
                </Nav.Link>
                <Nav.Link as={Link} to="/messages" className={`${navLinkClass(isPathActive("/messages"))} position-relative`} onClick={closeMenu}>
                  Messages
                  {unreadCount > 0 && (
                    <Badge bg="danger" pill className="ms-1">
                      {unreadCount}
                    </Badge>
                  )}
                </Nav.Link>
              </>
            )}
          </Nav>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            <ThemeToggle />

            {!token && (
              <>
                <Button variant="outline-light" size="sm" onClick={() => { closeMenu(); navigate("/login"); }}>
                  Login
                </Button>
                <Button variant="danger" size="sm" onClick={() => { closeMenu(); navigate("/register"); }}>
                  Register
                </Button>
              </>
            )}

            {token && role === "customer" && (
              <Dropdown align="end">
                <Dropdown.Toggle as={AvatarToggle} name={username} id="profile-avatar-dropdown" />
                <Dropdown.Menu className="dropdown-menu-end">
                  <Dropdown.Item as={Link} to="/profile" onClick={closeMenu}>
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            {token && role !== "customer" && (
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}

export default Navbar;
