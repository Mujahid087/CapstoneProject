import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminNotifications, markNotificationsRead } from "../../redux/adminNotificationSlice";
import { Table, Badge, Button, Card, Container } from "react-bootstrap";
import Loader from "../../components/Loader";

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} ${month} ${year} \u2022 ${time}`;
}

const eventColors = {
    "New Order": "primary",
    "Order Cancelled": "danger",
    "Payment Completed": "success",
    "Order Delivered": "info"
};

function AdminNotificationsPage() {
    const dispatch = useDispatch();
    const { notifications, loading } = useSelector((state) => state.adminNotifications);

    useEffect(() => {
        dispatch(fetchAdminNotifications());
        // Clean up equivalent - mark notifications as read when the admin enters or leaves the page.
        // Doing this instantly on load means the notification badge resets just by visiting the page.
        dispatch(markNotificationsRead());
    }, [dispatch]);

    return (
        <Container fluid className="px-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>🔔 Admin Notifications</h3>
                <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={() => dispatch(markNotificationsRead())}
                    disabled={notifications.every(n => n.isRead)}
                >
                    Mark All as Read
                </Button>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "20%" }}>Event Type</th>
                                <th style={{ width: "50%" }}>Message</th>
                                <th style={{ width: "30%" }}>Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-5">
                                        <Loader />
                                    </td>
                                </tr>
                            ) : notifications.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center text-muted py-5">
                                        No recent system events.
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((notif) => (
                                    <tr key={notif._id} className={notif.isRead ? "" : "table-active fw-semibold"}>
                                        <td>
                                            <Badge bg={eventColors[notif.eventTitle] || "secondary"} className="p-2">
                                                {notif.eventTitle}
                                            </Badge>
                                        </td>
                                        <td>{notif.message}</td>
                                        <td className="text-muted small">
                                            {formatDate(notif.createdAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default AdminNotificationsPage;
