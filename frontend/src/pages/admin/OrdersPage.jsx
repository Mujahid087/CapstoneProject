import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrders, updateOrderStatus } from "../../redux/orderSlice";
import { generateBill, clearBill } from "../../redux/adminSlice";
import { Table, Badge, Form, Modal, Button, InputGroup, Row, Col, Tabs, Tab } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const statusOptions = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

const statusVariant = {
    pending: "warning",
    confirmed: "info",
    preparing: "primary",
    out_for_delivery: "secondary",
    delivered: "success",
    cancelled: "danger",
};

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} ${month} ${year} \u2022 ${time}`;
}

const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;

function OrdersPage() {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.order);
    const { bill } = useSelector((state) => state.admin);
    const [showBill, setShowBill] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [activeTab, setActiveTab] = useState("active");
    const billRef = useRef();

    useEffect(() => {
        dispatch(getAllOrders());
    }, [dispatch]);

    const handleStatusChange = (id, status) => {
        dispatch(updateOrderStatus({ id, status })).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
                toast.success("Order status updated");
            }
        });
    };

    const handleBill = (orderId) => {
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

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            !search ||
            order.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
            order._id?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const activeOrdersMap = ["pending", "confirmed", "preparing", "out_for_delivery"];
    const activeOrders = filteredOrders.filter(o => activeOrdersMap.includes(o.orderStatus));
    const completedOrders = filteredOrders.filter(o => !activeOrdersMap.includes(o.orderStatus));

    if (loading) return <Loader />;

    const subtotal = bill?.items?.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0) || 0;
    const tax = Math.round(subtotal * TAX_RATE);
    const deliveryFee = bill?.deliveryMode === "pickup" ? 0 : DELIVERY_FEE;

    return (
        <>
            <h3 className="mb-4">📦 All Orders</h3>

            <div className="d-flex gap-3 mb-3 flex-wrap">
                <InputGroup style={{ maxWidth: "300px" }}>
                    <Form.Control
                        placeholder="Search by customer or order ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </InputGroup>
                <Form.Select
                    style={{ maxWidth: "200px" }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </Form.Select>
            </div>

            <Tabs
                id="admin-orders-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
                variant="pills"
            >
                <Tab eventKey="active" title={`🟢 Active Orders (${activeOrders.length})`}>
                    <OrderTable orders={activeOrders} handleStatusChange={handleStatusChange} handleBill={handleBill} isCompleted={false} />
                </Tab>
                <Tab eventKey="completed" title={`🏁 Completed Orders (${completedOrders.length})`}>
                    <OrderTable orders={completedOrders} handleStatusChange={handleStatusChange} handleBill={handleBill} isCompleted={true} />
                </Tab>
            </Tabs>

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
                                        {bill.email && <div className="small text-muted">✉️ {bill.email}</div>}
                                    </Col>
                                    <Col sm={6}>
                                        <small className="text-muted d-block">Status</small>
                                        <Badge bg={statusVariant[bill.status] || "secondary"} className="text-uppercase">
                                            {bill.status}
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
                                        {bill.payment.paidAt && (
                                            <div className="small text-muted">Paid on: {formatDate(bill.payment.paidAt)}</div>
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

function OrderTable({ orders, handleStatusChange, handleBill, isCompleted }) {
    return (
        <Table striped bordered hover responsive className="bg-white shadow-sm">
            <thead className="table-dark">
                <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    {/* Only show "Update Status" header if not completed, or alternatively keep it and show disabled dropdowns */}
                    <th>{isCompleted ? "Status Log" : "Update Status"}</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {orders.length === 0 ? (
                    <tr>
                        <td colSpan="7" className="text-center text-muted py-4">No orders found in this category</td>
                    </tr>
                ) : (
                    orders.map((order, idx) => {
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
                            <td>{idx + 1}</td>
                            <td>{order.userId?.name || "N/A"}</td>
                            <td>{order.items?.map((i) => `${i.name} x${i.quantity}`).join(", ")}</td>
                            <td>₹{finalAmount}</td>
                            <td>
                                <Badge bg={statusVariant[order.orderStatus] || "secondary"} className="px-2 py-1 shadow-sm text-uppercase">
                                    {order.orderStatus.replace(/_/g, " ")}
                                </Badge>
                            </td>
                            <td>
                                {isCompleted ? (
                                    <span className="text-muted small">
                                        🔒 Locked ({order.orderStatus})
                                    </span>
                                ) : (
                                    <Form.Select
                                        size="sm"
                                        value={order.orderStatus}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="shadow-sm"
                                    >
                                        {statusOptions.map((s) => (
                                            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                                        ))}
                                    </Form.Select>
                                )}
                            </td>
                            <td>
                                <Button variant="outline-primary" size="sm" onClick={() => handleBill(order._id)}>
                                    🧾 Bill
                                </Button>
                            </td>
                        </tr>
                        );
                    })
                )}
            </tbody>
        </Table>
    );
}

