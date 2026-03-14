import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, sendMessage } from "../../redux/userSlice";
import { getUserOrders } from "../../redux/orderSlice";
import { Card, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

// Helper to neatly format dates for the dropdown
function formatDateForDropdown(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
}

function MessagesPage() {
    const dispatch = useDispatch();
    const { users } = useSelector((state) => state.user);
    
    // Local state for the selected user and their fetched orders
    const [userId, setUserId] = useState("");
    const [userOrders, setUserOrders] = useState([]);
    const [isFetchingOrders, setIsFetchingOrders] = useState(false);
    
    const [orderId, setOrderId] = useState("");
    const [message, setMessage] = useState("");

    // 1. Initial Load: Fetch all users for the first dropdown
    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    // 2. Dynamic Fetch: When a user selects a user, fetch their orders
    useEffect(() => {
        if (userId) {
            setIsFetchingOrders(true);
            setOrderId(""); // Reset selected order
            
            dispatch(getUserOrders(userId))
                .unwrap()
                .then((orders) => {
                    // Sort orders newest first
                    const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setUserOrders(sorted);
                })
                .catch((err) => {
                    toast.error("Failed to load user's orders");
                })
                .finally(() => {
                    setIsFetchingOrders(false);
                });
        } else {
            setUserOrders([]);
            setOrderId("");
        }
    }, [dispatch, userId]);

    const handleSend = (e) => {
        e.preventDefault();
        dispatch(sendMessage({ userId, orderId: orderId || undefined, message })).then(
            (res) => {
                if (res.meta.requestStatus === "fulfilled") {
                    setMessage("");
                    setOrderId("");
                    toast.success("Message sent successfully");
                }
            }
        );
    };

    return (
        <>
            <h3 className="mb-4">💬 Send Message</h3>

            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSend}>
                                
                                {/* User Dropdown */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">Select User</Form.Label>
                                    <Form.Select
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        required
                                        className="shadow-sm"
                                    >
                                        <option value="">Choose a user...</option>
                                        {users.map((u) => (
                                            <option key={u._id} value={u._id}>
                                                {u.name} ({u.email})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                {/* Dynamic Order Dropdown */}
                                <Form.Group className="mb-4">
                                    <div className="d-flex justify-content-between align-items-end mb-2">
                                        <Form.Label className="fw-semibold mb-0">Select Related Order (Optional)</Form.Label>
                                        {isFetchingOrders && (
                                            <Spinner animation="border" size="sm" variant="primary" />
                                        )}
                                    </div>
                                    <Form.Select
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        disabled={!userId || isFetchingOrders}
                                        className="shadow-sm"
                                    >
                                        {/* Default / Unassociated Option */}
                                        <option value="">
                                            {userId ? "General Message (No Specific Order)" : "Select a user first..."}
                                        </option>
                                        
                                        {/* Populated Orders */}
                                        {userOrders.map((order) => (
                                            <option key={order._id} value={order._id}>
                                                Order #{order._id.slice(-8).toUpperCase()} • ₹{order.totalAmount} • {formatDateForDropdown(order.createdAt)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {userId && !isFetchingOrders && userOrders.length === 0 && (
                                        <Form.Text className="text-muted">
                                            This user has not placed any orders yet.
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                {/* Message Content Textarea */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">Message</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        required
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <Button type="submit" variant="danger" className="w-100 fw-bold py-2 shadow-sm">
                                    Send Message
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default MessagesPage;
