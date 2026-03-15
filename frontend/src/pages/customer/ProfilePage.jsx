import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { updateProfile, clearAuthError, clearSuccessMessage } from "../../redux/authSlice";
import {
    getUserAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
} from "../../redux/userSlice";
import { Card, Button, Alert, Row, Col, Modal } from "react-bootstrap";
import { useEffect, useState } from "react";
import API from "../../services/api";
import Loader from "../../components/Loader";
import ConfirmActionModal from "../../components/ConfirmActionModal";

const profileSchema = Yup.object({
    name: Yup.string().min(2, "Name too short"),
    email: Yup.string().email("Invalid email"),
    phone: Yup.string().matches(/^[0-9]{10}$/, "Phone must be 10 digits"),
    password: Yup.string().min(6, "Password must be at least 6 characters"),
});

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
    isDefault: Yup.boolean(),
});

const labelIcons = { Home: "🏠", Office: "🏢", Other: "📍" };

function ProfilePage() {
    const dispatch = useDispatch();
    const { loading, error, successMessage, user } = useSelector((state) => state.auth);
    const { addresses, loading: addrLoading } = useSelector((state) => state.user);
    const [profile, setProfile] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showAddrModal, setShowAddrModal] = useState(false);
    const [editAddress, setEditAddress] = useState(null);
    const [confirmDeleteAddressId, setConfirmDeleteAddressId] = useState(null);

    useEffect(() => {
        dispatch(clearAuthError());
        dispatch(clearSuccessMessage());
        fetchProfile();
        if (user?.id) dispatch(getUserAddresses(user.id));
    }, [dispatch, user]);

    const fetchProfile = async () => {
        try {
            const res = await API.get("/user/profile");
            setProfile(res.data);
        } catch {
            setProfile(null);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (values) => {
        const data = {};
        if (values.name) data.name = values.name;
        if (values.email) data.email = values.email;
        if (values.phone) data.phone = values.phone;
        if (values.password) data.password = values.password;
        const result = await dispatch(updateProfile(data));
        if (result.meta.requestStatus === "fulfilled") {
            fetchProfile();
            setShowForm(false);
        }
    };

    const handleSaveAddress = (values, { resetForm }) => {
        if (editAddress) {
            dispatch(updateAddress({ id: editAddress._id, data: values }));
        } else {
            dispatch(addAddress({ ...values, userId: user.id }));
        }
        resetForm();
        setEditAddress(null);
        setShowAddrModal(false);
    };

    const handleEditAddress = (addr) => {
        setEditAddress(addr);
        setShowAddrModal(true);
    };

    const handleDeleteAddress = (id) => {
        setConfirmDeleteAddressId(id);
    };

    const confirmDeleteAddress = () => {
        dispatch(deleteAddress(confirmDeleteAddressId));
        setConfirmDeleteAddressId(null);
    };

    const handleSetDefaultAddress = (addr) => {
        dispatch(updateAddress({ id: addr._id, data: { ...addr, isDefault: true } }));
    };

    if (fetching) return <Loader />;

    return (
        <>
            <h3 className="mb-4">👤 My Profile</h3>

            <Row className="justify-content-center">
                <Col md={8}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body className="p-4 d-flex align-items-center">
                            {profile ? (
                                <>
                                    <div 
                                        className="rounded-circle bg-danger text-white d-flex justify-content-center align-items-center fw-bold me-4 shadow-sm" 
                                        style={{ width: "80px", height: "80px", fontSize: "2.5rem" }}
                                    >
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-grow-1">
                                        <h4 className="mb-0 fw-bold">{profile.name}</h4>
                                        <p className="text-muted mb-2">{profile.email}</p>
                                        <div className="d-flex gap-3 text-muted small mb-3">
                                            <span>📞 {profile.phone || "Not provided"}</span>
                                            <span>|</span>
                                            <span className="text-capitalize">👤 {profile.role}</span>
                                            <span>|</span>
                                            <span>📅 Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {!showForm && (
                                            <Button variant="outline-danger" size="sm" onClick={() => setShowForm(true)}>
                                                Edit Profile
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted mb-0">Could not load profile details.</p>
                            )}
                        </Card.Body>
                    </Card>

                    {showForm && (
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Body className="p-4">
                                <h5 className="mb-3">Update Your Details</h5>
                                <Formik
                                    initialValues={{
                                        name: profile?.name || "",
                                        email: profile?.email || "",
                                        phone: profile?.phone || "",
                                        password: "",
                                    }}
                                    validationSchema={profileSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {() => (
                                        <Form>
                                            <div className="mb-3">
                                                <label className="form-label">Name</label>
                                                <Field name="name" className="form-control" placeholder="Enter new name" />
                                                <ErrorMessage name="name" component="div" className="text-danger small mt-1" />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Email</label>
                                                <Field name="email" type="email" className="form-control" placeholder="Enter new email" />
                                                <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Phone</label>
                                                <Field name="phone" className="form-control" placeholder="Enter new phone" />
                                                <ErrorMessage name="phone" component="div" className="text-danger small mt-1" />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">New Password</label>
                                                <Field name="password" type="password" className="form-control" placeholder="Leave blank to keep current" />
                                                <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                                            </div>

                                            <div className="d-flex gap-2">
                                                <Button type="submit" variant="danger" disabled={loading}>
                                                    {loading ? "Saving..." : "Save Changes"}
                                                </Button>
                                                <Button variant="outline-secondary" onClick={() => setShowForm(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </Card.Body>
                        </Card>
                    )}

                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">📍 Saved Addresses</h5>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                        setEditAddress(null);
                                        setShowAddrModal(true);
                                    }}
                                >
                                    + Add Address
                                </Button>
                            </div>

                            {addrLoading ? (
                                <Loader />
                            ) : addresses.length === 0 ? (
                                <p className="text-muted text-center py-3">No addresses saved yet. Add one to get started.</p>
                            ) : (
                                <Row>
                                    {addresses.map((addr) => (
                                        <Col md={6} key={addr._id} className="mb-3">
                                            <Card className="h-100 border">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <span className="fw-bold">
                                                            {labelIcons[addr.label] || "📍"}{" "}
                                                            {addr.label || "Home"}
                                                        </span>
                                                        {addr.isDefault && (
                                                            <span className="badge bg-danger">Default</span>
                                                        )}
                                                    </div>
                                                    <p className="text-muted small mb-1">
                                                        {addr.houseNumber}, {addr.street}
                                                    </p>
                                                    <p className="text-muted small mb-1">
                                                        {addr.city}, {addr.state}
                                                    </p>
                                                    <p className="text-muted small mb-2">
                                                        Pincode: {addr.pincode}
                                                    </p>
                                                    {addr.landmark && (
                                                        <p className="text-muted small mb-2">
                                                            Near {addr.landmark}
                                                        </p>
                                                    )}
                                                    <div className="d-flex gap-2 mt-3">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleEditAddress(addr)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteAddress(addr._id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                        {!addr.isDefault && (
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                className="ms-auto"
                                                                onClick={() => handleSetDefaultAddress(addr)}
                                                            >
                                                                Set as Default
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showAddrModal} onHide={() => { setShowAddrModal(false); setEditAddress(null); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editAddress ? "Edit Address" : "Add Address"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            label: editAddress?.label || "Home",
                            houseNumber: editAddress?.houseNumber || "",
                            street: editAddress?.street || "",
                            city: editAddress?.city || "",
                            state: editAddress?.state || "",
                            pincode: editAddress?.pincode || "",
                            landmark: editAddress?.landmark || "",
                            isDefault: editAddress?.isDefault || false,
                        }}
                        validationSchema={addressSchema}
                        onSubmit={handleSaveAddress}
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
                                <div className="mb-3 form-check">
                                    <Field type="checkbox" name="isDefault" className="form-check-input" id="isDefaultCheck" />
                                    <label className="form-check-label text-muted" htmlFor="isDefaultCheck">
                                        Set as default address
                                    </label>
                                </div>
                                <Button type="submit" variant="danger" className="w-100">
                                    {editAddress ? "Update" : "Save"} Address
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>

            <ConfirmActionModal
                show={Boolean(confirmDeleteAddressId)}
                title="Confirm Action"
                message="Are you sure you want to delete this address?"
                confirmLabel="Delete"
                onConfirm={confirmDeleteAddress}
                onHide={() => setConfirmDeleteAddressId(null)}
            />
        </>
    );
}

export default ProfilePage;
