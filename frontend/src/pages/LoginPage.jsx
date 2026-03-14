import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { loginUser, clearAuthError } from "../redux/authSlice";
import { Card, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useEffect } from "react";

const loginSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
});

function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    const handleSubmit = async (values) => {
        const result = await dispatch(loginUser(values));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Login successful!");
            navigate(result.payload.role === "admin" ? "/admin/dashboard" : "/menu");
        }
    };

    return (
        <Container className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <Row className="w-100 justify-content-center">
                <Col md={5}>
                    <Card className="shadow border-0">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-1">🍕 PizzaHub</h2>
                            <p className="text-center text-muted mb-4">Sign in to your account</p>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Formik
                                initialValues={{ email: "", password: "" }}
                                validationSchema={loginSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form>
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

                                        <Button
                                            type="submit"
                                            variant="danger"
                                            className="w-100"
                                            disabled={loading || isSubmitting}
                                        >
                                            {loading ? "Signing in..." : "Sign In"}
                                        </Button>
                                    </Form>
                                )}
                            </Formik>

                            <p className="text-center mt-3 mb-0">
                                Don&apos;t have an account? <Link to="/register">Register</Link>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginPage;
