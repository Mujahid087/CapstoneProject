import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRevenue } from "../../redux/adminSlice";
import { Table, Card, Row, Col, Button } from "react-bootstrap";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Loader from "../../components/Loader";

const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

function RevenuePage() {
    const dispatch = useDispatch();
    const { revenue, loading } = useSelector((state) => state.admin);

    useEffect(() => {
        dispatch(fetchRevenue());
    }, [dispatch]);

    if (loading || !revenue || !revenue.kpis) return <Loader />;

    const { kpis, monthlyRevenue, revenueByCategory } = revenue;

    const stats = [
        { label: "Revenue Today", value: `₹${kpis.revenueToday.toLocaleString()}`, icon: "💰", color: "success" },
        { label: "This Week", value: `₹${kpis.revenueThisWeek.toLocaleString()}`, icon: "📈", color: "info" },
        { label: "This Month", value: `₹${kpis.revenueThisMonth.toLocaleString()}`, icon: "📅", color: "primary" },
        { label: "Avg Order Value", value: `₹${kpis.avgOrderValue.toLocaleString()}`, icon: "⚖️", color: "warning" },
        { label: "Total Revenue", value: `₹${kpis.totalRevenue.toLocaleString()}`, icon: "🏛️", color: "danger" },
    ];

    // Format Monthly Chart Data
    const chartData = monthlyRevenue.map(r => ({
        name: `${monthNames[r._id.month - 1]} ${r._id.year.toString().slice(-2)}`,
        revenue: r.totalRevenue,
        orders: r.orderCount
    }));

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>💼 Financial Analytics</h3>
                <Button variant="outline-secondary" size="sm" onClick={() => dispatch(fetchRevenue())}>
                    Refresh Data
                </Button>
            </div>

            {/* Row 1: KPI Cards */}
            <Row className="mb-4">
                {stats.map((stat, idx) => (
                    <Col md key={idx} className="mb-3">
                        <Card className={`shadow-sm border-0 border-top border-${stat.color} border-4 h-100`}>
                            <Card.Body className="text-center py-3">
                                <div className="fs-3 align-items-center mb-1">{stat.icon}</div>
                                <h4 className={`text-dark fw-bold mb-0`}>{stat.value}</h4>
                                <small className="text-muted fw-semibold" style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}>
                                    {stat.label.toUpperCase()}
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Row 2: Charts */}
            <Row className="mb-4">
                <Col lg={8} className="mb-4 mb-lg-0">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h5 className="mb-4">Monthly Revenue Trend (Last 12 Months)</h5>
                            {chartData.length === 0 ? (
                                <p className="text-muted text-center py-5">Not enough data to display trend.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                        <YAxis tickLine={false} axisLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(v) => `₹${v}`} />
                                        <Tooltip 
                                            formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h5 className="mb-4">Revenue by Category</h5>
                            {(!revenueByCategory || revenueByCategory.length === 0) ? (
                                <p className="text-muted text-center py-5">No category data available.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={revenueByCategory}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {revenueByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Row 3: Data Table */}
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <h5 className="mb-3">Revenue Breakdown</h5>
                    {chartData.length === 0 ? (
                        <p className="text-muted text-center my-4">No historical revenue data available.</p>
                    ) : (
                        <Table responsive hover className="align-middle mb-0">
                            <thead className="table-light text-muted">
                                <tr>
                                    <th>Month</th>
                                    <th className="text-center">Paid Orders</th>
                                    <th className="text-end">Gross Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...chartData].reverse().map((r, idx) => (
                                    <tr key={idx}>
                                        <td className="fw-semibold">{r.name}</td>
                                        <td className="text-center">{r.orders}</td>
                                        <td className="text-end fw-bold text-success">₹{r.revenue.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="table-light fw-bold">
                                    <td>All-Time Total</td>
                                    <td className="text-center">{kpis.totalPaidOrders}</td>
                                    <td className="text-end fs-6">₹{kpis.totalRevenue.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </>
    );
}

export default RevenuePage;
