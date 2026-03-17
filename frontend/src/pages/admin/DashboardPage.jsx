import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../../redux/adminSlice";
import { Card, Row, Col, Table, Badge, Button } from "react-bootstrap";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Loader from "../../components/Loader";

function DashboardPage() {
    const dispatch = useDispatch();
    const { dashboard, loading } = useSelector((state) => state.admin);

    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    if (loading || !dashboard) return <Loader />;

    
    const {
        totalUsers,
        pendingOrders,
        ordersToday,
        revenueToday,
        recentOrders,
        ordersTrend
    } = dashboard;

    
    const stats = [
        { label: "Pending Orders", value: pendingOrders, icon: "⏳", color: "danger" },
        { label: "Orders Today", value: ordersToday, icon: "📦", color: "success" },
        { label: "Revenue Today", value: `₹${revenueToday.toLocaleString()}`, icon: "💸", color: "primary" },
        { label: "Active Customers", value: totalUsers, icon: "👥", color: "info" },
    ];

    
    const statusColors = {
        pending: "warning",
        confirmed: "info",
        preparing: "primary",
        out_for_delivery: "secondary",
        delivered: "success",
        cancelled: "danger"
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>📊 Operations Dashboard</h3>
                <Button variant="outline-secondary" size="sm" onClick={() => dispatch(fetchDashboard())}>
                    Refresh Data
                </Button>
            </div>

            {}
            <Row>
                {stats.map((stat, idx) => (
                    <Col md={3} key={idx} className="mb-4">
                        <Card className={`shadow-sm border-0 border-start border-${stat.color} border-4 h-100`}>
                            <Card.Body className="d-flex align-items-center">
                                <div 
                                    className={`bg-${stat.color} bg-opacity-10 text-${stat.color} rounded p-3 me-3 d-flex align-items-center justify-content-center`}
                                    style={{ width: "60px", height: "60px", fontSize: "1.8rem" }}
                                >
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-muted mb-0 fw-semibold" style={{ fontSize: "0.9rem" }}>{stat.label}</p>
                                    <h3 className="mb-0 fw-bold">{stat.value}</h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {}
            <Row className="mb-4">
                <Col lg={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <h5 className="mb-4">Orders Trend (Last 7 Days)</h5>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart
                                        data={ordersTrend}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#6b7280', fontSize: 12}} 
                                            tickFormatter={(val) => {
                                                const d = new Date(val);
                                                return `${d.getDate()} ${d.toLocaleString("en-US", {month:"short"})}`;
                                            }}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [value, "Orders"]}
                                            labelFormatter={(label) => `Date: ${label}`}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="orders" 
                                            stroke="#ef4444" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorOrders)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {}
            <Row>
                <Col lg={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-0 pt-4 pb-0">
                            <h5 className="mb-0">🔴 Live Recent Orders</h5>
                        </Card.Header>
                        <Card.Body>
                            {(!recentOrders || recentOrders.length === 0) ? (
                                <p className="text-muted text-center py-4">No recent orders found.</p>
                            ) : (
                                <Table responsive hover className="align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order._id}>
                                                <td className="fw-semibold font-monospace small">
                                                    #{order._id.toString().slice(-6).toUpperCase()}
                                                </td>
                                                <td>
                                                    <div className="fw-semibold">{order.userId?.name || "Unknown"}</div>
                                                    <div className="text-muted small">{order.userId?.email}</div>
                                                </td>
                                                <td>{order.items?.length || 0} items</td>
                                                <td className="fw-bold">₹{order.finalPrice || order.totalAmount}</td>
                                                <td>
                                                    <Badge bg={order.paymentStatus === "paid" ? "success" : "warning"}>
                                                        {order.paymentStatus}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={statusColors[order.orderStatus] || "secondary"} className="text-uppercase" style={{ letterSpacing: '0.5px' }}>
                                                        {order.orderStatus.replace("_", " ")}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default DashboardPage;
