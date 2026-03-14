import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserOrders, cancelOrder } from "../../redux/orderSlice";
import { generateBill, clearBill } from "../../redux/adminSlice";
import { Table, Badge, Button, Modal, Row, Col, Pagination, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const statusVariant = {
    pending: "warning",           // Yellow
    paid: "success",              // Green
    confirmed: "info",            // Light Blue
    preparing: "primary",         // Blue
    out_for_delivery: "secondary",// Grey
    delivered: "success",         // Dark Green handled via style if needed, but success is green
    cancelled: "danger",          // Red
    refunded: "info",             // Light Blue
};

const statusLabel = {
    pending: "Pending",
    paid: "Paid",
    confirmed: "Confirmed",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
};

const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;
const ORDERS_PER_PAGE = 5;

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} ${month} ${year} \u2022 ${time}`;
}

// Helper to format item display (e.g., "Pizza x1 + 2 more items")
function formatItemsList(items) {
    if (!items || items.length === 0) return "No items";
    const firstItem = `${items[0].name} (x${items[0].quantity})`;
    if (items.length === 1) return firstItem;
    return `${firstItem} + ${items.length - 1} more item${items.length > 2 ? 's' : ''}`;
}

function OrdersPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, loading } = useSelector((state) => state.order);
    const { bill } = useSelector((state) => state.admin);
    const { user } = useSelector((state) => state.auth);
    const [showBill, setShowBill] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const billRef = useRef();

    useEffect(() => {
        if (user?.id) {
            dispatch(getUserOrders(user.id));
        }
    }, [dispatch, user]);

    const handleCancel = (id) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            dispatch(cancelOrder(id)).then((res) => {
                if (res.meta.requestStatus === "fulfilled") {
                    toast.success("Order cancelled successfully");
                }
            });
        }
    };

    const handleViewBill = (orderId) => {
        dispatch(generateBill(orderId));
        setShowBill(true);
    };

    const closeBill = () => {
        setShowBill(false);
        dispatch(clearBill());
    };

    const handlePrint = () => {
        const content = billRef.current;
        const printWindow = window.open("", "_blank", "width=600,height=800");
        printWindow.document.write(
            "<html><head><title>Order Bill</title>" +
            '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">' +
            "<style>body{padding:20px;font-family:'Segoe UI',sans-serif;}@media print{.no-print{display:none;}}</style>" +
            "</head><body>" + content.innerHTML + "</body></html>"
        );
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 500);
    };

    if (loading) return <Loader />;

    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const totalPages = Math.ceil(sortedOrders.length / ORDERS_PER_PAGE);
    const paginatedOrders = sortedOrders.slice(
        (currentPage - 1) * ORDERS_PER_PAGE,
        currentPage * ORDERS_PER_PAGE
    );

    const subtotal = bill?.items?.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0) || 0;
    const tax = Math.round(subtotal * TAX_RATE);
    const deliveryFee = bill?.deliveryMode === "pickup" ? 0 : DELIVERY_FEE;

    return (
        <>
            <h3 className="mb-4">📦 My Orders</h3>

            {orders.length === 0 ? (
                <Card className="shadow-sm border-0 text-center py-5">
                    <Card.Body>
                        <div className="fs-1 mb-3">🍕</div>
                        <h5 className="text-muted">You haven&apos;t placed any orders yet.</h5>
                        <p className="text-muted small mb-3">Browse our delicious menu and place your first order!</p>
                        <Button variant="danger" size="lg" onClick={() => navigate("/menu")}>
                            Browse Menu
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <>
                    <Table striped bordered hover responsive className="align-middle bg-white shadow-sm">
                        <thead className="table-dark">
                            <tr>
                                <th>Order ID</th>
                                <th>Items</th>
                                <th className="text-end">Total</th>
                                <th className="text-center">Order Status</th>
                                <th className="text-center">Payment Status</th>
                                <th>Date</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.map((order) => {
                                const payStatus = order.paymentStatus || "pending"; // default if missing
                                const ordStatus = order.orderStatus;
                                
                                const getOrderTotal = () => {
                                    if (order.finalPrice) return order.finalPrice;
                                    if (order.totalAmount) return order.totalAmount;
                                    
                                    const itemsTotal = order.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0;
                                    const deliveryFee = order.deliveryMode === 'delivery' ? 50 : 0;
                                    const tax = Math.round(itemsTotal * 0.05);
                                    const discountAmount = order.discountAmount || 0;
                                    
                                    return itemsTotal - discountAmount + deliveryFee + tax;
                                };
                                const finalAmount = getOrderTotal();

                                return (
                                <tr key={order._id}>
                                    <td>
                                        <code className="small">#{order._id.slice(-8).toUpperCase()}</code>
                                    </td>
                                    <td>
                                        <span className="fw-semibold text-dark">
                                            {formatItemsList(order.items)}
                                        </span>
                                    </td>
                                    <td className="text-end fw-bold">₹{finalAmount}</td>
                                    <td className="text-center">
                                        <Badge bg={statusVariant[ordStatus] || "secondary"} className="px-2 py-1 shadow-sm">
                                            {statusLabel[ordStatus] || ordStatus}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg={statusVariant[payStatus]} className="px-2 py-1 shadow-sm">
                                            {statusLabel[payStatus] || payStatus}
                                        </Badge>
                                    </td>
                                    <td className="small text-muted">{formatDate(order.createdAt)}</td>
                                    <td className="text-center">
                                        <div className="d-flex gap-2 justify-content-center flex-wrap">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleViewBill(order._id)}
                                            >
                                                View Bill
                                            </Button>
                                            
                                            {/* Dynamic Render: Pending Order & Unpaid -> Can Pay/Cancel */}
                                            {ordStatus === "pending" && payStatus !== "paid" && (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="shadow-sm"
                                                        onClick={() => navigate(`/payment/${order._id}`)}
                                                    >
                                                        Pay Now
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleCancel(order._id)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}

                                            {/* Dynamic Render: Delivered -> Can Reorder */}
                                            {ordStatus === "delivered" && (
                                                 <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => navigate("/menu")}
                                                >
                                                    Reorder
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                            <Pagination>
                                <Pagination.Prev
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                />
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <Pagination.Item
                                        key={i + 1}
                                        active={currentPage === i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                />
                            </Pagination>
                        </div>
                    )}
                </>
            )}

            <Modal show={showBill && bill} onHide={closeBill} centered size="lg">
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>🧾 Order Bill</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {bill && (
                        <div ref={billRef}>
                            <div className="p-4">
                                <div className="text-center mb-3">
                                    <h4 className="fw-bold mb-0">🍕 PizzaHub</h4>
                                    <small className="text-muted">Order Receipt</small>
                                </div>

                                <hr />

                                <Row className="mb-3">
                                    <Col sm={6}>
                                        <small className="text-muted d-block">Order ID</small>
                                        <strong className="small">{bill.orderId}</strong>
                                    </Col>
                                    <Col sm={6} className="text-sm-end">
                                        <small className="text-muted d-block">Date</small>
                                        <strong className="small">{formatDate(bill.createdAt)}</strong>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col sm={6}>
                                        <small className="text-muted d-block">Customer</small>
                                        <strong>{bill.customer}</strong>
                                        {bill.phone && <div className="small text-muted">📞 {bill.phone}</div>}
                                    </Col>
                                    <Col sm={6}>
                                        <small className="text-muted d-block">Status</small>
                                        <Badge bg={statusVariant[bill.status] || "secondary"} className="text-uppercase">
                                            {statusLabel[bill.status] || bill.status}
                                        </Badge>
                                        <Badge bg="dark" className="ms-2 text-uppercase">
                                            {bill.deliveryMode || "delivery"}
                                        </Badge>
                                    </Col>
                                </Row>

                                {bill.address && (
                                    <div className="mb-3 p-3 bg-light rounded">
                                        <small className="text-muted d-block mb-1">📍 Delivery Address</small>
                                        <strong>{bill.address.houseNumber}, {bill.address.street}</strong>
                                        <div className="small">{bill.address.city}, {bill.address.state} - {bill.address.pincode}</div>
                                        {bill.address.landmark && (
                                            <div className="small text-muted">Near {bill.address.landmark}</div>
                                        )}
                                    </div>
                                )}

                                <Table bordered size="sm" className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Item</th>
                                            <th className="text-center" style={{ width: "60px" }}>Qty</th>
                                            <th className="text-end" style={{ width: "80px" }}>Price</th>
                                            <th className="text-end" style={{ width: "90px" }}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bill.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.name}</td>
                                                <td className="text-center">{item.quantity}</td>
                                                <td className="text-end">₹{item.price}</td>
                                                <td className="text-end fw-semibold">₹{(item.price || 0) * (item.quantity || 1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                <div className="border rounded mt-3 p-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted">Subtotal</span>
                                        <span>₹{subtotal}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted">Delivery Fee{bill.deliveryMode === "pickup" ? " (Pickup)" : ""}</span>
                                        <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Tax (5%)</span>
                                        <span>₹{tax}</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="d-flex justify-content-between">
                                        <strong className="fs-5">Total</strong>
                                        <strong className="fs-5 text-danger">₹{subtotal + deliveryFee + tax}</strong>
                                    </div>
                                </div>

                                {bill.payment && (
                                    <div className="mt-3 p-3 bg-light rounded">
                                        <small className="text-muted d-block mb-1">💳 Payment Information</small>
                                        <Row>
                                            <Col xs={6}>
                                                <div className="small text-muted">Method</div>
                                                <strong className="text-uppercase">{bill.payment.paymentMode}</strong>
                                            </Col>
                                            <Col xs={6} className="text-end">
                                                <div className="small text-muted">Status</div>
                                                <Badge bg={bill.payment.paymentStatus === "completed" ? "success" : "warning"}>
                                                    {bill.payment.paymentStatus === "completed" ? "Paid" : "Pending"}
                                                </Badge>
                                            </Col>
                                        </Row>
                                        {bill.payment.transactionId && (
                                            <div className="small text-muted mt-1">Txn: {bill.payment.transactionId}</div>
                                        )}
                                    </div>
                                )}

                                <div className="text-center mt-3 text-muted small">
                                    Thank you for ordering from PizzaHub!
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <Button variant="outline-secondary" onClick={closeBill}>Close</Button>
                    <Button variant="danger" onClick={handlePrint}>🖨️ Print / Download Bill</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default OrdersPage;
