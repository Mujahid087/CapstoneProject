import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, fetchMenuByCategory } from "../../redux/menuSlice";
import { addToCart } from "../../redux/cartSlice";
import { Row, Col, Card, Button, Nav } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const PLACEHOLDER_IMG = "https://via.placeholder.com/300x180?text=No+Image";

function MenuPage() {
    const dispatch = useDispatch();
    const { categories, menuItems, loading } = useSelector((state) => state.menu);
    const { user } = useSelector((state) => state.auth);
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0]._id);
        }
    }, [categories, activeCategory]);

    useEffect(() => {
        if (activeCategory) {
            dispatch(fetchMenuByCategory(activeCategory));
        }
    }, [dispatch, activeCategory]);

    const handleAddToCart = (item) => {
        dispatch(
            addToCart({
                userId: user.id,
                items: [{ itemId: item._id, name: item.name, price: item.price, quantity: 1 }],
                totalAmount: item.price,
            })
        );
        toast.success(`${item.name} added to cart!`);
    };

    return (
        <>
            <h3 className="mb-4">🍕 Our Menu</h3>

            <Nav variant="pills" className="mb-4 flex-wrap">
                {categories.map((cat) => (
                    <Nav.Item key={cat._id}>
                        <Nav.Link
                            active={activeCategory === cat._id}
                            onClick={() => setActiveCategory(cat._id)}
                            className={activeCategory === cat._id ? "bg-danger border-0" : ""}
                        >
                            {cat.categoryName}
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>

            {loading ? (
                <Loader />
            ) : menuItems.length === 0 ? (
                <p className="text-muted">No items in this category.</p>
            ) : (
                <Row>
                    {menuItems.map((item) => (
                        <Col sm={6} md={4} lg={3} className="mb-4" key={item._id}>
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Img
                                    variant="top"
                                    src={item.image || PLACEHOLDER_IMG}
                                    style={{ height: "180px", objectFit: "cover" }}
                                    onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="fs-6">{item.name}</Card.Title>
                                    <Card.Text className="text-muted small flex-grow-1">
                                        {item.description || "Delicious pizza item"}
                                    </Card.Text>
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <span className="fw-bold text-danger fs-5">₹{item.price}</span>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleAddToCart(item)}
                                            disabled={!item.isAvailable}
                                        >
                                            {item.isAvailable ? "Add to Cart" : "Unavailable"}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </>
    );
}

export default MenuPage;
