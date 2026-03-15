import { Row, Col, Card, Button } from "react-bootstrap";
import { isPizzaCategory } from "../utils/pizzaOptions";

const PLACEHOLDER_IMG = "https://via.placeholder.com/300x180?text=No+Image";

function MenuItemGrid({ items, categoryMap, onItemAction }) {
  return (
    <Row>
      {items.map((item) => {
        const isPizza = isPizzaCategory(categoryMap[item.categoryId] || "");

        return (
          <Col sm={6} md={4} lg={3} className="mb-4" key={item._id}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Img
                variant="top"
                src={item.image || PLACEHOLDER_IMG}
                style={{ height: "180px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMG;
                }}
              />
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
                    {item.isAvailable ? (isPizza ? "Customize" : "Add to Cart") : "Unavailable"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default MenuItemGrid;
