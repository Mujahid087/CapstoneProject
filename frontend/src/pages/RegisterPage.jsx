import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { registerUser, clearAuthError, clearSuccessMessage } from "../redux/authSlice";
import { Card, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useEffect } from "react";

const registerSchema = Yup.object({
    name: Yup.string().min(2, "Name too short").required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
        .required("Phone is required"),
});

function RegisterPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, successMessage } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(clearAuthError());
        dispatch(clearSuccessMessage());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success("Registration successful! Please login.");
            setTimeout(() => navigate("/login"), 1500);
        }
    }, [successMessage, navigate]);

    return (
        <Container className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <Row className="w-100 justify-content-center">
                <Col md={5}>
                    <Card className="shadow border-0">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-1">🍕 PizzaHub</h2>
                            <p className="text-center text-muted mb-4">Create your account</p>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Formik
                                initialValues={{ name: "", email: "", password: "", phone: "" }}
                                validationSchema={registerSchema}
                                onSubmit={(values) => dispatch(registerUser(values))}
                            >
                                {({ isSubmitting }) => (
                                    <Form>
                                        <div className="mb-3">
                                            <label className="form-label">Full Name</label>
                                            <Field
                                                name="name"
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter your name"
                                            />
                                            <ErrorMessage name="name" component="div" className="text-danger small mt-1" />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <Field
                                                name="email"
                                                type="email"
                                                className="form-control"
                                                placeholder="Enter your email"
                                            />
                                            <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Password</label>
                                            <Field
                                                name="password"
                                                type="password"
                                                className="form-control"
                                                placeholder="Enter your password"
                                            />
                                            <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Phone</label>
                                            <Field
                                                name="phone"
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter your phone number"
                                            />
                                            <ErrorMessage name="phone" component="div" className="text-danger small mt-1" />
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="danger"
                                            className="w-100"
                                            disabled={loading || isSubmitting}
                                        >
                                            {loading ? "Registering..." : "Create Account"}
                                        </Button>
                                    </Form>
                                )}
                            </Formik>

                            <p className="text-center mt-3 mb-0">
                                Already have an account? <Link to="/login">Login</Link>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default RegisterPage;
