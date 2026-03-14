import { Spinner } from "react-bootstrap";

function Loader() {
    return (
        <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="danger" />
        </div>
    );
}

export default Loader;
