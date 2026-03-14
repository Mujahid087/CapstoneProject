import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserMessages, markMessageAsRead } from "../../redux/userSlice";
import { Card, Badge, Row, Col } from "react-bootstrap";
import Loader from "../../components/Loader";

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} ${month} ${year} \u2022 ${time}`;
}

const statusIcons = {
    preparing: "🍳",
    out_for_delivery: "🛵",
    delivered: "✅",
    confirmed: "📋",
    cancelled: "❌",
    pending: "⏳",
};

function getStatusFromMessage(msg) {
    const text = (msg || "").toLowerCase();
    if (text.includes("delivered")) return "delivered";
    if (text.includes("out for delivery")) return "out_for_delivery";
    if (text.includes("preparing") || text.includes("prepared")) return "preparing";
    if (text.includes("confirmed")) return "confirmed";
    if (text.includes("cancelled")) return "cancelled";
    return "pending";
}

function getOrderName(order) {
    if (!order) return null;
    if (order.items && order.items.length > 0) {
        return order.items.map((i) => i.name).join(", ");
    }
    return `Order #${order._id?.slice(-6)}`;
}

function getOrderId(order) {
    if (!order || !order._id) return null;
    return `#${order._id.slice(-8).toUpperCase()}`;
}

function MessagesPage() {
    const dispatch = useDispatch();
    const { messages, loading } = useSelector((state) => state.user);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user?.id) dispatch(getUserMessages(user.id));
    }, [dispatch, user]);

    const handleMarkRead = (msg) => {
        if (!msg.isRead) {
            dispatch(markMessageAsRead(msg._id));
        }
    };

    if (loading) return <Loader />;

    const grouped = {};
    messages.forEach((msg) => {
        const key = msg.orderId?._id || msg._id;
        if (!grouped[key]) {
            grouped[key] = {
                orderId: msg.orderId,
                messages: [],
            };
        }
        grouped[key].messages.push(msg);
    });

    const groups = Object.values(grouped);

    return (
        <>
            <h3 className="mb-4">🔔 Notifications</h3>

            {messages.length === 0 ? (
                <Card className="shadow-sm border-0 text-center py-5">
                    <Card.Body>
                        <div className="fs-1 mb-3">🔕</div>
                        <h5 className="text-muted">You don&apos;t have any notifications yet.</h5>
                        <p className="text-muted small">
                            Order updates and messages from PizzaHub will appear here.
                        </p>
                    </Card.Body>
                </Card>
            ) : (
                groups.map((group, gIdx) => (
                    <Card key={gIdx} className="shadow-sm border-0 mb-4">
                        {group.orderId && (
                            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="fw-bold">{getOrderId(group.orderId)}</span>
                                    <span className="text-muted ms-2 small">
                                        {getOrderName(group.orderId)}
                                    </span>
                                </div>
                                <Badge bg="dark" className="text-uppercase small">
                                    {group.orderId.orderStatus || "—"}
                                </Badge>
                            </Card.Header>
                        )}
                        <Card.Body className="p-0">
                            {group.messages.map((msg) => {
                                const status = getStatusFromMessage(msg.message);
                                const icon = statusIcons[status] || "📩";

                                return (
                                    <div
                                        key={msg._id}
                                        className={`d-flex align-items-start gap-3 p-3 border-bottom ${!msg.isRead ? "bg-light" : ""
                                            }`}
                                        style={{ cursor: !msg.isRead ? "pointer" : "default" }}
                                        onClick={() => handleMarkRead(msg)}
                                    >
                                        <div className="fs-3">{icon}</div>
                                        <div className="flex-grow-1">
                                            <p className="mb-1 fw-semibold">{msg.message}</p>
                                            <small className="text-muted">{formatDate(msg.createdAt)}</small>
                                        </div>
                                        <div>
                                            {!msg.isRead && (
                                                <Badge bg="danger" pill>New</Badge>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </Card.Body>
                    </Card>
                ))
            )}
        </>
    );
}

export default MessagesPage;
