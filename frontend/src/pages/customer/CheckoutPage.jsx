import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAddresses, addAddress } from "../../redux/userSlice";
import { placeOrder } from "../../redux/orderSlice";
import { clearCart } from "../../redux/cartSlice";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card, Button, Modal, Row, Col, Form as BsForm } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const addressSchema = Yup.object({
    label: Yup.string().oneOf(["Home", "Office", "Other"]).required("Label is required"),
    houseNumber: Yup.string().required("House number is required"),
    street: Yup.string().required("Street is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    pincode: Yup.string()
        .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
        .required("Pincode is required"),
    landmark: Yup.string(),
});

const labelIcons = { Home: "🏠", Office: "🏢", Other: "📍" };

function CheckoutPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { addresses, loading: addrLoading } = useSelector((state) => state.user);
    const { items } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const { loading: orderLoading } = useSelector((state) => state.order);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [deliveryMode, setDeliveryMode] = useState("delivery");
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (user?.id) dispatch(getUserAddresses(user.id));
    }, [dispatch, user]);

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            const def = addresses.find((a) => a.isDefault);
            setSelectedAddress(def ? def._id : addresses[0]._id);
        }
    }, [addresses, selectedAddress]);

    const itemsTotal = items.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
    );
    
    // Calculate auto-discount locally for display
    let discountAmount = 0;
    if (itemsTotal > 1000) {
        discountAmount = Math.round(itemsTotal * 0.05);
    }
    
    const deliveryFee = deliveryMode === "delivery" ? 50 : 0;
    const tax = Math.round(itemsTotal * 0.05);
    const totalAmount = itemsTotal - discountAmount + deliveryFee + tax;

    const handleAddAddress = (values, { resetForm }) => {
        dispatch(addAddress({ ...values, userId: user.id })).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
                toast.success("Address added");
                setSelectedAddress(res.payload._id);
            }
        });
        resetForm();
        setShowModal(false);
    };

    const handlePlaceOrder = () => {
        if (!selectedAddress) {
            toast.error("Please select a delivery address");
            return;
        }
        const allItems = items.flatMap((cart) => (cart.items ? cart.items : [cart]));
        dispatch(
            placeOrder({
                userId: user.id,
                addressId: selectedAddress,
                items: allItems.map((i) => ({
                    itemId: i.itemId,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity || 1,
                })),
                totalAmount,
                deliveryMode,
            })
        ).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
                dispatch(clearCart(user.id));
                toast.success("Order placed successfully!");
                navigate("/orders");
            }
        });
    };

    if (items.length === 0) {
        return (
            <Card className="shadow-sm border-0 text-center py-5">
                <Card.Body>
                    <div className="fs-1 mb-3">🛒</div>
                    <h5 className="text-muted">Your cart is empty</h5>
                    <p className="text-muted small mb-3">Add items to your cart before checkout.</p>
                    <Button variant="danger" size="lg" onClick={() => navigate("/menu")}>
                        Browse Menu
                    </Button>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            <h3 className="mb-4">🧾 Checkout</h3>

            <Row>
                <Col lg={7} className="mb-4">
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body>
                            <h5 className="mb-3">📦 Order Summary</h5>
                            <div className="table-responsive">
                                <table className="table table-sm mb-0">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th className="text-center">Qty</th>
                                            <th className="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={item.itemId || idx}>
                                                <td>{item.name}</td>
                                                <td className="text-center">{item.quantity || 1}</td>
                                                <td className="text-end">
                                                    ₹{(item.price || 0) * (item.quantity || 1)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="fw-bold">
                                            <td colSpan="2">Items Total</td>
                                            <td className="text-end text-muted">₹{itemsTotal}</td>
                                        </tr>
                                        {discountAmount > 0 && (
                                            <tr className="fw-bold text-success">
                                                <td colSpan="2">Discount (5%)</td>
                                                <td className="text-end">-₹{discountAmount}</td>
                                            </tr>
                                        )}
                                        <tr className="fw-bold">
                                            <td colSpan="2">Delivery Fee</td>
                                            <td className="text-end text-muted">₹{deliveryFee}</td>
                                        </tr>
                                        <tr className="fw-bold">
                                            <td colSpan="2">Tax (5%)</td>
                                            <td className="text-end text-muted">₹{tax}</td>
                                        </tr>
                                        <tr className="fw-bold">
                                            <td colSpan="2">Final Total</td>
                                            <td className="text-end fs-5 text-danger">₹{totalAmount}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <h5 className="mb-3">🚚 Delivery Mode</h5>
                            <BsForm.Select
                                value={deliveryMode}
                                onChange={(e) => setDeliveryMode(e.target.value)}
                                style={{ maxWidth: "200px" }}
                            >
                                <option value="delivery">🚗 Delivery</option>
                                <option value="pickup">🏪 Pickup</option>
                            </BsForm.Select>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={5}>
                    <Card className="shadow-sm border-0 mb-3">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">📍 Select Delivery Address</h5>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => setShowModal(true)}
                                >
                                    + Add New
                                </Button>
                            </div>

                            {addrLoading ? (
                                <Loader />
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-muted mb-2">No saved addresses</p>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => setShowModal(true)}
                                    >
                                        + Add Address
                                    </Button>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            className={`border rounded p-3 cursor-pointer ${selectedAddress === addr._id
                                                    ? "border-danger bg-light"
                                                    : ""
                                                }`}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setSelectedAddress(addr._id)}
                                        >
                                            <div className="d-flex align-items-start gap-2">
                                                <BsForm.Check
                                                    type="radio"
                                                    name="selectedAddr"
                                                    checked={selectedAddress === addr._id}
                                                    onChange={() => setSelectedAddress(addr._id)}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <div className="fw-semibold">
                                                        {labelIcons[addr.label] || "📍"}{" "}
                                                        {addr.label || "Home"}
                                                    </div>
                                                    <div className="text-muted small">
                                                        {addr.houseNumber}, {addr.street}, {addr.city},{" "}
                                                        {addr.state} - {addr.pincode}
                                                    </div>
                                                    {addr.landmark && (
                                                        <div className="text-muted small">
                                                            Near {addr.landmark}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    <Button
                        variant="danger"
                        size="lg"
                        className="w-100 fw-bold"
                        disabled={!selectedAddress || orderLoading}
                        onClick={handlePlaceOrder}
                    >
                        {orderLoading ? "Placing Order..." : "Place Order →"}
                    </Button>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Address</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{
                            label: "Home",
                            houseNumber: "",
                            street: "",
                            city: "",
                            state: "",
                            pincode: "",
                            landmark: "",
                        }}
                        validationSchema={addressSchema}
                        onSubmit={handleAddAddress}
                    >
                        {() => (
                            <Form>
                                <div className="mb-3">
                                    <label className="form-label">Address Label</label>
                                    <Field as="select" name="label" className="form-select">
                                        <option value="Home">🏠 Home</option>
                                        <option value="Office">🏢 Office</option>
                                        <option value="Other">📍 Other</option>
                                    </Field>
                                    <ErrorMessage name="label" component="div" className="text-danger small mt-1" />
                                </div>
                                {["houseNumber", "street", "city", "state", "pincode", "landmark"].map(
                                    (field) => (
                                        <div className="mb-3" key={field}>
                                            <label className="form-label text-capitalize">
                                                {field.replace(/([A-Z])/g, " $1")}
                                            </label>
                                            <Field name={field} className="form-control" />
                                            <ErrorMessage
                                                name={field}
                                                component="div"
                                                className="text-danger small mt-1"
                                            />
                                        </div>
                                    )
                                )}
                                <Button type="submit" variant="danger" className="w-100">
                                    Save Address
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default CheckoutPage;
