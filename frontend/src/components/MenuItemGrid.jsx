import { Row, Col, Card, Button } from "react-bootstrap";
import { isPizzaCategory } from "../utils/pizzaOptions";

const PLACEHOLDER_IMG = "https://via.placeholder.com/300x180?text=No+Image";

function MenuItemGrid({
  items,
  categoryMap,
  onItemAction,
  allowFavorites = false,
  favoriteIds = [],
  onToggleFavorite,
  primaryActionLabel,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <Row>
      {items.map((item) => {
        const isPizza = isPizzaCategory(categoryMap[item.categoryId] || "");
        const isFavorite = favoriteIds.includes(item._id);
        const actionLabel = primaryActionLabel
          ? primaryActionLabel(item, isPizza)
          : isPizza
            ? "Customize"
            : "Add to Cart";
        const extraActionLabel = secondaryActionLabel
          ? secondaryActionLabel(item, isPizza)
          : null;

        return (
          <Col sm={6} md={4} lg={3} className="mb-4" key={item._id}>
            <Card className="h-100 shadow-sm border-0">
              <div className="position-relative">
              <Card.Img
                variant="top"
                src={item.image || PLACEHOLDER_IMG}
                style={{ height: "180px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMG;
                }}
              />
                {allowFavorites && isPizza && onToggleFavorite && (
                  <Button
                    variant="light"
                    size="sm"
                    className="position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                    style={{ width: "38px", height: "38px", lineHeight: "1" }}
                    onClick={() => onToggleFavorite(item)}
                  >
                    <span className={isFavorite ? "text-danger" : "text-secondary"}>
                      {isFavorite ? "❤" : "♡"}
                    </span>
                  </Button>
                )}
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fs-6">{item.name}</Card.Title>
                <Card.Text className="text-muted small flex-grow-1">
                  {item.description || "Delicious pizza item"}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="fw-bold text-danger fs-5">Rs.{item.price}</span>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onItemAction(item)}
                    disabled={!item.isAvailable}
                  >
                    {item.isAvailable ? actionLabel : "Unavailable"}
                  </Button>
                </div>
                {extraActionLabel && onSecondaryAction && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => onSecondaryAction(item)}
                  >
                    {extraActionLabel}
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default MenuItemGrid;
