import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Container } from "react-bootstrap";

function CustomerLayout() {
    return (
        <>
            <Navbar />
            <Container className="py-4">
                <Outlet />
            </Container>
        </>
    );
}

export default CustomerLayout;
