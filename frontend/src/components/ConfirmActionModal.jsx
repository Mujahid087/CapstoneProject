import { Button, Modal } from "react-bootstrap";

function ConfirmActionModal({
    show,
    title = "Confirm Action",
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    confirmVariant = "danger",
    isLoading = false,
    onConfirm,
    onHide,
}) {
    return (
        <Modal show={show} onHide={onHide} centered backdrop="static" animation>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-0">{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide} disabled={isLoading}>
                    {cancelLabel}
                </Button>
                <Button variant={confirmVariant} onClick={onConfirm} disabled={isLoading}>
                    {isLoading ? "Please wait..." : confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmActionModal;
