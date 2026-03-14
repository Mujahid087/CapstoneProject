import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { makePayment, clearPaymentSuccess } from "../../redux/userSlice";
import { getOrderById } from "../../redux/orderSlice";
import { Card, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";

function PaymentPage() {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { paymentSuccess, error: userError } = useSelector((state) => state.user);
    const { currentOrder, loading, error: orderError } = useSelector((state) => state.order);
    
    const [paymentMode, setPaymentMode] = useState("card");

    // Fetch order details when component mounts
    useEffect(() => {
        dispatch(getOrderById(orderId));
    }, [dispatch, orderId]);

    useEffect(() => {
        dispatch(clearPaymentSuccess());
    }, [dispatch]);

    useEffect(() => {
        if (paymentSuccess) {
            setTimeout(() => navigate("/orders"), 2000);
        }
    }, [paymentSuccess, navigate]);

    const handlePayment = (e) => {
        e.preventDefault();
        
        if (!currentOrder) return;
        
        const getFinalAmount = () => {
             // Prefer finalPrice (or calculate from totalAmount for legacy compatibility)
            if (currentOrder.finalPrice) return currentOrder.finalPrice;
            if (currentOrder.totalAmount) return currentOrder.totalAmount;

            const itemsTotal = currentOrder?.items?.reduce(
                (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
                0
            ) || 0;
            const deliveryFee = currentOrder.deliveryMode === 'delivery' ? 50 : 0;
            const tax = Math.round(itemsTotal * 0.05);
            const discountAmount = currentOrder.discountAmount || 0;

            return itemsTotal - discountAmount + deliveryFee + tax;
        };

        const finalAmountToPay = getFinalAmount();

        dispatch(
            makePayment({
                orderId,
                paymentMode,
                paidAmount: finalAmountToPay, // Send exactly what the order expects
                paymentStatus: "completed",
                transactionId: `TXN${Date.now()}`,
                paidAt: new Date(),
            })
        );
    };

    // Calculate breakdown for display
    const itemsTotal = currentOrder?.items?.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
    ) || 0;
    const deliveryFee = currentOrder?.deliveryMode === 'delivery' ? 50 : 0;
    const tax = Math.round(itemsTotal * 0.05);
    const discountAmount = currentOrder?.discountAmount || 0;
    
    const finalAmountToPay = currentOrder?.finalPrice || 
        currentOrder?.totalAmount || 
        (itemsTotal - discountAmount + deliveryFee + tax);

    return (
        <>
            <h3 className="mb-4">💳 Payment</h3>

            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            {paymentSuccess && (
                                <Alert variant="success">{paymentSuccess}. Redirecting...</Alert>
                            )}
                            {(userError || orderError) && (
                                <Alert variant="danger">{userError || orderError}</Alert>
                            )}

                            <p className="text-muted mb-3">Order ID: <strong>{orderId}</strong></p>

                            {loading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="danger" />
                                    <p className="mt-2 text-muted">Fetching order details...</p>
                                </div>
                            ) : currentOrder ? (
                                <>
                                    {/* Order Breakdown */}
                                    <Card className="bg-light border-0 mb-4 p-3">
                                        <h6 className="mb-3 border-bottom pb-2">Order Summary</h6>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Items Total</span>
                                            <span>₹{itemsTotal}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Delivery Fee</span>
                                            <span>₹{deliveryFee}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Tax (5%)</span>
                                            <span>₹{tax}</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="d-flex justify-content-between mb-2 text-success">
                                                <span>Discount</span>
                                                <span>-₹{discountAmount}</span>
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between border-top pt-2 fw-bold fs-5 text-danger">
                                            <span>Final Amount to Pay</span>
                                            <span>₹{finalAmountToPay}</span>
                                        </div>
                                    </Card>

                                    <Form onSubmit={handlePayment}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-semibold">Payment Mode</Form.Label>
                                            <Form.Select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                                                <option value="card">💳 Credit / Debit Card</option>
                                                <option value="upi">📱 UPI</option>
                                                <option value="cash">💵 Cash on Delivery</option>
                                            </Form.Select>
                                        </Form.Group>

                                        <Button type="submit" variant="danger" className="w-100 fw-bold fs-5 py-2">
                                            Pay ₹{finalAmountToPay} Now
                                        </Button>
                                    </Form>
                                </>
                            ) : (
                                <Alert variant="warning">Order details not found.</Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default PaymentPage;
