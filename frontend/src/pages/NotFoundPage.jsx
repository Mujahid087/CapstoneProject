import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

function NotFoundPage() {
    return (
        <Container className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center">
            <h1 className="display-1 fw-bold text-danger">404</h1>
            <h3 className="mb-3">Page Not Found</h3>
            <p className="text-muted mb-4">The page you are looking for does not exist or has been moved.</p>
            <Button as={Link} to="/" variant="danger">
                Go Home
            </Button>
        </Container>
    );
}

export default NotFoundPage;
