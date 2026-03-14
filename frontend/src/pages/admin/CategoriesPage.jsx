import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, createCategory } from "../../redux/menuSlice";
import { Table, Button, Form, Card, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function CategoriesPage() {
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.menu);
    const [categoryName, setCategoryName] = useState("");

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;
        dispatch(createCategory({ categoryName })).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
                setCategoryName("");
                toast.success("Category added successfully");
            }
        });
    };

    if (loading) return <Loader />;

    return (
        <>
            <h3 className="mb-4">📁 Manage Categories</h3>

            <Row>
                <Col md={5}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body>
                            <h5 className="mb-3">Add New Category</h5>
                            <Form onSubmit={handleAdd}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category Name</Form.Label>
                                    <Form.Control
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        placeholder="e.g. Veg Pizza, Beverages..."
                                        required
                                    />
                                </Form.Group>
                                <Button type="submit" variant="danger">
                                    Add Category
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={7}>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <h5 className="mb-3">
                                All Categories{" "}
                                <span className="badge bg-secondary">{categories.length}</span>
                            </h5>
                            {categories.length === 0 ? (
                                <p className="text-muted">No categories yet.</p>
                            ) : (
                                <Table striped bordered hover>
                                    <thead className="table-dark">
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((cat, idx) => (
                                            <tr key={cat._id}>
                                                <td>{idx + 1}</td>
                                                <td>{cat.categoryName}</td>
                                                <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default CategoriesPage;
