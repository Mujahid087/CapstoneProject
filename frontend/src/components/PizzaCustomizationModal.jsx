import { useMemo, useState } from "react";
import { Badge, Button, Form, ListGroup, Modal } from "react-bootstrap";
import {
  DEFAULT_CUSTOMIZATION,
  PIZZA_CRUSTS,
  PIZZA_EXTRAS,
  PIZZA_SIZES,
  calculateCustomizedPrice,
  createCustomizedCartItem,
} from "../utils/pizzaOptions";

function formatDelta(value) {
  return value === 0 ? "Included" : `+Rs.${value}`;
}

function PizzaCustomizationModal({ item, show, onHide, onConfirm }) {
  const [customization, setCustomization] = useState(DEFAULT_CUSTOMIZATION);

  const finalPrice = useMemo(
    () => calculateCustomizedPrice(item?.price, customization),
    [item?.price, customization]
  );

  if (!item) {
    return null;
  }

  const toggleExtra = (extraLabel) => {
    setCustomization((current) => {
      const extras = current.extras.includes(extraLabel)
        ? current.extras.filter((entry) => entry !== extraLabel)
        : [...current.extras, extraLabel];

      return { ...current, extras };
    });
  };

  const handleConfirm = () => {
    onConfirm(createCustomizedCartItem(item, customization));
    setCustomization(DEFAULT_CUSTOMIZATION);
    onHide();
  };

  const handleClose = () => {
    setCustomization(DEFAULT_CUSTOMIZATION);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Customize {item.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="fw-semibold">{item.name}</div>
            <div className="text-muted small">Base price: Rs.{item.price}</div>
          </div>
          <Badge bg="danger" pill>
            Final Rs.{finalPrice}
          </Badge>
        </div>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Size</Form.Label>
          <div className="d-grid gap-2">
            {PIZZA_SIZES.map((size) => (
              <Form.Check
                key={size.label}
                type="radio"
                name="pizza-size"
                id={`size-${size.label}`}
                label={`${size.label} (${formatDelta(size.priceDelta)})`}
                checked={customization.size === size.label}
                onChange={() =>
                  setCustomization((current) => ({ ...current, size: size.label }))
                }
              />
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Crust</Form.Label>
          <div className="d-grid gap-2">
            {PIZZA_CRUSTS.map((crust) => (
              <Form.Check
                key={crust.label}
                type="radio"
                name="pizza-crust"
                id={`crust-${crust.label}`}
                label={`${crust.label} (${formatDelta(crust.priceDelta)})`}
                checked={customization.crust === crust.label}
                onChange={() =>
                  setCustomization((current) => ({ ...current, crust: crust.label }))
                }
              />
            ))}
          </div>
        </Form.Group>

        <Form.Group>
          <Form.Label className="fw-semibold">Extras</Form.Label>
          <div className="d-grid gap-2">
            {PIZZA_EXTRAS.map((extra) => (
              <Form.Check
                key={extra.label}
                type="checkbox"
                id={`extra-${extra.label}`}
                label={`${extra.label} (${formatDelta(extra.priceDelta)})`}
                checked={customization.extras.includes(extra.label)}
                onChange={() => toggleExtra(extra.label)}
              />
            ))}
          </div>
        </Form.Group>

        <ListGroup className="mt-4">
          <ListGroup.Item className="d-flex justify-content-between">
            <span>Selected size</span>
            <strong>{customization.size}</strong>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between">
            <span>Selected crust</span>
            <strong>{customization.crust}</strong>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between">
            <span>Extras</span>
            <strong>
              {customization.extras.length ? customization.extras.join(", ") : "None"}
            </strong>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between">
            <span>Live total</span>
            <strong className="text-danger">Rs.{finalPrice}</strong>
          </ListGroup.Item>
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Add to Cart
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PizzaCustomizationModal;
