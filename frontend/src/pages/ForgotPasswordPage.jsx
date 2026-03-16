import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import API from "../services/api";

function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!email) {
            setError("Email is required");
            return;
        }

        try {
            setLoading(true);
            const res = await API.post("/user/forgot-password", { email });
            setMessage(res.data.message || "If this email is registered, a reset link has been sent.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <Row className="w-100 justify-content-center">
                <Col md={5}>
                    <Card className="shadow border-0">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-1">PizzaHub</h2>
                            <p className="text-center text-muted mb-4">Forgot your password?</p>

                            {error && <Alert variant="danger">{error}</Alert>}
                            {message && <Alert variant="success">{message}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <Button type="submit" variant="danger" className="w-100" disabled={loading}>
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </Button>
                            </Form>

                            <p className="text-center mt-3 mb-0">
                                Back to <Link to="/login">Login</Link>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ForgotPasswordPage;
