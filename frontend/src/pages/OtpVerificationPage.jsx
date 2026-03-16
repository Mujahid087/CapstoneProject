import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Alert, Button, Card, Col, Container, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { clearAuthError, resendOtp, verifyOtp } from "../redux/authSlice";

const otpSchema = Yup.object({
    otp: Yup.string()
        .matches(/^\d{6}$/, "OTP must be 6 digits")
        .required("OTP is required"),
});

function OtpVerificationPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { loading, error, pendingEmail, role } = useSelector((state) => state.auth);

    const [resendLoading, setResendLoading] = useState(false);

    const email = location.state?.email || pendingEmail;

    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    useEffect(() => {
        if (!email) {
            navigate("/login", { replace: true });
        }
    }, [email, navigate]);

    useEffect(() => {
        if (role) {
            navigate(role === "admin" ? "/admin/dashboard" : "/menu", { replace: true });
        }
    }, [role, navigate]);

    const handleVerifyOtp = async (values) => {
        if (!email) return;

        const result = await dispatch(verifyOtp({ email, otp: values.otp }));

        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Login successful");
            navigate(result.payload.role === "admin" ? "/admin/dashboard" : "/menu", { replace: true });
        }
    };

    const handleResendOtp = async () => {
        if (!email) return;

        setResendLoading(true);
        const result = await dispatch(resendOtp(email));
        setResendLoading(false);

        if (result.meta.requestStatus === "fulfilled") {
            toast.success("New OTP sent to your email");
        }
    };

    return (
        <Container className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <Row className="w-100 justify-content-center">
                <Col md={5}>
                    <Card className="shadow border-0">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-1">PizzaHub</h2>
                            <p className="text-center text-muted mb-4">
                                Enter the 6-digit OTP sent to <strong>{email}</strong>
                            </p>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Formik
                                initialValues={{ otp: "" }}
                                validationSchema={otpSchema}
                                onSubmit={handleVerifyOtp}
                            >
                                {({ isSubmitting }) => (
                                    <Form>
                                        <div className="mb-3">
                                            <label className="form-label">OTP</label>
                                            <Field
                                                name="otp"
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                            />
                                            <ErrorMessage name="otp" component="div" className="text-danger small mt-1" />
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="danger"
                                            className="w-100"
                                            disabled={loading || isSubmitting}
                                        >
                                            {loading ? "Verifying..." : "Verify OTP"}
                                        </Button>
                                    </Form>
                                )}
                            </Formik>

                            <Button
                                variant="outline-secondary"
                                className="w-100 mt-3"
                                onClick={handleResendOtp}
                                disabled={resendLoading || loading}
                            >
                                {resendLoading ? "Resending..." : "Resend OTP"}
                            </Button>

                            <p className="text-center mt-3 mb-0">
                                Wrong email? <Link to="/login">Back to login</Link>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default OtpVerificationPage;
